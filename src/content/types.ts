export const LANGUAGES = ['js', 'python'] as const
export type Language = (typeof LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<Language, string> = {
  js: 'JavaScript',
  python: 'Python',
}

/** What kind of challenge this is. Only "code" exists for now; see the roadmap in CLAUDE.md. */
export const KINDS = ['code'] as const
export type ChallengeKind = (typeof KINDS)[number]

export const EVIDENCE_TYPES = ['log', 'stack-trace', 'note'] as const

/** Extra material attached to a ticket, e.g. a log excerpt or a stack trace. */
export interface Evidence {
  type: (typeof EVIDENCE_TYPES)[number]
  title: string
  content: string
}

export const CHARACTERS = ['priya', 'maya', 'leo'] as const
export type Character = (typeof CHARACTERS)[number]

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const SKILLS = [
  'data-types',
  'loops',
  'conditions',
  'async',
  'dates',
  'mutation',
  'math',
  'control-flow',
] as const
export type Skill = (typeof SKILLS)[number]

/**
 * A rule-based code-review rule (the MVP mentor is not AI). The rule "fires" when
 * the player's fixed code matches `pattern` (or does NOT match, if `matches` is false).
 */
export interface ReviewRule {
  id: string
  kind: 'root-cause' | 'symptom' | 'bonus' | 'tip'
  /** Regular expression source, tested against the player's code. */
  pattern: string
  matches: boolean
  feedback: string
}

export interface LanguageVersion {
  /** The file name shown on the editor tab, e.g. "leaderboard.js". */
  fileName: string
  /** Paths relative to the challenge folder. */
  buggy: string
  solution: string
  tests: string
  /** Exactly 4, following the hint ladder: read the test, inspect data, concept, full. */
  hints: string[]
  reviewRules: ReviewRule[]
}

export interface Challenge {
  /** Folder name, e.g. "001-leaderboard". */
  id: string
  /** Ticket number, used in flags: BUGHUNT{snackr-001-js-xxxxxx}. */
  number: number
  /** Defaults to "code" when missing. */
  kind?: ChallengeKind
  title: string
  character: Character
  difficulty: Difficulty
  skill: Skill
  /** Set for language-specific bugs; null for universal logic bugs. */
  languageSpecific: Language | null
  ticket: { subject: string; body: string }
  /** Optional logs, stack traces or notes that come with the ticket. */
  evidence?: Evidence[]
  briefing: string
  lesson: string
  howToPrevent: string
  whereItShowsUpAtWork: string
  bonusTests: string
  languages: Partial<Record<Language, LanguageVersion>>
}
