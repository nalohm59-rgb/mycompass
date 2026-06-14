import { useState } from 'react'

const ABSTRACT_ENDINGS = ['する', '始める', '頑張る', '改善する', '進める']

function categorizeWarnings(text, evidence, deadlineEvidence, consequenceIfDelayed, estimatedMinutes, dueDate, hasParentMilestone) {
  const strong = []
  const hints = []

  if (text.length > 0 && text.length < 10) {
    strong.push('行動の内容が短すぎます。具体的に書いてください。')
  }
  if (estimatedMinutes > 120) {
    strong.push('120分を超える行動は分割を検討してください。')
  }
  if (text.length >= 10 && ABSTRACT_ENDINGS.some((e) => text.trimEnd().endsWith(e))) {
    strong.push('「する」「頑張る」などの抽象的な表現を避け、具体的な行動を書いてください。')
  }

  if (!dueDate) hints.push('期限を設定すると優先度管理がしやすくなります。')
  if (!evidence.trim()) hints.push('なぜこの行動が必要か根拠を記入すると実行力が上がります。')
  if (!deadlineEvidence.trim()) hints.push('期限の根拠を入れると、なぜ今やるべきか判断しやすくなります。')
  if (!consequenceIfDelayed.trim()) hints.push('遅れた場合の影響を書くと、行動の優先度が明確になります。')
  if (!hasParentMilestone) hints.push('マイルストーンに紐づけると計画進捗が可視化されます。')

  return { strong, hints }
}

export default function ActionComposer({ onAdd, onCancel, hasParentMilestone = false }) {
  const [text, setText] = useState('')
  const [evidence, setEvidence] = useState('')
  const [deadlineEvidence, setDeadlineEvidence] = useState('')
  const [consequenceIfDelayed, setConsequenceIfDelayed] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [dueDate, setDueDate] = useState('')

  const { strong, hints } = text.trim()
    ? categorizeWarnings(text.trim(), evidence, deadlineEvidence, consequenceIfDelayed, estimatedMinutes, dueDate, hasParentMilestone)
    : { strong: [], hints: [] }

  function handleSubmit() {
    if (!text.trim()) return
    onAdd({ text: text.trim(), evidence, deadlineEvidence, consequenceIfDelayed, estimatedMinutes, dueDate })
    setText('')
    setEvidence('')
    setDeadlineEvidence('')
    setConsequenceIfDelayed('')
    setEstimatedMinutes(30)
    setDueDate('')
    if (onCancel) onCancel()
  }

  return (
    <div className="border border-indigo-200 rounded-xl p-3 space-y-2 bg-indigo-50/30">
      {strong.length > 0 && (
        <ul className="space-y-1">
          {strong.map((w, i) => (
            <li
              key={i}
              className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 leading-relaxed flex gap-1.5"
            >
              <span className="flex-shrink-0">⚠️</span>
              {w}
            </li>
          ))}
        </ul>
      )}

      {strong.length === 0 && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 leading-relaxed">
          💡 30分〜2時間で完了できる具体行動を入力してください
        </p>
      )}

      <input
        type="text"
        placeholder="具体行動を入力..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      />

      <textarea
        placeholder="なぜ必要か..."
        value={evidence}
        onChange={(e) => setEvidence(e.target.value)}
        rows={2}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
      />

      <textarea
        placeholder="なぜこの日まで？（期限の根拠）..."
        value={deadlineEvidence}
        onChange={(e) => setDeadlineEvidence(e.target.value)}
        rows={2}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
      />

      <textarea
        placeholder="遅れると何が起きる？..."
        value={consequenceIfDelayed}
        onChange={(e) => setConsequenceIfDelayed(e.target.value)}
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
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">期限</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
      </div>

      {hints.length > 0 && (
        <div className="space-y-1">
          {hints.map((h, i) => (
            <p
              key={i}
              className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 leading-relaxed flex gap-1.5"
            >
              <span className="flex-shrink-0">💡</span>
              {h}
            </p>
          ))}
        </div>
      )}

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
