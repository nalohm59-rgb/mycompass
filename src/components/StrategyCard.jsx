import { useState } from 'react'
import MilestoneTimeline from './MilestoneTimeline'
import MilestoneProgressBar from './MilestoneProgressBar'
import ActionList from './ActionList'
import { getProgressPercent } from '../utils/progress'

const STATUS_BADGE = {
  idea: 'bg-slate-100 text-slate-600',
  active: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  done: 'bg-emerald-100 text-emerald-700',
  abandoned: 'bg-red-100 text-red-500',
}

const STATUS_LABELS = {
  idea: 'アイデア',
  active: '実行中',
  paused: '一時停止',
  done: '完了',
  abandoned: '断念',
}

const IMPACT_UNIT_LABELS = {
  monthly_yen: '万円/月',
  one_time_yen: '万円（一時）',
  habit: '習慣',
  knowledge: '知識・スキル',
}

const BORDER = {
  active: 'border-blue-200',
  done: 'border-emerald-200',
  abandoned: 'border-slate-100 opacity-60',
  idea: 'border-slate-200',
  paused: 'border-yellow-200',
}

const CATEGORY_ICONS = {
  home: '🏠',
  birth: '👶',
  money: '💰',
  career: '💼',
  health: '💪',
  life: '✨',
}

export default function StrategyCard({
  strategy,
  milestones,
  actions,
  allDreams,
  allLinks,
  onToggleMilestone,
  onToggleAction,
  onDeleteAction,
  dream,
}) {
  const [expanded, setExpanded] = useState(false)

  const directActions = actions.filter((a) => !a.milestoneId)
  const completedMilestonesCount = milestones.filter((m) => m.completed).length
  const completedActionsCount = actions.filter((a) => a.completed).length
  const milestoneProgress = getProgressPercent(completedMilestonesCount, milestones.length)
  const actionProgress = getProgressPercent(completedActionsCount, actions.length)

  // このStrategyがリンクしている他のDream（現在のDream以外）
  const otherDreams = (allLinks || [])
    .filter((l) => l.strategyId === strategy.id && l.dreamId !== dream?.id)
    .map((l) => (allDreams || []).find((d) => d.id === l.dreamId))
    .filter(Boolean)

  // 現在のDreamとのLink情報
  const currentLink = (allLinks || []).find(
    (l) => l.strategyId === strategy.id && l.dreamId === dream?.id,
  )

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${BORDER[strategy.status] ?? 'border-slate-200'}`}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold ${strategy.title ? 'text-slate-800' : 'text-slate-400'}`}
            >
              {strategy.title || '（無題）'}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[strategy.status]}`}
            >
              {STATUS_LABELS[strategy.status]}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {'●'.repeat(strategy.confidence)}
              {'○'.repeat(5 - strategy.confidence)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
            {currentLink?.expectedMonthlyImpact > 0 && (
              <span>
                効果: {Number(currentLink.expectedMonthlyImpact).toLocaleString()}
                {IMPACT_UNIT_LABELS[currentLink.impactUnit]}
              </span>
            )}
            {currentLink?.deadline && (
              <span>期限: {new Date(currentLink.deadline).toLocaleDateString('ja-JP')}</span>
            )}
            {milestones.length > 0 && (
              <span>
                計画 {completedMilestonesCount}/{milestones.length}
              </span>
            )}
            {actions.length > 0 && (
              <span>
                行動 {completedActionsCount}/{actions.length}
              </span>
            )}
          </div>

          {otherDreams.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {otherDreams.map((d) => (
                <span
                  key={d.id}
                  className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full"
                >
                  {CATEGORY_ICONS[d.category] ?? '✨'} {d.title}
                </span>
              ))}
            </div>
          )}

          {(milestones.length > 0 || actions.length > 0) && !expanded && (
            <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-1 bg-indigo-400 rounded-full"
                style={{ width: `${milestones.length > 0 ? milestoneProgress : actionProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {strategy.description && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">概要</p>
              <p className="text-sm text-slate-700 leading-relaxed">{strategy.description}</p>
            </div>
          )}

          {currentLink?.reasonForDream && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">この夢に必要な理由</p>
              <p className="text-sm text-slate-700 leading-relaxed">{currentLink.reasonForDream}</p>
            </div>
          )}

          <MilestoneProgressBar milestones={milestones} />

          <MilestoneTimeline
            milestones={milestones}
            actions={actions}
            onToggle={onToggleMilestone}
            onToggleAction={onToggleAction}
            onDeleteAction={onDeleteAction}
            dream={dream}
            strategy={strategy}
            allDreams={allDreams}
            allLinks={allLinks}
          />

          {directActions.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">戦略直下の行動</p>
              <ActionList
                actions={directActions}
                allScopeActions={actions}
                onToggle={onToggleAction}
                onDelete={onDeleteAction}
                strategyName={strategy.title}
                promptContext={{ dream, strategy, milestone: null }}
                allDreams={allDreams}
                allLinks={allLinks}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
