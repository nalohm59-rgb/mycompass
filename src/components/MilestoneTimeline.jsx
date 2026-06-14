import MilestoneStep from './MilestoneStep'
import { sortByDueDate, getProgressPercent } from '../utils/progress'

export default function MilestoneTimeline({
  milestones, actions,
  onToggle, onAddAction, onToggleAction, onDeleteAction,
}) {
  const sorted = sortByDueDate(milestones)
  const today = new Date()

  const plannedCompletedCount = milestones.filter(
    m => m.dueDate && new Date(m.dueDate) <= today
  ).length
  const actualCompletedCount = milestones.filter(m => m.completed).length

  const plannedProgress = getProgressPercent(plannedCompletedCount, milestones.length)
  const actualProgress = getProgressPercent(actualCompletedCount, milestones.length)
  const delayPercent = Math.max(0, plannedProgress - actualProgress)

  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-2">ロードマップ</p>

      {milestones.length > 0 && (
        <div className="mb-3 space-y-1.5 bg-slate-50 rounded-xl p-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>予定進捗</span>
              <span>{plannedProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-1.5 bg-slate-400 rounded-full" style={{ width: `${plannedProgress}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span>実績進捗</span>
              <span>{actualProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${actualProgress}%` }} />
            </div>
          </div>
          {delayPercent > 0 && (
            <p className="text-xs text-red-500 font-medium">{delayPercent}% 遅れ</p>
          )}
          {delayPercent === 0 && actualProgress > 0 && (
            <p className="text-xs text-emerald-600 font-medium">予定通り進行中</p>
          )}
        </div>
      )}

      {sorted.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-3">
          「編集」タブでマイルストーンを追加してください
        </p>
      )}

      <div className="space-y-2">
        {sorted.map(milestone => (
          <MilestoneStep
            key={milestone.id}
            milestone={milestone}
            actions={actions}
            onToggle={() => onToggle(milestone.id)}
            onAddAction={fields => onAddAction(milestone.id, fields)}
            onToggleAction={onToggleAction}
            onDeleteAction={onDeleteAction}
          />
        ))}
      </div>
    </div>
  )
}
