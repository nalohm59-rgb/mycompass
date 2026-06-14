import StrategyCard from './StrategyCard'

export default function StrategyList({
  strategies,
  milestones,
  actions,
  allDreams,
  allLinks,
  onToggleMilestone,
  onToggleAction,
  onDeleteAction,
  dream,
}) {
  if (strategies.length === 0) return null

  return (
    <div className="space-y-3">
      {strategies.map((strategy) => (
        <StrategyCard
          key={strategy.id}
          strategy={strategy}
          milestones={milestones.filter((m) => m.strategyId === strategy.id)}
          actions={actions.filter((a) => a.strategyId === strategy.id)}
          allDreams={allDreams}
          allLinks={allLinks}
          onToggleMilestone={onToggleMilestone}
          onToggleAction={onToggleAction}
          onDeleteAction={onDeleteAction}
          dream={dream}
        />
      ))}
    </div>
  )
}
