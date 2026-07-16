import React from 'react'
import { colourConfig } from '../colours'
import Logo from './Logo'

const COLOUR_CARDS = [
  { key: 'cool_blue', icon: '🔵' },
  { key: 'earth_green', icon: '🟢' },
  { key: 'sunshine_yellow', icon: '🟡' },
  { key: 'fiery_red', icon: '🔴' },
]

export default function Home({ db, state, onStart, onNavigate }) {
  const hasResults = !!state.scores

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="stagger text-center pt-8 pb-12 px-4">
        <Logo className="w-20 h-20 mx-auto mb-5 animate-float-soft drop-shadow-sm" />
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-4">
          Verity
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Discover your behavioural preferences through four colour energies.
          Build self-awareness and unlock practical tools for growth.
        </p>

        <div>
          {hasResults ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate('results')}
                className="btn-primary bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                View My Results
              </button>
              <button
                onClick={() => onNavigate('quiz')}
                className="btn-primary bg-gray-800"
              >
                Retake Quiz
              </button>
            </div>
          ) : (
            <button
              onClick={onStart}
              className="btn-primary group bg-gray-900 hover:bg-gray-800 text-lg px-8 py-4"
            >
              Start My Profile
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          )}
        </div>
      </div>

      {/* Colour energy cards */}
      <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {COLOUR_CARDS.map(({ key, icon }) => {
          const colour = db.colours[key]
          const cfg = colourConfig(key)
          return (
            <div
              key={key}
              className={`card card-interactive text-center bg-gradient-to-b ${cfg.softGradient} ring-1 ${cfg.ring}`}
            >
              <div className="text-3xl mb-2.5">{icon}</div>
              <h3 className={`font-bold text-sm ${cfg.textDark}`}>{colour.display_name}</h3>
              <p className="text-xs text-gray-600/90 mt-1.5 leading-relaxed">{colour.core_drive}</p>
            </div>
          )
        })}
      </div>

      {/* Quick stats if they have a profile */}
      {hasResults && (
        <div className="card mb-6 relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 text-white ring-0">
          <div className="absolute -right-8 -top-8 text-8xl opacity-10 select-none" aria-hidden="true">
            {colourConfig(state.scores.dominantColour).emoji}
          </div>
          <h2 className="font-bold text-lg mb-4 relative">Your Profile at a Glance</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 relative">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Dominant Energy</p>
              <p className="font-bold text-lg">{db.colours[state.scores.dominantColour].display_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Secondary Energy</p>
              <p className="font-bold text-lg">{db.colours[state.scores.secondaryColour].display_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Confidence</p>
              <p className="font-bold text-lg tnums">{state.scores.confidence}%</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Your Tier</p>
              <p className="font-bold text-lg capitalize">{state.gamification.tier.replace('tier_', '') || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {/* What you'll discover */}
      <div className="card">
        <h2 className="font-bold text-gray-900 text-lg mb-4">What you'll discover</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '📊', text: 'Your spectrum scores across 4 colour energies' },
            { icon: '💡', text: 'Strengths and potential blind spots' },
            { icon: '💬', text: 'Communication tips for different styles' },
            { icon: '🎯', text: 'Personalised next steps and experiments' },
            { icon: '⚡', text: 'Colour-specific challenges to grow' },
            { icon: '👥', text: 'Optional team mode for group insights' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl ring-1 ring-gray-900/[0.03] transition-colors duration-150 hover:bg-gray-100/70"
            >
              <span className="text-xl leading-none mt-0.5">{item.icon}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-amber-50 ring-1 ring-amber-500/15 rounded-xl text-xs text-amber-800/90 text-center leading-relaxed">
        This is a behavioural preference tool for self-awareness, not a clinical assessment.
        Results are indicative, not diagnostic.
      </div>
    </div>
  )
}
