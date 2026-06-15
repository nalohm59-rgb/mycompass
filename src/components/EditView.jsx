import DreamBasicEditForm from './DreamBasicEditForm'
import MoneyEditForm from './MoneyEditForm'
import WhyEditForm from './WhyEditForm'
import DreamStrategyLinkEditList from './DreamStrategyLinkEditList'
import StrategyEditList from './StrategyEditList'
import MilestoneEditList from './MilestoneEditList'
import ActionEditList from './ActionEditList'

export default function EditView({
  dream,
  strategies,
  milestones,
  actions,
  links,
  allStrategies,
  allDreams,
  allLinks,
  onChange,
  onAddStrategyAndLink,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onUpdateStrategy,
  onDeleteStrategy,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onToggleMilestone,
  onAddAction,
  onUpdateAction,
  onToggleAction,
  onDeleteAction,
}) {
  return (
    <div className="space-y-4">
      <DreamBasicEditForm dream={dream} onChange={onChange} />

      <MoneyEditForm dream={dream} onChange={onChange} />

      <WhyEditForm dream={dream} onChange={onChange} />

      <DreamStrategyLinkEditList
        dream={dream}
        links={links}
        strategies={strategies}
        allStrategies={allStrategies}
        onAddStrategyAndLink={onAddStrategyAndLink}
        onAddLink={onAddLink}
        onUpdate={onUpdateLink}
        onDelete={onDeleteLink}
      />

      <StrategyEditList
        strategies={allStrategies}
        allLinks={allLinks}
        allDreams={allDreams}
        onAdd={onAddStrategyAndLink}
        onUpdate={onUpdateStrategy}
        onDelete={onDeleteStrategy}
      />

      <MilestoneEditList
        strategies={strategies}
        milestones={milestones}
        onAdd={onAddMilestone}
        onUpdate={onUpdateMilestone}
        onDelete={onDeleteMilestone}
        onToggle={onToggleMilestone}
        dream={dream}
      />

      <ActionEditList
        strategies={strategies}
        milestones={milestones}
        actions={actions}
        onAdd={onAddAction}
        onUpdate={onUpdateAction}
        onDelete={onDeleteAction}
        onToggle={onToggleAction}
        dream={dream}
        allDreams={allDreams}
        allLinks={allLinks}
      />
    </div>
  )
}
