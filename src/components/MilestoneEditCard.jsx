const inputClass = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

export default function MilestoneEditCard({ milestone, onChange, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            milestone.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 hover:border-emerald-400'
          }`}
        >
          {milestone.completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <input
          type="text"
          value={milestone.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="マイルストーン名..."
          className="flex-1 text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none placeholder-slate-300 min-w-0"
        />
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
          aria-label="削除"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pl-7">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
          <input
            type="date"
            value={milestone.dueDate}
            onChange={e => onChange({ dueDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">完了条件</label>
          <textarea
            value={milestone.doneDefinition}
            onChange={e => onChange({ doneDefinition: e.target.value })}
            placeholder="何をもって完了とするか..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
          />
        </div>
      </div>
    </div>
  )
}
