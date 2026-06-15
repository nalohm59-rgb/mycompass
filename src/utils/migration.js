export function migrateDreams(dreams) {
  return dreams.map((d) => ({
    currentMonthlyProgress: 0,
    ...d,
  }))
}

export function migrateMilestones(milestones) {
  return milestones.map((m) => ({
    deadlineEvidence: '',
    consequenceIfDelayed: '',
    whatProgressesWhenCompleted: '',
    ...m,
  }))
}

export function migrateActions(actions) {
  return actions.map((a) => ({
    strategyId: null,
    milestoneId: null,
    evidence: '',
    deadlineEvidence: '',
    consequenceIfDelayed: '',
    estimatedMinutes: 30,
    dueDate: '',
    delayImpactDays: 30,
    blocksStrategyStart: false,
    contentDetail: '',
    ...a,
  }))
}

export function migrateStrategiesAndLinks(oldStrategies, oldLinks = []) {
  const migratedStrategies = []
  // 既存Linkに新フィールドのデフォルト値を補完
  const generatedLinks = oldLinks.map((l) => ({
    expectedStartDate: '',
    impactRampUpMonths: 0,
    linkedTargetAmount: 0,
    ...l,
  }))

  const LINK_DEFAULTS = {
    expectedStartDate: '',
    impactRampUpMonths: 0,
    linkedTargetAmount: 0,
  }

  oldStrategies.forEach((strategy) => {
    const { dreamId, reason, expectedImpact, impactUnit, deadline, ...rest } = strategy

    migratedStrategies.push({
      id: strategy.id,
      title: strategy.title ?? '',
      description: strategy.description ?? reason ?? '',
      category: strategy.category ?? 'income',
      status: strategy.status ?? 'idea',
      confidence: strategy.confidence ?? 3,
      createdAt: strategy.createdAt ?? new Date().toISOString(),
      updatedAt: strategy.updatedAt ?? new Date().toISOString(),
    })

    if (dreamId) {
      const exists = generatedLinks.some(
        (link) => link.dreamId === dreamId && link.strategyId === strategy.id,
      )
      if (!exists) {
        generatedLinks.push({
          ...LINK_DEFAULTS,
          id: crypto.randomUUID(),
          dreamId,
          strategyId: strategy.id,
          contributionTargetAmount: 0,
          contributionCurrentAmount: 0,
          expectedMonthlyImpact: Number(expectedImpact || 0),
          impactUnit: impactUnit ?? 'monthly_yen',
          deadline: deadline ?? '',
          reasonForDream: reason ?? '',
          successDefinition: '',
          riskIfDelayed: '',
          relevance: 5,
          priority: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
  })

  return { strategies: migratedStrategies, dreamStrategyLinks: generatedLinks }
}
