import React from 'react'
import { DEV_AUTH, isDevSignedIn, setDevSignedIn, buildDemoState } from '../devMode'

/**
 * Unmissable marker that authentication is stubbed.
 *
 * Renders only when DEV_AUTH is on, which cannot happen in a production
 * build (see devMode.js). Deliberately loud — a fake session should never
 * be mistakable for a real one.
 */
export default function DevBanner({ db, onSetState, onNavigate }) {
  if (!DEV_AUTH) return null

  const signedIn = isDevSignedIn()

  const toggleSignIn = () => {
    setDevSignedIn(!signedIn)
    window.location.reload()
  }

  const loadDemo = (lean) => {
    onSetState(buildDemoState(db, lean))
    onNavigate('profile')
  }

  return (
    <div className="bg-amber-400 text-amber-950 border-b border-amber-500">
      <div className="max-w-4xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="font-bold uppercase tracking-wide shrink-0">
          ⚠ Dev mode — auth is stubbed
        </span>

        <span className="opacity-80">
          Session is fake ({signedIn ? 'signed in as dev@localhost' : 'signed out'}). Nothing is saved to a server.
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleSignIn}
            className="font-semibold px-2 py-1 rounded bg-amber-950/10 hover:bg-amber-950/20 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
          >
            {signedIn ? 'Simulate sign out' : 'Simulate sign in'}
          </button>
          <span className="opacity-60">Demo profile:</span>
          {[
            ['cool_blue', 'Blue'],
            ['earth_green', 'Green'],
            ['sunshine_yellow', 'Yellow'],
            ['fiery_red', 'Red'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => loadDemo(key)}
              className="font-semibold px-2 py-1 rounded bg-amber-950/10 hover:bg-amber-950/20 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
