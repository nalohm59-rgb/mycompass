export function getMonthsLeft(deadline) {
  if (!deadline) return null
  const today = new Date()
  const end = new Date(deadline)
  const yearDiff = end.getFullYear() - today.getFullYear()
  const monthDiff = end.getMonth() - today.getMonth()
  return Math.max(0, yearDiff * 12 + monthDiff)
}

export function getPercent(dream) {
  const { targetAmount, currentAmount } = dream
  return targetAmount > 0
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
    : 0
}

export function getStatus(dream) {
  const { targetAmount, currentAmount, deadline } = dream
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  if (remainingAmount === 0) return '達成'
  if (!deadline) return '期限未設定'
  const monthsLeft = getMonthsLeft(deadline)
  if (monthsLeft === 0) return '期限切れ'
  const requiredMonthly = Math.ceil(remainingAmount / monthsLeft)
  if (requiredMonthly <= 50000) return '順調'
  if (requiredMonthly <= 150000) return '要注意'
  return '危険'
}
