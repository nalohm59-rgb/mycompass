import { formatMoneyProjectionForPrompt } from './moneyProjection'

function formatJpDate(dateStr) {
  if (!dateStr) return '未設定'
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getRemainingText(dateStr) {
  if (!dateStr) return '未設定'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `期限切れ（${Math.abs(diffDays)}日超過）`
  if (diffDays === 0) return '今日が期限'
  const months = Math.floor(diffDays / 30)
  if (months >= 2) return `約${months}ヶ月（${diffDays}日）`
  return `${diffDays}日`
}

export function buildMilestoneEvidencePrompt({ dream, strategy, milestone, link, moneyProjection }) {
  const today = new Date()
  const currentDateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // link があれば link 側のデータ、なければ strategy 側にフォールバック
  const strategyReason = link?.reasonForDream ?? strategy?.reason ?? '（未入力）'
  const strategyDeadline = link?.deadline ?? strategy?.deadline

  const moneySection = moneyProjection
    ? formatMoneyProjectionForPrompt(moneyProjection, dream?.title)
    : null

  return [
    'あなたは、ユーザーのDream達成を支援する戦略コーチです。',
    '以下のDream、Strategy、Milestone情報をもとに、MilestoneのAIコメントを作成してください。',
    '',
    '目的は、ユーザーがそのMilestoneに対して',
    '「今やらないとまずい」',
    '「でも完了すればDreamに近づく」',
    'と感じ、行動したくなることです。',
    '',
    '一般論ではなく、期限・数字・因果関係・生活への影響を具体化してください。',
    ...(moneySection
      ? ['金額目標がある場合は、具体的な金額の増減・達成月の変化・遅延損失額を必ず含めてください。']
      : []),
    '',
    '# 入力情報',
    '',
    `現在日:\n${currentDateStr}`,
    '',
    `Dream:\n${dream?.title ?? '（未設定）'}`,
    '',
    `Dreamの理由:\n${dream?.why ?? '（未入力）'}`,
    '',
    `叶った状態:\n${dream?.desiredState ?? '（未入力）'}`,
    '',
    `Dreamの期限:\n${formatJpDate(dream?.deadline)}`,
    '',
    `Dream期限までの残り期間:\n${getRemainingText(dream?.deadline)}`,
    '',
    `Strategy:\n${strategy?.title ?? '（未設定）'}`,
    '',
    `Strategyのこの夢への貢献理由:\n${strategyReason}`,
    '',
    `Strategyの期限:\n${formatJpDate(strategyDeadline)}`,
    '',
    `Strategy期限までの残り期間:\n${getRemainingText(strategyDeadline)}`,
    '',
    `Milestone:\n${milestone?.title ?? '（未設定）'}`,
    '',
    `Milestoneの完了条件:\n${milestone?.doneDefinition ?? '（未入力）'}`,
    '',
    `Milestoneの期限:\n${formatJpDate(milestone?.dueDate)}`,
    '',
    `Milestone期限までの残り期間:\n${getRemainingText(milestone?.dueDate)}`,
    ...(moneySection ? ['', moneySection] : []),
    '',
    '# 出力項目',
    '',
    '## なぜこの日まで？',
    '以下を必ず含めてください。',
    '- Dream期限から逆算して、このMilestoneがなぜ今必要なのか',
    '- このMilestoneが次の行動にどう接続するのか',
    '- 期限までに終わることで、どんな選択肢・余裕・安心が生まれるのか',
    '- 数字や期間が使える場合は必ず使う（例：残りX日、月YY万円が必要、など）',
    ...(moneySection
      ? ['- 金額目標があるDreamでは、期日時点の見込み金額・余裕額・達成月を具体的に書く']
      : []),
    '- 抽象的な表現だけで終わらせない',
    '',
    '## 遅れると何が起きる？',
    '以下を必ず因果連鎖で書いてください（→ を使って連鎖を明示する）。',
    '- まず何が止まるのか',
    '- 次にどの行動・検証・収益化・準備が遅れるのか',
    '- その結果、Dream達成に必要な条件がどう厳しくなるのか（必要月額・期間・競争条件など）',
    ...(moneySection
      ? ['- 金額目標があるDreamでは、遅延による損失金額と達成月の後ろ倒しを明記する']
      : []),
    '- 最終的に、ユーザーが何を妥協する可能性があるのか（立地・条件・期限など）',
    '',
    '## 完了すると何が進む？',
    '以下を必ず含めてください。',
    '- このMilestoneが完了すると、次に何を実行できるようになるのか',
    '- Dream達成に向けて、どの不確実性が減るのか',
    '- ユーザーの行動管理がどう前に進むのか',
    '- 「この作業はDreamに直結している」と感じられる表現にする',
    '',
    '# 文体',
    '- 甘い励ましではなく、現実的で具体的に',
    '- ただし、不安を煽るだけではなく「だから今やる価値がある」と感じられる書き方にする',
    '- ユーザー本人が読んで、自分ごと化できる表現にする',
    '- 1項目あたり200〜400字程度',
    '- 日本語で出力する',
    '',
    '# 出力形式',
    '必ず以下のJSON形式のみで返してください。説明文・Markdownコードブロックは不要です。',
    '',
    '{',
    '  "whyByThisDate": "string",',
    '  "whatHappensIfDelayed": "string",',
    '  "whatProgressesWhenCompleted": "string"',
    '}',
  ].join('\n')
}

export function buildActionEvidencePrompt({ dream, strategy, milestone, action, link, moneyProjection }) {
  const today = new Date()
  const currentDateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const strategyReason = link?.reasonForDream ?? strategy?.reason ?? '（未入力）'
  const strategyDeadline = link?.deadline ?? strategy?.deadline

  const moneySection = moneyProjection
    ? formatMoneyProjectionForPrompt(moneyProjection, dream?.title)
    : null

  const delayMonths = action?.delayImpactDays
    ? Math.max(1, Math.ceil(action.delayImpactDays / 30))
    : 1

  return [
    'あなたは、ユーザーのDream達成を支援する戦略コーチです。',
    '以下の情報をもとに、Actionの「なぜ必要か」「なぜこの期限までに必要か」「遅れると何が起きるか」を作成してください。',
    '',
    ...(moneySection
      ? [
          '金額目標があるDreamです。必ず具体的な金額・期限を使ってください。',
          `このActionが${delayMonths}ヶ月遅れた場合の金額インパクトを「遅れると何が起きるか」に含めてください。`,
          '',
        ]
      : []),
    '# 入力情報',
    '',
    `現在日:\n${currentDateStr}`,
    '',
    `Dream:\n${dream?.title ?? '（未設定）'}`,
    '',
    `Dreamの理由:\n${dream?.why ?? '（未入力）'}`,
    '',
    `叶った状態:\n${dream?.desiredState ?? '（未入力）'}`,
    '',
    `Dreamの期限:\n${formatJpDate(dream?.deadline)}（残り${getRemainingText(dream?.deadline)}）`,
    '',
    `Strategy:\n${strategy?.title ?? '（未設定）'}`,
    '',
    `Strategyのこの夢への貢献理由:\n${strategyReason}`,
    '',
    `Strategyの期限:\n${formatJpDate(strategyDeadline)}（残り${getRemainingText(strategyDeadline)}）`,
    '',
    `Milestone:\n${milestone?.title ?? '（未設定）'}`,
    '',
    `Milestoneの完了条件:\n${milestone?.doneDefinition ?? '（未入力）'}`,
    '',
    `Milestoneの期限:\n${formatJpDate(milestone?.dueDate)}（残り${getRemainingText(milestone?.dueDate)}）`,
    '',
    `Action:\n${action?.text ?? ''}`,
    ...(action?.contentDetail ? [`\n内容詳細:\n${action.contentDetail}`] : []),
    '',
    `Actionの期限:\n${formatJpDate(action?.dueDate)}（残り${getRemainingText(action?.dueDate)}）`,
    '',
    ...(action?.blocksStrategyStart
      ? ['このActionはStrategyの開始をブロックします（完了しないと戦略が動き出しません）。\n']
      : []),
    ...(moneySection ? [moneySection, ''] : []),
    '# 文体・要件',
    '- 一般論ではなく、入力されたDream/Strategy/Milestone/Actionに即して書く',
    '- 数字が使える場合は必ず使う',
    ...(moneySection
      ? [
          '- 金額目標があるDreamでは「遅れると何が起きるか」に損失金額・達成月の後ろ倒しを必ず入れる',
          '- 「このActionの遅れは単なる作業遅れではなく、未来の資金余裕をXX円削る遅れ」という表現を使う',
        ]
      : []),
    '- 1項目あたり100〜200字程度',
    '- 日本語で出力する',
    '',
    '# 出力形式',
    '必ず以下のJSON形式のみで返してください。説明文・Markdownコードブロックは不要です。',
    '',
    '{',
    '  "whyNeeded": "string",',
    '  "whyByThisDate": "string",',
    '  "whatHappensIfDelayed": "string"',
    '}',
  ].join('\n')
}

function normalizeQuotes(raw) {
  return raw
    .replace(/[“”„‟″‶]/g, '"')
    .replace(/[‘’‚‛′‵]/g, "'")
}

// Milestone AI JSON（whyByThisDate / whatHappensIfDelayed / whatProgressesWhenCompleted）をパース
export function parseMilestoneAiJson(raw) {
  try {
    const match = normalizeQuotes(raw).match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    if (
      typeof parsed.whyByThisDate === 'string' &&
      typeof parsed.whatHappensIfDelayed === 'string' &&
      typeof parsed.whatProgressesWhenCompleted === 'string'
    ) {
      return {
        whyByThisDate: parsed.whyByThisDate,
        whatHappensIfDelayed: parsed.whatHappensIfDelayed,
        whatProgressesWhenCompleted: parsed.whatProgressesWhenCompleted,
      }
    }
    return null
  } catch {
    return null
  }
}

// Action AI JSON（whyNeeded / whyByThisDate / whatHappensIfDelayed）をパース
export function parseActionAiJson(raw) {
  try {
    const match = normalizeQuotes(raw).match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    if (
      typeof parsed.whyNeeded === 'string' &&
      typeof parsed.whyByThisDate === 'string' &&
      typeof parsed.whatHappensIfDelayed === 'string'
    ) {
      return {
        whyNeeded: parsed.whyNeeded,
        whyByThisDate: parsed.whyByThisDate,
        whatHappensIfDelayed: parsed.whatHappensIfDelayed,
      }
    }
    return null
  } catch {
    return null
  }
}
