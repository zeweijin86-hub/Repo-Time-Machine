import { CalendarDays, GitCommitHorizontal, Tag } from 'lucide-react'
import type { RepoReport } from '../types'
import { compactNumber, formatDate } from '../lib/report'

export function Timeline({ report, commitIndex, onSelectCommit }: { report: RepoReport; commitIndex: number; onSelectCommit: (index: number) => void }) {
  const milestoneMap = new Map(report.milestones.map((item) => [item.commitSha, item]))
  const events = report.commits.map((commit, index) => ({ commit, index, milestone: milestoneMap.get(commit.sha) })).reverse()

  return <div className="view-stack timeline-view">
    <section className="view-intro">
      <span className="eyebrow">PROJECT CHRONICLE</span><h1>项目不是一串提交，<em>而是一个个阶段的交界。</em></h1>
      <p>节点按 Git 提交时间排列。带色标的记录是 tag、release 或系统自动识别的阶段边界。</p>
    </section>
    <section className="timeline-legend"><span><i className="legend-dot current" /> 当前时刻</span><span><i className="legend-dot phase" /> 阶段节点</span><span><GitCommitHorizontal size={14} /> 常规提交</span></section>
    <section className="timeline-list">
      {events.map(({ commit, index, milestone }) => <button key={commit.sha} className={`timeline-event ${index === commitIndex ? 'selected' : ''} ${milestone ? 'major' : ''}`} type="button" onClick={() => onSelectCommit(index)}>
        <time><CalendarDays size={14} />{formatDate(commit.date)}</time>
        <span className="timeline-rail"><i /></span>
        <div className="timeline-content">
          <div className="event-meta"><span>{commit.shortSha}</span>{commit.tags?.map((tag) => <b key={tag}><Tag size={12} /> {tag}</b>)}</div>
          <strong>{milestone?.title || commit.message}</strong>
          <p>{milestone?.description || `${commit.author.name} · ${compactNumber(commit.additions)} additions / ${compactNumber(commit.deletions)} deletions`}</p>
          <div className="affected-paths">{commit.files.slice(0, 3).map((file) => <code key={file.path}>{file.path}</code>)}</div>
        </div>
      </button>)}
    </section>
  </div>
}
