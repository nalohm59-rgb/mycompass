import { useState } from 'react'
import ActionComposer from './ActionComposer'

export default function ActionList({ actions, onAdd, onToggle, onDelete, hasParentMilestone = false }) {
  const [showComposer, setShowComposer] = useState(false)

  const completed = actions.filter(a => a.completed).length

  return (
    <div className="space-y-1.5">
      {actions.length > 0 && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-500">未来に効く行動</span>
          <span className="text-xs text-slate-400">{completed}/{actions.length} 完了</span>
        </div>
      )}

      <ul className="space-y-1">
        {actions.length === 0 && !showComposer && (
          <li className="text-xs text-slate-400 text-center py-2">
            行動を追加してください
          </li>
        )}
        {actions.map(action => (
          <li
            key={action.id}
            className="flex items-start gap-2 group px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <button
              onClick={() => onToggle(action.id)}
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                action.completed
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'border-slate-300 hover:border-indigo-400'
              }`}
            >
              {action.completed && (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${action.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {action.text}
              </p>
              <div className="flex gap-3 mt-0.5 flex-wrap">
                {action.dueDate && (
                  <span className="text-xs text-indigo-400">
                    {new Date(action.dueDate).toLocaleDateString('ja-JP')}
                  </span>
                )}
                {action.estimatedMinutes > 0 && (
                  <span className="text-xs text-slate-400">{action.estimatedMinutes}分</span>
                )}
                {action.evidence && (
                  <span className="text-xs text-slate-400 truncate max-w-[200px]">
                    根拠: {action.evidence}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(action.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-base leading-none flex-shrink-0 mt-0.5"
              aria-label="削除"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {showComposer ? (
        <ActionComposer
          onAdd={fields => { onAdd(fields); setShowComposer(false) }}
          onCancel={() => setShowComposer(false)}
          hasParentMilestone={hasParentMilestone}
        />
      ) : (
        <button
          onClick={() => setShowComposer(true)}
          className="w-full text-xs text-indigo-600 hover:text-indigo-800 py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          ＋ 今日の一手を追加
        </button>
      )}
    </div>
  )
}
