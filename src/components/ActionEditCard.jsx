import { useState } from 'react'
import { buildActionEvidencePrompt } from '../utils/aiPrompt'

const inputClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

const textareaClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white'

export default function ActionEditCard({ action, onChange, onDelete, onToggle, promptContext }) {
  const [expanded, setExpanded] = useState(!action.text)
  const [draft, setDraft] = useState(() => ({ ...action }))
  const [copied, setCopied] = useState(false)

  function set(key) {
    return (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleToggle() {
    onToggle()
    setDraft((prev) => ({ ...prev, completed: !prev.completed }))
  }

  function save() {
    onChange({ ...draft, estimatedMinutes: parseInt(draft.estimatedMinutes) || 30 })
    setExpanded(false)
  }

  async function handleCopyPrompt() {
    const prompt = buildActionEvidencePrompt({
      dream: promptContext?.dream ?? null,
      strategy: promptContext?.strategy ?? null,
      milestone: promptContext?.milestone ?? null,
      action: draft,
    })
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isOverdue = draft.dueDate && new Date(draft.dueDate) < new Date()

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 常時表示ヘッダー */}
      <div className="flex items-start gap-2 px-3 py-2">
        <button
          onClick={handleToggle}
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
            draft.completed
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'border-slate-300 hover:border-indigo-400'
          }`}
        >
          {draft.completed && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${draft.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
          >
            {draft.text || '（新しい行動）'}
          </p>
          {!expanded && (
            <div className="flex gap-3 mt-0.5 flex-wrap">
              {draft.dueDate && (
                <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-indigo-400'}`}>
                  {new Date(draft.dueDate).toLocaleDateString('ja-JP')}
                  {isOverdue && ' ⚠️'}
                </span>
              )}
              {draft.estimatedMinutes > 0 && (
                <span className="text-xs text-slate-400">{draft.estimatedMinutes}分</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-md px-2 py-0.5 flex-shrink-0 mt-0.5 transition-colors"
        >
          {expanded ? '閉じる' : '編集'}
        </button>

        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0 mt-0.5"
          aria-label="削除"
        >
          ×
        </button>
      </div>

      {/* 展開時フォーム */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">行動内容</label>
            <input
              type="text"
              value={draft.text}
              onChange={set('text')}
              placeholder="具体的な行動..."
              autoFocus={!action.text}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">なぜ必要か</label>
            <textarea
              value={draft.evidence}
              onChange={set('evidence')}
              placeholder="なぜこの行動が必要か..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">なぜこの日まで？</label>
            <textarea
              value={draft.deadlineEvidence ?? ''}
              onChange={set('deadlineEvidence')}
              placeholder="なぜこの期限までに必要か..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-red-500 mb-1">遅れると何が起きる？</label>
            <textarea
              value={draft.consequenceIfDelayed ?? ''}
              onChange={set('consequenceIfDelayed')}
              placeholder="遅れた場合の影響..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">見積もり（分）</label>
              <input
                type="number"
                min="5"
                step="5"
                value={draft.estimatedMinutes}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, estimatedMinutes: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
              <input
                type="date"
                value={draft.dueDate}
                onChange={set('dueDate')}
                className={inputClass}
              />
            </div>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg px-2 py-1.5 transition-colors bg-indigo-50/50"
          >
            {copied ? '✓ AI用プロンプトをコピーしました' : '🤖 AI用プロンプトをコピー'}
          </button>

          <button
            onClick={save}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      )}
    </div>
  )
}
