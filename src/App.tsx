import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { demoReport } from './data/demoReport'
import { loadGitHubReport } from './lib/github'
import { currentCommit, formatDate, parseReportFile, sourceLabel } from './lib/report'
import { ImportPanel } from './components/ImportPanel'
import { FileExplorer } from './components/FileExplorer'
import { Overview } from './components/Overview'
import { ReplayPanel } from './components/ReplayPanel'
import { Timeline } from './components/Timeline'
import { BlueprintMark } from './components/primitives'
import type { AppView, RepoReport } from './types'

const navigation: Array<{ id: AppView; order: string; label: string; caption: string }> = [
  { id: 'overview', order: '01', label: '总览', caption: '项目脉络' },
  { id: 'timeline', order: '02', label: '时间线', caption: '阶段边界' },
  { id: 'files', order: '03', label: '文件演进', caption: '生命周期' },
  { id: 'replay', order: '04', label: '提交回放', caption: '差异阅读' },
]

export function App() {
  const [report, setReport] = useState<RepoReport>(demoReport)
  const [activeView, setActiveView] = useState<AppView>('overview')
  const [commitIndex, setCommitIndex] = useState(demoReport.commits.length - 1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const commit = currentCommit(report, commitIndex)
  const progress = report.commits.length > 1 ? (commitIndex / (report.commits.length - 1)) * 100 : 100
  const source = sourceLabel[report.source]

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setCommitIndex((current) => {
        if (current >= report.commits.length - 1) {
          setIsPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1200)
    return () => window.clearInterval(timer)
  }, [isPlaying, report.commits.length])

  const selectCommit = (next: number) => {
    setCommitIndex(Math.min(Math.max(next, 0), report.commits.length - 1))
    setIsPlaying(false)
  }

  const activateReport = (nextReport: RepoReport, message: string) => {
    setReport(nextReport)
    setCommitIndex(Math.max(0, nextReport.commits.length - 1))
    setActiveView('overview')
    setIsPlaying(false)
    setNotice(message)
  }

  const importGitHub = async () => {
    try {
      setIsLoading(true)
      setNotice('正在从 GitHub 读取公开元数据与最近提交…')
      const nextReport = await loadGitHubReport(githubUrl)
      activateReport(nextReport, `已建立 ${nextReport.repository.fullName} 的公开历史档案。匿名 GitHub 导入仅包含最近 ${nextReport.commits.length} 笔提交。`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '导入失败，请检查仓库链接后重试。')
    } finally {
      setIsLoading(false)
    }
  }

  const importFile = async (file: File) => {
    try {
      const nextReport = await parseReportFile(file)
      activateReport(nextReport, `已导入 ${nextReport.repository.name} 的本地分析报告。`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '无法读取报告文件。')
    }
  }

  const renderView = useMemo(() => {
    const props = { report, commitIndex, onSelectCommit: selectCommit }
    if (activeView === 'timeline') return <Timeline {...props} />
    if (activeView === 'files') return <FileExplorer {...props} />
    if (activeView === 'replay') return <ReplayPanel {...props} />
    return <Overview {...props} />
  }, [activeView, report, commitIndex])

  return <div className="app-shell">
    <aside className="left-rail">
      <div className="brand-lockup"><BlueprintMark /><div><strong>Repo <em>Time</em> Machine</strong><span>PROJECT ARCHIVE</span></div></div>
      <div className="rail-rule" />
      <section className="repository-stamp">
        <span className="eyebrow">CURRENT REPOSITORY</span>
        <strong>{report.repository.fullName}</strong>
        <small>{source}</small>
        <div><i /> {report.repository.defaultBranch} <span>·</span> {report.commits.length} commits</div>
      </section>
      <nav className="main-nav" aria-label="报告视图">
        {navigation.map((item) => <button type="button" key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><span>{item.order}</span><div><strong>{item.label}</strong><small>{item.caption}</small></div><i /></button>)}
      </nav>
      <ImportPanel report={report} githubUrl={githubUrl} onGithubUrlChange={setGithubUrl} onGithubImport={importGitHub} onFileImport={importFile} onLoadDemo={() => activateReport(demoReport, '已恢复内置演示仓库：Cobalt。')} isLoading={isLoading} />
      <div className="rail-footer"><span>LOCAL-FIRST / 0.1</span><small>报告始终由你决定是否保存与分享。</small></div>
    </aside>

    <main className="main-canvas">
      <header className="topbar">
        <div className="breadcrumb"><span>档案馆</span><i>/</i><strong>{navigation.find((item) => item.id === activeView)?.label}</strong></div>
        <div className="topbar-meta"><span className="source-chip">{source}</span>{report.repository.url && <a href={report.repository.url} target="_blank" rel="noreferrer">原仓库 ↗</a>}</div>
      </header>
      <section className="replay-rail" aria-label="历史回放控制">
        <button type="button" className="play-button" onClick={() => { if (commitIndex === report.commits.length - 1) setCommitIndex(0); setIsPlaying((value) => !value) }} aria-label={isPlaying ? '暂停回放' : '播放回放'}>{isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
        <div className="scrubber"><input type="range" min="0" max={Math.max(0, report.commits.length - 1)} value={commitIndex} onChange={(event) => selectCommit(Number(event.target.value))} style={{ '--progress': `${progress}%` } as CSSProperties} /><div><span>{formatDate(report.commits[0].date)}</span><strong>{formatDate(commit.date)}</strong><span>{formatDate(report.commits.at(-1)?.date ?? '')}</span></div></div>
        <button className="reset-button" type="button" onClick={() => selectCommit(report.commits.length - 1)}><RotateCcw size={15} /> 最新</button>
      </section>
      {notice && <div className="notice-bar"><span>档案提示</span><p>{notice}</p><button type="button" onClick={() => setNotice('')} aria-label="关闭提示">×</button></div>}
      <div className="canvas-content">{renderView}</div>
    </main>

    <aside className="right-rail">
      <span className="eyebrow">CURRENT RECORD</span>
      <div className="record-index">{String(commitIndex + 1).padStart(3, '0')}</div>
      <div className="record-line" />
      <time>{formatDate(commit.date)}</time>
      <strong className="record-message">{commit.message}</strong>
      <div className="record-author"><i>{commit.author.name.slice(0, 1)}</i><span>{commit.author.name}<small>author</small></span></div>
      <div className="record-deltas"><span><b>+</b>{commit.additions}</span><span><b>−</b>{commit.deletions}</span><span><b>ƒ</b>{commit.files.length}</span></div>
      <div className="record-sha"><span>SHA</span><code>{commit.shortSha}</code></div>
      <div className="right-footer"><div><i /> 回放同步</div><small>指标、目录、文件与差异均锁定到当前节点。</small></div>
    </aside>
  </div>
}
