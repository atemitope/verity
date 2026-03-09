import React, { useState } from 'react'
import { colourConfig } from '../colours'

function ChallengeCard({ challenge, colourKey, db, completed, onComplete }) {
  const [showInput, setShowInput] = useState(false)
  const [note, setNote] = useState('')
  const cfg = colourConfig(colourKey)

  function handleSubmit() {
    if (note.trim()) {
      onComplete(challenge.challenge_id, note.trim())
      setShowInput(false)
    }
  }

  return (
    <div className={`border-2 rounded-2xl p-4 transition-all ${
      completed
        ? 'bg-green-50 border-green-200 opacity-80'
        : `${cfg.bgLight} ${cfg.border}`
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${completed ? '' : cfg.emoji}`}>
            {completed ? '✅' : cfg.emoji}
          </span>
          <h3 className={`font-bold text-sm ${completed ? 'text-green-800' : cfg.textDark}`}>
            {challenge.title}
          </h3>
        </div>
        {!completed && (
          <span className="badge-pill bg-white/80 text-gray-500 text-xs">+150 XP</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{challenge.description}</p>

      {completed ? (
        <div className="bg-green-100 rounded-lg p-2">
          <p className="text-xs text-green-700">
            <strong>Your note:</strong> {completed.note}
          </p>
        </div>
      ) : showInput ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={2}
            placeholder="Describe your outcome (required)…"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!note.trim()}
              className="btn-primary bg-green-500 text-sm py-1.5 px-4 disabled:opacity-50"
            >
              Submit ✓
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className={`btn-primary ${cfg.bg} text-sm py-1.5 px-4`}
        >
          Mark Complete
        </button>
      )}
    </div>
  )
}

export default function Challenges({ db, state, onComplete, onNavigate }) {
  const catalogue = db.gamification.mechanics_catalogue.challenges_by_colour
  const { gamification, scores } = state
  const [filter, setFilter] = useState('all')

  const dominantColour = scores?.dominantColour
  const colours = Object.keys(catalogue)

  const completedCount = Object.values(gamification.completedChallenges).filter(Boolean).length
  const totalCount = Object.values(catalogue).reduce((sum, arr) => sum + arr.length, 0)

  const filteredColours = filter === 'all'
    ? colours
    : filter === 'dominant' && dominantColour
    ? [dominantColour]
    : [filter]

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚡ Challenges</h1>
        <span className="badge-pill bg-green-100 text-green-700">
          {completedCount}/{totalCount} done
        </span>
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Challenges completed</span>
          <span className="font-bold">{Math.round((completedCount / totalCount) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`badge-pill whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All
        </button>
        {dominantColour && (
          <button
            onClick={() => setFilter('dominant')}
            className={`badge-pill whitespace-nowrap ${filter === 'dominant' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            ⭐ My Dominant
          </button>
        )}
        {colours.map(c => {
          const cfg = colourConfig(c)
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`badge-pill whitespace-nowrap ${filter === c ? `${cfg.bg} text-white` : `${cfg.bgLight} ${cfg.text}`}`}
            >
              {cfg.emoji} {db.colours[c].display_name}
            </button>
          )
        })}
      </div>

      {/* Challenge cards */}
      <div className="space-y-4">
        {filteredColours.map(colourKey => (
          <div key={colourKey}>
            <div className="flex items-center gap-2 mb-3">
              <span>{colourConfig(colourKey).emoji}</span>
              <h2 className="font-semibold text-gray-700">{db.colours[colourKey].display_name}</h2>
              {colourKey === dominantColour && (
                <span className="badge-pill bg-amber-100 text-amber-700 text-xs">Dominant</span>
              )}
            </div>
            <div className="space-y-3">
              {catalogue[colourKey].map(challenge => (
                <ChallengeCard
                  key={challenge.challenge_id}
                  challenge={challenge}
                  colourKey={colourKey}
                  db={db}
                  completed={gamification.completedChallenges[challenge.challenge_id]}
                  onComplete={onComplete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button onClick={() => onNavigate('achievements')} className="btn-primary bg-purple-600 w-full text-sm">
          🏆 View Achievements
        </button>
      </div>
    </div>
  )
}
