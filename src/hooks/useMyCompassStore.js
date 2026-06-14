import { useState, useEffect } from 'react'
import {
  createDream,
  createStrategy,
  createDreamStrategyLink,
  createMilestone,
  createAction,
} from '../utils/factory'
import {
  migrateDreams,
  migrateActions,
  migrateMilestones,
  migrateStrategiesAndLinks,
} from '../utils/migration'

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

function loadInitialState() {
  const savedDreams = load('mycompass:dreams', [])
  const rawDreams = savedDreams.length > 0 ? savedDreams : [createDream()]
  const dreams = migrateDreams(rawDreams)
  const selectedDreamId = dreams[0].id

  const rawStrategies = load('mycompass:strategies', [])
  const rawLinks = load('mycompass:dreamStrategyLinks', [])
  const { strategies, dreamStrategyLinks } = migrateStrategiesAndLinks(rawStrategies, rawLinks)

  return { dreams, selectedDreamId, strategies, dreamStrategyLinks }
}

const _init = loadInitialState()

export function useMyCompassStore() {
  const [dreams, setDreams] = useState(_init.dreams)
  const [strategies, setStrategies] = useState(_init.strategies)
  const [dreamStrategyLinks, setDreamStrategyLinks] = useState(_init.dreamStrategyLinks)
  const [milestones, setMilestones] = useState(() =>
    migrateMilestones(load('mycompass:milestones', [])),
  )
  const [actions, setActions] = useState(() => migrateActions(load('mycompass:actions', [])))
  const [selectedDreamId, setSelectedDreamId] = useState(_init.selectedDreamId)

  useEffect(() => {
    save('mycompass:dreams', dreams)
  }, [dreams])
  useEffect(() => {
    save('mycompass:strategies', strategies)
  }, [strategies])
  useEffect(() => {
    save('mycompass:dreamStrategyLinks', dreamStrategyLinks)
  }, [dreamStrategyLinks])
  useEffect(() => {
    save('mycompass:milestones', milestones)
  }, [milestones])
  useEffect(() => {
    save('mycompass:actions', actions)
  }, [actions])

  // Dream
  function selectDream(id) {
    setSelectedDreamId(id)
  }

  function addDream() {
    const dream = createDream()
    setDreams((prev) => [...prev, dream])
    setSelectedDreamId(dream.id)
  }

  function updateDream(id, patch) {
    setDreams((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
    )
  }

  function deleteDream(id) {
    const remaining = dreams.filter((d) => d.id !== id)
    if (remaining.length === 0) {
      const newDream = createDream()
      setDreams([newDream])
      setSelectedDreamId(newDream.id)
    } else {
      setDreams(remaining)
      if (selectedDreamId === id) setSelectedDreamId(remaining[0].id)
    }
    // Linkのみ削除。Strategy/Milestone/Actionは削除しない
    setDreamStrategyLinks((prev) => prev.filter((l) => l.dreamId !== id))
  }

  // Strategy
  function addStrategy() {
    const s = createStrategy()
    setStrategies((prev) => [...prev, s])
    return s.id
  }

  function addStrategyAndLink(dreamId) {
    const s = createStrategy()
    const link = createDreamStrategyLink(dreamId, s.id)
    setStrategies((prev) => [...prev, s])
    setDreamStrategyLinks((prev) => [...prev, link])
    return s.id
  }

  function updateStrategy(id, patch) {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)),
    )
  }

  function deleteStrategy(id) {
    const milestoneIds = milestones.filter((m) => m.strategyId === id).map((m) => m.id)
    setStrategies((prev) => prev.filter((s) => s.id !== id))
    setDreamStrategyLinks((prev) => prev.filter((l) => l.strategyId !== id))
    setMilestones((prev) => prev.filter((m) => m.strategyId !== id))
    setActions((prev) =>
      prev.filter((a) => a.strategyId !== id && !milestoneIds.includes(a.milestoneId)),
    )
  }

  // DreamStrategyLink
  function addDreamStrategyLink(dreamId, strategyId) {
    const exists = dreamStrategyLinks.some(
      (l) => l.dreamId === dreamId && l.strategyId === strategyId,
    )
    if (exists) return
    setDreamStrategyLinks((prev) => [...prev, createDreamStrategyLink(dreamId, strategyId)])
  }

  function updateDreamStrategyLink(id, patch) {
    setDreamStrategyLinks((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l,
      ),
    )
  }

  function deleteDreamStrategyLink(id) {
    // Linkのみ削除。Strategy/Milestone/Actionは削除しない
    setDreamStrategyLinks((prev) => prev.filter((l) => l.id !== id))
  }

  // Milestone
  function addMilestone(dreamId, strategyId) {
    setMilestones((prev) => [...prev, createMilestone(dreamId, strategyId)])
  }

  function updateMilestone(id, patch) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function deleteMilestone(id) {
    setMilestones((prev) => prev.filter((m) => m.id !== id))
    setActions((prev) => prev.filter((a) => a.milestoneId !== id))
  }

  function toggleMilestone(id) {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? new Date().toISOString() : null,
            }
          : m,
      ),
    )
  }

  // Action
  function addAction(dreamId, strategyId, milestoneId, fields = {}) {
    setActions((prev) => [
      ...prev,
      { ...createAction(dreamId, strategyId, milestoneId), ...fields },
    ])
  }

  function toggleAction(id) {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              completed: !a.completed,
              completedAt: !a.completed ? new Date().toISOString() : null,
            }
          : a,
      ),
    )
  }

  function updateAction(id, patch) {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function deleteAction(id) {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }

  return {
    dreams,
    strategies,
    dreamStrategyLinks,
    milestones,
    actions,
    selectedDreamId,
    selectDream,
    addDream,
    updateDream,
    deleteDream,
    addStrategy,
    addStrategyAndLink,
    updateStrategy,
    deleteStrategy,
    addDreamStrategyLink,
    updateDreamStrategyLink,
    deleteDreamStrategyLink,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestone,
    addAction,
    toggleAction,
    updateAction,
    deleteAction,
  }
}
