export function createDream() {
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

export function createStrategy() {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    category: 'income',
    status: 'idea',
    confidence: 3,
    createdAt: now,
    updatedAt: now,
  }
}

export function createDreamStrategyLink(dreamId, strategyId) {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    dreamId,
    strategyId,
    contributionTargetAmount: 0,
    contributionCurrentAmount: 0,
    expectedMonthlyImpact: 0,
    impactUnit: 'monthly_yen',
    deadline: '',
    reasonForDream: '',
    successDefinition: '',
    riskIfDelayed: '',
    relevance: 3,
    priority: 3,
    createdAt: now,
    updatedAt: now,
  }
}

export function createMilestone(dreamId, strategyId) {
  return {
    id: crypto.randomUUID(),
    dreamId,
    strategyId,
    title: '',
    dueDate: '',
    doneDefinition: '',
    deadlineEvidence: '',
    consequenceIfDelayed: '',
    whatProgressesWhenCompleted: '',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }
}

export function createAction(dreamId, strategyId, milestoneId) {
  return {
    id: crypto.randomUUID(),
    dreamId,
    strategyId: strategyId ?? null,
    milestoneId: milestoneId ?? null,
    text: '',
    evidence: '',
    deadlineEvidence: '',
    consequenceIfDelayed: '',
    estimatedMinutes: 30,
    dueDate: '',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }
}
