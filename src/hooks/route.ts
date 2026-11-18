/** The pages of the app. The URL hash decides which one is shown. */
export type Route =
  | { page: 'daily' }
  | { page: 'play'; id: string }
  | { page: 'practice' }
  | { page: 'progress' }

/** Where each page lives. Anything unknown opens today's bug. */
export const hrefs = {
  daily: '#/',
  practice: '#/practice',
  progress: '#/progress',
  play: (id: string) => `#/play/${encodeURIComponent(id)}`,
} as const

export function parseRoute(hash: string): Route {
  const [page, id] = hash.replace(/^#\/?/, '').split('?')[0].split('/')
  if (page === 'progress') return { page: 'progress' }
  if (page === 'practice') return { page: 'practice' }
  if (page === 'play' && id) {
    try {
      return { page: 'play', id: decodeURIComponent(id) }
    } catch {
      return { page: 'daily' }
    }
  }
  return { page: 'daily' }
}
