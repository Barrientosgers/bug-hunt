import {
  CHARACTERS,
  DIFFICULTIES,
  EVIDENCE_TYPES,
  KINDS,
  LANGUAGES,
  SKILLS,
  type Challenge,
} from './types.ts'

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

function validateLanguage(language: string, value: unknown, errors: string[]): void {
  const where = `languages.${language}`
  if (!isObject(value)) {
    errors.push(`${where} must be an object`)
    return
  }
  if (!isNonEmptyString(value.fileName)) errors.push(`${where}.fileName is required`)
  for (const key of ['buggy', 'solution', 'tests'] as const) {
    if (!isNonEmptyString(value[key])) errors.push(`${where}.${key} must be a file path`)
  }
  const minimal = value.minimalChange
  if (
    !isObject(minimal) ||
    !Number.isInteger(minimal.maxLines) ||
    (minimal.maxLines as number) < 1
  ) {
    errors.push(`${where}.minimalChange.maxLines must be a positive integer`)
  }
  const hints = value.hints
  if (!Array.isArray(hints) || hints.length !== 4 || !hints.every(isNonEmptyString)) {
    errors.push(`${where}.hints must be exactly 4 non-empty strings`)
  }
  if (!Array.isArray(value.reviewRules)) {
    errors.push(`${where}.reviewRules must be an array`)
    return
  }
  value.reviewRules.forEach((rule: unknown, index: number) => {
    const ruleWhere = `${where}.reviewRules[${index}]`
    if (!isObject(rule)) {
      errors.push(`${ruleWhere} must be an object`)
      return
    }
    if (!isNonEmptyString(rule.id)) errors.push(`${ruleWhere}.id is required`)
    if (!['root-cause', 'symptom', 'bonus', 'tip'].includes(String(rule.kind))) {
      errors.push(`${ruleWhere}.kind is invalid`)
    }
    if (typeof rule.matches !== 'boolean')
      errors.push(`${ruleWhere}.matches must be boolean`)
    if (!isNonEmptyString(rule.feedback)) errors.push(`${ruleWhere}.feedback is required`)
    try {
      new RegExp(String(rule.pattern))
    } catch {
      errors.push(`${ruleWhere}.pattern is not a valid regular expression`)
    }
  })
}

/** Returns a list of problems. An empty list means the challenge is well-formed. */
export function validateChallenge(input: unknown): string[] {
  const errors: string[] = []
  if (!isObject(input)) return ['challenge must be an object']

  for (const key of ['id', 'title', 'briefing', 'lesson', 'howToPrevent'] as const) {
    if (!isNonEmptyString(input[key])) errors.push(`${key} is required`)
  }
  for (const key of ['whereItShowsUpAtWork', 'bonusTests'] as const) {
    if (!isNonEmptyString(input[key])) errors.push(`${key} is required`)
  }
  if (!Number.isInteger(input.number) || (input.number as number) < 1) {
    errors.push('number must be a positive integer')
  }
  if (!(CHARACTERS as readonly unknown[]).includes(input.character)) {
    errors.push(`character must be one of: ${CHARACTERS.join(', ')}`)
  }
  if (!(DIFFICULTIES as readonly unknown[]).includes(input.difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`)
  }
  if (!(SKILLS as readonly unknown[]).includes(input.skill)) {
    errors.push(`skill must be one of: ${SKILLS.join(', ')}`)
  }
  if (input.kind !== undefined && !(KINDS as readonly unknown[]).includes(input.kind)) {
    errors.push(`kind must be one of: ${KINDS.join(', ')}`)
  }
  if (input.evidence !== undefined) {
    if (!Array.isArray(input.evidence)) {
      errors.push('evidence must be an array')
    } else {
      input.evidence.forEach((item: unknown, index: number) => {
        const ok =
          isObject(item) &&
          (EVIDENCE_TYPES as readonly unknown[]).includes(item.type) &&
          isNonEmptyString(item.title) &&
          isNonEmptyString(item.content)
        if (!ok) errors.push(`evidence[${index}] needs a valid type, title and content`)
      })
    }
  }
  const hypothesis = input.hypothesis
  if (!isObject(hypothesis)) {
    errors.push('hypothesis is required')
  } else {
    for (const key of ['where', 'why'] as const) {
      const words = hypothesis[key]
      if (!Array.isArray(words) || words.length === 0 || !words.every(isNonEmptyString)) {
        errors.push(`hypothesis.${key} must be a non-empty list of keywords`)
      }
    }
    for (const key of ['good', 'partial', 'miss', 'skipped'] as const) {
      if (!isNonEmptyString(hypothesis[key])) errors.push(`hypothesis.${key} is required`)
    }
  }
  const specific = input.languageSpecific
  if (specific !== null && !(LANGUAGES as readonly unknown[]).includes(specific)) {
    errors.push('languageSpecific must be null or a supported language')
  }
  const ticket = input.ticket
  if (
    !isObject(ticket) ||
    !isNonEmptyString(ticket.subject) ||
    !isNonEmptyString(ticket.body)
  ) {
    errors.push('ticket needs a subject and a body')
  }

  const languages = input.languages
  if (!isObject(languages) || Object.keys(languages).length === 0) {
    errors.push('languages must contain at least one language')
  } else {
    for (const [language, version] of Object.entries(languages)) {
      if (!(LANGUAGES as readonly unknown[]).includes(language)) {
        errors.push(`languages.${language} is not a supported language`)
      } else {
        validateLanguage(language, version, errors)
      }
    }
    if (typeof specific === 'string' && !(specific in languages)) {
      errors.push(`languageSpecific is "${specific}" but that version is missing`)
    }
  }
  return errors
}

export function parseChallenge(input: unknown): Challenge {
  const errors = validateChallenge(input)
  if (errors.length > 0) throw new Error(`Invalid challenge:\n- ${errors.join('\n- ')}`)
  return input as Challenge
}
