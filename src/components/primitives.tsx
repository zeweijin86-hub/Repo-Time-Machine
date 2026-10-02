import type { ReactNode } from 'react'
import { Box, GitCommitHorizontal, Route } from 'lucide-react'

export function BlueprintMark({ compact = false }: { compact?: boolean }) {
  return <span className={`blueprint-mark ${compact ? 'compact' : ''}`} aria-hidden="true"><i /><i /><i /></span>
}

export function Metric({ label, value, hint, accent = false }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return <div className={`metric-card ${accent ? 'accent' : ''}`}>
    <span className="metric-label">{label}</span>
    <strong>{value}</strong>
    {hint && <small>{hint}</small>}
  </div>
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="section-title">
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
    {action}
  </div>
}

export function LineChart({ values, activeIndex }: { values: number[]; activeIndex?: number }) {
  const safe = values.length ? values : [0]
  const max = Math.max(...safe, 1)
  const min = Math.min(...safe, 0)
  const range = Math.max(max - min, 1)
  const coords = safe.map((value, index) => `${(index / Math.max(safe.length - 1, 1)) * 100},${100 - ((value - min) / range) * 86 - 7}`).join(' ')
  const x = ((activeIndex ?? safe.length - 1) / Math.max(safe.length - 1, 1)) * 100
  return <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="代码量演进曲线">
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1d4ed8" stopOpacity=".18" /><stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" /></linearGradient></defs>
    <polygon points={`0,100 ${coords} 100,100`} fill="url(#chartFill)" />
    <polyline points={coords} fill="none" stroke="#1d4ed8" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    <line x1={x} x2={x} y1="0" y2="100" stroke="#f59e0b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
  </svg>
}

export function SourceIcon({ type }: { type: 'commit' | 'tree' | 'route' }) {
  const Icon = type === 'commit' ? GitCommitHorizontal : type === 'tree' ? Box : Route
  return <Icon size={16} strokeWidth={1.7} />
}
