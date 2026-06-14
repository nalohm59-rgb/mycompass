const CATEGORY_ICONS = {
  home: '🏠', birth: '👶', money: '💰', career: '💼', health: '💪', life: '✨',
}

const CATEGORY_OPTIONS = [
  { value: 'home',   label: '🏠 家・住まい' },
  { value: 'birth',  label: '👶 子供・家族' },
  { value: 'money',  label: '💰 お金・資産' },
  { value: 'career', label: '💼 仕事・キャリア' },
  { value: 'health', label: '💪 健康・体' },
  { value: 'life',   label: '✨ ライフスタイル' },
]

export default function DreamBasicEditForm({ dream, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl flex-shrink-0">
          {CATEGORY_ICONS[dream.category] ?? '✨'}
        </span>
        <input
          type="text"
          value={dream.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="夢のタイトルを入力..."
          className="flex-1 text-base font-bold text-slate-900 bg-transparent border-none focus:outline-none placeholder-slate-300 min-w-0"
        />
        <select
          value={dream.category}
          onChange={e => onChange({ category: e.target.value })}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-shrink-0"
        >
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
