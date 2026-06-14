import { useState } from 'react'
import { getMilestoneStatus, getProgressPercent } from '../utils/progress'
import { buildMilestoneEvidencePrompt } from '../utils/aiPrompt'
import { calculateMoneyProjection } from '../utils/moneyProjection'
import ActionList from './ActionList'

const STATUS_CONFIG = {
  completed: {
    icon: '✅',
    label: '完了',
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
  },
  in_progress: {
    icon: '🔵',
    label: '進行中',
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
  },
  not_started: {
    icon: '⚪',
    label: '未着手',
    badge: 'bg-slate-100 text-slate-500',
    border: 'border-slate-200',
  },
  overdue: {
    icon: '🔴',
    label: '期限切れ',
    badge: 'bg-red-100 text-red-600',
    border: 'border-red-200',
  },
}

export default function MilestoneStep({
  milestone,
  actions,
  onToggle,
  onToggleAction,
  onDeleteAction,
  dream,
  strategy,
  allDreams,
  allLinks,
}) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const milestoneActions = actions.filter((a) => a.milestoneId === milestone.id)
  const completedActions = milestoneActions.filter((a) => a.completed)
  const actionPercent = getProgressPercent(completedActions.length, milestoneActions.length)
  const status = getMilestoneStatus(milestone, actions)
  const cfg = STATUS_CONFIG[status]

  async function handleCopyPrompt() {
    const link = (allLinks || []).find(
      (l) => l.dreamId === dream?.id && l.strategyId === strategy?.id,
    )
    const dreamLinks = dream ? (allLinks || []).filter((l) => l.dreamId === dream.id) : []
    const moneyProjection =
      dream && dream.targetAmount > 0 && dream.deadline && dreamLinks.length > 0
        ? calculateMoneyProjection({ dream, dreamStrategyLinks: dreamLinks })
        : null
    const prompt = buildMilestoneEvidencePrompt({ dream, strategy, milestone, link, moneyProjection })
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.border}`}>
      <div className="flex items-start gap-3 p-3">
        <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${milestone.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
          >
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
            onClick={() => setShowActions((v) => !v)}
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
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showActions && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-3 space-y-3">
          {(milestone.doneDefinition ||
            milestone.deadlineEvidence ||
            milestone.consequenceIfDelayed ||
            milestone.whatProgressesWhenCompleted) ? (
            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
              {milestone.doneDefinition && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">完了条件</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{milestone.doneDefinition}</p>
                </div>
              )}
              {milestone.deadlineEvidence && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">なぜこの日まで？</p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {milestone.deadlineEvidence}
                  </p>
                </div>
              )}
              {milestone.consequenceIfDelayed && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-red-600 mb-1">遅れると何が起きる？</p>
                  <p className="text-xs text-red-700 leading-relaxed whitespace-pre-line">
                    {milestone.consequenceIfDelayed}
                  </p>
                </div>
              )}
              {milestone.whatProgressesWhenCompleted && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">✓ 完了すると何が進む？</p>
                  <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-line">
                    {milestone.whatProgressesWhenCompleted}
                  </p>
                </div>
              )}
              <button
                onClick={handleCopyPrompt}
                className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg px-2 py-1 transition-colors bg-white"
              >
                {copied ? '✓ AI用プロンプトをコピーしました' : '🤖 AI用プロンプトを再生成'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 text-center mb-2">
                「編集」タブでAIプロンプトを生成し、3項目を入力してください
              </p>
              <button
                onClick={handleCopyPrompt}
                className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg px-2 py-1 transition-colors bg-white"
              >
                {copied ? '✓ AI用プロンプトをコピーしました' : '🤖 AI用プロンプトをコピー'}
              </button>
            </div>
          )}

          <ActionList
            actions={milestoneActions}
            onToggle={onToggleAction}
            onDelete={onDeleteAction}
            milestoneName={milestone.title}
            strategyName={strategy?.title}
            promptContext={{ dream, strategy, milestone }}
            allDreams={allDreams}
            allLinks={allLinks}
          />
        </div>
      )}
    </div>
  )
}
