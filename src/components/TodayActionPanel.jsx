import { useState } from 'react'
import { getMilestoneStatus, getActionPriorityScore, getPriorityReason } from '../utils/progress'

const CATEGORY_ICONS = {
  home: '🏠',
  birth: '👶',
  money: '💰',
  career: '💼',
  health: '💪',
  life: '✨',
}

function getCompletionEffect(action, milestone, allActions) {
  if (!milestone) return '行動進捗が進みます'
  const msActions = allActions.filter((a) => a.milestoneId === milestone.id)
  const completedBefore = msActions.filter((a) => a.completed).length
  const total = msActions.length
  const after = completedBefore + 1
  const title = milestone.title || '（無題）'
  return `マイルストーン「${title}」が ${completedBefore}/${total} → ${after}/${total} になります`
}

export default function TodayActionPanel({
  actions,
  allActions,
  dreams,
  strategies,
  milestones,
  allLinks,
  onToggle,
  onDelete,
}) {
  const [showAll, setShowAll] = useState(false)

  if (actions.length === 0) return null

  const actionsWithMeta = actions.map((action) => {
    const strategy = strategies.find((s) => s.id === action.strategyId)
    const milestone = milestones.find((m) => m.id === action.milestoneId)
    const computedStatus = milestone ? getMilestoneStatus(milestone, actions) : null
    const milestoneWithStatus = milestone ? { ...milestone, computedStatus } : null
    const score = getActionPriorityScore(action, strategy, milestoneWithStatus)
    const reason = getPriorityReason(action, milestoneWithStatus)
    return { action, strategy, milestone, score, reason }
  })

  const sorted = [...actionsWithMeta].sort((a, b) => b.score - a.score)
  const top = sorted[0]
  const rest = sorted.slice(1)
  const visibleRest = showAll ? rest : rest.slice(0, 3)

  const topEffect = top
    ? getCompletionEffect(top.action, top.milestone, allActions ?? actions)
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎯</span>
        <h2 className="text-sm font-semibold text-slate-700">今日の一手</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {actions.length}件
        </span>
      </div>

      {top && (
        <TopAction
          item={top}
          dreams={dreams}
          allLinks={allLinks}
          completionEffect={topEffect}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      )}

      {rest.length > 0 && (
        <div className="mt-3 space-y-1">
          {visibleRest.map((item) => (
            <CompactAction
              key={item.action.id}
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}

          {rest.length > 3 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full text-xs text-slate-400 hover:text-indigo-500 py-1.5 transition-colors"
            >
              {showAll ? '▲ 折りたたむ' : `▼ 残り ${rest.length - 3}件を表示`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TopAction({ item, dreams, allLinks, completionEffect, onToggle, onDelete }) {
  const { action, strategy, milestone, reason } = item
  const dream = dreams.find((d) => d.id === action.dreamId)
  const isOverdueAction = action.dueDate && new Date(action.dueDate) < new Date()

  // このActionのStrategyに紐づく他の夢
  const otherEffectingDreams =
    action.strategyId && allLinks
      ? allLinks
          .filter((l) => l.strategyId === action.strategyId && l.dreamId !== action.dreamId)
          .map((l) => dreams.find((d) => d.id === l.dreamId))
          .filter(Boolean)
      : []

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(action.id)}
          className="w-5 h-5 rounded-full border-2 border-indigo-400 flex-shrink-0 hover:bg-indigo-200 transition-colors mt-0.5"
          aria-label="完了にする"
        />

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
              最優先
            </span>
          </div>

          <p className="text-base font-semibold text-slate-800 leading-snug">{action.text}</p>

          {reason && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">理由：</p>
              <p className="text-xs text-indigo-700 leading-relaxed">{reason}</p>
            </div>
          )}

          {completionEffect && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 leading-relaxed">
              ✓ これを完了すると、{completionEffect}
            </p>
          )}

          {action.evidence && (
            <p className="text-xs text-slate-500 leading-relaxed">{action.evidence}</p>
          )}

          {action.deadlineEvidence && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-0.5">なぜこの日まで？</p>
              <p className="text-xs text-slate-500 leading-relaxed">{action.deadlineEvidence}</p>
            </div>
          )}

          {action.consequenceIfDelayed && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-0.5">遅れると？</p>
              <p className="text-xs text-red-500 leading-relaxed">{action.consequenceIfDelayed}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
            {action.estimatedMinutes > 0 && <span>見積もり：{action.estimatedMinutes}分</span>}
            {action.dueDate && (
              <span className={isOverdueAction ? 'text-red-500 font-medium' : ''}>
                期限：{new Date(action.dueDate).toLocaleDateString('ja-JP')}
                {isOverdueAction && ' ⚠️'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-1.5 text-xs text-slate-400">
            {dream && (
              <span>
                {CATEGORY_ICONS[dream.category] ?? '✨'} {dream.title}
              </span>
            )}
            {strategy?.title && (
              <>
                <span>›</span>
                <span>{strategy.title}</span>
              </>
            )}
            {milestone?.title && (
              <>
                <span>›</span>
                <span>{milestone.title}</span>
              </>
            )}
          </div>

          {otherEffectingDreams.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-slate-400">他の夢にも効く：</span>
              {otherEffectingDreams.map((d) => (
                <span
                  key={d.id}
                  className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full"
                >
                  {CATEGORY_ICONS[d.category] ?? '✨'} {d.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(action.id)}
            className="text-slate-300 hover:text-red-400 transition-all text-lg leading-none flex-shrink-0 mt-0.5"
            aria-label="削除"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

function CompactAction({ item, onToggle, onDelete }) {
  const { action } = item
  const isOverdueAction = action.dueDate && new Date(action.dueDate) < new Date()

  return (
    <div className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
      <button
        onClick={() => onToggle(action.id)}
        className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0 hover:border-indigo-400 transition-colors"
        aria-label="完了にする"
      />
      <p className="flex-1 text-sm text-slate-600 truncate">{action.text}</p>
      <div className="flex items-center gap-2 text-xs flex-shrink-0">
        {action.dueDate && (
          <span className={isOverdueAction ? 'text-red-500 font-medium' : 'text-indigo-400'}>
            {new Date(action.dueDate).toLocaleDateString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
            })}
          </span>
        )}
        {action.estimatedMinutes > 0 && (
          <span className="text-slate-400">{action.estimatedMinutes}分</span>
        )}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(action.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-base leading-none flex-shrink-0"
          aria-label="削除"
        >
          ×
        </button>
      )}
    </div>
  )
}
