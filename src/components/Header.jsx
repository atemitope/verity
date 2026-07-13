import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'quiz', label: 'Quiz', icon: '📝' },
  { key: 'results', label: 'Results', icon: '📊' },
  { key: 'report', label: 'Report', icon: '📄' },
  { key: 'challenges', label: 'Challenges', icon: '⚡' },
  { key: 'achievements', label: 'Achievements', icon: '🏆' },
  { key: 'team', label: 'Team', icon: '👥' },
]

const TIER_LABELS = {
  tier_explorer: '🧭 Explorer',
  tier_builder: '🔨 Builder',
  tier_leader: '👑 Leader',
}

function isItemLocked(state, key) {
  return !state.assessmentComplete && ['results', 'report', 'challenges', 'achievements'].includes(key)
}

export default function Header({ state, db, onNavigate, progressPercent, levelProgress, user, onLogin, onLogout }) {
  const { gamification } = state
  const xpPerLevel = db.gamification.mechanics_catalogue.levels.xp_per_level
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile sheet on Escape and lock body scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [menuOpen])

  const activeItem = NAV_ITEMS.find((i) => i.key === state.view) || NAV_ITEMS[0]

  const go = (key) => {
    if (isItemLocked(state, key)) return
    onNavigate(key)
    setMenuOpen(false)
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/70 sticky top-0 z-40 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Top row: logo + gamification cluster (+ room for auth control on far right) */}
        <div className="flex items-center justify-between gap-3 py-2.5">
          <button
            onClick={() => onNavigate('home')}
            aria-label="Colour Spectrum — go to home"
            className="group flex items-center gap-2 font-bold text-gray-900 transition-transform duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 rounded-lg -mx-1 px-1"
          >
            <span className="text-xl transition-transform duration-300 group-hover:rotate-12" aria-hidden="true">🌈</span>
            <span className="text-sm font-semibold tracking-tight hidden sm:block">Colour Spectrum</span>
          </button>

          {/* Right cluster: gamification stats. Auth control (Sign in / account chip)
              is intentionally placed after this by the parallel auth effort. */}
          <div className="flex items-center gap-2 text-sm">
            {/* Level badge */}
            <div className="flex items-center gap-2 bg-purple-50 ring-1 ring-purple-500/10 px-2.5 py-1 rounded-full">
              <span className="text-purple-700 font-bold text-xs tnums">Lv {gamification.level}</span>
              <div className="w-14 h-1.5 bg-purple-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
            {/* XP */}
            <span className="hidden xs:inline-flex items-center gap-1 text-amber-700 font-semibold text-xs tnums bg-amber-50 ring-1 ring-amber-500/10 px-2.5 py-1 rounded-full">
              <span className="text-amber-500">✦</span>{gamification.xp} XP
            </span>
            {/* Tier badge */}
            {gamification.tier !== 'none' && (
              <span className="badge-pill bg-indigo-50 ring-1 ring-indigo-500/10 text-indigo-700 text-xs">
                {TIER_LABELS[gamification.tier] || gamification.tier}
              </span>
            )}

            {/* Auth control */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <button
                  onClick={onLogout}
                  className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                  title={user.email || user.name || 'Signed in'}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="text-xs font-medium bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Desktop nav — full row (all 7 items fit at >=sm). */}
        <nav className="hidden sm:flex gap-1 pb-2 -mb-px" aria-label="Primary">
          {NAV_ITEMS.map(item => {
            const isActive = state.view === item.key
            const isLocked = isItemLocked(state, item.key)
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                disabled={isLocked}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isLocked ? `${item.label} (locked — complete the assessment first)` : item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
                  ${isActive
                    ? 'bg-gray-900 text-white shadow-[0_1px_2px_rgba(16,24,40,0.15),0_4px_10px_-3px_rgba(16,24,40,0.3)]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
                  ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {isLocked && <span className="text-[10px]" aria-hidden="true">🔒</span>}
              </button>
            )
          })}
        </nav>

        {/* Mobile nav trigger — opens the bottom sheet below. */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className="sm:hidden flex items-center gap-2 w-full mb-2 px-3 py-2 rounded-xl bg-gray-100/80 text-gray-800 text-sm font-medium
            transition-[transform,background-color] duration-150 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          <span aria-hidden="true">{activeItem.icon}</span>
          <span className="font-semibold">{activeItem.label}</span>
          <span className="ml-auto flex items-center gap-1.5 text-gray-500 text-xs">
            Menu
            <span aria-hidden="true" className="text-base leading-none">☰</span>
          </span>
        </button>
      </div>

      {/* Mobile bottom sheet — portalled to <body>: the header's backdrop-blur
          makes it a containing block for fixed descendants, which would anchor
          (and clip) the sheet inside the header instead of the viewport. */}
      {menuOpen && createPortal(
        <div className="sm:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-[0_-8px_40px_-8px_rgba(16,24,40,0.4)]
              px-3 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] animate-sheet-up overscroll-contain
              max-h-[80dvh] overflow-y-auto"
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-200" aria-hidden="true" />
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Go to</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="text-gray-500 hover:text-gray-900 text-sm px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Primary">
              {NAV_ITEMS.map(item => {
                const isActive = state.view === item.key
                const isLocked = isItemLocked(state, item.key)
                return (
                  <button
                    key={item.key}
                    onClick={() => go(item.key)}
                    disabled={isLocked}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={isLocked ? `${item.label} (locked — complete the assessment first)` : item.label}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-left
                      transition-[background-color,transform] duration-150 active:scale-[0.99]
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
                      ${isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'}
                      ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-lg leading-none" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                    {isLocked && <span className="ml-auto text-xs" aria-hidden="true">🔒</span>}
                    {isActive && <span className="ml-auto text-xs" aria-hidden="true">●</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
