export function getProgressPercent(done, total) {
  if (!total || total <= 0) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

export function sortByDueDate(items) {
  return [...items].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

export function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false
  return new Date(dueDate) < new Date()
}

export function formatYen(value) {
  return `${Number(value || 0).toLocaleString()}円`
}

export function getMilestoneStatus(milestone, actions) {
  const milestoneActions = actions.filter((a) => a.milestoneId === milestone.id)
  const completedActions = milestoneActions.filter((a) => a.completed)
  const actionProgress =
    milestoneActions.length > 0
      ? Math.round((completedActions.length / milestoneActions.length) * 100)
      : 0
  const overdue =
    milestone.dueDate && new Date(milestone.dueDate) < new Date() && !milestone.completed
  if (milestone.completed) return 'completed'
  if (overdue) return 'overdue'
  if (actionProgress > 0) return 'in_progress'
  return 'not_started'
}

export function getDreamHealthStatus({
  overdueActionCount,
  overdueMilestoneCount,
  strategyCoveragePercent,
  todayActionCount,
  planProgressPercent,
  actionProgressPercent,
}) {
  if (overdueActionCount > 0 || overdueMilestoneCount > 0) return 'danger'
  if (strategyCoveragePercent !== null && strategyCoveragePercent < 50) return 'danger'
  if (todayActionCount === 0) return 'warning'
  if (strategyCoveragePercent !== null && strategyCoveragePercent < 100) return 'warning'
  if (planProgressPercent === 0 && actionProgressPercent === 0) return 'warning'
  return 'good'
}

export function getActionPriorityScore(action, strategy, milestone) {
  let score = 0
  const today = new Date()
  if (action.dueDate) {
    const due = new Date(action.dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) score += 100
    else if (diffDays === 0) score += 90
    else if (diffDays <= 3) score += 70
    else if (diffDays <= 7) score += 40
  }
  if (milestone?.computedStatus === 'in_progress') score += 30
  if (strategy?.impactUnit === 'monthly_yen') {
    score += Math.min(30, Math.round((Number(strategy.expectedImpact) || 0) / 10000))
  }
  if (action.estimatedMinutes && action.estimatedMinutes <= 60) score += 10
  if (action.evidence?.trim()) score += 5
  return score
}

export function getPriorityReason(action, milestone) {
  const reasons = []
  const today = new Date()
  if (action.dueDate) {
    const due = new Date(action.dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) reasons.push('期限が切れています')
    else if (diffDays === 0) reasons.push('本日が期限です')
    else if (diffDays <= 3) reasons.push('期限が3日以内に迫っています')
    else if (diffDays <= 7) reasons.push('期限が1週間以内に迫っています')
  }
  if (milestone?.computedStatus === 'in_progress') {
    reasons.push('進行中のマイルストーンに紐づいています')
  }
  return reasons.length > 0 ? reasons.join('・') : null
}
