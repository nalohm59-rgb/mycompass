import StrategyList from './StrategyList'

export default function RoadmapView({
  strategies, milestones, actions,
  onAddStrategy,
  onUpdateStrategy, onDeleteStrategy,
  onAddMilestone, onUpdateMilestone, onDeleteMilestone, onToggleMilestone,
  onAddAction, onToggleAction, onDeleteAction,
}) {
  if (strategies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-sm text-slate-400 mb-5">まだ戦略がありません</p>
        <button
          onClick={onAddStrategy}
          className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl font-medium transition-colors"
        >
          ＋ 最初の戦略を追加
        </button>
      </div>
    )
  }

  return (
    <StrategyList
      strategies={strategies}
      milestones={milestones}
      actions={actions}
      onAdd={onAddStrategy}
      onUpdate={onUpdateStrategy}
      onDelete={onDeleteStrategy}
      onAddMilestone={onAddMilestone}
      onUpdateMilestone={onUpdateMilestone}
      onDeleteMilestone={onDeleteMilestone}
      onToggleMilestone={onToggleMilestone}
      onAddAction={onAddAction}
      onToggleAction={onToggleAction}
      onDeleteAction={onDeleteAction}
      readOnly
    />
  )
}
