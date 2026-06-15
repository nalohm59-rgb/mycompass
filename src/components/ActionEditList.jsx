import ActionEditCard from './ActionEditCard'

export default function ActionEditList({
  strategies,
  milestones,
  actions,
  onUpdate,
  onDelete,
  onToggle,
  onAdd,
  dream,
  allDreams,
  allLinks,
}) {
  if (strategies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-semibold text-slate-700">行動</h3>
        </div>
        <p className="text-xs text-slate-400 text-center py-3">先に戦略を追加してください</p>
      </div>
    )
  }

  // 戦略に紐づかない行動
  const orphanActions = actions.filter((a) => !a.strategyId)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-semibold text-slate-700">行動</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
          {actions.length}件
        </span>
      </div>

      {strategies.map((strategy) => {
        const stratMilestones = milestones.filter((m) => m.strategyId === strategy.id)
        const directActions = actions.filter(
          (a) => a.strategyId === strategy.id && !a.milestoneId,
        )

        return (
          <div key={strategy.id} className="space-y-3">
            {/* 戦略ヘッダー */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                🎯 {strategy.title || '（無題）'}
              </p>
              <button
                onClick={() => onAdd(strategy.id, null)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex-shrink-0"
              >
                ＋ 行動を追加
              </button>
            </div>

            {/* マイルストーン別グループ */}
            {stratMilestones.map((milestone) => {
              const msActions = actions.filter(
                (a) => a.strategyId === strategy.id && a.milestoneId === milestone.id,
              )
              return (
                <div key={milestone.id} className="pl-3 border-l-2 border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 truncate max-w-[160px]">
                      📍 {milestone.title || '（無題）'}
                    </p>
                    <button
                      onClick={() => onAdd(strategy.id, milestone.id)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors flex-shrink-0"
                    >
                      ＋ 追加
                    </button>
                  </div>
                  {msActions.length === 0 && (
                    <p className="text-xs text-slate-300 pl-1">まだ行動がありません</p>
                  )}
                  {msActions.map((action) => (
                    <ActionEditCard
                      key={action.id}
                      action={action}
                      onChange={(patch) => onUpdate(action.id, patch)}
                      onDelete={() => onDelete(action.id)}
                      onToggle={() => onToggle(action.id)}
                      promptContext={{ dream, strategy, milestone }}
                      allDreams={allDreams}
                      allLinks={allLinks}
                    />
                  ))}
                </div>
              )
            })}

            {/* 戦略直下の行動（マイルストーン未紐づけ） */}
            {directActions.length > 0 && (
              <div className="pl-3 border-l-2 border-slate-100 space-y-2">
                <p className="text-xs text-slate-500">戦略直下の行動</p>
                {directActions.map((action) => (
                  <ActionEditCard
                    key={action.id}
                    action={action}
                    onChange={(patch) => onUpdate(action.id, patch)}
                    onDelete={() => onDelete(action.id)}
                    onToggle={() => onToggle(action.id)}
                    promptContext={{ dream, strategy, milestone: null }}
                    allDreams={allDreams}
                    allLinks={allLinks}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* 戦略未紐づけ行動 */}
      {orphanActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">その他の行動</p>
          {orphanActions.map((action) => (
            <ActionEditCard
              key={action.id}
              action={action}
              onChange={(patch) => onUpdate(action.id, patch)}
              onDelete={() => onDelete(action.id)}
              onToggle={() => onToggle(action.id)}
              promptContext={{ dream, strategy: null, milestone: null }}
              allDreams={allDreams}
              allLinks={allLinks}
            />
          ))}
        </div>
      )}
    </div>
  )
}
