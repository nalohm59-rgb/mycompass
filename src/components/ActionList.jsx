import { useState } from 'react'
import { buildActionEvidencePrompt } from '../utils/aiPrompt'
import { calculateMoneyProjection } from '../utils/moneyProjection'
import MoneyImpactCard from './MoneyImpactCard'

const CATEGORY_ICONS = {
  home: '🏠',
  birth: '👶',
  money: '💰',
  career: '💼',
  health: '💪',
  life: '✨',
}

function getCompletionMsg(action, allScopeActions, { milestoneName, strategyName } = {}) {
  if (action.completed) return 'このActionは完了済みです。'
  const completedBefore = allScopeActions.filter((a) => a.completed && a.id !== action.id).length
  const total = allScopeActions.length
  const after = completedBefore + 1
  if (milestoneName) {
    return `マイルストーン「${milestoneName}」のAction進捗が ${completedBefore}/${total} → ${after}/${total} になります`
  }
  if (strategyName) {
    return `戦略「${strategyName}」のAction進捗が ${completedBefore}/${total} → ${after}/${total} になります`
  }
  return '行動進捗が進みます'
}

function ActionItem({
  action,
  displayActions,
  allScopeActions,
  onToggle,
  onDelete,
  milestoneName,
  strategyName,
  promptContext,
  allDreams,
  allLinks,
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const isOverdue = action.dueDate && new Date(action.dueDate) < new Date()

  // 金額インパクト計算（blocksStrategyStart=true のときのみ）
  const actionDream = (allDreams || []).find((d) => d.id === action.dreamId) ?? promptContext?.dream
  const dreamLinks = actionDream ? (allLinks || []).filter((l) => l.dreamId === actionDream.id) : []
  const delayMonths = Math.max(1, Math.ceil((action.delayImpactDays || 30) / 30))
  const moneyProjection =
    action.blocksStrategyStart &&
    actionDream &&
    actionDream.targetAmount > 0 &&
    actionDream.deadline &&
    dreamLinks.length > 0
      ? calculateMoneyProjection({
          dream: actionDream,
          dreamStrategyLinks: dreamLinks,
          delayScenario: { delayMonths, affectedStrategyId: action.strategyId },
        })
      : null

  async function handleCopyPrompt() {
    const link = (allLinks || []).find(
      (l) => l.dreamId === actionDream?.id && l.strategyId === action.strategyId,
    )
    const prompt = buildActionEvidencePrompt({
      dream: promptContext?.dream ?? actionDream ?? null,
      strategy: promptContext?.strategy ?? null,
      milestone: promptContext?.milestone ?? null,
      action,
      link,
      moneyProjection,
    })
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const completionMsg = getCompletionMsg(action, allScopeActions ?? displayActions, {
    milestoneName,
    strategyName,
  })
  const hasDetails = action.evidence || action.deadlineEvidence || action.consequenceIfDelayed

  // このActionのStrategyに紐づく夢（現在のDream以外）
  const effectingDreams =
    action.strategyId && allLinks && allDreams
      ? allLinks
          .filter(
            (l) =>
              l.strategyId === action.strategyId &&
              l.dreamId !== promptContext?.dream?.id,
          )
          .map((l) => (allDreams || []).find((d) => d.id === l.dreamId))
          .filter(Boolean)
      : []

  return (
    <li className="rounded-lg border border-slate-100 overflow-hidden">
      <div
        className={`flex items-start gap-2 px-2 py-1.5 transition-colors ${expanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
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
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${action.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
          >
            {action.text}
          </p>
          <div className="flex gap-3 mt-0.5 flex-wrap">
            {action.dueDate && (
              <span
                className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-indigo-400'}`}
              >
                {new Date(action.dueDate).toLocaleDateString('ja-JP')}
                {isOverdue && ' ⚠️'}
              </span>
            )}
            {action.estimatedMinutes > 0 && (
              <span className="text-xs text-slate-400">{action.estimatedMinutes}分</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-slate-300 hover:text-slate-500 px-1 py-0.5 flex-shrink-0 mt-0.5 transition-colors"
          title={expanded ? '折りたたむ' : '詳細を表示'}
        >
          {expanded ? '▲' : '▼'}
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(action.id)}
            className="text-slate-300 hover:text-red-400 transition-all text-base leading-none flex-shrink-0 mt-0.5"
            aria-label="削除"
          >
            ×
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {action.contentDetail && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">内容詳細</p>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {action.contentDetail}
              </p>
            </div>
          )}
          {action.evidence && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">なぜ必要か</p>
              <p className="text-xs text-slate-600 leading-relaxed">{action.evidence}</p>
            </div>
          )}
          {action.deadlineEvidence && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">なぜこの日まで？</p>
              <p className="text-xs text-slate-600 leading-relaxed">{action.deadlineEvidence}</p>
            </div>
          )}
          {action.consequenceIfDelayed && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">遅れると？</p>
              <p className="text-xs text-red-600 leading-relaxed">{action.consequenceIfDelayed}</p>
            </div>
          )}
          {!hasDetails && (
            <p className="text-xs text-slate-300 italic">
              根拠・期限の根拠・遅延影響を「編集」タブから入力してください
            </p>
          )}
          {effectingDreams.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">他の夢にも効く</p>
              <div className="flex flex-wrap gap-1">
                {effectingDreams.map((d) => (
                  <span
                    key={d.id}
                    className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full"
                  >
                    {CATEGORY_ICONS[d.category] ?? '✨'} {d.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          <MoneyImpactCard
            projection={moneyProjection}
            delayMonths={delayMonths}
            blocksStrategyStart={action.blocksStrategyStart}
          />
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5">
            <p className="text-xs font-medium text-slate-500 mb-0.5">完了すると？</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              ✓ これを完了すると、{completionMsg}
            </p>
          </div>
          <button
            onClick={handleCopyPrompt}
            className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg px-2 py-1 transition-colors bg-white"
          >
            {copied ? '✓ AI用プロンプトをコピーしました' : '🤖 AI用プロンプトをコピー'}
          </button>
        </div>
      )}
    </li>
  )
}

export default function ActionList({
  actions,
  onToggle,
  onDelete,
  allScopeActions,
  milestoneName,
  strategyName,
  promptContext,
  allDreams,
  allLinks,
}) {
  const completed = actions.filter((a) => a.completed).length

  return (
    <div className="space-y-1.5">
      {actions.length > 0 && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-500">未来に効く行動</span>
          <span className="text-xs text-slate-400">
            {completed}/{actions.length} 完了
          </span>
        </div>
      )}

      <ul className="space-y-1">
        {actions.length === 0 && (
          <li className="text-xs text-slate-400 text-center py-2">
            「編集」タブから行動を追加してください
          </li>
        )}
        {actions.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            displayActions={actions}
            allScopeActions={allScopeActions}
            onToggle={onToggle}
            onDelete={onDelete}
            milestoneName={milestoneName}
            strategyName={strategyName}
            promptContext={promptContext}
            allDreams={allDreams}
            allLinks={allLinks}
          />
        ))}
      </ul>
    </div>
  )
}
