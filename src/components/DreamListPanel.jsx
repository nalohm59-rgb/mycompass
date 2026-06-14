import { getProgressPercent, isOverdue, getDreamHealthStatus } from '../utils/progress'
import { getMonthsLeft } from '../utils'

const CATEGORY_ICONS = {
  home: '🏠',
  birth: '👶',
  money: '💰',
  career: '💼',
  health: '💪',
  life: '✨',
}

const HEALTH_CONFIG = {
  good: { label: '順調', badge: 'bg-emerald-100 text-emerald-700' },
  warning: { label: '要注意', badge: 'bg-yellow-100 text-yellow-700' },
  danger: { label: '要対策', badge: 'bg-red-100 text-red-600' },
}

function MiniBar({ value, color }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function computeDreamStats(dream, dreamStrategyLinks, milestones, actions) {
  const links = dreamStrategyLinks.filter((l) => l.dreamId === dream.id)
  const linkedStrategyIds = new Set(links.map((l) => l.strategyId))

  const dreamMilestones = milestones.filter(
    (m) => linkedStrategyIds.has(m.strategyId) || m.dreamId === dream.id,
  )
  const dreamActions = actions.filter(
    (a) => linkedStrategyIds.has(a.strategyId) || a.dreamId === dream.id,
  )
  const pendingActions = dreamActions.filter((a) => !a.completed)

  const outcomeProgress = getProgressPercent(dream.currentAmount, dream.targetAmount)
  const milestoneCompleted = dreamMilestones.filter((m) => m.completed).length
  const planProgress = getProgressPercent(milestoneCompleted, dreamMilestones.length)
  const actionCompleted = dreamActions.filter((a) => a.completed).length
  const actionProgress = getProgressPercent(actionCompleted, dreamActions.length)

  const overdueActionsCount = pendingActions.filter((a) => isOverdue(a.dueDate, a.completed)).length
  const overdueMilestonesCount = dreamMilestones.filter((m) =>
    isOverdue(m.dueDate, m.completed),
  ).length

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  const todayActionsCount = pendingActions.filter(
    (a) => a.dueDate && new Date(a.dueDate) <= todayEnd,
  ).length

  let strategyCoveragePercent = null
  if (dream.targetAmount > 0 && dream.deadline) {
    const remainingAmount = Math.max(0, dream.targetAmount - dream.currentAmount)
    const monthsLeft = getMonthsLeft(dream.deadline)
    const requiredMonthlyAmount =
      monthsLeft && monthsLeft > 0 ? Math.ceil(remainingAmount / monthsLeft) : remainingAmount
    const requiredMonthlyGap = Math.max(
      0,
      requiredMonthlyAmount - (dream.currentMonthlyProgress || 0),
    )
    if (requiredMonthlyGap > 0) {
      const totalImpact = links
        .filter((l) => l.impactUnit === 'monthly_yen')
        .reduce((sum, l) => sum + Number(l.expectedMonthlyImpact || 0), 0)
      strategyCoveragePercent = Math.min(999, Math.round((totalImpact / requiredMonthlyGap) * 100))
    } else {
      strategyCoveragePercent = 100
    }
  }

  const healthStatus = getDreamHealthStatus({
    overdueActionCount: overdueActionsCount,
    overdueMilestoneCount: overdueMilestonesCount,
    strategyCoveragePercent,
    todayActionCount: todayActionsCount,
    planProgressPercent: planProgress,
    actionProgressPercent: actionProgress,
  })

  return {
    outcomeProgress,
    planProgress,
    actionProgress,
    overdueActionsCount,
    overdueMilestonesCount,
    todayActionsCount,
    strategyCoveragePercent,
    healthStatus,
    milestoneTotal: dreamMilestones.length,
    milestoneCompleted,
    actionTotal: dreamActions.length,
    actionCompleted,
  }
}

export default function DreamListPanel({
  dreams,
  dreamStrategyLinks,
  milestones,
  actions,
  selectedDreamId,
  onSelect,
  onAdd,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">叶えたい未来</h2>
        <button
          onClick={onAdd}
          className="text-indigo-600 text-xs font-medium hover:text-indigo-800 transition-colors"
        >
          + 追加
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {dreams.map((dream) => {
          const stats = computeDreamStats(dream, dreamStrategyLinks, milestones, actions)
          const isSelected = dream.id === selectedDreamId
          const hc = HEALTH_CONFIG[stats.healthStatus]

          return (
            <li key={dream.id} className="group relative">
              <button
                className={`w-full text-left px-4 py-3 pr-10 transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                onClick={() => onSelect(dream.id)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {CATEGORY_ICONS[dream.category] ?? '✨'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}
                    >
                      {dream.title}
                    </p>
                    {dream.deadline && (
                      <p className="text-xs text-slate-400">
                        期限: {new Date(dream.deadline).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${hc.badge}`}
                  >
                    {hc.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {dream.targetAmount > 0 && (
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>成果進捗</span>
                        <span>{stats.outcomeProgress}%</span>
                      </div>
                      <MiniBar value={stats.outcomeProgress} color="bg-purple-400" />
                    </div>
                  )}
                  {stats.milestoneTotal > 0 && (
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>計画進捗</span>
                        <span>
                          {stats.milestoneCompleted}/{stats.milestoneTotal}
                        </span>
                      </div>
                      <MiniBar value={stats.planProgress} color="bg-emerald-400" />
                    </div>
                  )}
                  {stats.actionTotal > 0 && (
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>行動進捗</span>
                        <span>
                          {stats.actionCompleted}/{stats.actionTotal}
                        </span>
                      </div>
                      <MiniBar value={stats.actionProgress} color="bg-indigo-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs">
                  {stats.strategyCoveragePercent !== null && (
                    <span
                      className={
                        stats.strategyCoveragePercent >= 100
                          ? 'text-emerald-600'
                          : stats.strategyCoveragePercent >= 50
                            ? 'text-yellow-600'
                            : 'text-red-500'
                      }
                    >
                      戦略カバー: {stats.strategyCoveragePercent}%
                    </span>
                  )}
                  {stats.overdueActionsCount > 0 && (
                    <span className="text-red-500">期限切れ: {stats.overdueActionsCount}件</span>
                  )}
                  {stats.todayActionsCount > 0 && (
                    <span className="text-indigo-500">今日の一手: {stats.todayActionsCount}件</span>
                  )}
                </div>
              </button>

              {dreams.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(dream.id)
                  }}
                  className="absolute right-3 top-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 hover:text-red-400 active:text-red-400 transition-all text-lg leading-none p-1"
                  aria-label="削除"
                >
                  ×
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
