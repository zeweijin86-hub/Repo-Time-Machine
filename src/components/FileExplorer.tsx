import { FileCode2, FolderOpen, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { RepoReport } from '../types'
import { compactNumber, fileStatesAt, formatDate, latestFileTouch, shortPath, titleFromPath } from '../lib/report'
import { LineChart, SectionTitle } from './primitives'

export function FileExplorer({ report, commitIndex, onSelectCommit }: { report: RepoReport; commitIndex: number; onSelectCommit: (index: number) => void }) {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => fileStatesAt(report, commitIndex).filter((file) => file.path.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.commits - a.commits), [report, commitIndex, query])
  const [selectedPath, setSelectedPath] = useState(visible[0]?.path ?? '')
  useEffect(() => { if (!visible.some((file) => file.path === selectedPath)) setSelectedPath(visible[0]?.path ?? '') }, [visible, selectedPath])
  useEffect(() => { setQuery(''); setSelectedPath('') }, [report])
  const selected = visible.find((file) => file.path === selectedPath) ?? visible[0]
  const lastChange = selected ? latestFileTouch(report, selected.path, commitIndex) : -1

  return <div className="view-stack files-view">
    <section className="view-intro split-intro"><div><span className="eyebrow">FILE LIFECYCLE</span><h1>文件有自己的<br /><em>出生、增长与沉积。</em></h1></div><p>只显示当前时刻已经出现的文件。选择一项，观察它从第一次提交到最后修改的轨迹。</p></section>
    <section className="file-explorer-shell">
      <aside className="file-list-panel">
        <div className="file-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="筛选路径" /></div>
        <div className="file-count"><FolderOpen size={15} /> {visible.length} 可见文件</div>
        <div className="file-list">{visible.map((file) => <button type="button" key={file.path} className={file.path === selected?.path ? 'selected' : ''} onClick={() => setSelectedPath(file.path)}><FileCode2 size={15} /><span><strong>{titleFromPath(file.path)}</strong><small>{shortPath(file.path)}</small></span><em>{file.commits}</em></button>)}</div>
      </aside>
      <article className="file-detail-panel">{selected ? <>
        <div className="file-heading"><div><span className="eyebrow">RECORD / {String(visible.indexOf(selected) + 1).padStart(3, '0')}</span><h2>{titleFromPath(selected.path)}</h2><code>{selected.path}</code></div><button type="button" className="button secondary compact-button" disabled={lastChange < 0} onClick={() => onSelectCommit(lastChange)}>跳到最后变更</button></div>
        <div className="file-stats"><div><span>创建</span><strong>{formatDate(selected.createdAt)}</strong></div><div><span>修改次数</span><strong>{compactNumber(selected.commits)}</strong></div><div><span>累计变更</span><strong>+{compactNumber(selected.additions)} / −{compactNumber(selected.deletions)}</strong></div></div>
        <div className="file-chart"><SectionTitle eyebrow="规模变化" title="可追溯行数" /><LineChart values={selected.sizeSeries.map((point) => point.lines)} /><div className="chart-caption"><span>{formatDate(selected.createdAt)}</span><strong>{selected.sizeSeries.at(-1)?.lines ?? 0} lines</strong><span>{formatDate(selected.lastModified)}</span></div></div>
        <div className="contributors-block"><span className="eyebrow"><Users size={14} /> 主要贡献者</span><div>{selected.contributors.length ? selected.contributors.map((person, index) => <span className="contributor" key={person}><i>{person.slice(0, 1)}</i>{person}<small>#{String(index + 1).padStart(2, '0')}</small></span>) : <p className="empty-state">GitHub 列表没有提供足够的文件级贡献者数据。</p>}</div></div>
      </> : <p className="empty-state">当前时刻还没有可显示的文件。</p>}</article>
    </section>
  </div>
}
