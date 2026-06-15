/**
 * 金額目標の進捗予測を計算する純粋関数群。
 *
 * Dream.currentMonthlyProgress = 月次ベース貯蓄（現在ペース）
 * DreamStrategyLink.expectedMonthlyImpact = 戦略による上乗せ月額
 * DreamStrategyLink.expectedStartDate = 戦略効果の開始予定日
 * DreamStrategyLink.impactRampUpMonths = 立ち上がり月数（0なら即全額）
 */

function monthsBetween(from, to) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function toYearMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 月次貯蓄の累積シミュレーション。
 * @param {number} startAmount - 開始時点の金額
 * @param {number} monthlyBase - 月次ベース貯蓄
 * @param {Array} contribs - [{ monthlyImpact, startDate, rampUpMonths }]
 * @param {Date} fromDate - シミュレーション開始日
 * @param {number} totalMonths - シミュレーション月数
 */
function simulate(startAmount, monthlyBase, contribs, fromDate, totalMonths) {
  let accumulated = startAmount
  for (let m = 0; m < totalMonths; m++) {
    const monthDate = addMonths(fromDate, m + 1)
    let income = monthlyBase
    for (const c of contribs) {
      if (monthDate >= c.startDate) {
        if (c.rampUpMonths > 0) {
          const msSinceStart = monthsBetween(c.startDate, monthDate)
          const factor = Math.min(1, (msSinceStart + 1) / c.rampUpMonths)
          income += c.monthlyImpact * factor
        } else {
          income += c.monthlyImpact
        }
      }
    }
    accumulated += income
  }
  return Math.round(accumulated)
}

/**
 * 目標達成月を計算。達成できない場合は null を返す。
 * @param {number} startAmount
 * @param {number} targetAmount
 * @param {number} monthlyBase
 * @param {Array} contribs
 * @param {Date} fromDate
 * @param {number} maxSearchMonths
 */
function findAchievementMonth(startAmount, targetAmount, monthlyBase, contribs, fromDate, maxSearchMonths = 120) {
  let accumulated = startAmount
  for (let m = 0; m < maxSearchMonths; m++) {
    if (accumulated >= targetAmount) {
      return toYearMonth(addMonths(fromDate, m))
    }
    const monthDate = addMonths(fromDate, m + 1)
    let income = monthlyBase
    for (const c of contribs) {
      if (monthDate >= c.startDate) {
        income += c.monthlyImpact
      }
    }
    accumulated += income
  }
  return null
}

/**
 * 金額目標の進捗予測を計算する。
 *
 * @param {object} dream - Dream オブジェクト (targetAmount, currentAmount, deadline, currentMonthlyProgress)
 * @param {Array}  dreamStrategyLinks - このDreamに紐づくDreamStrategyLink配列
 * @param {object|null} delayScenario - { delayMonths: number } | null
 * @returns {object} ProjectionResult
 */
export function calculateMoneyProjection({ dream, dreamStrategyLinks = [], delayScenario = null }) {
  if (!dream || !dream.targetAmount || !dream.deadline) {
    return { hasMoneyGoal: false }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(dream.deadline)

  if (isNaN(deadline.getTime())) return { hasMoneyGoal: false }

  const totalMonths = monthsBetween(today, deadline)

  if (totalMonths <= 0) {
    return {
      hasMoneyGoal: true,
      isExpired: true,
      targetAmount: dream.targetAmount,
      currentAmount: dream.currentAmount || 0,
      deadline: dream.deadline,
    }
  }

  const monthlyBase = Number(dream.currentMonthlyProgress || 0)
  const currentAmount = Number(dream.currentAmount || 0)

  const linkContribs = dreamStrategyLinks.map((link) => ({
    strategyId: link.strategyId,
    monthlyImpact: Number(link.expectedMonthlyImpact || 0),
    startDate: link.expectedStartDate ? new Date(link.expectedStartDate) : today,
    rampUpMonths: Number(link.impactRampUpMonths || 0),
  }))

  const maxSearch = totalMonths + 60

  const projectedAmountAtDeadline = simulate(currentAmount, monthlyBase, linkContribs, today, totalMonths)
  const surplusAtDeadline = Math.max(0, projectedAmountAtDeadline - dream.targetAmount)
  const shortageAtDeadline = Math.max(0, dream.targetAmount - projectedAmountAtDeadline)
  const projectedAchievementMonth = findAchievementMonth(
    currentAmount, dream.targetAmount, monthlyBase, linkContribs, today, maxSearch,
  )

  let delayedData = {}

  if (delayScenario && delayScenario.delayMonths > 0) {
    const dm = delayScenario.delayMonths
    const { affectedStrategyId } = delayScenario
    const delayedContribs = linkContribs.map((c) => {
      if (affectedStrategyId && c.strategyId !== affectedStrategyId) return c
      return { ...c, startDate: addMonths(c.startDate, dm) }
    })

    const delayedProjectedAmountAtDeadline = simulate(
      currentAmount, monthlyBase, delayedContribs, today, totalMonths,
    )
    const delayedSurplusAtDeadline = Math.max(0, delayedProjectedAmountAtDeadline - dream.targetAmount)
    const delayedShortageAtDeadline = Math.max(0, dream.targetAmount - delayedProjectedAmountAtDeadline)
    const delayedAchievementMonth = findAchievementMonth(
      currentAmount, dream.targetAmount, monthlyBase, delayedContribs, today, maxSearch,
    )

    delayedData = {
      delayedProjectedAmountAtDeadline,
      delayedSurplusAtDeadline,
      delayedShortageAtDeadline,
      delayedAchievementMonth,
      delayMonths: dm,
      lossByDelay: projectedAmountAtDeadline - delayedProjectedAmountAtDeadline,
    }
  }

  return {
    hasMoneyGoal: true,
    isExpired: false,
    targetAmount: dream.targetAmount,
    currentAmount,
    deadline: dream.deadline,
    projectedAmountAtDeadline,
    surplusAtDeadline,
    shortageAtDeadline,
    projectedAchievementMonth,
    ...delayedData,
  }
}

/**
 * moneyProjection をAIプロンプト用テキストに変換する。
 */
export function formatMoneyProjectionForPrompt(projection, dreamTitle = '') {
  if (!projection?.hasMoneyGoal || projection.isExpired) return null

  const { fmtYen, fmtYearMonth, fmtDateMonth } = {
    fmtYen: (n) => `${Number(n || 0).toLocaleString('ja-JP')}円`,
    fmtYearMonth: (ym) => {
      if (!ym) return '未達成'
      const [y, m] = ym.split('-')
      return `${y}年${parseInt(m, 10)}月`
    },
    fmtDateMonth: (d) => {
      if (!d) return '未設定'
      const date = new Date(d)
      return `${date.getFullYear()}年${date.getMonth() + 1}月`
    },
  }

  const lines = [
    `【金額目標との関係 (${dreamTitle || 'このDream'}に金額目標があります)】`,
    `目標金額: ${fmtYen(projection.targetAmount)}`,
    `現在金額: ${fmtYen(projection.currentAmount)}`,
    `期限: ${fmtDateMonth(projection.deadline)}`,
    `期限通り進んだ場合の期日時点見込み: ${fmtYen(projection.projectedAmountAtDeadline)}`,
  ]

  if (projection.surplusAtDeadline > 0) {
    lines.push(`余裕額: +${fmtYen(projection.surplusAtDeadline)}`)
  } else if (projection.shortageAtDeadline > 0) {
    lines.push(`不足額: -${fmtYen(projection.shortageAtDeadline)}`)
  }

  if (projection.projectedAchievementMonth) {
    lines.push(`達成予定月: ${fmtYearMonth(projection.projectedAchievementMonth)}`)
  }

  if (projection.delayMonths > 0 && projection.lossByDelay != null) {
    lines.push('')
    lines.push(`${projection.delayMonths}ヶ月遅延した場合の期日時点見込み: ${fmtYen(projection.delayedProjectedAmountAtDeadline)}`)
    if (projection.delayedSurplusAtDeadline > 0) {
      lines.push(`遅延後余裕額: +${fmtYen(projection.delayedSurplusAtDeadline)}`)
    } else if (projection.delayedShortageAtDeadline > 0) {
      lines.push(`遅延後不足額: -${fmtYen(projection.delayedShortageAtDeadline)}`)
    }
    if (projection.delayedAchievementMonth) {
      lines.push(`遅延後達成予定月: ${fmtYearMonth(projection.delayedAchievementMonth)}`)
    }
    lines.push(`遅延による損失: ${fmtYen(Math.abs(projection.lossByDelay))}`)
  }

  return lines.join('\n')
}
