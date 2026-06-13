import { useState } from 'react'
import { getMonthsLeft, getStatus } from '../utils'

const STATUS_STYLE = {
  '達成':     { badge: 'bg-purple-100 text-purple-700', icon: '🎉' },
  '期限未設定': { badge: 'bg-slate-100 text-slate-600',  icon: '📅' },
  '期限切れ':  { badge: 'bg-red-100 text-red-600',       icon: '⚠️' },
  '順調':     { badge: 'bg-emerald-100 text-emerald-700', icon: '✅' },
  '要注意':   { badge: 'bg-yellow-100 text-yellow-700',  icon: '⚡' },
  '危険':     { badge: 'bg-red-100 text-red-600',        icon: '🚨' },
}

function fmt(n) { return Number(n || 0).toLocaleString() }

function Row({ label, value, bold, red, large }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`${large ? 'text-xl font-bold' : bold ? 'text-sm font-semibold' : 'text-sm'} ${red ? 'text-red-600' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  )
}

export default function MoneyRealityCard({ dream, strategies, onChange, onAddStrategy, readOnly = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})

  const { targetAmount, currentAmount, currentMonthlyProgress = 0, deadline } = dream

  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const monthsLeft = getMonthsLeft(deadline)
  const requiredMonthlyAmount = monthsLeft && monthsLeft > 0
    ? Math.ceil(remainingAmount / monthsLeft)
    : remainingAmount
  const monthlyShortfall = Math.max(0, requiredMonthlyAmount - currentMonthlyProgress)

  const dreamStrategies = (strategies || []).filter(s => s.dreamId === dream.id)
  const totalExpectedMonthlyImpact = dreamStrategies
    .filter(s => s.impactUnit === 'monthly_yen' && s.status !== 'abandoned')
    .reduce((sum, s) => sum + Number(s.expectedImpact || 0), 0)
  const requiredMonthlyGap = monthlyShortfall
  const strategyCoveragePercent = requiredMonthlyGap > 0
    ? Math.min(999, Math.round((totalExpectedMonthlyImpact / requiredMonthlyGap) * 100))
    : null
  const remainingMonthlyGap = Math.max(0, requiredMonthlyGap - totalExpectedMonthlyImpact)

  const status = getStatus(dream)
  const s = STATUS_STYLE[status]

  const coverageColor = !strategyCoveragePercent ? 'text-slate-500'
    : strategyCoveragePercent >= 100 ? 'text-emerald-600'
    : strategyCoveragePercent >= 50  ? 'text-yellow-600'
    : 'text-red-600'

  function startEdit() {
    setDraft({ targetAmount, currentAmount, currentMonthlyProgress, deadline: deadline || '' })
    setEditing(true)
  }

  function saveEdit() {
    onChange({
      targetAmount: parseInt(draft.targetAmount) || 0,
      currentAmount: parseInt(draft.currentAmount) || 0,
      currentMonthlyProgress: parseInt(draft.currentMonthlyProgress) || 0,
      deadline: draft.deadline || '',
    })
    setEditing(false)
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h3 className="text-sm font-semibold text-slate-700">お金の現実</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.badge}`}>
            {s.icon} {status}
          </span>
          {!readOnly && (
            editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveEdit}
                  className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="text-xs text-slate-400 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
              >
                編集
              </button>
            )
          )}
        </div>
      </div>

      {editing ? (
        /* 編集フォーム */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">目標金額</label>
              <input type="number" className={inputClass} value={draft.targetAmount ?? 0}
                onChange={e => setDraft(p => ({ ...p, targetAmount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">現在の金額</label>
              <input type="number" className={inputClass} value={draft.currentAmount ?? 0}
                onChange={e => setDraft(p => ({ ...p, currentAmount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">現在の月収ペース</label>
              <input type="number" className={inputClass} value={draft.currentMonthlyProgress ?? 0}
                onChange={e => setDraft(p => ({ ...p, currentMonthlyProgress: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
              <input type="date" className={inputClass} value={draft.deadline}
                onChange={e => setDraft(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 目標値がない場合 */}
          {targetAmount === 0 && (
            <p className="text-xs text-slate-400 text-center py-2 mb-4">
              「編集」ボタンで目標金額を設定すると月次分析が表示されます
            </p>
          )}

          {/* 基本数値 */}
          {targetAmount > 0 && (
            <div className="divide-y divide-slate-50 mb-4">
              <Row label="目標額"   value={`¥${fmt(targetAmount)}`} />
              <Row label="現在額"   value={`¥${fmt(currentAmount)}`} />
              <Row label="残額"     value={`¥${fmt(remainingAmount)}`} bold />
              {deadline && <Row label="期限"     value={new Date(deadline).toLocaleDateString('ja-JP')} />}
              {monthsLeft !== null && <Row label="残り" value={`${monthsLeft}ヶ月`} />}
            </div>
          )}

          {/* 月次分析 */}
          {monthsLeft !== null && monthsLeft > 0 && targetAmount > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">月次分析</p>
              <div className="divide-y divide-slate-100">
                <Row label="必要月額"   value={`¥${fmt(requiredMonthlyAmount)}`} />
                <Row label="現在ペース" value={`¥${fmt(currentMonthlyProgress)}`} />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500">月間不足</span>
                  <span className={`text-2xl font-bold ${monthlyShortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {monthlyShortfall > 0 ? `¥${fmt(monthlyShortfall)}` : '不足なし'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 戦略効果 */}
          {requiredMonthlyGap > 0 && (
            <div className="border border-slate-100 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">戦略効果</p>
              <div className="divide-y divide-slate-50">
                <Row label="戦略合計効果" value={`¥${fmt(totalExpectedMonthlyImpact)}/月`} />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500">差分カバー率</span>
                  <span className={`text-2xl font-bold ${coverageColor}`}>
                    {strategyCoveragePercent ?? '--'}%
                  </span>
                </div>
                {remainingMonthlyGap > 0 && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-slate-500">あと必要</span>
                    <span className="text-red-600 font-bold text-sm">¥{fmt(remainingMonthlyGap)}/月</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 戦略追加ボタン */}
      {!readOnly && (
        <button
          onClick={onAddStrategy}
          className="w-full text-sm text-indigo-600 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors font-medium mt-2"
        >
          ＋ 戦略を追加
        </button>
      )}
    </div>
  )
}
