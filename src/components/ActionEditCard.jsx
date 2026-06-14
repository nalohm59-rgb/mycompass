const inputClass = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

export default function ActionEditCard({ action, onChange, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <button
          onClick={onToggle}
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
            action.completed
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'border-slate-300 hover:border-indigo-400'
          }`}
        >
          {action.completed && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <input
          type="text"
          value={action.text}
          onChange={e => onChange({ text: e.target.value })}
          placeholder="具体的な行動..."
          className={`flex-1 text-sm font-medium bg-transparent border-none focus:outline-none placeholder-slate-300 min-w-0 ${action.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
        />
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
          aria-label="削除"
        >
          ×
        </button>
      </div>

      <div className="pl-6 space-y-2">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">根拠・理由</label>
          <textarea
            value={action.evidence}
            onChange={e => onChange({ evidence: e.target.value })}
            placeholder="なぜこの行動が必要か..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">見積もり（分）</label>
            <input
              type="number"
              min="5"
              step="5"
              value={action.estimatedMinutes}
              onChange={e => onChange({ estimatedMinutes: parseInt(e.target.value) || 30 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
            <input
              type="date"
              value={action.dueDate}
              onChange={e => onChange({ dueDate: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
