import DreamSummaryCard from './DreamSummaryCard'
import TodayActionPanel from './TodayActionPanel'
import MoneyRealityCard from './MoneyRealityCard'
import BlockDetector from './BlockDetector'

export default function DashboardView({
  dream, strategies, milestones, actions,
  onToggleAction, onDeleteAction,
}) {
  const incompleteActions = actions.filter(a => !a.completed)

  return (
    <div className="space-y-4">
      <DreamSummaryCard
        dream={dream}
        strategies={strategies}
        milestones={milestones}
        actions={actions}
      />
      <TodayActionPanel
        actions={incompleteActions}
        dreams={[dream]}
        strategies={strategies}
        milestones={milestones}
        onToggle={onToggleAction}
        onDelete={onDeleteAction}
      />
      <MoneyRealityCard
        dream={dream}
        strategies={strategies}
      />
      <BlockDetector
        dream={dream}
        strategies={strategies}
        milestones={milestones}
        actions={actions}
      />
    </div>
  )
}
