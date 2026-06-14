import StrategyEditCard from './StrategyEditCard'

export default function StrategyEditList({
  strategies,
  allLinks,
  allDreams,
  onAdd,
  onUpdate,
  onDelete,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-semibold text-slate-700">全戦略</h3>
          {strategies.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {strategies.length}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          ＋ 戦略を追加
        </button>
      </div>

      {strategies.length === 0 && (
        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400 mb-3">まだ戦略がありません</p>
          <button
            onClick={onAdd}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-dashed border-indigo-200 px-6 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            ＋ 最初の戦略を追加
          </button>
        </div>
      )}

      {strategies.map((strategy) => {
        const linkedDreams = (allLinks || [])
          .filter((l) => l.strategyId === strategy.id)
          .map((l) => (allDreams || []).find((d) => d.id === l.dreamId))
          .filter(Boolean)

        return (
          <StrategyEditCard
            key={strategy.id}
            strategy={strategy}
            linkedDreams={linkedDreams}
            onChange={(patch) => onUpdate(strategy.id, patch)}
            onDelete={() => onDelete(strategy.id)}
          />
        )
      })}
    </div>
  )
}
