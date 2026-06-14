export default function WhyCard({ dream }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💭</span>
        <h3 className="text-sm font-semibold text-slate-700">なぜ欲しいのか</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">なぜ欲しいのか</p>
          {dream.why ? (
            <p className="text-sm text-slate-800 leading-relaxed">{dream.why}</p>
          ) : (
            <p className="text-sm text-slate-300">未入力</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">叶った状態</p>
          {dream.desiredState ? (
            <p className="text-sm text-slate-800 leading-relaxed">{dream.desiredState}</p>
          ) : (
            <p className="text-sm text-slate-300">未入力</p>
          )}
        </div>
      </div>
    </div>
  )
}
