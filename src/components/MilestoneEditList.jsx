import MilestoneEditCard from './MilestoneEditCard'

export default function MilestoneEditList({
  strategies, milestones,
  onAdd, onUpdate, onDelete, onToggle,
}) {
  if (strategies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📍</span>
          <h3 className="text-sm font-semibold text-slate-700">マイルストーン</h3>
        </div>
        <p className="text-xs text-slate-400 text-center py-3">
          先に戦略を追加してください
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">📍</span>
        <h3 className="text-sm font-semibold text-slate-700">マイルストーン</h3>
      </div>

      {strategies.map(strategy => {
        const stratMilestones = milestones.filter(m => m.strategyId === strategy.id)
        return (
          <div key={strategy.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                🎯 {strategy.title || '（無題）'}
              </p>
              <button
                onClick={() => onAdd(strategy.id)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex-shrink-0"
              >
                ＋ 追加
              </button>
            </div>

            {stratMilestones.length === 0 && (
              <p className="text-xs text-slate-400 pl-4 py-1">
                マイルストーンがありません
              </p>
            )}

            {stratMilestones.map(milestone => (
              <MilestoneEditCard
                key={milestone.id}
                milestone={milestone}
                onChange={patch => onUpdate(milestone.id, patch)}
                onDelete={() => onDelete(milestone.id)}
                onToggle={() => onToggle(milestone.id)}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
