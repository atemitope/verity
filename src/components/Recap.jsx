import React from 'react'

// Presentational only — reused by the owner's in-app "Your Journey" view
// (App.jsx, full gamification data) and the public shared-link view
// (SharedProfile.jsx, same shape via server/share.js's public endpoint).
export default function Recap({ recap }) {
  const { cfg, dominantColour, dominantName, coreDrive, headline, level, badgeCount, challengesCompleted, memberSinceDays } = recap

  const stats = [
    { label: 'Level', value: level },
    { label: 'Badges', value: badgeCount },
    { label: 'Challenges', value: challengesCompleted },
  ]
  if (memberSinceDays != null) {
    stats.unshift({ label: 'Days here', value: memberSinceDays })
  }

  return (
    <div className={`card sheen relative overflow-hidden ring-0 bg-gradient-to-br ${cfg.hero} ${cfg.heroFg} shadow-[0_10px_30px_-8px_rgba(16,24,40,0.35)]`}>
      <div className="absolute -right-8 -bottom-10 text-[10rem] leading-none opacity-15 select-none" aria-hidden="true">
        {cfg.emoji}
      </div>
      <div className="relative text-center py-6">
        <p className={`${cfg.heroFgSoft} text-xs uppercase tracking-[0.15em] mb-2`}>Your Verity journey</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
          {cfg.emoji} {headline}
        </h1>
        <p className={`${cfg.heroFgSoft} text-sm mb-6 max-w-md mx-auto leading-relaxed`}>{coreDrive}</p>

        <div className={`grid gap-3 max-w-md mx-auto`} style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map(s => (
            <div key={s.label} className={`${cfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-3 py-3`}>
              <p className="text-2xl font-bold tnums">{s.value}</p>
              <p className={`${cfg.heroFgSoft} text-[11px] mt-0.5`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
