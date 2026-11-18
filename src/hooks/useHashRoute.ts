import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute, type Route } from './route.ts'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current page, taken from the URL hash. Updates when the hash changes. */
export function useHashRoute(): Route {
  // The snapshot must be a plain string: a new object each time would re-render forever.
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )
  return useMemo(() => parseRoute(hash), [hash])
}
