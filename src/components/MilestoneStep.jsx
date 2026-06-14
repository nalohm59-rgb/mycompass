import { useState } from 'react'
import { getMilestoneStatus, getProgressPercent } from '../utils/progress'
import ActionList from './ActionList'

const STATUS_CONFIG = {
  completed:   { icon: '✅', label: '完了',     badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
  in_progress: { icon: '🔵', label: '進行中',   badge: 'bg-blue-100 text-blue-700',      border: 'border-blue-200' },
  not_started: { icon: '⚪', label: '未着手',   badge: 'bg-slate-100 text-slate-500',    border: 'border-slate-200' },
  overdue:     { icon: '🔴', label: '期限切れ', badge: 'bg-red-100 text-red-600',        border: 'border-red-200' },
}

export default function MilestoneStep({
  milestone, actions,
  onToggle, onAddAction, onToggleAction, onDeleteAction,
}) {
  const [showActions, setShowActions] = useState(false)

  const milestoneActions = actions.filter(a => a.milestoneId === milestone.id)
  const completedActions = milestoneActions.filter(a => a.completed)
  const actionPercent = getProgressPercent(completedActions.length, milestoneActions.length)
  const status = getMilestoneStatus(milestone, actions)
  const cfg = STATUS_CONFIG[status]

  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.border}`}>
      <div className="flex items-start gap-3 p-3">
        <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${milestone.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {milestone.title || '（無題）'}
          </p>

          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {milestone.dueDate && (
              <span className="text-xs text-slate-400">
                {new Date(milestone.dueDate).toLocaleDateString('ja-JP')}
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
              {cfg.label}
            </span>
            {milestoneActions.length > 0 && (
              <span className="text-xs text-slate-400">
                Action {completedActions.length}/{milestoneActions.length}
              </span>
            )}
          </div>

          {milestoneActions.length > 0 && (
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-1 bg-indigo-400 rounded-full transition-all"
                style={{ width: `${actionPercent}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowActions(v => !v)}
            className="text-xs text-slate-400 hover:text-indigo-600 px-1.5 py-1 rounded transition-colors"
          >
            {showActions ? '▲' : '▼'}
          </button>
          <button
            onClick={onToggle}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              milestone.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 hover:border-emerald-400'
            }`}
          >
            {milestone.completed && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showActions && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-3">
          <ActionList
            actions={milestoneActions}
            onAdd={onAddAction}
            onToggle={onToggleAction}
            onDelete={onDeleteAction}
            hasParentMilestone
          />
        </div>
      )}
    </div>
  )
}
