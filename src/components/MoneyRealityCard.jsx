import { getMonthsLeft, getStatus } from '../utils'

const STATUS_STYLE = {
  達成: { badge: 'bg-purple-100 text-purple-700', icon: '🎉' },
  期限未設定: { badge: 'bg-slate-100 text-slate-600', icon: '📅' },
  期限切れ: { badge: 'bg-red-100 text-red-600', icon: '⚠️' },
  順調: { badge: 'bg-emerald-100 text-emerald-700', icon: '✅' },
  要注意: { badge: 'bg-yellow-100 text-yellow-700', icon: '⚡' },
  危険: { badge: 'bg-red-100 text-red-600', icon: '🚨' },
}

function fmt(n) {
  return Number(n || 0).toLocaleString()
}

function Row({ label, value, bold, red }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`${bold ? 'text-sm font-semibold' : 'text-sm'} ${red ? 'text-red-600' : 'text-slate-700'}`}
      >
        {value}
      </span>
    </div>
  )
}

export default function MoneyRealityCard({ dream, links }) {
  const { targetAmount, currentAmount, currentMonthlyProgress = 0, deadline } = dream

  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const monthsLeft = getMonthsLeft(deadline)
  const requiredMonthlyAmount =
    monthsLeft && monthsLeft > 0 ? Math.ceil(remainingAmount / monthsLeft) : remainingAmount
  const monthlyShortfall = Math.max(0, requiredMonthlyAmount - currentMonthlyProgress)

  const totalExpectedMonthlyImpact = (links || [])
    .filter((l) => l.impactUnit === 'monthly_yen')
    .reduce((sum, l) => sum + Number(l.expectedMonthlyImpact || 0), 0)
  const requiredMonthlyGap = monthlyShortfall
  const strategyCoveragePercent =
    requiredMonthlyGap > 0
      ? Math.min(999, Math.round((totalExpectedMonthlyImpact / requiredMonthlyGap) * 100))
      : null
  const remainingMonthlyGap = Math.max(0, requiredMonthlyGap - totalExpectedMonthlyImpact)

  const status = getStatus(dream)
  const s = STATUS_STYLE[status]

  const coverageColor = !strategyCoveragePercent
    ? 'text-slate-500'
    : strategyCoveragePercent >= 100
      ? 'text-emerald-600'
      : strategyCoveragePercent >= 50
        ? 'text-yellow-600'
        : 'text-red-600'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h3 className="text-sm font-semibold text-slate-700">お金の現実</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.badge}`}>
          {s.icon} {status}
        </span>
      </div>

      {targetAmount === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">
          「編集」タブで目標金額を設定すると月次分析が表示されます
        </p>
      )}

      {targetAmount > 0 && (
        <div className="divide-y divide-slate-50 mb-4">
          <Row label="目標額" value={`¥${fmt(targetAmount)}`} />
          <Row label="現在額" value={`¥${fmt(currentAmount)}`} />
          <Row label="残額" value={`¥${fmt(remainingAmount)}`} bold />
          {deadline && <Row label="期限" value={new Date(deadline).toLocaleDateString('ja-JP')} />}
          {monthsLeft !== null && <Row label="残り" value={`${monthsLeft}ヶ月`} />}
        </div>
      )}

      {monthsLeft !== null && monthsLeft > 0 && targetAmount > 0 && (
        <div className="bg-slate-50 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">月次分析</p>
          <div className="divide-y divide-slate-100">
            <Row label="必要月額" value={`¥${fmt(requiredMonthlyAmount)}`} />
            <Row label="現在ペース" value={`¥${fmt(currentMonthlyProgress)}`} />
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">月間不足</span>
              <span
                className={`text-2xl font-bold ${monthlyShortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}
              >
                {monthlyShortfall > 0 ? `¥${fmt(monthlyShortfall)}` : '不足なし'}
              </span>
            </div>
          </div>
        </div>
      )}

      {requiredMonthlyGap > 0 ? (
        <div className="border border-slate-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-600 mb-2">戦略効果</p>
          <div className="divide-y divide-slate-50">
            <Row label="戦略合計効果" value={`¥${fmt(totalExpectedMonthlyImpact)}/月`} />
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">差分カバー率</span>
              <span className={`text-2xl font-bold ${coverageColor}`}>
                {strategyCoveragePercent}%
              </span>
            </div>
            {remainingMonthlyGap > 0 && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-slate-500">あと必要</span>
                <span className="text-red-600 font-bold text-sm">
                  ¥{fmt(remainingMonthlyGap)}/月
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        targetAmount > 0 && (
          <p className="text-xs text-slate-400 text-center py-2">
            目標額・期限・現在ペースを入力すると戦略カバー率が表示されます
          </p>
        )
      )}
    </div>
  )
}
