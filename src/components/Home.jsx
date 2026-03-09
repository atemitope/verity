import React from 'react'
import { colourConfig } from '../colours'

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
      <div className="text-center py-12 px-4">
        <div className="text-7xl mb-4">🌈</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Colour Spectrum Profile</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Discover your behavioural preferences through four colour energies.
          Build self-awareness and unlock practical tools for growth.
        </p>

        {hasResults ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('results')}
              className="btn-primary bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              View My Results
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="btn-primary bg-gray-700"
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <button
            onClick={onStart}
            className="btn-primary bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 text-lg px-8 py-4"
          >
            Start My Profile →
          </button>
        )}
      </div>

      {/* Colour energy cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {COLOUR_CARDS.map(({ key, icon }) => {
          const colour = db.colours[key]
          const cfg = colourConfig(key)
          return (
            <div key={key} className={`card text-center hover:shadow-md transition-shadow ${cfg.bgLight}`}>
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className={`font-bold text-sm ${cfg.textDark}`}>{colour.display_name}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{colour.core_drive}</p>
            </div>
          )
        })}
      </div>

      {/* Quick stats if they have a profile */}
      {hasResults && (
        <div className="card mb-6 bg-gradient-to-br from-slate-800 to-slate-700 text-white">
          <h2 className="font-bold text-lg mb-3">Your Profile at a Glance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Dominant Energy</p>
              <p className="font-bold text-lg">{db.colours[state.scores.dominantColour].display_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Secondary Energy</p>
              <p className="font-bold text-lg">{db.colours[state.scores.secondaryColour].display_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Confidence</p>
              <p className="font-bold text-lg">{state.scores.confidence}%</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Your Tier</p>
              <p className="font-bold text-lg capitalize">{state.gamification.tier.replace('tier_', '') || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {/* What you'll discover */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">What you'll discover</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '📊', text: 'Your spectrum scores across 4 colour energies' },
            { icon: '💡', text: 'Strengths and potential blind spots' },
            { icon: '💬', text: 'Communication tips for different styles' },
            { icon: '🎯', text: 'Personalised next steps and experiments' },
            { icon: '⚡', text: 'Colour-specific challenges to grow' },
            { icon: '👥', text: 'Optional team mode for group insights' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center">
        This is a behavioural preference tool for self-awareness, not a clinical assessment.
        Results are indicative, not diagnostic.
      </div>
    </div>
  )
}
