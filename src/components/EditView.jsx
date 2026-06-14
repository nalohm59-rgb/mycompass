import DreamBasicEditForm from './DreamBasicEditForm'
import MoneyEditForm from './MoneyEditForm'
import WhyEditForm from './WhyEditForm'
import StrategyEditList from './StrategyEditList'
import MilestoneEditList from './MilestoneEditList'
import ActionEditList from './ActionEditList'

export default function EditView({
  dream, strategies, milestones, actions,
  onChange,
  onAddStrategy, onUpdateStrategy, onDeleteStrategy,
  onAddMilestone, onUpdateMilestone, onDeleteMilestone, onToggleMilestone,
  onUpdateAction, onToggleAction, onDeleteAction,
}) {
  return (
    <div className="space-y-4">
      <DreamBasicEditForm dream={dream} onChange={onChange} />

      <MoneyEditForm dream={dream} onChange={onChange} />

      <WhyEditForm dream={dream} onChange={onChange} />

      <StrategyEditList
        strategies={strategies}
        onAdd={onAddStrategy}
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
      />

      <ActionEditList
        strategies={strategies}
        milestones={milestones}
        actions={actions}
        onUpdate={onUpdateAction}
        onDelete={onDeleteAction}
        onToggle={onToggleAction}
      />
    </div>
  )
}
