import { Download, FileJson, GitFork, LoaderCircle, Play, Upload } from 'lucide-react'
import { useRef } from 'react'
import type { RepoReport } from '../types'
import { downloadReport } from '../lib/report'

interface Props {
  report: RepoReport
  githubUrl: string
  onGithubUrlChange: (value: string) => void
  onGithubImport: () => void
  onFileImport: (file: File) => void
  onLoadDemo: () => void
  isLoading: boolean
}

export function ImportPanel({ report, githubUrl, onGithubUrlChange, onGithubImport, onFileImport, onLoadDemo, isLoading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  return <section className="import-panel">
    <div className="panel-label"><GitFork size={15} /> 导入档案</div>
    <label className="github-input">
      <span>公开 GitHub 仓库</span>
      <input value={githubUrl} onChange={(event) => onGithubUrlChange(event.target.value)} placeholder="github.com/owner/repo" onKeyDown={(event) => { if (event.key === 'Enter') onGithubImport() }} />
    </label>
    <button className="button primary import-button" type="button" onClick={onGithubImport} disabled={isLoading || !githubUrl.trim()}>
      {isLoading ? <LoaderCircle size={16} className="spin" /> : <GitFork size={16} />} {isLoading ? '读取提交中' : '读取公开仓库'}
    </button>
    <div className="import-divider"><span>或</span></div>
    <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) onFileImport(file); event.currentTarget.value = '' }} />
    <button className="button secondary" type="button" onClick={() => inputRef.current?.click()}><Upload size={16} /> 导入 report.json</button>
    <button className="button ghost" type="button" onClick={onLoadDemo}><Play size={15} fill="currentColor" /> 载入演示档案</button>
    <div className="cli-note">
      <FileJson size={15} /><span>本地仓库用 <code>pnpm analyze /path --output report.json</code> 导出。</span>
    </div>
    <div className="archive-card">
      <div><span className="archive-title">可携带归档</span><small>下载当前报告；不上传代码</small></div>
      <button type="button" onClick={() => downloadReport(report)} aria-label="下载当前报告"><Download size={16} /></button>
    </div>
  </section>
}
