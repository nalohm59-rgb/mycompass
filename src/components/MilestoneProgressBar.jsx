import { getProgressPercent } from '../utils/progress'

export default function MilestoneProgressBar({ milestones }) {
  const total = milestones.length
  const completed = milestones.filter(m => m.completed).length
  const percent = getProgressPercent(completed, total)

  if (total === 0) return null

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">計画進捗</span>
        <span className="text-xs font-medium text-slate-600">{completed} / {total} 完了</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
