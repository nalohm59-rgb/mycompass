import { useState } from 'react'
import { buildMilestoneEvidencePrompt, parseMilestoneAiJson } from '../utils/aiPrompt'

const inputClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

const textareaClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white'

const AI_FIELDS = [
  {
    key: 'deadlineEvidence',
    label: 'なぜこの日まで？',
    placeholder: 'AIプロンプトを生成してAIに貼り付け、出力結果を入力してください',
    labelClass: 'text-slate-500',
  },
  {
    key: 'consequenceIfDelayed',
    label: '遅れると何が起きる？',
    placeholder: '因果連鎖で書いてください（→ を使って連鎖を明示）',
    labelClass: 'text-red-500',
  },
  {
    key: 'whatProgressesWhenCompleted',
    label: '完了すると何が進む？',
    placeholder: '次に実行できること・解消される不確実性を書いてください',
    labelClass: 'text-emerald-600',
  },
]

export default function MilestoneEditCard({ milestone, onChange, onDelete, onToggle, promptContext }) {
  const [draft, setDraft] = useState(() => ({ ...milestone }))
  const [copied, setCopied] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteRaw, setPasteRaw] = useState('')
  const [parseError, setParseError] = useState(false)

  function set(key) {
    return (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleToggle() {
    onToggle()
    setDraft((prev) => ({ ...prev, completed: !prev.completed }))
  }

  function save() {
    onChange(draft)
  }

  async function handleCopyPrompt() {
    const prompt = buildMilestoneEvidencePrompt({
      dream: promptContext?.dream ?? null,
      strategy: promptContext?.strategy ?? null,
      milestone: draft,
    })
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleApplyJson() {
    const parsed = parseMilestoneAiJson(pasteRaw)
    if (!parsed) {
      setParseError(true)
      setTimeout(() => setParseError(false), 3000)
      return
    }
    setDraft((prev) => ({
      ...prev,
      deadlineEvidence: parsed.whyByThisDate,
      consequenceIfDelayed: parsed.whatHappensIfDelayed,
      whatProgressesWhenCompleted: parsed.whatProgressesWhenCompleted,
    }))
    setPasteRaw('')
    setShowPaste(false)
    setParseError(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
      {/* タイトル行 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            draft.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 hover:border-emerald-400'
          }`}
        >
          {draft.completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
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
        <input
          type="text"
          value={draft.title}
          onChange={set('title')}
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

      <div className="pl-7 space-y-2">
        {/* 期限・完了条件 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
            <input
              type="date"
              value={draft.dueDate}
              onChange={set('dueDate')}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">完了条件</label>
            <textarea
              value={draft.doneDefinition}
              onChange={set('doneDefinition')}
              placeholder="何をもって完了とするか..."
              rows={2}
              className={textareaClass}
            />
          </div>
        </div>

        {/* AIコメント3項目 */}
        {AI_FIELDS.map(({ key, label, placeholder, labelClass }) => (
          <div key={key}>
            <label className={`block text-xs font-medium mb-1 ${labelClass}`}>{label}</label>
            <textarea
              value={draft[key] ?? ''}
              onChange={set(key)}
              placeholder={placeholder}
              rows={3}
              className={textareaClass}
            />
          </div>
        ))}

        {/* AIプロンプト生成・JSON貼り付け */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <button
            onClick={handleCopyPrompt}
            className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg px-2 py-1.5 transition-colors bg-indigo-50/50"
          >
            {copied ? '✓ AI用プロンプトをコピーしました' : '🤖 AI用プロンプトをコピー（3項目生成）'}
          </button>

          <button
            onClick={() => setShowPaste((v) => !v)}
            className="w-full text-xs text-slate-400 hover:text-slate-600 border border-slate-100 hover:border-slate-200 rounded-lg px-2 py-1.5 transition-colors"
          >
            {showPaste ? '▲ 閉じる' : '▼ AIの出力（JSON）を貼り付けて自動反映する'}
          </button>

          {showPaste && (
            <div className="space-y-1.5">
              <textarea
                value={pasteRaw}
                onChange={(e) => {
                  setPasteRaw(e.target.value)
                  setParseError(false)
                }}
                placeholder={
                  'AIからのJSON出力をここに貼り付けてください\n例：\n{\n  "whyByThisDate": "...",\n  "whatHappensIfDelayed": "...",\n  "whatProgressesWhenCompleted": "..."\n}'
                }
                rows={6}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-mono placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-slate-50"
              />
              {parseError && (
                <p className="text-xs text-red-500">
                  JSONの形式が正しくありません。AIの出力をそのまま貼り付けてください。
                </p>
              )}
              <button
                onClick={handleApplyJson}
                disabled={!pasteRaw.trim()}
                className="w-full text-xs text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg px-2 py-1.5 transition-colors font-medium"
              >
                3つのフィールドに反映する
              </button>
            </div>
          )}
        </div>

        {/* 保存ボタン */}
        <button
          onClick={save}
          className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  )
}
