import { useState, useEffect } from 'react'
import DreamListPanel from './components/DreamListPanel'
import DashboardView from './components/DashboardView'
import RoadmapView from './components/RoadmapView'
import EditView from './components/EditView'

const TABS = [
  { key: 'dashboard', label: '現状' },
  { key: 'roadmap',   label: 'ロードマップ' },
  { key: 'edit',      label: '編集' },
]

function load(key, fallback) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function createDream() {
  return {
    id: crypto.randomUUID(),
    title: '新しい夢',
    why: '',
    desiredState: '',
    category: 'life',
    targetAmount: 0,
    currentAmount: 0,
    currentMonthlyProgress: 0,
    deadline: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function createStrategy(dreamId) {
  return {
    id: crypto.randomUUID(),
    dreamId,
    title: '',
    reason: '',
    expectedImpact: 0,
    impactUnit: 'monthly_yen',
    confidence: 3,
    deadline: '',
    status: 'idea',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function createMilestone(dreamId, strategyId) {
  return {
    id: crypto.randomUUID(),
    dreamId,
    strategyId,
    title: '',
    dueDate: '',
    doneDefinition: '',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }
}

function createAction(dreamId, strategyId, milestoneId) {
  return {
    id: crypto.randomUUID(),
    dreamId,
    strategyId: strategyId ?? null,
    milestoneId: milestoneId ?? null,
    text: '',
    evidence: '',
    estimatedMinutes: 30,
    dueDate: '',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }
}

function migrateActions(actions) {
  return actions.map(a => ({
    strategyId: null,
    milestoneId: null,
    evidence: '',
    estimatedMinutes: 30,
    dueDate: '',
    ...a,
  }))
}

function migrateDreams(dreams) {
  return dreams.map(d => ({
    currentMonthlyProgress: 0,
    ...d,
  }))
}

function loadInitialState() {
  const savedDreams = load('mycompass:dreams', [])
  if (savedDreams.length > 0) {
    const dreams = migrateDreams(savedDreams)
    return { dreams, selectedDreamId: dreams[0].id }
  }
  const initial = createDream()
  return { dreams: [initial], selectedDreamId: initial.id }
}

const _init = loadInitialState()

export default function App() {
  const [dreams, setDreams] = useState(_init.dreams)
  const [strategies, setStrategies] = useState(() => load('mycompass:strategies', []))
  const [milestones, setMilestones] = useState(() => load('mycompass:milestones', []))
  const [actions, setActions] = useState(() => migrateActions(load('mycompass:actions', [])))
  const [selectedDreamId, setSelectedDreamId] = useState(_init.selectedDreamId)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => { save('mycompass:dreams', dreams) }, [dreams])
  useEffect(() => { save('mycompass:strategies', strategies) }, [strategies])
  useEffect(() => { save('mycompass:milestones', milestones) }, [milestones])
  useEffect(() => { save('mycompass:actions', actions) }, [actions])

  function selectDream(id) {
    setSelectedDreamId(id)
    setActiveTab('dashboard')
  }

  // Dream
  function addDream() {
    const dream = createDream()
    setDreams(prev => [...prev, dream])
    selectDream(dream.id)
  }

  function updateDream(id, patch) {
    setDreams(prev =>
      prev.map(d => d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)
    )
  }

  function deleteDream(id) {
    const remaining = dreams.filter(d => d.id !== id)
    if (remaining.length === 0) {
      const newDream = createDream()
      setDreams([newDream])
      setSelectedDreamId(newDream.id)
    } else {
      setDreams(remaining)
      if (selectedDreamId === id) selectDream(remaining[0].id)
    }
    setStrategies(prev => prev.filter(s => s.dreamId !== id))
    setMilestones(prev => prev.filter(m => m.dreamId !== id))
    setActions(prev => prev.filter(a => a.dreamId !== id))
  }

  // Strategy
  function addStrategy(dreamId) {
    const strategy = createStrategy(dreamId)
    setStrategies(prev => [...prev, strategy])
  }

  function updateStrategy(id, patch) {
    setStrategies(prev =>
      prev.map(s => s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)
    )
  }

  function deleteStrategy(id) {
    const milestoneIds = milestones.filter(m => m.strategyId === id).map(m => m.id)
    setStrategies(prev => prev.filter(s => s.id !== id))
    setMilestones(prev => prev.filter(m => m.strategyId !== id))
    setActions(prev => prev.filter(a => a.strategyId !== id && !milestoneIds.includes(a.milestoneId)))
  }

  // Milestone
  function addMilestone(dreamId, strategyId) {
    setMilestones(prev => [...prev, createMilestone(dreamId, strategyId)])
  }

  function updateMilestone(id, patch) {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  }

  function deleteMilestone(id) {
    setMilestones(prev => prev.filter(m => m.id !== id))
    setActions(prev => prev.filter(a => a.milestoneId !== id))
  }

  function toggleMilestone(id) {
    setMilestones(prev => prev.map(m =>
      m.id === id
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : null }
        : m
    ))
  }

  // Action
  function addAction(dreamId, strategyId, milestoneId, fields = {}) {
    setActions(prev => [...prev, { ...createAction(dreamId, strategyId, milestoneId), ...fields }])
  }

  function toggleAction(id) {
    setActions(prev => prev.map(a =>
      a.id === id
        ? { ...a, completed: !a.completed, completedAt: !a.completed ? new Date().toISOString() : null }
        : a
    ))
  }

  function deleteAction(id) {
    setActions(prev => prev.filter(a => a.id !== id))
  }

  const selectedDream = dreams.find(d => d.id === selectedDreamId) ?? null
  const dreamStrategies = selectedDream ? strategies.filter(s => s.dreamId === selectedDream.id) : []
  const dreamMilestones = selectedDream ? milestones.filter(m => m.dreamId === selectedDream.id) : []
  const dreamActions = selectedDream ? actions.filter(a => a.dreamId === selectedDream.id) : []

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
          {/* 左：Dream一覧 */}
          <div className="lg:w-72 flex-shrink-0">
            <DreamListPanel
              dreams={dreams}
              strategies={strategies}
              milestones={milestones}
              actions={actions}
              selectedDreamId={selectedDreamId}
              onSelect={selectDream}
              onAdd={addDream}
              onDelete={deleteDream}
            />
          </div>

          {/* 右：タブ + コンテンツ */}
          <div className="flex-1 min-w-0">
            {selectedDream ? (
              <div>
                {/* タブナビゲーション */}
                <div className="flex gap-1 border-b border-slate-200 mb-4">
                  {TABS.map(tab => (
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

                {/* タブコンテンツ */}
                {activeTab === 'dashboard' && (
                  <DashboardView
                    dream={selectedDream}
                    strategies={dreamStrategies}
                    milestones={dreamMilestones}
                    actions={dreamActions}
                    onToggleAction={toggleAction}
                    onDeleteAction={deleteAction}
                  />
                )}
                {activeTab === 'roadmap' && (
                  <RoadmapView
                    dream={selectedDream}
                    strategies={dreamStrategies}
                    milestones={dreamMilestones}
                    actions={dreamActions}
                    onAddStrategy={() => addStrategy(selectedDream.id)}
                    onUpdateStrategy={updateStrategy}
                    onDeleteStrategy={deleteStrategy}
                    onAddMilestone={strategyId => addMilestone(selectedDream.id, strategyId)}
                    onUpdateMilestone={updateMilestone}
                    onDeleteMilestone={deleteMilestone}
                    onToggleMilestone={toggleMilestone}
                    onAddAction={(strategyId, milestoneId, fields) =>
                      addAction(selectedDream.id, strategyId, milestoneId, fields)
                    }
                    onToggleAction={toggleAction}
                    onDeleteAction={deleteAction}
                  />
                )}
                {activeTab === 'edit' && (
                  <EditView
                    dream={selectedDream}
                    strategies={dreamStrategies}
                    milestones={dreamMilestones}
                    actions={dreamActions}
                    onChange={patch => updateDream(selectedDream.id, patch)}
                    onAddStrategy={() => addStrategy(selectedDream.id)}
                    onUpdateStrategy={updateStrategy}
                    onDeleteStrategy={deleteStrategy}
                    onAddMilestone={strategyId => addMilestone(selectedDream.id, strategyId)}
                    onUpdateMilestone={updateMilestone}
                    onDeleteMilestone={deleteMilestone}
                    onToggleMilestone={toggleMilestone}
                    onAddAction={(strategyId, milestoneId, fields) =>
                      addAction(selectedDream.id, strategyId, milestoneId, fields)
                    }
                    onToggleAction={toggleAction}
                    onDeleteAction={deleteAction}
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
