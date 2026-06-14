const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

export default function MoneyEditForm({ dream, onChange }) {
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
            value={dream.targetAmount ?? 0}
            onChange={e => onChange({ targetAmount: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">現在の金額（円）</label>
          <input
            type="number"
            className={inputClass}
            value={dream.currentAmount ?? 0}
            onChange={e => onChange({ currentAmount: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">現在の月収ペース（円）</label>
          <input
            type="number"
            className={inputClass}
            value={dream.currentMonthlyProgress ?? 0}
            onChange={e => onChange({ currentMonthlyProgress: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
          <input
            type="date"
            className={inputClass}
            value={dream.deadline ?? ''}
            onChange={e => onChange({ deadline: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
