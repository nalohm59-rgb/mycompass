import ActionEditCard from './ActionEditCard'

export default function ActionEditList({
  strategies, milestones, actions,
  onUpdate, onDelete, onToggle,
}) {
  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-semibold text-slate-700">行動</h3>
        </div>
        <p className="text-xs text-slate-400 text-center py-3">
          「ロードマップ」タブからActionを追加してください
        </p>
      </div>
    )
  }

  // strategy → milestone → action の階層でグループ化
  const groups = []

  strategies.forEach(strategy => {
    const stratActions = actions.filter(a => a.strategyId === strategy.id)
    if (stratActions.length === 0) return

    const milestoneGroups = []
    const stratMilestones = milestones.filter(m => m.strategyId === strategy.id)

    stratMilestones.forEach(milestone => {
      const msActions = stratActions.filter(a => a.milestoneId === milestone.id)
      if (msActions.length > 0) {
        milestoneGroups.push({ milestone, actions: msActions })
      }
    })

    const directActions = stratActions.filter(a => !a.milestoneId)
    if (directActions.length > 0) {
      milestoneGroups.push({ milestone: null, actions: directActions })
    }

    if (milestoneGroups.length > 0) {
      groups.push({ strategy, milestoneGroups })
    }
  })

  // 戦略に紐づかない行動
  const orphanActions = actions.filter(a => !a.strategyId)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-semibold text-slate-700">行動</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
          {actions.length}件
        </span>
      </div>

      {groups.map(({ strategy, milestoneGroups }) => (
        <div key={strategy.id} className="space-y-3">
          <p className="text-xs font-semibold text-slate-600">🎯 {strategy.title || '（無題）'}</p>
          {milestoneGroups.map(({ milestone, actions: groupActions }) => (
            <div key={milestone?.id ?? 'direct'} className="space-y-2 pl-3 border-l-2 border-slate-100">
              <p className="text-xs text-slate-500">
                {milestone ? `📍 ${milestone.title || '（無題）'}` : '戦略直下の行動'}
              </p>
              {groupActions.map(action => (
                <ActionEditCard
                  key={action.id}
                  action={action}
                  onChange={patch => onUpdate(action.id, patch)}
                  onDelete={() => onDelete(action.id)}
                  onToggle={() => onToggle(action.id)}
                />
              ))}
            </div>
          ))}
        </div>
      ))}

      {orphanActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">その他の行動</p>
          {orphanActions.map(action => (
            <ActionEditCard
              key={action.id}
              action={action}
              onChange={patch => onUpdate(action.id, patch)}
              onDelete={() => onDelete(action.id)}
              onToggle={() => onToggle(action.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
