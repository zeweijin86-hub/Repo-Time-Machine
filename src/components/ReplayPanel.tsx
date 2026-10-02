import { ChevronLeft, ChevronRight, Copy, FileDiff, Files, GitCommitHorizontal, Minus, Plus } from 'lucide-react'
import type { RepoReport } from '../types'
import { compactNumber, currentCommit, formatDate } from '../lib/report'

export function ReplayPanel({ report, commitIndex, onSelectCommit }: { report: RepoReport; commitIndex: number; onSelectCommit: (index: number) => void }) {
  const commit = currentCommit(report, commitIndex)
  const previous = commitIndex > 0
  const next = commitIndex < report.commits.length - 1
  const copySha = () => navigator.clipboard?.writeText(commit.sha)

  return <div className="view-stack replay-view">
    <section className="view-intro replay-intro"><div><span className="eyebrow">COMMIT REPLAY</span><h1>停在一个瞬间，<br /><em>读懂它改变了什么。</em></h1></div><div className="step-controls"><button type="button" onClick={() => onSelectCommit(commitIndex - 1)} disabled={!previous}><ChevronLeft size={18} /> 上一笔</button><span>{String(commitIndex + 1).padStart(2, '0')} / {String(report.commits.length).padStart(2, '0')}</span><button type="button" onClick={() => onSelectCommit(commitIndex + 1)} disabled={!next}>下一笔 <ChevronRight size={18} /></button></div></section>
    <section className="commit-card-main">
      <div className="commit-card-top"><span className="commit-date">{formatDate(commit.date)} · {commit.author.name}</span><div>{commit.tags?.map((tag) => <b key={tag}>{tag}</b>)}<button type="button" onClick={copySha} aria-label="复制完整 SHA"><Copy size={15} /> {commit.shortSha}</button></div></div>
      <h2>{commit.message}</h2>
      <div className="commit-impact"><span><Plus size={16} /> {compactNumber(commit.additions)} additions</span><span><Minus size={16} /> {compactNumber(commit.deletions)} deletions</span><span><Files size={16} /> {commit.files.length} files</span><span><GitCommitHorizontal size={16} /> {commit.shortSha}</span></div>
    </section>
    <section className="two-column replay-columns">
      <article className="archive-card-panel changed-files"><SectionHeading /><div className="changed-files-title"><FileDiff size={18} /><div><span className="eyebrow">影响范围</span><h2>文件变更清单</h2></div></div><div>{commit.files.length ? commit.files.map((file) => <div className="changed-file" key={file.path}><i className={file.status}>{file.status.slice(0, 1).toUpperCase()}</i><code>{file.path}</code><span>+{file.additions} −{file.deletions}</span></div>) : <p className="empty-state">此提交没有可解析的文件级统计。</p>}</div></article>
      <article className="archive-card-panel diff-panel"><div className="diff-heading"><div><span className="eyebrow">PATCH EXCERPT</span><h2>差异阅读</h2></div><small>已受控截断</small></div>{commit.diff ? <pre>{commit.diff}</pre> : <p className="empty-state">此数据源没有附带代码 patch；仍可阅读影响文件与增删统计。</p>}</article>
    </section>
  </div>
}

function SectionHeading() { return null }
