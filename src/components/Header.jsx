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

export default function Header({ state, db, onNavigate, progressPercent, levelProgress }) {
  const { gamification } = state
  const xpPerLevel = db.gamification.mechanics_catalogue.levels.xp_per_level

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Top row: logo + XP */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 font-bold text-gray-800 hover:text-gray-600 transition-colors"
          >
            <span className="text-xl">🌈</span>
            <span className="text-sm font-semibold hidden sm:block">Colour Spectrum</span>
          </button>

          <div className="flex items-center gap-3 text-sm">
            {/* Level badge */}
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full">
              <span className="text-purple-600 font-bold">Lv {gamification.level}</span>
              <div className="w-16 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
            {/* XP */}
            <span className="text-amber-600 font-semibold">{gamification.xp} XP</span>
            {/* Tier badge */}
            {gamification.tier !== 'none' && (
              <span className="badge-pill bg-indigo-50 text-indigo-700 text-xs">
                {gamification.tier === 'tier_explorer' ? '🧭 Explorer' :
                 gamification.tier === 'tier_builder' ? '🔨 Builder' : '👑 Leader'}
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {NAV_ITEMS.map(item => {
            const isActive = state.view === item.key
            const isLocked = !state.assessmentComplete && ['results', 'report', 'challenges', 'achievements'].includes(item.key)
            return (
              <button
                key={item.key}
                onClick={() => !isLocked && onNavigate(item.key)}
                disabled={isLocked}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}
                  ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
