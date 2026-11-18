import { useSyncExternalStore } from 'react'
import { parseRoute, type Route } from './route.ts'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current page, taken from the URL hash. Updates when the hash changes. */
export function useHashRoute(): Route {
  return useSyncExternalStore(
    subscribe,
    () => parseRoute(window.location.hash),
    () => 'game',
  )
}
