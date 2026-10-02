import { ArrowUpRight, FolderTree, Layers3 } from 'lucide-react'
import type { RepoReport } from '../types'
import { compactNumber, cumulativeLines, currentCommit, fileStatesAt, formatDate, getMetrics, languageBreakdown, reportDirectorySummary } from '../lib/report'
import { LineChart, Metric, SectionTitle } from './primitives'

export function Overview({ report, commitIndex, onSelectCommit }: { report: RepoReport; commitIndex: number; onSelectCommit: (index: number) => void }) {
  const metrics = getMetrics(report, commitIndex)
  const lines = cumulativeLines(report)
  const directory = reportDirectorySummary(report, commitIndex)
  const liveFiles = fileStatesAt(report, commitIndex)
  const languages = languageBreakdown(liveFiles)
  const now = currentCommit(report, commitIndex)
  const activeMilestones = report.milestones.filter((milestone) => new Date(milestone.date) <= new Date(now.date)).slice(-4).reverse()
  const maxLanguage = Math.max(...Object.values(languages), 1)

  return <div className="view-stack overview-view">
    <section className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">ARCHIVE / {String(commitIndex + 1).padStart(3, '0')}</span>
        <h1>把散乱的 Git 记录，<br /><em>收成一条可探索的时间线。</em></h1>
        <p>当前停在 <strong>{formatDate(now.date)}</strong>。每一个指标都只计算该时刻之前已经发生的提交。</p>
      </div>
      <div className="hero-graphic" aria-hidden="true">
        <span className="graphic-year">{new Date(now.date).getFullYear()}</span>
        <div className="graphic-axis"><i /><i /><i /><i /><b style={{ left: `${(commitIndex / Math.max(report.commits.length - 1, 1)) * 100}%` }} /></div>
        <small>{now.shortSha} / {report.repository.defaultBranch}</small>
      </div>
    </section>

    <section className="metric-grid">
      <Metric label="可见提交" value={compactNumber(metrics.commits)} hint="随回放时间变化" accent />
      <Metric label="参与者" value={compactNumber(metrics.contributors)} hint="截至当前节点" />
      <Metric label="推算代码量" value={compactNumber(metrics.lines)} hint="累计增删行近似值" />
      <Metric label="目录档案" value={`${directory.files} 文件`} hint={`${directory.roots.length} 个根路径`} />
    </section>

    <section className="two-column wide-left">
      <article className="archive-card-panel evolution-card">
        <SectionTitle eyebrow="累计变化" title="代码量演进" action={<span className="data-chip">+{compactNumber(metrics.additions)} / −{compactNumber(metrics.deletions)}</span>} />
        <div className="chart-wrap"><LineChart values={lines.map((item) => item.value)} activeIndex={commitIndex} /></div>
        <div className="chart-caption"><span>{formatDate(report.commits[0].date)}</span><strong>{compactNumber(metrics.lines)} lines</strong><span>{formatDate(report.commits.at(-1)?.date ?? '')}</span></div>
      </article>
      <article className="archive-card-panel language-card">
        <SectionTitle eyebrow="语言构成" title="当前材料" />
        <div className="language-list">
          {Object.entries(languages).length ? Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], index) => <div className="language-row" key={name}>
            <span className={`language-dot tone-${index}`} /><strong>{name}</strong><div className="language-track"><i style={{ width: `${(value / maxLanguage) * 100}%` }} /></div><small>{value}%</small>
          </div>) : <p className="empty-state">当前数据源没有返回可用的语言统计。</p>}
        </div>
      </article>
    </section>

    <section className="two-column">
      <article className="archive-card-panel milestones-card">
        <SectionTitle eyebrow="关键节点" title="项目的阶段边界" action={<Layers3 size={17} />} />
        <div className="milestone-list">
          {activeMilestones.length ? activeMilestones.map((milestone) => {
            const index = report.commits.findIndex((commit) => commit.sha === milestone.commitSha)
            return <button key={milestone.id} type="button" className="milestone-row" onClick={() => onSelectCommit(index)}>
              <span className={`milestone-pin ${milestone.kind}`} /><div><strong>{milestone.title}</strong><small>{milestone.description}</small></div><time>{formatDate(milestone.date, false)}</time><ArrowUpRight size={15} />
            </button>
          }) : <p className="empty-state">继续播放，关键节点会在此归档。</p>}
        </div>
      </article>
      <article className="archive-card-panel directory-card">
        <SectionTitle eyebrow="目录快照" title="此时存在的结构" action={<FolderTree size={17} />} />
        <div className="directory-roots">{directory.roots.map((root, index) => { const isFile = liveFiles.some((file) => file.path === root); const count = liveFiles.filter((file) => file.path === root || file.path.startsWith(`${root}/`)).length; return <div key={root}><span>{String(index + 1).padStart(2, '0')}</span><strong>{isFile ? root : `${root}/`}</strong><small>{count} records</small></div> })}</div>
      </article>
    </section>
  </div>
}
