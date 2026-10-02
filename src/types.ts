export type ReportSource = 'demo' | 'github' | 'local'
export type MilestoneKind = 'phase' | 'tag' | 'release' | 'refactor' | 'growth'

export interface FileChange {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
}

export interface RepoCommit {
  sha: string
  shortSha: string
  date: string
  author: { name: string; email?: string; avatarUrl?: string }
  message: string
  additions: number
  deletions: number
  files: FileChange[]
  diff?: string
  tags?: string[]
}

export interface RepoFile {
  path: string
  createdAt: string
  lastModified: string
  contributors: string[]
  commits: number
  additions: number
  deletions: number
  sizeSeries: Array<{ date: string; lines: number }>
}

export interface RepoMilestone {
  id: string
  date: string
  title: string
  description: string
  commitSha: string
  kind: MilestoneKind
}

export interface RepoReport {
  schemaVersion: '1.0'
  generatedAt: string
  source: ReportSource
  repository: {
    name: string
    fullName: string
    description: string
    url?: string
    defaultBranch: string
    createdAt: string
    updatedAt: string
    baselineLines?: number
  }
  commits: RepoCommit[]
  files: RepoFile[]
  milestones: RepoMilestone[]
  languages: Record<string, number>
}

export type AppView = 'overview' | 'timeline' | 'files' | 'replay'
