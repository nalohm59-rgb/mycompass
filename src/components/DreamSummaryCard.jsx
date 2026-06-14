import { getProgressPercent, isOverdue, getDreamHealthStatus } from '../utils/progress'
import { getMonthsLeft } from '../utils'

const HEALTH_CONFIG = {
  good: {
    label: '順調',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    label: '要注意',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  danger: {
    label: '要対策',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-600',
  },
}

function ProgressRow({ label, value, sub, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-medium text-slate-600">{sub}</span>
      </div>
      <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function KpiBox({ label, value, valueClass }) {
  return (
    <div className="bg-white/70 rounded-xl p-2.5">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`font-bold text-lg leading-tight ${valueClass}`}>{value}</p>
    </div>
  )
}

export default function DreamSummaryCard({ dream, strategies, milestones, actions, links }) {
  const pendingActions = actions.filter((a) => !a.completed)

  const outcomeProgress = getProgressPercent(dream.currentAmount, dream.targetAmount)
  const milestoneCompleted = milestones.filter((m) => m.completed).length
  const planProgress = getProgressPercent(milestoneCompleted, milestones.length)
  const actionCompleted = actions.filter((a) => a.completed).length
  const actionProgress = getProgressPercent(actionCompleted, actions.length)

  const overdueActionsCount = pendingActions.filter((a) => isOverdue(a.dueDate, a.completed)).length
  const overdueMilestonesCount = milestones.filter((m) =>
    isOverdue(m.dueDate, m.completed),
  ).length
  const totalOverdueCount = overdueActionsCount + overdueMilestonesCount

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  const todayActionsCount = pendingActions.filter(
    (a) => a.dueDate && new Date(a.dueDate) <= todayEnd,
  ).length

  const remainingAmount = Math.max(0, dream.targetAmount - dream.currentAmount)
  const monthsLeft = getMonthsLeft(dream.deadline)
  const requiredMonthlyAmount =
    monthsLeft && monthsLeft > 0 ? Math.ceil(remainingAmount / monthsLeft) : remainingAmount
  const monthlyShortfall = Math.max(0, requiredMonthlyAmount - (dream.currentMonthlyProgress || 0))

  let strategyCoveragePercent = null
  if (dream.targetAmount > 0 && dream.deadline) {
    const requiredMonthlyGap = Math.max(
      0,
      requiredMonthlyAmount - (dream.currentMonthlyProgress || 0),
    )
    if (requiredMonthlyGap > 0) {
      const activeStrategyIds = new Set(
        strategies.filter((s) => s.status !== 'abandoned').map((s) => s.id),
      )
      const totalImpact = (links || [])
        .filter((l) => l.impactUnit === 'monthly_yen' && activeStrategyIds.has(l.strategyId))
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

  const hc = HEALTH_CONFIG[healthStatus]

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${hc.bg} ${hc.border}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-slate-800 leading-snug flex-1 min-w-0">
          {dream.title}
        </h2>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${hc.badge}`}>
          {hc.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {dream.targetAmount > 0 && (
          <ProgressRow
            label="成果進捗"
            value={outcomeProgress}
            sub={`${outcomeProgress}%`}
            color="bg-purple-400"
          />
        )}
        <ProgressRow
          label="計画進捗"
          value={planProgress}
          sub={milestones.length > 0 ? `${milestoneCompleted}/${milestones.length}` : '---'}
          color="bg-emerald-500"
        />
        <ProgressRow
          label="行動進捗"
          value={actionProgress}
          sub={actions.length > 0 ? `${actionCompleted}/${actions.length}` : '---'}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {monthlyShortfall > 0 ? (
          <KpiBox
            label="月間不足"
            value={`¥${monthlyShortfall.toLocaleString()}`}
            valueClass="text-red-600"
          />
        ) : dream.targetAmount > 0 ? (
          <KpiBox label="月間不足" value="なし" valueClass="text-emerald-600" />
        ) : null}

        {strategyCoveragePercent !== null && (
          <KpiBox
            label="戦略カバー率"
            value={`${strategyCoveragePercent}%`}
            valueClass={
              strategyCoveragePercent >= 100
                ? 'text-emerald-600'
                : strategyCoveragePercent >= 50
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }
          />
        )}

        <KpiBox
          label="今日の一手"
          value={`${todayActionsCount}件`}
          valueClass={todayActionsCount > 0 ? 'text-indigo-600' : 'text-slate-400'}
        />
        <KpiBox
          label="期限切れ"
          value={`${totalOverdueCount}件`}
          valueClass={totalOverdueCount > 0 ? 'text-red-600' : 'text-slate-400'}
        />
      </div>
    </div>
  )
}
