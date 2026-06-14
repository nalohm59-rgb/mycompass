import DreamSummaryCard from './DreamSummaryCard'
import TodayActionPanel from './TodayActionPanel'
import MoneyRealityCard from './MoneyRealityCard'
import BlockDetector from './BlockDetector'

export default function DashboardView({
  dream,
  strategies,
  milestones,
  actions,
  links,
  allDreams,
  allLinks,
  onToggleAction,
}) {
  const incompleteActions = actions.filter((a) => !a.completed)

  return (
    <div className="space-y-4">
      <DreamSummaryCard
        dream={dream}
        strategies={strategies}
        milestones={milestones}
        actions={actions}
        links={links}
      />
      <TodayActionPanel
        actions={incompleteActions}
        allActions={actions}
        dreams={allDreams}
        strategies={strategies}
        milestones={milestones}
        allLinks={allLinks}
        onToggle={onToggleAction}
      />
      <MoneyRealityCard dream={dream} links={links} />
      <BlockDetector
        dream={dream}
        strategies={strategies}
        milestones={milestones}
        actions={actions}
        links={links}
      />
    </div>
  )
}
