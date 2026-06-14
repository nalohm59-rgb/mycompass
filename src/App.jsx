import { useState } from 'react'
import { useMyCompassStore } from './hooks/useMyCompassStore'
import DreamListPanel from './components/DreamListPanel'
import DashboardView from './components/DashboardView'
import RoadmapView from './components/RoadmapView'
import EditView from './components/EditView'

const TABS = [
  { key: 'dashboard', label: '現状' },
  { key: 'roadmap', label: 'ロードマップ' },
  { key: 'edit', label: '編集' },
]

export default function App() {
  const store = useMyCompassStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  function selectDream(id) {
    store.selectDream(id)
    setActiveTab('dashboard')
  }

  const selectedDream = store.dreams.find((d) => d.id === store.selectedDreamId) ?? null

  const dreamLinks = selectedDream
    ? store.dreamStrategyLinks.filter((l) => l.dreamId === selectedDream.id)
    : []
  const linkedStrategyIds = new Set(dreamLinks.map((l) => l.strategyId))

  const dreamStrategies = store.strategies.filter((s) => linkedStrategyIds.has(s.id))
  const dreamMilestones = selectedDream
    ? store.milestones.filter(
        (m) => linkedStrategyIds.has(m.strategyId) || m.dreamId === selectedDream.id,
      )
    : []
  const dreamActions = selectedDream
    ? store.actions.filter(
        (a) =>
          linkedStrategyIds.has(a.strategyId) ||
          (a.dreamId === selectedDream.id && !a.strategyId),
      )
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🧭</span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">MyCompass</h1>
            <p className="text-xs text-slate-500">叶えたい未来を、今日の一手に変える</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72 flex-shrink-0">
            <DreamListPanel
              dreams={store.dreams}
              dreamStrategyLinks={store.dreamStrategyLinks}
              milestones={store.milestones}
              actions={store.actions}
              selectedDreamId={store.selectedDreamId}
              onSelect={selectDream}
              onAdd={store.addDream}
              onDelete={store.deleteDream}
            />
          </div>

          <div className="flex-1 min-w-0">
            {selectedDream ? (
              <div>
                <div className="flex gap-1 border-b border-slate-200 mb-4">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === tab.key
                          ? 'text-indigo-600 border-indigo-600'
                          : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'dashboard' && (
                  <DashboardView
                    dream={selectedDream}
                    strategies={dreamStrategies}
                    milestones={dreamMilestones}
                    actions={dreamActions}
                    links={dreamLinks}
                    allDreams={store.dreams}
                    allLinks={store.dreamStrategyLinks}
                    onToggleAction={store.toggleAction}
                  />
                )}
                {activeTab === 'roadmap' && (
                  <RoadmapView
                    dream={selectedDream}
                    strategies={dreamStrategies}
                    milestones={dreamMilestones}
                    actions={dreamActions}
                    allDreams={store.dreams}
                    allLinks={store.dreamStrategyLinks}
                    onToggleMilestone={store.toggleMilestone}
                    onToggleAction={store.toggleAction}
                    onDeleteAction={store.deleteAction}
                    onGoToEdit={() => setActiveTab('edit')}
                  />
                )}
                {activeTab === 'edit' && (
                  <EditView
                    dream={selectedDream}
                    strategies={dreamStrategies}
                    milestones={dreamMilestones}
                    actions={dreamActions}
                    links={dreamLinks}
                    allStrategies={store.strategies}
                    allDreams={store.dreams}
                    allLinks={store.dreamStrategyLinks}
                    onChange={(patch) => store.updateDream(selectedDream.id, patch)}
                    onAddStrategyAndLink={() => store.addStrategyAndLink(selectedDream.id)}
                    onAddLink={(strategyId) =>
                      store.addDreamStrategyLink(selectedDream.id, strategyId)
                    }
                    onUpdateLink={store.updateDreamStrategyLink}
                    onDeleteLink={store.deleteDreamStrategyLink}
                    onUpdateStrategy={store.updateStrategy}
                    onDeleteStrategy={store.deleteStrategy}
                    onAddMilestone={(strategyId) =>
                      store.addMilestone(selectedDream.id, strategyId)
                    }
                    onUpdateMilestone={store.updateMilestone}
                    onDeleteMilestone={store.deleteMilestone}
                    onToggleMilestone={store.toggleMilestone}
                    onAddAction={(strategyId, milestoneId) =>
                      store.addAction(selectedDream.id, strategyId, milestoneId, {})
                    }
                    onUpdateAction={store.updateAction}
                    onToggleAction={store.toggleAction}
                    onDeleteAction={store.deleteAction}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                左から夢を選んでください
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
