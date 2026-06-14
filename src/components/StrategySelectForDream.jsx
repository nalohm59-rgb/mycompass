import { useState } from 'react'

const STATUS_BADGE = {
  idea: 'bg-slate-100 text-slate-600',
  active: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  done: 'bg-emerald-100 text-emerald-700',
  abandoned: 'bg-red-100 text-red-500',
}

const STATUS_LABELS = {
  idea: 'アイデア',
  active: '実行中',
  paused: '一時停止',
  done: '完了',
  abandoned: '断念',
}

export default function StrategySelectForDream({
  allStrategies,
  linkedStrategyIds,
  onSelect,
  onClose,
}) {
  const [query, setQuery] = useState('')

  const available = allStrategies.filter(
    (s) =>
      !linkedStrategyIds.has(s.id) &&
      (s.title.includes(query) || (s.description ?? '').includes(query)),
  )

  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">既存の戦略を選択して追加</p>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-slate-500 text-base leading-none"
        >
          ×
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="戦略名で絞り込み..."
        autoFocus
        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      />

      {available.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">
          {allStrategies.length === 0
            ? 'まだ戦略がありません'
            : '追加可能な戦略がありません'}
        </p>
      ) : (
        <ul className="space-y-1 max-h-48 overflow-y-auto">
          {available.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {s.title || '（無題）'}
                  </p>
                  {s.description && (
                    <p className="text-xs text-slate-400 truncate">{s.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[s.status]}`}
                >
                  {STATUS_LABELS[s.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
