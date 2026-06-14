import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'idea', label: 'アイデア' },
  { value: 'active', label: '実行中' },
  { value: 'paused', label: '一時停止' },
  { value: 'done', label: '完了' },
  { value: 'abandoned', label: '断念' },
]

const STATUS_BADGE = {
  idea: 'bg-slate-100 text-slate-600',
  active: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  done: 'bg-emerald-100 text-emerald-700',
  abandoned: 'bg-red-100 text-red-500',
}

const CATEGORY_OPTIONS = [
  { value: 'income', label: '収入' },
  { value: 'expense', label: '支出削減' },
  { value: 'investment', label: '投資' },
  { value: 'skill', label: 'スキル' },
  { value: 'network', label: 'ネットワーク' },
  { value: 'health', label: '健康' },
  { value: 'other', label: 'その他' },
]

const CATEGORY_ICONS_STRATEGY = {
  home: '🏠',
  birth: '👶',
  money: '💰',
  career: '💼',
  health: '💪',
  life: '✨',
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

export default function StrategyEditCard({ strategy, onChange, onDelete, linkedDreams }) {
  const [expanded, setExpanded] = useState(!strategy.title)
  const [draft, setDraft] = useState(() => ({ ...strategy }))

  function set(key) {
    return (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function save() {
    onChange({ ...draft })
    setExpanded(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/60">
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
        <span
          className={`flex-1 text-sm font-semibold min-w-0 truncate ${draft.title ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {draft.title || '（無題）'}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[draft.status]}`}
        >
          {STATUS_OPTIONS.find((o) => o.value === draft.status)?.label}
        </span>
        {linkedDreams && linkedDreams.length > 0 && (
          <span className="text-xs text-purple-500 flex-shrink-0">
            {linkedDreams.length}夢
          </span>
        )}
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
          aria-label="削除"
        >
          ×
        </button>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">戦略タイトル</label>
            <input
              type="text"
              value={draft.title}
              onChange={set('title')}
              placeholder="戦略タイトルを入力..."
              autoFocus={!strategy.title}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">概要</label>
            <textarea
              value={draft.description ?? ''}
              onChange={set('description')}
              placeholder="この戦略の概要..."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">カテゴリ</label>
              <select value={draft.category ?? 'income'} onChange={set('category')} className={inputClass}>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ステータス</label>
              <select value={draft.status} onChange={set('status')} className={inputClass}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">確信度</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDraft((prev) => ({ ...prev, confidence: n }))}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    draft.confidence >= n
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {linkedDreams && linkedDreams.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">効いている夢</p>
              <div className="flex flex-wrap gap-1">
                {linkedDreams.map((d) => (
                  <span
                    key={d.id}
                    className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full"
                  >
                    {CATEGORY_ICONS_STRATEGY[d.category] ?? '✨'} {d.title}
                  </span>
                ))}
              </div>
            </div>
          )}

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
