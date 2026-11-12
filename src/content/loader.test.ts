import { describe, expect, it } from 'vitest'
import { listChallenges, loadStarterFiles, reachableFilePaths } from './loader.ts'

describe('listChallenges', () => {
  it('finds and validates the challenges in content/challenges', () => {
    const challenges = listChallenges()
    expect(challenges.length).toBeGreaterThan(0)
    expect(challenges[0].id).toBe('001-leaderboard')
  })
})

describe('loadStarterFiles', () => {
  it('loads the buggy code and tests for every language of every challenge', async () => {
    for (const challenge of listChallenges()) {
      for (const language of ['js', 'python'] as const) {
        if (!challenge.languages[language]) continue
        const { code, tests } = await loadStarterFiles(challenge, language)
        expect(code.length, `${challenge.id} ${language} code`).toBeGreaterThan(0)
        expect(tests.length, `${challenge.id} ${language} tests`).toBeGreaterThan(0)
      }
    }
  })

  it('loads the BUGGY version, not the solution', async () => {
    const [challenge] = listChallenges()
    const { code } = await loadStarterFiles(challenge, 'js')
    expect(code).toContain('players.sort(')
    expect(code).not.toContain('Number(b.points)')
  })

  it('rejects a language the challenge does not have', async () => {
    const [challenge] = listChallenges()
    const withoutPython = { ...challenge, languages: { js: challenge.languages.js } }
    await expect(loadStarterFiles(withoutPython, 'python')).rejects.toThrow(
      /no python version/,
    )
  })

  it('can never reach a solution file', () => {
    const paths = reachableFilePaths()
    expect(paths.length).toBeGreaterThan(0)
    expect(paths.filter((path) => path.includes('solution'))).toEqual([])
  })
})
