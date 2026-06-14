import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'idea',      label: 'アイデア' },
  { value: 'active',    label: '実行中' },
  { value: 'paused',    label: '一時停止' },
  { value: 'done',      label: '完了' },
  { value: 'abandoned', label: '断念' },
]

const STATUS_BADGE = {
  idea:      'bg-slate-100 text-slate-600',
  active:    'bg-blue-100 text-blue-700',
  paused:    'bg-yellow-100 text-yellow-700',
  done:      'bg-emerald-100 text-emerald-700',
  abandoned: 'bg-red-100 text-red-500',
}

const IMPACT_UNIT_OPTIONS = [
  { value: 'monthly_yen',  label: '万円/月' },
  { value: 'one_time_yen', label: '万円（一時）' },
  { value: 'habit',        label: '習慣' },
  { value: 'knowledge',    label: '知識・スキル' },
]

const inputClass = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

export default function StrategyEditCard({ strategy, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(!strategy.title)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/60">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 16 16">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={`flex-1 text-sm font-semibold min-w-0 truncate ${strategy.title ? 'text-slate-800' : 'text-slate-400'}`}>
          {strategy.title || '（無題）'}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[strategy.status]}`}>
          {STATUS_OPTIONS.find(o => o.value === strategy.status)?.label}
        </span>
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
          aria-label="削除"
        >
          ×
        </button>
      </div>

      {/* 編集フォーム */}
      {expanded && (
        <div className="px-4 py-4 space-y-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">戦略タイトル</label>
            <input
              type="text"
              value={strategy.title}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="戦略タイトルを入力..."
              autoFocus={!strategy.title}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ステータス</label>
              <select
                value={strategy.status}
                onChange={e => onChange({ status: e.target.value })}
                className={inputClass}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">確信度</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => onChange({ confidence: n })}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      strategy.confidence >= n
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">なぜ必要か</label>
            <textarea
              value={strategy.reason}
              onChange={e => onChange({ reason: e.target.value })}
              placeholder="この戦略が必要な理由..."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">期待効果</label>
              <input
                type="number"
                value={strategy.expectedImpact}
                onChange={e => onChange({ expectedImpact: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">単位</label>
              <select
                value={strategy.impactUnit}
                onChange={e => onChange({ impactUnit: e.target.value })}
                className={inputClass}
              >
                {IMPACT_UNIT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
            <input
              type="date"
              value={strategy.deadline}
              onChange={e => onChange({ deadline: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  )
}
