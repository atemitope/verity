import React from 'react'

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

export default function Header({ state, db, onNavigate, progressPercent, levelProgress }) {
  const { gamification } = state
  const xpPerLevel = db.gamification.mechanics_catalogue.levels.xp_per_level

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
            className="group flex items-center gap-2 font-bold text-gray-900 transition-transform duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 rounded-lg -mx-1 px-1"
          >
            <span className="text-xl transition-transform duration-300 group-hover:rotate-12">🌈</span>
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
            <span className="hidden xs:inline-flex items-center gap-1 text-amber-600 font-semibold text-xs tnums bg-amber-50 ring-1 ring-amber-500/10 px-2.5 py-1 rounded-full">
              <span className="text-amber-400">✦</span>{gamification.xp} XP
            </span>
            {/* Tier badge */}
            {gamification.tier !== 'none' && (
              <span className="badge-pill bg-indigo-50 ring-1 ring-indigo-500/10 text-indigo-700 text-xs">
                {TIER_LABELS[gamification.tier] || gamification.tier}
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px scrollbar-hide">
          {NAV_ITEMS.map(item => {
            const isActive = state.view === item.key
            const isLocked = !state.assessmentComplete && ['results', 'report', 'challenges', 'achievements'].includes(item.key)
            return (
              <button
                key={item.key}
                onClick={() => !isLocked && onNavigate(item.key)}
                disabled={isLocked}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
                  transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
                  ${isActive
                    ? 'bg-gray-900 text-white shadow-[0_1px_2px_rgba(16,24,40,0.15),0_4px_10px_-3px_rgba(16,24,40,0.3)]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
                  ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {isLocked && <span className="hidden sm:inline text-[10px]">🔒</span>}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
