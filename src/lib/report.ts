import type { RepoCommit, RepoFile, RepoReport } from '../types'

export type FileState = RepoFile & { alive: boolean }

export const formatDate = (value: string, withYear = true) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: withYear ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

export const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(Math.round(value))

export const compactNumber = (value: number) =>
  new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.round(value))

export const titleFromPath = (path: string) => path.split('/').filter(Boolean).at(-1) || path

export const shortPath = (path: string) => path.split('/').slice(-2).join('/')

export function commitsThrough(report: RepoReport, commitIndex: number): RepoCommit[] {
  return report.commits.slice(0, Math.max(0, commitIndex + 1))
}

export function currentCommit(report: RepoReport, commitIndex: number): RepoCommit {
  return report.commits[Math.min(Math.max(commitIndex, 0), report.commits.length - 1)]
}

export function getMetrics(report: RepoReport, commitIndex: number) {
  const visible = commitsThrough(report, commitIndex)
  const contributors = new Set(visible.map((commit) => commit.author.name))
  const additions = visible.reduce((sum, commit) => sum + commit.additions, 0)
  const deletions = visible.reduce((sum, commit) => sum + commit.deletions, 0)
  const baseline = report.repository.baselineLines ?? 0

  return {
    commits: visible.length,
    contributors: contributors.size,
    lines: Math.max(0, baseline + additions - deletions),
    churn: additions + deletions,
    additions,
    deletions,
  }
}

export function cumulativeLines(report: RepoReport) {
  const baseline = report.repository.baselineLines ?? 0
  let value = baseline
  return report.commits.map((commit) => {
    value = Math.max(0, value + commit.additions - commit.deletions)
    return { date: commit.date, value }
  })
}

export function fileStatesAt(report: RepoReport, commitIndex: number): FileState[] {
  const state = new Map<string, FileState>()
  for (const commit of commitsThrough(report, commitIndex)) {
    for (const change of commit.files) {
      const file = state.get(change.path) ?? {
        path: change.path,
        createdAt: commit.date,
        lastModified: commit.date,
        contributors: [],
        commits: 0,
        additions: 0,
        deletions: 0,
        sizeSeries: [],
        alive: true,
      }
      file.lastModified = commit.date
      file.commits += 1
      file.additions += change.additions
      file.deletions += change.deletions
      if (!file.contributors.includes(commit.author.name)) file.contributors.push(commit.author.name)
      const previousLines = file.sizeSeries.at(-1)?.lines ?? 0
      const nextLines = change.status === 'deleted' ? 0 : Math.max(0, previousLines + change.additions - change.deletions)
      file.sizeSeries.push({ date: commit.date, lines: nextLines })
      file.alive = change.status !== 'deleted'
      state.set(change.path, file)
    }
  }

  if (!state.size) {
    const at = new Date(currentCommit(report, commitIndex).date).getTime()
    return report.files.filter((file) => new Date(file.createdAt).getTime() <= at).map((file) => ({ ...file, alive: true }))
  }
  return [...state.values()].filter((file) => file.alive).sort((a, b) => a.path.localeCompare(b.path))
}

const extensionLanguage: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', jsx: 'JSX', py: 'Python', go: 'Go', rs: 'Rust', java: 'Java',
  md: 'Markdown', json: 'JSON', css: 'CSS', html: 'HTML', yml: 'YAML', yaml: 'YAML',
}

export function languageBreakdown(files: FileState[]): Record<string, number> {
  const values = new Map<string, number>()
  for (const file of files) {
    const extension = titleFromPath(file.path).split('.').at(-1)?.toLowerCase() ?? ''
    const language = extensionLanguage[extension] ?? 'Other'
    const weight = Math.max(1, file.sizeSeries.at(-1)?.lines ?? file.additions - file.deletions)
    values.set(language, (values.get(language) ?? 0) + weight)
  }
  const total = [...values.values()].reduce((sum, value) => sum + value, 0) || 1
  return Object.fromEntries([...values.entries()].map(([language, value]) => [language, Math.max(1, Math.round((value / total) * 100))]))
}

export function latestFileTouch(report: RepoReport, path: string, commitIndex: number): number {
  for (let index = Math.min(commitIndex, report.commits.length - 1); index >= 0; index -= 1) {
    if (report.commits[index].files.some((file) => file.path === path)) return index
  }
  return -1
}

export function reportDirectorySummary(report: RepoReport, commitIndex: number) {
  const visible = fileStatesAt(report, commitIndex)
  const roots = new Set(visible.map((file) => file.path.split('/')[0]).filter(Boolean))
  return { files: visible.length, roots: [...roots].sort() }
}

function isValidCommit(value: unknown): value is RepoCommit {
  if (!value || typeof value !== 'object') return false
  const commit = value as Partial<RepoCommit>
  return typeof commit.sha === 'string' && typeof commit.shortSha === 'string' && typeof commit.date === 'string' && Number.isFinite(new Date(commit.date).getTime()) && typeof commit.message === 'string' && typeof commit.additions === 'number' && typeof commit.deletions === 'number' && Boolean(commit.author && typeof commit.author.name === 'string') && Array.isArray(commit.files)
}

export async function parseReportFile(file: File): Promise<RepoReport> {
  const raw = JSON.parse(await file.text()) as Partial<RepoReport>
  if (raw.schemaVersion !== '1.0' || !raw.repository || typeof raw.repository.name !== 'string' || !Array.isArray(raw.commits) || raw.commits.length === 0 || !raw.commits.every(isValidCommit) || !Array.isArray(raw.files) || !Array.isArray(raw.milestones) || !raw.languages) {
    throw new Error('这不是有效的 Repo Time Machine report.json 文件。')
  }
  const commits = [...raw.commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return { ...(raw as RepoReport), commits }
}

export function downloadReport(report: RepoReport) {
  const payload = JSON.stringify(report, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${report.repository.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'repo'}-report.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const sourceLabel: Record<RepoReport['source'], string> = {
  demo: '内置演示档案',
  github: 'GitHub 公开导入',
  local: '本地 Git CLI',
}
