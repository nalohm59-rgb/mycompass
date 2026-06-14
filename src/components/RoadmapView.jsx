import StrategyList from './StrategyList'

export default function RoadmapView({
  strategies,
  milestones,
  actions,
  allDreams,
  allLinks,
  onToggleMilestone,
  onToggleAction,
  onDeleteAction,
  onGoToEdit,
  dream,
}) {
  if (strategies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-2xl mb-3">🗺️</p>
        <p className="text-sm font-medium text-slate-600 mb-1">まだ戦略がありません</p>
        <p className="text-xs text-slate-400 mb-5">
          夢を実現するための戦略を追加すると、ここにロードマップが表示されます
        </p>
        <button
          onClick={onGoToEdit}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          編集タブで戦略を追加する
        </button>
      </div>
    )
  }

  return (
    <StrategyList
      strategies={strategies}
      milestones={milestones}
      actions={actions}
      allDreams={allDreams}
      allLinks={allLinks}
      onToggleMilestone={onToggleMilestone}
      onToggleAction={onToggleAction}
      onDeleteAction={onDeleteAction}
      dream={dream}
    />
  )
}
