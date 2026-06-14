import StrategyCard from './StrategyCard'

export default function StrategyList({
  strategies, milestones, actions,
  onToggleMilestone, onAddAction, onToggleAction, onDeleteAction,
}) {
  if (strategies.length === 0) return null

  return (
    <div className="space-y-3">
      {strategies.map(strategy => (
        <StrategyCard
          key={strategy.id}
          strategy={strategy}
          milestones={milestones.filter(m => m.strategyId === strategy.id)}
          actions={actions.filter(a => a.strategyId === strategy.id)}
          onToggleMilestone={onToggleMilestone}
          onAddAction={(milestoneId, fields) => onAddAction(strategy.id, milestoneId, fields)}
          onToggleAction={onToggleAction}
          onDeleteAction={onDeleteAction}
        />
      ))}
    </div>
  )
}
