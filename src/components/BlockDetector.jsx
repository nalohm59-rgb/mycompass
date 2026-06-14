import { isOverdue } from '../utils/progress'
import { getMonthsLeft } from '../utils'

function buildIssues(dream, strategies, milestones, actions, links) {
  const issues = []

  // 戦略がない（このDreamにリンクされた戦略がない）
  if (strategies.length === 0) {
    issues.push({
      title: '戦略がありません',
      reason: '差分を埋める手段が設定されていません',
      next: '「編集」タブから戦略を追加してください',
    })
  }

  // 戦略カバー率が低い
  if (dream && dream.targetAmount > 0 && dream.deadline) {
    const remainingAmount = Math.max(0, dream.targetAmount - dream.currentAmount)
    const monthsLeft = getMonthsLeft(dream.deadline)
    const requiredMonthlyAmount =
      monthsLeft && monthsLeft > 0 ? Math.ceil(remainingAmount / monthsLeft) : remainingAmount
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
      const coveragePercent = Math.min(999, Math.round((totalImpact / requiredMonthlyGap) * 100))
      if (coveragePercent < 50) {
        issues.push({
          title: `戦略カバー率が${coveragePercent}%です`,
          reason: `月¥${requiredMonthlyGap.toLocaleString()}不足に対して、戦略効果が不足しています`,
          next: 'Linkの期待月収効果を入力するか、新しい戦略を追加してください',
        })
      }
    }
  }

  // expectedMonthlyImpactが未設定のLink
  const noImpactLinks = (links || []).filter(
    (l) => l.impactUnit === 'monthly_yen' && !l.expectedMonthlyImpact,
  )
  if (noImpactLinks.length > 0) {
    const s = strategies.find((st) => st.id === noImpactLinks[0].strategyId)
    issues.push({
      title: `期待月収効果が未設定の戦略があります（${noImpactLinks.length}件）`,
      reason: '効果の見積もりがないと戦略カバー率を計算できません',
      next: `「${s?.title || '（無題）'}」などのリンク設定で期待月収効果を入力してください`,
    })
  }

  // deadlineが未設定のLink
  const noDeadlineLinks = (links || []).filter((l) => !l.deadline)
  if (noDeadlineLinks.length > 0) {
    const s = strategies.find((st) => st.id === noDeadlineLinks[0].strategyId)
    issues.push({
      title: `期限が未設定の戦略リンクがあります（${noDeadlineLinks.length}件）`,
      reason: '戦略の期限がないと達成時期が不明瞭になります',
      next: `「${s?.title || '（無題）'}」などのリンク設定で期限を入力してください`,
    })
  }

  // マイルストーンがない戦略
  strategies.forEach((s) => {
    const ms = milestones.filter((m) => m.strategyId === s.id)
    if (ms.length === 0) {
      issues.push({
        title: `「${s.title || '（無題）'}」にマイルストーンがありません`,
        reason: '実行計画が未定のため、進捗を測定できません',
        next: `「${s.title || '（無題）'}」にマイルストーンを追加してください`,
      })
    } else {
      ms.forEach((m) => {
        if (
          !m.completed &&
          actions.filter((a) => a.milestoneId === m.id && !a.completed).length === 0
        ) {
          issues.push({
            title: `「${m.title || '（無題）'}」に次の行動がありません`,
            reason: 'このマイルストーンが止まっています',
            next: `「${m.title || '（無題）'}」に行動を追加してください`,
          })
        }
      })
    }
  })

  // 期限切れAction
  const overdueActions = actions.filter((a) => !a.completed && isOverdue(a.dueDate, a.completed))
  if (overdueActions.length > 0) {
    issues.push({
      title: `期限切れのActionが${overdueActions.length}件あります`,
      reason: '計画が遅延しています',
      next: '期限切れのActionを確認・更新してください',
    })
  }

  // 期限切れMilestone
  const overdueMilestones = milestones.filter(
    (m) => !m.completed && isOverdue(m.dueDate, m.completed),
  )
  if (overdueMilestones.length > 0) {
    issues.push({
      title: `期限切れのMilestoneが${overdueMilestones.length}件あります`,
      reason: 'ロードマップが遅延しています',
      next: '期限切れのMilestoneを確認・更新してください',
    })
  }

  // 期限未設定Action（3件以上の場合のみ）
  const noDueDateActions = actions.filter((a) => !a.completed && !a.dueDate)
  if (noDueDateActions.length >= 3) {
    issues.push({
      title: `期限未設定のActionが${noDueDateActions.length}件あります`,
      reason: '期限がないと優先度管理ができません',
      next: 'Actionに期限を設定してください',
    })
  }

  // 根拠未入力Action（3件以上の場合のみ）
  const noEvidenceActions = actions.filter((a) => !a.completed && !a.evidence?.trim())
  if (noEvidenceActions.length >= 3) {
    issues.push({
      title: `根拠未入力のActionが${noEvidenceActions.length}件あります`,
      reason: '行動の根拠が不明確だと実行力が下がります',
      next: 'Actionに根拠（evidence）を入力してください',
    })
  }

  // 期限の根拠未入力Action（3件以上の場合のみ）
  const noDeadlineEvidenceActions = actions.filter(
    (a) => !a.completed && !a.deadlineEvidence?.trim(),
  )
  if (noDeadlineEvidenceActions.length >= 3) {
    issues.push({
      title: `期限の根拠未入力のActionが${noDeadlineEvidenceActions.length}件あります`,
      reason: '期限の根拠がないと「なんとなく」で先延ばしされます',
      next: 'Actionに「なぜこの日まで？」を入力してください',
    })
  }

  // 遅延影響未入力Action（3件以上の場合のみ）
  const noConsequenceActions = actions.filter(
    (a) => !a.completed && !a.consequenceIfDelayed?.trim(),
  )
  if (noConsequenceActions.length >= 3) {
    issues.push({
      title: `遅延影響未入力のActionが${noConsequenceActions.length}件あります`,
      reason: '遅れた時の影響が不明だと緊急感が生まれません',
      next: 'Actionに「遅れると何が起きる？」を入力してください',
    })
  }

  // 期限の根拠未入力Milestone（2件以上の場合のみ）
  const noDeadlineEvidenceMilestones = milestones.filter(
    (m) => !m.completed && !m.deadlineEvidence?.trim(),
  )
  if (noDeadlineEvidenceMilestones.length >= 2) {
    issues.push({
      title: `期限の根拠未入力のMilestoneが${noDeadlineEvidenceMilestones.length}件あります`,
      reason: '期限の根拠がないマイルストーンは形骸化しやすいです',
      next: 'Milestoneに「なぜこの日まで？」を入力してください',
    })
  }

  // 遅延影響未入力Milestone（2件以上の場合のみ）
  const noConsequenceMilestones = milestones.filter(
    (m) => !m.completed && !m.consequenceIfDelayed?.trim(),
  )
  if (noConsequenceMilestones.length >= 2) {
    issues.push({
      title: `遅延影響未入力のMilestoneが${noConsequenceMilestones.length}件あります`,
      reason: '遅れた時の影響が不明だとマイルストーンが先送りされます',
      next: 'Milestoneに「遅れると何が起きる？」を入力してください',
    })
  }

  return issues
}

export default function BlockDetector({ dream, strategies, milestones, actions, links }) {
  const issues = buildIssues(dream, strategies, milestones, actions, links)
  if (issues.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm font-semibold text-amber-800">詰まり検知</h3>
        <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
          {issues.length}件
        </span>
      </div>

      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div key={i} className="bg-white/60 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-semibold text-amber-800 flex items-start gap-1.5">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              {issue.title}
            </p>
            <p className="text-xs text-amber-700 pl-4">
              <span className="font-medium">理由：</span>
              {issue.reason}
            </p>
            <p className="text-xs text-amber-700 pl-4">
              <span className="font-medium">次の行動：</span>
              {issue.next}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
