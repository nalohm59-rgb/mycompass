import { useState, useEffect } from 'react'

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

const KEYS = ['targetAmount', 'currentAmount', 'currentMonthlyProgress']

function toDraftFields(dream) {
  return {
    targetAmount: String(dream.targetAmount ?? 0),
    currentAmount: String(dream.currentAmount ?? 0),
    currentMonthlyProgress: String(dream.currentMonthlyProgress ?? 0),
  }
}

export default function MoneyEditForm({ dream, onChange }) {
  const [fields, setFields] = useState(() => toDraftFields(dream))

  // 夢が切り替わったときだけ再同期する
  useEffect(() => {
    setFields(toDraftFields(dream))
  }, [dream.id])

  function handleChange(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function handleBlur(key, value) {
    const num = parseInt(value) || 0
    setFields((prev) => ({ ...prev, [key]: String(num) }))
    onChange({ [key]: num })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💰</span>
        <h3 className="text-sm font-semibold text-slate-700">お金の設定</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">目標金額（円）</label>
          <input
            type="number"
            className={inputClass}
            value={fields.targetAmount}
            onChange={(e) => handleChange('targetAmount', e.target.value)}
            onBlur={(e) => handleBlur('targetAmount', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">現在の金額（円）</label>
          <input
            type="number"
            className={inputClass}
            value={fields.currentAmount}
            onChange={(e) => handleChange('currentAmount', e.target.value)}
            onBlur={(e) => handleBlur('currentAmount', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            現在の月収ペース（円）
          </label>
          <input
            type="number"
            className={inputClass}
            value={fields.currentMonthlyProgress}
            onChange={(e) => handleChange('currentMonthlyProgress', e.target.value)}
            onBlur={(e) => handleBlur('currentMonthlyProgress', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
          <input
            type="date"
            className={inputClass}
            value={dream.deadline ?? ''}
            onChange={(e) => onChange({ deadline: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
