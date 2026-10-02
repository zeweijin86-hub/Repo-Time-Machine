#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'

const args = process.argv.slice(2)
const repoArg = args.find((arg) => !arg.startsWith('--')) || '.'
const outputFlag = args.indexOf('--output')
const outputArg = outputFlag >= 0 ? args[outputFlag + 1] : 'report.json'
const repo = resolve(repoArg)
const output = resolve(outputArg)

function run(...gitArgs) {
  try {
    return execFileSync('git', ['-C', repo, ...gitArgs], { encoding: 'utf8', maxBuffer: 24 * 1024 * 1024 }).trim()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown git error'
    throw new Error(`无法读取 Git 仓库：${message}`)
  }
}

function runOptional(...gitArgs) {
  try {
    return execFileSync('git', ['-C', repo, ...gitArgs], { encoding: 'utf8', maxBuffer: 24 * 1024 * 1024 }).trim()
  } catch {
    return ''
  }
}

const rawLog = run('log', '--reverse', '--max-count=200', '--date=iso-strict', '--format=%H%x1f%ad%x1f%an%x1f%ae%x1f%s')
if (!rawLog) throw new Error('当前仓库没有可分析的提交。')
const logEntries = rawLog.split('\n').filter(Boolean).map((line) => {
  const [sha, date, author, email, message] = line.split('\x1f')
  return { sha, date, author, email, message }
})

const extensionLanguage = { '.ts': 'TypeScript', '.tsx': 'TSX', '.js': 'JavaScript', '.jsx': 'JSX', '.py': 'Python', '.go': 'Go', '.rs': 'Rust', '.java': 'Java', '.md': 'Markdown', '.json': 'JSON', '.css': 'CSS', '.html': 'HTML', '.yml': 'YAML', '.yaml': 'YAML' }
const files = new Map()
const commits = logEntries.map((entry, index) => {
  const stat = run('show', '--numstat', '--format=', entry.sha)
  const changes = stat.split('\n').filter(Boolean).map((line) => {
    const [added, deleted, ...pathParts] = line.split('\t')
    const path = pathParts.join('\t').replace(/^\{.* => (.*)\}$/, '$1')
    const additions = Number.parseInt(added, 10) || 0
    const deletions = Number.parseInt(deleted, 10) || 0
    const status = additions > 0 && deletions === 0 ? 'added' : additions === 0 && deletions > 0 ? 'deleted' : 'modified'
    const record = files.get(path) || { path, createdAt: entry.date, lastModified: entry.date, contributors: new Set(), commits: 0, additions: 0, deletions: 0, lines: 0, sizeSeries: [] }
    record.lastModified = entry.date
    record.contributors.add(entry.author)
    record.commits += 1
    record.additions += additions
    record.deletions += deletions
    record.lines = Math.max(0, record.lines + additions - deletions)
    record.sizeSeries.push({ date: entry.date, lines: record.lines })
    files.set(path, record)
    return { path, status, additions, deletions }
  })
  const additions = changes.reduce((sum, change) => sum + change.additions, 0)
  const deletions = changes.reduce((sum, change) => sum + change.deletions, 0)
  const tag = run('tag', '--points-at', entry.sha).split('\n').filter(Boolean)
  const diff = run('show', '--format=', '--unified=2', entry.sha).slice(0, 8000)
  return { sha: entry.sha, shortSha: entry.sha.slice(0, 7), date: entry.date, author: { name: entry.author, email: entry.email }, message: entry.message, additions, deletions, files: changes, diff, tags: tag.length ? tag : undefined, _index: index }
})

const reportedFiles = [...files.values()].map((file) => ({ path: file.path, createdAt: file.createdAt, lastModified: file.lastModified, contributors: [...file.contributors], commits: file.commits, additions: file.additions, deletions: file.deletions, sizeSeries: file.sizeSeries }))
const languages = {}
for (const file of reportedFiles) {
  const language = extensionLanguage[extname(file.path).toLowerCase()] || 'Other'
  languages[language] = (languages[language] || 0) + Math.max(1, file.additions - file.deletions)
}
const languageTotal = Object.values(languages).reduce((sum, value) => sum + value, 0) || 1
for (const [language, value] of Object.entries(languages)) languages[language] = Math.max(1, Math.round((value / languageTotal) * 100))
const remoteUrl = runOptional('config', '--get', 'remote.origin.url') || undefined
const name = repo.split('/').filter(Boolean).at(-1) || 'repository'
const milestones = commits.flatMap((commit, index) => {
  if (commit.tags?.length) return [{ id: `tag-${commit.sha}`, date: commit.date, title: commit.tags[0], description: `Tag at ${commit.shortSha}`, commitSha: commit.sha, kind: 'tag' }]
  if (index === 0 || index === commits.length - 1 || index % Math.max(1, Math.ceil(commits.length / 6)) === 0) return [{ id: `phase-${commit.sha}`, date: commit.date, title: commit.message, description: `${commit.author.name} · ${commit.additions} additions / ${commit.deletions} deletions`, commitSha: commit.sha, kind: 'growth' }]
  return []
})

const report = {
  schemaVersion: '1.0', generatedAt: new Date().toISOString(), source: 'local',
  repository: { name, fullName: name, description: 'Analyzed from a local Git working tree', url: remoteUrl, defaultBranch: run('branch', '--show-current') || 'HEAD', createdAt: commits[0].date, updatedAt: commits.at(-1).date },
  commits: commits.map(({ _index, ...commit }) => commit), files: reportedFiles, milestones, languages,
}
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Repo Time Machine report written: ${output}`)
console.log(`${report.commits.length} commits · ${report.files.length} files · ${Object.keys(report.languages).length} languages`)
