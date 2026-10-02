import type { FileChange, RepoCommit, RepoFile, RepoMilestone, RepoReport } from '../types'

const API = 'https://api.github.com'
const MAX_COMMITS = 20

type GitHubRepo = {
  name: string; full_name: string; description: string | null; html_url: string; default_branch: string
  created_at: string; updated_at: string
}
type GitHubCommit = {
  sha: string; commit: { message: string; author: { name: string; email: string; date: string } }
  author: { login?: string; avatar_url?: string } | null
}
type GitHubCommitDetail = GitHubCommit & {
  stats?: { additions: number; deletions: number }
  files?: Array<{ filename: string; status: string; additions: number; deletions: number; patch?: string }>
}
type GitHubTree = { tree?: Array<{ path: string; type: string; size?: number }> }
type GitHubTag = { name: string; commit: { sha: string } }

export function parseGitHubRepo(input: string) {
  const clean = input.trim().replace(/\/$/, '')
  const match = clean.match(/(?:github\.com[/:])([^/\s]+)\/([^/#\s]+)/i)
  if (!match) throw new Error('请输入公开 GitHub 仓库链接，例如 https://github.com/owner/repo。')
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/vnd.github+json' } })
  if (!response.ok) {
    if (response.status === 403) throw new Error('GitHub 匿名 API 速率已用尽，请稍后重试或改用本地 CLI。')
    if (response.status === 404) throw new Error('找不到公开仓库；私有仓库需要本地 CLI 分析。')
    throw new Error(`GitHub 请求失败（${response.status}）。`)
  }
  return response.json() as Promise<T>
}

function fileStatus(status: string): FileChange['status'] {
  if (status === 'added') return 'added'
  if (status === 'removed') return 'deleted'
  if (status === 'renamed') return 'renamed'
  return 'modified'
}

function languagePercentages(values: Record<string, number>) {
  const total = Object.values(values).reduce((sum, value) => sum + value, 0) || 1
  return Object.fromEntries(Object.entries(values).map(([name, value]) => [name, Math.max(1, Math.round((value / total) * 100))]))
}

export async function loadGitHubReport(input: string): Promise<RepoReport> {
  const { owner, repo } = parseGitHubRepo(input)
  const encoded = `${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const repository = await getJson<GitHubRepo>(`/repos/${encoded}`)
  const [list, tree, languageBytes, tags] = await Promise.all([
    getJson<GitHubCommit[]>(`/repos/${encoded}/commits?sha=${encodeURIComponent(repository.default_branch)}&per_page=${MAX_COMMITS}`),
    getJson<GitHubTree>(`/repos/${encoded}/git/trees/${encodeURIComponent(repository.default_branch)}?recursive=1`).catch((): GitHubTree => ({ tree: [] })),
    getJson<Record<string, number>>(`/repos/${encoded}/languages`).catch(() => ({})),
    getJson<GitHubTag[]>(`/repos/${encoded}/tags?per_page=50`).catch(() => []),
  ])
  if (!list.length) throw new Error('该仓库没有可读取的提交。')

  const details = await Promise.all(list.map((entry) => getJson<GitHubCommitDetail>(`/repos/${encoded}/commits/${entry.sha}`)))
  const tagBySha = new Map(tags.map((tag) => [tag.commit.sha, tag.name]))
  const commits: RepoCommit[] = details.reverse().map((detail) => ({
    sha: detail.sha,
    shortSha: detail.sha.slice(0, 7),
    date: detail.commit.author.date,
    author: {
      name: detail.author?.login || detail.commit.author.name,
      email: detail.commit.author.email,
      avatarUrl: detail.author?.avatar_url,
    },
    message: detail.commit.message.split('\n')[0],
    additions: detail.stats?.additions ?? 0,
    deletions: detail.stats?.deletions ?? 0,
    files: (detail.files ?? []).map((file) => ({
      path: file.filename,
      status: fileStatus(file.status),
      additions: file.additions,
      deletions: file.deletions,
    })),
    diff: (detail.files ?? []).filter((file) => file.patch).slice(0, 4).map((file) => `diff -- ${file.filename}\n${file.patch}`).join('\n\n').slice(0, 8000),
    tags: tagBySha.has(detail.sha) ? [tagBySha.get(detail.sha) as string] : undefined,
  }))

  const tracked = new Map<string, { createdAt: string; lastModified: string; contributors: Set<string>; commits: number; additions: number; deletions: number; lines: number; sizeSeries: RepoFile['sizeSeries'] }>()
  for (const entry of commits) {
    for (const change of entry.files) {
      const item = tracked.get(change.path) ?? { createdAt: entry.date, lastModified: entry.date, contributors: new Set(), commits: 0, additions: 0, deletions: 0, lines: 0, sizeSeries: [] }
      item.lastModified = entry.date
      item.contributors.add(entry.author.name)
      item.commits += 1
      item.additions += change.additions
      item.deletions += change.deletions
      item.lines = Math.max(0, item.lines + change.additions - change.deletions)
      item.sizeSeries.push({ date: entry.date, lines: item.lines })
      tracked.set(change.path, item)
    }
  }
  for (const node of tree.tree?.filter((entry) => entry.type === 'blob').slice(0, 160) ?? []) {
    if (!tracked.has(node.path)) {
      tracked.set(node.path, { createdAt: repository.created_at, lastModified: repository.updated_at, contributors: new Set(), commits: 0, additions: 0, deletions: 0, lines: Math.max(0, Math.round((node.size ?? 0) / 38)), sizeSeries: [] })
    }
  }
  const files: RepoFile[] = [...tracked.entries()].map(([path, item]) => ({ path, createdAt: item.createdAt, lastModified: item.lastModified, contributors: [...item.contributors], commits: item.commits, additions: item.additions, deletions: item.deletions, sizeSeries: item.sizeSeries }))

  const milestones: RepoMilestone[] = []
  commits.forEach((entry, index) => {
    const tagged = entry.tags?.[0]
    if (tagged) {
      milestones.push({ id: `tag-${entry.sha}`, date: entry.date, title: tagged, description: `Tag points to ${entry.shortSha}.`, commitSha: entry.sha, kind: 'tag' })
      return
    }
    if (index === 0 || index === commits.length - 1 || index % 5 === 0) {
      milestones.push({ id: `phase-${entry.sha}`, date: entry.date, title: entry.message, description: `${entry.author.name} · ${entry.additions} additions / ${entry.deletions} deletions`, commitSha: entry.sha, kind: 'growth' })
    }
  })

  return {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    source: 'github',
    repository: { name: repository.name, fullName: repository.full_name, description: repository.description || 'Public GitHub repository', url: repository.html_url, defaultBranch: repository.default_branch, createdAt: repository.created_at, updatedAt: repository.updated_at },
    commits,
    files,
    milestones,
    languages: languagePercentages(languageBytes),
  }
}
