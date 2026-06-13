import { useState } from 'react'

const ABSTRACT_ENDINGS = ['する', '始める', '頑張る', '改善する', '進める']

function getWarnings(text, evidence, estimatedMinutes, dueDate, hasParentMilestone) {
  const warnings = []
  if (text.length > 0 && text.length < 10) {
    warnings.push('行動の内容が短すぎます。具体的に書いてください。')
  }
  if (estimatedMinutes > 120) {
    warnings.push('120分を超える行動は分割を検討してください。')
  }
  if (!dueDate) {
    warnings.push('期限を設定すると優先度管理がしやすくなります。')
  }
  if (!evidence.trim()) {
    warnings.push('なぜこの行動が必要か根拠を記入してください。')
  }
  if (!hasParentMilestone) {
    warnings.push('マイルストーンに紐づけると計画進捗が可視化されます。')
  }
  if (text.length >= 10 && ABSTRACT_ENDINGS.some(e => text.trimEnd().endsWith(e))) {
    warnings.push('「する」「頑張る」などの抽象的な表現を避け、具体的な行動を書いてください。')
  }
  return warnings
}

export default function ActionComposer({ onAdd, onCancel, hasParentMilestone = false }) {
  const [text, setText] = useState('')
  const [evidence, setEvidence] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [dueDate, setDueDate] = useState('')

  const warnings = text.trim() ? getWarnings(text.trim(), evidence, estimatedMinutes, dueDate, hasParentMilestone) : []

  function handleSubmit() {
    if (!text.trim()) return
    onAdd({ text: text.trim(), evidence, estimatedMinutes, dueDate })
    setText('')
    setEvidence('')
    setEstimatedMinutes(30)
    setDueDate('')
    if (onCancel) onCancel()
  }

  return (
    <div className="border border-indigo-200 rounded-xl p-3 space-y-2 bg-indigo-50/30">
      {warnings.length > 0 && (
        <ul className="space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 leading-relaxed flex gap-1.5">
              <span className="flex-shrink-0">⚠️</span>
              {w}
            </li>
          ))}
        </ul>
      )}

      {warnings.length === 0 && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 leading-relaxed">
          💡 30分〜2時間で完了できる具体行動を入力してください
        </p>
      )}

      <input
        type="text"
        placeholder="具体行動を入力..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoFocus
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      />

      <textarea
        placeholder="なぜこの行動が必要か（根拠）..."
        value={evidence}
        onChange={e => setEvidence(e.target.value)}
        rows={2}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
      />

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">見積もり時間（分）</label>
          <input
            type="number"
            min="5"
            step="5"
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(parseInt(e.target.value) || 30)}
            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">期限</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          追加
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </div>
  )
}
