import { fmtYen, fmtYearMonth, fmtDateMonth } from '../utils/formatters'

function Cell({ label, amount, surplus, shortage, achievementMonth }) {
  return (
    <div className="flex-1 min-w-0 space-y-0.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-800">{fmtYen(amount)}</p>
      {surplus > 0 ? (
        <p className="text-xs text-emerald-600 font-medium">余裕 +{fmtYen(surplus)}</p>
      ) : shortage > 0 ? (
        <p className="text-xs text-red-600 font-medium">不足 -{fmtYen(shortage)}</p>
      ) : (
        <p className="text-xs text-emerald-600 font-medium">ちょうど達成</p>
      )}
      {achievementMonth && (
        <p className="text-xs text-slate-400">達成予定 {fmtYearMonth(achievementMonth)}</p>
      )}
    </div>
  )
}

/**
 * 金額目標があるDreamに紐づくActionのお金インパクトを表示する。
 *
 * Props:
 *   projection: calculateMoneyProjection() の戻り値
 *   delayMonths: 遅延シナリオの月数
 */
export default function MoneyImpactCard({ projection, delayMonths = 1 }) {
  if (!projection?.hasMoneyGoal || projection.isExpired) return null
  if (!projection.projectedAmountAtDeadline) return null

  const hasDelay = projection.delayMonths > 0 && projection.lossByDelay != null
  const deadlineLabel = fmtDateMonth(projection.deadline)

  // インパクトがゼロのときはカード自体を出さない
  if (hasDelay && projection.lossByDelay === 0) return null

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-base">💰</span>
        <p className="text-xs font-semibold text-violet-700">
          資金インパクト（{deadlineLabel}時点）
        </p>
      </div>

      <div className="flex gap-3 bg-white/60 rounded-lg p-2.5">
        <Cell
          label="期限通り完了"
          amount={projection.projectedAmountAtDeadline}
          surplus={projection.surplusAtDeadline}
          shortage={projection.shortageAtDeadline}
          achievementMonth={projection.projectedAchievementMonth}
        />

        {hasDelay && (
          <>
            <div className="w-px bg-violet-200 self-stretch" />
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-xs text-red-500">{delayMonths}ヶ月遅れた場合</p>
              <p className="text-sm font-bold text-red-700">
                {fmtYen(projection.delayedProjectedAmountAtDeadline)}
              </p>
              {projection.delayedSurplusAtDeadline > 0 ? (
                <p className="text-xs text-emerald-600 font-medium">
                  余裕 +{fmtYen(projection.delayedSurplusAtDeadline)}
                </p>
              ) : projection.delayedShortageAtDeadline > 0 ? (
                <p className="text-xs text-red-600 font-medium">
                  不足 -{fmtYen(projection.delayedShortageAtDeadline)}
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">ちょうど達成</p>
              )}
              {projection.delayedAchievementMonth && (
                <p className="text-xs text-slate-400">
                  達成予定 {fmtYearMonth(projection.delayedAchievementMonth)}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {hasDelay && projection.lossByDelay !== 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
          <p className="text-xs font-semibold text-red-600">
            遅延による損失: -{fmtYen(Math.abs(projection.lossByDelay))}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {delayMonths}ヶ月の遅れで、未来の資金余裕が{fmtYen(Math.abs(projection.lossByDelay))}縮小します
          </p>
        </div>
      )}
    </div>
  )
}
