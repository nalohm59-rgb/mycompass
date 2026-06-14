import StrategyList from './StrategyList'

export default function RoadmapView({
  strategies, milestones, actions,
  onToggleMilestone, onAddAction, onToggleAction, onDeleteAction,
}) {
  if (strategies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-sm text-slate-400 mb-2">まだ戦略がありません</p>
        <p className="text-xs text-slate-300">「編集」タブから戦略を追加してください</p>
      </div>
    )
  }

  return (
    <StrategyList
      strategies={strategies}
      milestones={milestones}
      actions={actions}
      onToggleMilestone={onToggleMilestone}
      onAddAction={onAddAction}
      onToggleAction={onToggleAction}
      onDeleteAction={onDeleteAction}
    />
  )
}
