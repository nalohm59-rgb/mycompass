import { useState } from 'react'

const IMPACT_UNIT_OPTIONS = [
  { value: 'monthly_yen', label: '万円/月' },
  { value: 'one_time_yen', label: '万円（一時）' },
  { value: 'habit', label: '習慣' },
  { value: 'knowledge', label: '知識・スキル' },
]

const inputClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

const textareaClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white'

export default function DreamStrategyLinkEditCard({ link, strategy, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(() => ({ ...link }))

  function set(key) {
    return (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleImpactBlur(e) {
    const num = parseInt(e.target.value) || 0
    setDraft((prev) => ({ ...prev, expectedMonthlyImpact: String(num) }))
    onChange({ expectedMonthlyImpact: num })
  }

  function save() {
    onChange({
      ...draft,
      expectedMonthlyImpact: parseInt(draft.expectedMonthlyImpact) || 0,
      contributionTargetAmount: parseInt(draft.contributionTargetAmount) || 0,
      contributionCurrentAmount: parseInt(draft.contributionCurrentAmount) || 0,
      impactRampUpMonths: parseInt(draft.impactRampUpMonths) || 0,
      relevance: Number(draft.relevance) || 3,
      priority: Number(draft.priority) || 3,
    })
    setExpanded(false)
  }

  const impactDisplay =
    draft.impactUnit === 'monthly_yen'
      ? `¥${Number(draft.expectedMonthlyImpact || 0).toLocaleString()}/月`
      : draft.impactUnit === 'one_time_yen'
        ? `¥${Number(draft.expectedMonthlyImpact || 0).toLocaleString()}（一時）`
        : IMPACT_UNIT_OPTIONS.find((o) => o.value === draft.impactUnit)?.label ?? ''

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50/40">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {strategy?.title || '（無題の戦略）'}
          </p>
          <p className="text-xs text-slate-400">{impactDisplay}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 text-xs text-slate-400">
          <span>優先度 {draft.priority}</span>
          <span>·</span>
          <span>関連度 {draft.relevance}</span>
        </div>
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
          aria-label="リンクを解除"
        >
          ×
        </button>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-3 border-t border-slate-100">
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">期待効果</label>
              <input
                type="number"
                value={draft.expectedMonthlyImpact}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, expectedMonthlyImpact: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">単位</label>
              <select
                value={draft.impactUnit}
                onChange={set('impactUnit')}
                className={inputClass}
              >
                {IMPACT_UNIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
              <input
                type="date"
                value={draft.deadline ?? ''}
                onChange={set('deadline')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">期待開始日</label>
              <input
                type="date"
                value={draft.expectedStartDate ?? ''}
                onChange={set('expectedStartDate')}
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-0.5">効果が出始める日</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              立ち上がり期間（ヶ月）
            </label>
            <input
              type="number"
              min="0"
              value={draft.impactRampUpMonths ?? 0}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, impactRampUpMonths: e.target.value }))
              }
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-0.5">
              0=即全額、1以上=指定月数かけて全額に増加
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">この夢に必要な理由</label>
            <textarea
              value={draft.reasonForDream ?? ''}
              onChange={set('reasonForDream')}
              placeholder="なぜこの戦略がこの夢に必要か..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">成功の定義</label>
            <textarea
              value={draft.successDefinition ?? ''}
              onChange={set('successDefinition')}
              placeholder="何が達成できたら成功か..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-red-500 mb-1">遅れると何が起きる？</label>
            <textarea
              value={draft.riskIfDelayed ?? ''}
              onChange={set('riskIfDelayed')}
              placeholder="戦略が遅れた場合の影響..."
              rows={2}
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">優先度（1-5）</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDraft((prev) => ({ ...prev, priority: n }))}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      Number(draft.priority) >= n
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">関連度（1-5）</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDraft((prev) => ({ ...prev, relevance: n }))}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      Number(draft.relevance) >= n
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-purple-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
