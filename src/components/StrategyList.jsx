import StrategyCard from './StrategyCard'

export default function StrategyList({
  strategies, milestones, actions, onAdd,
  onUpdate, onDelete,
  onAddMilestone, onUpdateMilestone, onDeleteMilestone, onToggleMilestone,
  onAddAction, onToggleAction, onDeleteAction,
  readOnly = false,
}) {
  if (strategies.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-semibold text-slate-700">戦略</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {strategies.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          ＋ 戦略を追加
        </button>
      </div>

      {strategies.map(strategy => (
        <StrategyCard
          key={strategy.id}
          strategy={strategy}
          milestones={milestones.filter(m => m.strategyId === strategy.id)}
          actions={actions.filter(a => a.strategyId === strategy.id)}
          onChange={patch => onUpdate(strategy.id, patch)}
          onDelete={() => onDelete(strategy.id)}
          onAddMilestone={() => onAddMilestone(strategy.id)}
          onUpdateMilestone={onUpdateMilestone}
          onDeleteMilestone={onDeleteMilestone}
          onToggleMilestone={onToggleMilestone}
          onAddAction={(milestoneId, fields) => onAddAction(strategy.id, milestoneId, fields)}
          onToggleAction={onToggleAction}
          onDeleteAction={onDeleteAction}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
