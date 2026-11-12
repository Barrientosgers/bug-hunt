import type { Challenge, Language } from './types.ts'
import { parseChallenge } from './validate.ts'

// Vite finds these files at build time. The challenge.json files are small, so they are
// bundled with the app. The code files are loaded on demand (one request per language),
// so a large library of challenges does not slow down the first page load.
//
// Only buggy.* and tests.* match the pattern below. The reference solution (solution.*)
// is deliberately NOT included, so it is never sent to the player's browser.
const manifests = import.meta.glob<unknown>('../../content/challenges/*/challenge.json', {
  eager: true,
  import: 'default',
})
const starterFiles = import.meta.glob<string>(
  '../../content/challenges/*/*/{buggy,tests}.*',
  { query: '?raw', import: 'default' },
)

export interface StarterFiles {
  code: string
  tests: string
}

let cache: Challenge[] | undefined

/** All challenges, validated and sorted by ticket number. Throws a clear error if one is invalid. */
export function listChallenges(): Challenge[] {
  if (!cache) {
    cache = Object.entries(manifests)
      .map(([path, json]) => {
        try {
          const challenge = parseChallenge(json)
          const folder = path.split('/').at(-2)
          if (challenge.id !== folder) {
            throw new Error(`id "${challenge.id}" must match its folder "${folder}"`)
          }
          return challenge
        } catch (error) {
          throw new Error(
            `${path}: ${error instanceof Error ? error.message : String(error)}`,
            {
              cause: error,
            },
          )
        }
      })
      .sort((a, b) => a.number - b.number)
  }
  return cache
}

/** Loads the buggy starter code and the tests for one language of a challenge. */
export async function loadStarterFiles(
  challenge: Challenge,
  language: Language,
): Promise<StarterFiles> {
  const version = challenge.languages[language]
  if (!version) throw new Error(`${challenge.id} has no ${language} version`)

  const find = (file: string) =>
    starterFiles[`../../content/challenges/${challenge.id}/${file}`]
  const loadCode = find(version.buggy)
  const loadTests = find(version.tests)
  if (!loadCode || !loadTests) {
    throw new Error(`Could not find the starter files for ${challenge.id} (${language})`)
  }
  const [code, tests] = await Promise.all([loadCode(), loadTests()])
  return { code, tests }
}

/** The paths the loader can reach. Exposed so a test can prove solutions are excluded. */
export function reachableFilePaths(): string[] {
  return Object.keys(starterFiles)
}
