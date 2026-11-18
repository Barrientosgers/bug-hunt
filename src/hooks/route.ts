export type Route = 'game' | 'progress'

/** The page for a URL hash such as "#/progress". Anything unknown is the game. */
export function parseRoute(hash: string): Route {
  return hash.replace(/^#\/?/, '').split(/[/?]/)[0] === 'progress' ? 'progress' : 'game'
}

export const hrefFor = (route: Route) => (route === 'progress' ? '#/progress' : '#/')
