import { isOverdue } from '../utils/progress'
import { getMonthsLeft } from '../utils'

function buildIssues(dream, strategies, milestones, actions) {
  const issues = []

  // 戦略がない
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
    const requiredMonthlyAmount = monthsLeft && monthsLeft > 0
      ? Math.ceil(remainingAmount / monthsLeft) : remainingAmount
    const requiredMonthlyGap = Math.max(0, requiredMonthlyAmount - (dream.currentMonthlyProgress || 0))
    if (requiredMonthlyGap > 0) {
      const totalImpact = strategies
        .filter(s => s.impactUnit === 'monthly_yen' && s.status !== 'abandoned')
        .reduce((sum, s) => sum + Number(s.expectedImpact || 0), 0)
      const coveragePercent = Math.min(999, Math.round((totalImpact / requiredMonthlyGap) * 100))
      if (coveragePercent < 50) {
        issues.push({
          title: `戦略カバー率が${coveragePercent}%です`,
          reason: `月¥${requiredMonthlyGap.toLocaleString()}不足に対して、戦略効果が不足しています`,
          next: '戦略の期待効果を入力するか、新しい戦略を追加してください',
        })
      }
    }
  }

  // マイルストーンがない戦略
  strategies.forEach(s => {
    const ms = milestones.filter(m => m.strategyId === s.id)
    if (ms.length === 0) {
      issues.push({
        title: `「${s.title || '（無題）'}」にマイルストーンがありません`,
        reason: '実行計画が未定のため、進捗を測定できません',
        next: `「${s.title || '（無題）'}」にマイルストーンを追加してください`,
      })
    } else {
      ms.forEach(m => {
        if (!m.completed && actions.filter(a => a.milestoneId === m.id && !a.completed).length === 0) {
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
  const overdueActions = actions.filter(a => !a.completed && isOverdue(a.dueDate, a.completed))
  if (overdueActions.length > 0) {
    issues.push({
      title: `期限切れのActionが${overdueActions.length}件あります`,
      reason: '計画が遅延しています',
      next: '期限切れのActionを確認・更新してください',
    })
  }

  // 期限切れMilestone
  const overdueMilestones = milestones.filter(m => !m.completed && isOverdue(m.dueDate, m.completed))
  if (overdueMilestones.length > 0) {
    issues.push({
      title: `期限切れのMilestoneが${overdueMilestones.length}件あります`,
      reason: 'ロードマップが遅延しています',
      next: '期限切れのMilestoneを確認・更新してください',
    })
  }

  // 期限未設定Action（3件以上の場合のみ）
  const noDueDateActions = actions.filter(a => !a.completed && !a.dueDate)
  if (noDueDateActions.length >= 3) {
    issues.push({
      title: `期限未設定のActionが${noDueDateActions.length}件あります`,
      reason: '期限がないと優先度管理ができません',
      next: 'Actionに期限を設定してください',
    })
  }

  // 根拠未入力Action（3件以上の場合のみ）
  const noEvidenceActions = actions.filter(a => !a.completed && !a.evidence?.trim())
  if (noEvidenceActions.length >= 3) {
    issues.push({
      title: `根拠未入力のActionが${noEvidenceActions.length}件あります`,
      reason: '行動の根拠が不明確だと実行力が下がります',
      next: 'Actionに根拠（evidence）を入力してください',
    })
  }

  return issues
}

export default function BlockDetector({ dream, strategies, milestones, actions }) {
  const issues = buildIssues(dream, strategies, milestones, actions)
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
              <span className="font-medium">理由：</span>{issue.reason}
            </p>
            <p className="text-xs text-amber-700 pl-4">
              <span className="font-medium">次の行動：</span>{issue.next}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
