const textareaClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-colors'

export default function WhyEditForm({ dream, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💭</span>
        <h3 className="text-sm font-semibold text-slate-700">なぜ欲しいのか</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">なぜ欲しいのか</label>
          <textarea
            value={dream.why}
            onChange={(e) => onChange({ why: e.target.value })}
            placeholder="この夢が欲しい理由を書いてください..."
            rows={3}
            className={textareaClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">叶った状態</label>
          <textarea
            value={dream.desiredState}
            onChange={(e) => onChange({ desiredState: e.target.value })}
            placeholder="夢が叶った時の状態を具体的に描いてください..."
            rows={3}
            className={textareaClass}
          />
        </div>
      </div>
    </div>
  )
}
