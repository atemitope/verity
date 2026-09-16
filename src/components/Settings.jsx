import React, { useState } from 'react'

const MOTION_OPTIONS = [
  { value: 'system', label: 'System', hint: 'Follow your device setting' },
  { value: 'reduced', label: 'Reduced', hint: 'Minimize motion everywhere' },
  { value: 'full', label: 'Full', hint: 'Always show animations' },
]

/**
 * Account and app settings. Split out from Profile, which is now a person's
 * behavioural profile — "profile" was being used for two different things.
 */
export default function Settings({ state, user, onUpdateState, onLogin, onLogout, onReset, onDeleteAccount, onNavigate }) {
  const { preferences } = state
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const setPreference = (key, value) => {
    onUpdateState({ preferences: { ...preferences, [key]: value } })
  }

  const canDelete = user && confirmText.trim().toLowerCase() === (user.email || '').toLowerCase()

  const handleDelete = async () => {
    if (!canDelete) return
    setDeleting(true)
    await onDeleteAccount()
    setDeleting(false)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>

      {/* Account */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Account</h2>
        {user ? (
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-14 h-14 rounded-full ring-1 ring-gray-900/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-600">
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">{user.name || 'Signed in'}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">Signed in with Google</p>
            </div>
            <button onClick={onLogout} className="btn-ghost ring-1 ring-gray-900/10 shrink-0">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-600 max-w-sm">
              Sign in to sync your profile and progress across devices. Your preferences below work either way.
            </p>
            <button onClick={onLogin} className="btn-primary bg-gray-900 hover:bg-gray-800 shrink-0">
              Sign in
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-1">Preferences</h2>
        <p className="text-sm text-gray-500 mb-5">
          Saved on this device{user ? ' and synced to your account' : ''}.
        </p>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-800 mb-2">Motion</p>
          <div className="grid grid-cols-3 gap-2">
            {MOTION_OPTIONS.map(opt => {
              const active = preferences.reducedMotion === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setPreference('reducedMotion', opt.value)}
                  aria-pressed={active}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm transition-[background-color,box-shadow] duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
                    ${active
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 ring-1 ring-gray-900/[0.04]'}`}
                >
                  <span className="block font-medium">{opt.label}</span>
                  <span className={`block text-xs mt-0.5 ${active ? 'text-white/70' : 'text-gray-500'}`}>{opt.hint}</span>
                </button>
              )
            })}
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.explainerDefaultOpen}
            onChange={e => setPreference('explainerDefaultOpen', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            Show detailed score explanations by default on the Results page
          </span>
        </label>
      </div>

      {/* Danger zone */}
      <div className="card ring-1 ring-red-500/15">
        <h2 className="font-bold text-red-700 mb-1">Danger zone</h2>
        <p className="text-sm text-gray-500 mb-5">These actions can't be undone.</p>

        <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Reset progress</p>
            <p className="text-xs text-gray-500 mt-0.5">Clears quiz responses, scores, and gamification. Preferences stay as they are.</p>
          </div>
          <button onClick={() => { onReset(); onNavigate('home') }} className="btn-ghost ring-1 ring-gray-900/10 shrink-0 text-sm">
            Reset
          </button>
        </div>

        {user && (
          <div className="py-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-800">Delete account</p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">
              Permanently deletes your account and everything saved to it. Type your email
              (<span className="font-medium">{user.email}</span>) to confirm.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={user.email}
                className="min-w-0 flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <button
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-sm px-4 py-2"
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
