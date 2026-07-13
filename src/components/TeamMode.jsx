import React, { useState } from 'react'
import { colourConfig } from '../colours'
import { computeScores, generateReport } from '../scoring'

function TeamMemberCard({ member, db, onRemove }) {
  const cfg = colourConfig(member.scores.dominantColour)
  return (
    <div className={`card flex items-center gap-3 py-3.5 ${cfg.bgLight} ring-1 ${cfg.ring}`}>
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${cfg.hero} ${cfg.heroFg} flex items-center justify-center font-bold shrink-0 shadow-sm`}>
        {member.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{member.name}</p>
        <p className={`text-xs ${cfg.text} truncate`}>
          {cfg.emoji} {db.colours[member.scores.dominantColour].display_name} · {colourConfig(member.scores.secondaryColour).emoji} {db.colours[member.scores.secondaryColour].display_name}
        </p>
      </div>
      <button
        onClick={() => onRemove(member.name)}
        aria-label={`Remove ${member.name}`}
        className="grid place-items-center w-9 h-9 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors text-sm shrink-0"
      >✕</button>
    </div>
  )
}

function TeamReportPanel({ teamMembers, db }) {
  const colours = db.scoring.colour_keys
  const colourCounts = {}
  colours.forEach(c => { colourCounts[c] = 0 })

  teamMembers.forEach(m => {
    colourCounts[m.scores.dominantColour]++
  })

  const sorted = colours.slice().sort((a, b) => colourCounts[b] - colourCounts[a])
  const dominated = sorted[0]
  const underrepresented = sorted[sorted.length - 1]

  // Polarity averages
  const avgRedGreen = teamMembers.reduce((s, m) => s + m.scores.polarityRedGreen, 0) / teamMembers.length
  const avgBlueYellow = teamMembers.reduce((s, m) => s + m.scores.polarityBlueYellow, 0) / teamMembers.length

  return (
    <div className="space-y-6">
      {/* Distribution */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Team Energy Distribution</h3>
        {colours.map(c => {
          const cfg = colourConfig(c)
          const count = colourCounts[c]
          const pct = teamMembers.length > 0 ? (count / teamMembers.length) * 100 : 0
          return (
            <div key={c} className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span>{cfg.emoji} {db.colours[c].display_name}</span>
                <span className="text-gray-500 tnums">{count} member{count !== 1 ? 's' : ''} ({Math.round(pct)}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden ring-1 ring-gray-900/[0.04]">
                <div className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Analysis */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Team Analysis</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-1">Dominant team energy</p>
            <p>{colourConfig(dominated).emoji} {db.colours[dominated].display_name} — {db.colours[dominated].core_drive}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="font-semibold text-amber-800 mb-1">Least represented energy</p>
            <p>{colourConfig(underrepresented).emoji} {db.colours[underrepresented].display_name} — consider actively surfacing {db.colours[underrepresented].core_drive.toLowerCase()} perspectives.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-1">Polarities (team average)</p>
            <p>Red–Green: {avgRedGreen.toFixed(2)} ({avgRedGreen > 0 ? 'Results-leaning' : 'Harmony-leaning'})</p>
            <p>Blue–Yellow: {avgBlueYellow.toFixed(2)} ({avgBlueYellow > 0 ? 'Analysis-leaning' : 'Connection-leaning'})</p>
          </div>
        </div>
      </div>

      {/* Pairings */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Pairings</h3>
        {teamMembers.length < 2 ? (
          <p className="text-sm text-gray-500">Add at least 2 members to see pairings.</p>
        ) : (
          <div className="space-y-3">
            {teamMembers.flatMap((a, i) =>
              teamMembers.slice(i + 1).map(b => {
                const aCfg = colourConfig(a.scores.dominantColour)
                const bCfg = colourConfig(b.scores.dominantColour)
                return (
                  <div key={`${a.name}-${b.name}`} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge-pill ${aCfg.bgLight} ${aCfg.text} text-xs`}>{a.name}</span>
                      <span className="text-gray-500">×</span>
                      <span className={`badge-pill ${bCfg.bgLight} ${bCfg.text} text-xs`}>{b.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="font-semibold text-green-700">Synergy</p>
                        <p className="text-gray-600">{aCfg.emoji} brings {db.colours[a.scores.dominantColour].core_drive.split(',')[0].toLowerCase()}</p>
                        <p className="text-gray-600">{bCfg.emoji} brings {db.colours[b.scores.dominantColour].core_drive.split(',')[0].toLowerCase()}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="font-semibold text-red-700">Friction risk</p>
                        <p className="text-gray-600">
                          {a.scores.dominantColour === b.scores.dominantColour
                            ? 'Similar style — may lack complementary challenge'
                            : 'Different paces and priorities'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-semibold mb-1">Operating agreements:</p>
                      <p>1. Agree on decision pace before starting.</p>
                      <p>2. Name the tension early — don't let it fester.</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeamMode({ db, state, onUpdateState, onNavigate, showToast }) {
  const [newMemberName, setNewMemberName] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [showReport, setShowReport] = useState(false)

  function addSelf() {
    if (!state.scores) {
      showToast('Complete the questionnaire first', 'info')
      return
    }
    if (!consentChecked) {
      showToast('Please confirm your consent before sharing', 'error')
      return
    }
    const name = newMemberName.trim() || 'You'
    if (state.teamMembers.find(m => m.name === name)) {
      showToast('A member with this name already exists', 'error')
      return
    }
    const newMembers = [...state.teamMembers, {
      name,
      scores: state.scores,
      addedAt: new Date().toISOString(),
      consent: true,
    }]
    onUpdateState({ teamMembers: newMembers })
    showToast(`${name} added to team`, 'success')
    setNewMemberName('')
    setConsentChecked(false)
  }

  function removeMember(name) {
    onUpdateState({ teamMembers: state.teamMembers.filter(m => m.name !== name) })
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">👥 Team Mode</h1>
      <p className="text-sm text-gray-500 mb-6">
        Aggregate team profiles to understand collective dynamics. All sharing is opt-in and consent-gated.
      </p>

      {/* Privacy notice */}
      <div className="card mb-6 bg-blue-50 ring-1 ring-blue-500/15">
        <p className="text-sm text-blue-800">
          🔒 <strong>Privacy first:</strong> Results are only shared within this session. No data leaves your device.
          Each person must explicitly consent before their profile is added to the team view.
        </p>
      </div>

      {/* Add member */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Add Your Profile</h2>
        {!state.assessmentComplete ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3 text-sm">Complete the questionnaire first to join the team view.</p>
            <button onClick={() => onNavigate('quiz')} className="btn-primary bg-blue-500 text-sm">
              Take the Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Your name (or alias)</label>
              <input
                type="text"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                placeholder="Enter your name…"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={e => setConsentChecked(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                I consent to sharing my Colour Spectrum Profile results in this team session for the purpose of team development.
              </span>
            </label>
            <button
              onClick={addSelf}
              className="btn-primary bg-blue-500 text-sm w-full"
            >
              Add to Team
            </button>
          </div>
        )}
      </div>

      {/* Team members */}
      {state.teamMembers.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3">
            Team Members ({state.teamMembers.length})
          </h2>
          <div className="space-y-2">
            {state.teamMembers.map(member => (
              <TeamMemberCard
                key={member.name}
                member={member}
                db={db}
                onRemove={removeMember}
              />
            ))}
          </div>
        </div>
      )}

      {/* Team report */}
      {state.teamMembers.length >= 2 && (
        <div className="mb-6">
          <button
            onClick={() => setShowReport(!showReport)}
            className="btn-primary bg-gradient-to-r from-slate-700 to-slate-900 w-full text-sm"
          >
            {showReport ? '▲ Hide' : '▼ View'} Team Report
          </button>
          {showReport && (
            <div className="mt-4 animate-fade-in">
              <TeamReportPanel teamMembers={state.teamMembers} db={db} />
            </div>
          )}
        </div>
      )}

      {state.teamMembers.length < 2 && state.teamMembers.length > 0 && (
        <div className="card bg-gray-50 text-center py-6">
          <p className="text-gray-500 text-sm">Add at least 2 members to generate a team report.</p>
        </div>
      )}
    </div>
  )
}
