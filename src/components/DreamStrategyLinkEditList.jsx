import { useState } from 'react'
import DreamStrategyLinkEditCard from './DreamStrategyLinkEditCard'
import StrategySelectForDream from './StrategySelectForDream'

export default function DreamStrategyLinkEditList({
  dream,
  links,
  strategies,
  allStrategies,
  onAddStrategyAndLink,
  onAddLink,
  onUpdate,
  onDelete,
}) {
  const [showSelector, setShowSelector] = useState(false)

  const linkedStrategyIds = new Set(links.map((l) => l.strategyId))

  function handleSelect(strategyId) {
    onAddLink(strategyId)
    setShowSelector(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <h3 className="text-sm font-semibold text-slate-700">この夢に効く戦略</h3>
          {links.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {links.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowSelector(false)
              onAddStrategyAndLink()
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            ＋ 新規戦略
          </button>
          <button
            onClick={() => setShowSelector((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors border border-slate-200 px-2 py-0.5 rounded-lg"
          >
            既存を追加
          </button>
        </div>
      </div>

      {showSelector && (
        <StrategySelectForDream
          allStrategies={allStrategies}
          linkedStrategyIds={linkedStrategyIds}
          onSelect={handleSelect}
          onClose={() => setShowSelector(false)}
        />
      )}

      {links.length === 0 && !showSelector && (
        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400 mb-3">
            「{dream.title}」に紐づく戦略がありません
          </p>
          <button
            onClick={onAddStrategyAndLink}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-dashed border-indigo-200 px-6 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            ＋ 最初の戦略を追加
          </button>
        </div>
      )}

      {links.map((link) => {
        const strategy = strategies.find((s) => s.id === link.strategyId)
        return (
          <DreamStrategyLinkEditCard
            key={link.id}
            link={link}
            strategy={strategy}
            onChange={(patch) => onUpdate(link.id, patch)}
            onDelete={() => onDelete(link.id)}
          />
        )
      })}
    </div>
  )
}
