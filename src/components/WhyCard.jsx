import { useState } from 'react'

export default function WhyCard({ dream, onChange, autoEdit = false }) {
  const [editing, setEditing] = useState(autoEdit)
  const [draftWhy, setDraftWhy] = useState('')
  const [draftDesiredState, setDraftDesiredState] = useState('')

  function startEdit() {
    setDraftWhy(dream.why)
    setDraftDesiredState(dream.desiredState)
    setEditing(true)
  }

  function save() {
    onChange({ why: draftWhy, desiredState: draftDesiredState })
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💭</span>
          <h3 className="text-sm font-semibold text-slate-700">なぜ欲しいのか</h3>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="text-xs text-slate-400 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
          >
            編集
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">なぜ欲しいのか</label>
            <textarea
              value={draftWhy}
              onChange={e => setDraftWhy(e.target.value)}
              placeholder="この夢が欲しい理由を書いてください..."
              rows={3}
              autoFocus
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">叶った状態</label>
            <textarea
              value={draftDesiredState}
              onChange={e => setDraftDesiredState(e.target.value)}
              placeholder="夢が叶った時の状態を具体的に描いてください..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-colors"
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
              onClick={save}
              className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              完了
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">なぜ欲しいのか</p>
            {dream.why ? (
              <p className="text-sm text-slate-800 leading-relaxed">{dream.why}</p>
            ) : (
              <button
                onClick={startEdit}
                className="text-sm text-slate-300 hover:text-indigo-400 transition-colors text-left"
              >
                クリックして入力...
              </button>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">叶った状態</p>
            {dream.desiredState ? (
              <p className="text-sm text-slate-800 leading-relaxed">{dream.desiredState}</p>
            ) : (
              <button
                onClick={startEdit}
                className="text-sm text-slate-300 hover:text-indigo-400 transition-colors text-left"
              >
                クリックして入力...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
