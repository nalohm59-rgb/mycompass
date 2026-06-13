import { useState } from 'react'
import MilestoneTimeline from './MilestoneTimeline'
import MilestoneProgressBar from './MilestoneProgressBar'
import ActionList from './ActionList'
import { getProgressPercent } from '../utils/progress'

const STATUS_OPTIONS = [
  { value: 'idea',      label: 'アイデア' },
  { value: 'active',    label: '実行中' },
  { value: 'paused',    label: '一時停止' },
  { value: 'done',      label: '完了' },
  { value: 'abandoned', label: '断念' },
]

const STATUS_BADGE = {
  idea:      'bg-slate-100 text-slate-600',
  active:    'bg-blue-100 text-blue-700',
  paused:    'bg-yellow-100 text-yellow-700',
  done:      'bg-emerald-100 text-emerald-700',
  abandoned: 'bg-red-100 text-red-500',
}

const IMPACT_UNIT_LABELS = {
  monthly_yen:  '万円/月',
  one_time_yen: '万円（一時）',
  habit:        '習慣',
  knowledge:    '知識・スキル',
}

const BORDER = {
  active:    'border-blue-200',
  done:      'border-emerald-200',
  abandoned: 'border-slate-100 opacity-60',
  idea:      'border-slate-200',
  paused:    'border-yellow-200',
}

export default function StrategyCard({
  strategy, milestones, actions,
  onChange, onDelete,
  onAddMilestone, onUpdateMilestone, onDeleteMilestone, onToggleMilestone,
  onAddAction, onToggleAction, onDeleteAction,
  readOnly = false,
}) {
  const [expanded, setExpanded] = useState(!strategy.title && !readOnly)
  const [editing, setEditing] = useState(!strategy.title && !readOnly)
  const [draft, setDraft] = useState({})

  const directActions = actions.filter(a => !a.milestoneId)
  const completedMilestonesCount = milestones.filter(m => m.completed).length
  const completedActionsCount = actions.filter(a => a.completed).length
  const milestoneProgress = getProgressPercent(completedMilestonesCount, milestones.length)
  const actionProgress = getProgressPercent(completedActionsCount, actions.length)

  function startEdit() {
    setDraft({
      title: strategy.title,
      status: strategy.status,
      confidence: strategy.confidence,
      reason: strategy.reason,
      expectedImpact: strategy.expectedImpact,
      impactUnit: strategy.impactUnit,
      deadline: strategy.deadline,
    })
    setExpanded(true)
    setEditing(true)
  }

  function saveEdit() {
    onChange({
      title: draft.title,
      status: draft.status,
      confidence: Number(draft.confidence),
      reason: draft.reason,
      expectedImpact: parseInt(draft.expectedImpact) || 0,
      impactUnit: draft.impactUnit,
      deadline: draft.deadline,
    })
    setEditing(false)
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${BORDER[strategy.status] ?? 'border-slate-200'}`}>
      {/* ヘッダー（常時表示） */}
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 16 16"
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          {/* タイトル + バッジ */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${strategy.title ? 'text-slate-800' : 'text-slate-400'}`}>
              {strategy.title || '（無題）'}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[strategy.status]}`}>
              {STATUS_OPTIONS.find(o => o.value === strategy.status)?.label}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {'●'.repeat(strategy.confidence)}{'○'.repeat(5 - strategy.confidence)}
            </span>
          </div>

          {/* コンパクトKPI */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
            {strategy.expectedImpact > 0 && (
              <span>効果: {Number(strategy.expectedImpact).toLocaleString()}{IMPACT_UNIT_LABELS[strategy.impactUnit]}</span>
            )}
            {strategy.deadline && (
              <span>期限: {new Date(strategy.deadline).toLocaleDateString('ja-JP')}</span>
            )}
            {milestones.length > 0 && (
              <span>計画 {completedMilestonesCount}/{milestones.length}</span>
            )}
            {actions.length > 0 && (
              <span>行動 {completedActionsCount}/{actions.length}</span>
            )}
          </div>

          {/* 進捗ミニバー */}
          {(milestones.length > 0 || actions.length > 0) && !expanded && (
            <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-1 bg-indigo-400 rounded-full"
                style={{ width: `${milestones.length > 0 ? milestoneProgress : actionProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!readOnly && (
            <button
              onClick={startEdit}
              className="text-xs text-slate-400 hover:text-indigo-600 transition-colors px-1.5 py-1 rounded hover:bg-indigo-50"
            >
              編集
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none"
            aria-label="削除"
          >
            ×
          </button>
        </div>
      </div>

      {/* 展開コンテンツ（閲覧モード） */}
      {expanded && !editing && (
        <div className="px-4 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {strategy.reason && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">なぜ必要か</p>
              <p className="text-sm text-slate-700 leading-relaxed">{strategy.reason}</p>
            </div>
          )}

          <MilestoneProgressBar milestones={milestones} />

          <MilestoneTimeline
            milestones={milestones}
            actions={actions}
            onAdd={onAddMilestone}
            onUpdate={onUpdateMilestone}
            onDelete={onDeleteMilestone}
            onToggle={onToggleMilestone}
            onAddAction={(milestoneId, fields) => onAddAction(milestoneId, fields)}
            onToggleAction={onToggleAction}
            onDeleteAction={onDeleteAction}
            readOnly={readOnly}
          />

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500 mb-2">戦略直下の行動</p>
            <ActionList
              actions={directActions}
              onAdd={fields => onAddAction(null, fields)}
              onToggle={onToggleAction}
              onDelete={onDeleteAction}
            />
          </div>
        </div>
      )}

      {/* 編集フォーム */}
      {editing && (
        <div className="px-4 pb-5 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">戦略タイトル</label>
            <input
              type="text"
              value={draft.title}
              onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
              autoFocus
              placeholder="戦略タイトルを入力..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ステータス</label>
              <select
                value={draft.status}
                onChange={e => setDraft(p => ({ ...p, status: e.target.value }))}
                className={inputClass}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">確信度</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setDraft(p => ({ ...p, confidence: n }))}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      draft.confidence >= n
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">なぜ必要か</label>
            <textarea
              value={draft.reason}
              onChange={e => setDraft(p => ({ ...p, reason: e.target.value }))}
              placeholder="この戦略が必要な理由..."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">期待効果</label>
              <input
                type="number"
                value={draft.expectedImpact}
                onChange={e => setDraft(p => ({ ...p, expectedImpact: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">単位</label>
              <select
                value={draft.impactUnit}
                onChange={e => setDraft(p => ({ ...p, impactUnit: e.target.value }))}
                className={inputClass}
              >
                {Object.entries(IMPACT_UNIT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">期限</label>
            <input
              type="date"
              value={draft.deadline}
              onChange={e => setDraft(p => ({ ...p, deadline: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={saveEdit}
              className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              保存
            </button>
          </div>

          {/* 閲覧モードに戻っても展開は維持 */}
          <div className="border-t border-slate-100 pt-3">
            <MilestoneProgressBar milestones={milestones} />
          </div>

          <MilestoneTimeline
            milestones={milestones}
            actions={actions}
            onAdd={onAddMilestone}
            onUpdate={onUpdateMilestone}
            onDelete={onDeleteMilestone}
            onToggle={onToggleMilestone}
            onAddAction={(milestoneId, fields) => onAddAction(milestoneId, fields)}
            onToggleAction={onToggleAction}
            onDeleteAction={onDeleteAction}
          />

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500 mb-2">戦略直下の行動</p>
            <ActionList
              actions={directActions}
              onAdd={fields => onAddAction(null, fields)}
              onToggle={onToggleAction}
              onDelete={onDeleteAction}
            />
          </div>
        </div>
      )}
    </div>
  )
}
