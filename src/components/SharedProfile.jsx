import React, { useState, useEffect } from 'react'
import { colourConfig } from '../colours'
import { fetchSharedProfile } from '../share'
import { SpectrumBar } from './Results'
import Logo from './Logo'

// Standalone, read-only page for a private share link (/share/:token).
// Mounted directly by main.jsx instead of <App/> — no header, no nav, no
// account state, nobody needs to be signed in to view it.
export default function SharedProfile({ token }) {
  const [db, setDb] = useState(null)
  const [profile, setProfile] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    Promise.all([
      fetch('/db.json').then(r => r.json()),
      fetchSharedProfile(token),
    ]).then(([dbData, profileData]) => {
      setDb(dbData)
      setProfile(profileData)
    })
  }, [token])

  if (profile === undefined || !db) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6f7f9]">
        <Logo className="w-12 h-12 animate-float-soft" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#f6f7f9] px-4 text-center">
        <Logo className="w-12 h-12 mb-4" />
        <h1 className="text-lg font-bold text-gray-900 mb-1">Link not found</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          This share link doesn't exist or has been revoked by its owner.
        </p>
      </div>
    )
  }

  const { name, scores } = profile
  const colours = db.scoring.colour_keys
  const sorted = scores.sortedColours
  const dominantCfg = colourConfig(scores.dominantColour)
  const secondaryCfg = colourConfig(scores.secondaryColour)

  return (
    <div className="min-h-[100dvh] bg-[#f6f7f9] antialiased">
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center gap-2 mb-6 text-gray-500">
          <Logo className="w-5 h-5" />
          <span className="text-sm font-semibold">Verity</span>
        </div>

        <p className="text-sm text-gray-500 mb-4">{name ? `${name}'s` : "Someone's"} colour spectrum profile</p>

        {/* Hero */}
        <div className={`card sheen relative overflow-hidden mb-6 ring-0 bg-gradient-to-br ${dominantCfg.hero} ${dominantCfg.heroFg} shadow-[0_10px_30px_-8px_rgba(16,24,40,0.35)]`}>
          <div className="absolute -right-6 -bottom-8 text-[9rem] leading-none opacity-15 select-none" aria-hidden="true">
            {dominantCfg.emoji}
          </div>
          <div className="text-center py-4 relative">
            <p className={`${dominantCfg.heroFgSoft} text-xs uppercase tracking-[0.15em] mb-2`}>Dominant energy</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">
              {dominantCfg.emoji} {db.colours[scores.dominantColour].display_name}
            </h1>
            <p className={`${dominantCfg.heroFgSoft} text-sm mb-4 max-w-md mx-auto leading-relaxed`}>
              {db.colours[scores.dominantColour].core_drive}
            </p>
            <div className={`inline-block ${dominantCfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-4 py-2`}>
              <p className={`${dominantCfg.heroFgSoft} text-xs mb-0.5`}>Secondary</p>
              <p className="font-semibold">{secondaryCfg.emoji} {db.colours[scores.secondaryColour].display_name}</p>
            </div>
          </div>
        </div>

        {/* Spectrum scores */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Spectrum Scores</h2>
          {sorted.map((colourKey, i) => (
            <SpectrumBar
              key={colourKey}
              colour={colourKey}
              rank={i}
              score={scores.spectrumScores[colourKey]}
              cfg={colourConfig(colourKey)}
              label={db.colours[colourKey].display_name}
            />
          ))}
        </div>

        <footer className="border-t border-gray-200/70 pt-6 text-center text-xs leading-relaxed text-gray-500 max-w-2xl mx-auto">
          Verity is a behavioural preference tool for self-awareness and development.
          It is not a clinical instrument and is not the proprietary Insights Discovery® Preference Evaluator.
          This is a read-only view shared via a private link.
        </footer>
      </main>
    </div>
  )
}
