import React, { useState, useEffect } from 'react'
import { colourConfig } from '../colours'

const LIKERT_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']
const MILESTONES = [25, 50, 75, 100]

export default function Quiz({ db, state, onComplete, onUpdateState }) {
  const items = db.questionnaire.items
  const totalItems = items.length

  // Restore from saved state
  const [responses, setResponses] = useState(state.responses || {})
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = state.currentItemIndex || 0
    return Math.min(saved, totalItems - 1)
  })
  const [milestone, setMilestone] = useState(null)

  const item = items[currentIndex]
  const answered = Object.keys(responses).length
  const progressPct = Math.round((currentIndex / totalItems) * 100)

  // Persist progress
  useEffect(() => {
    onUpdateState({ responses, currentItemIndex: currentIndex })
  }, [responses, currentIndex])

  // Show milestone celebration
  useEffect(() => {
    const pct = Math.round((currentIndex / totalItems) * 100)
    const hit = MILESTONES.find(m => pct >= m && pct < m + (100 / totalItems) * 2)
    if (hit && hit !== milestone) setMilestone(hit)
  }, [currentIndex])

  function handleLikertResponse(value) {
    const newResponses = { ...responses, [item.id]: value }
    setResponses(newResponses)
    if (currentIndex < totalItems - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 200)
    } else {
      onComplete(newResponses)
    }
  }

  function handleForcedChoice(optionId) {
    const newResponses = { ...responses, [item.id]: optionId }
    setResponses(newResponses)
    if (currentIndex < totalItems - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 200)
    } else {
      onComplete(newResponses)
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1)
  }

  const currentResponse = responses[item.id]

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
          <span>Question {currentIndex + 1} of {totalItems}</span>
          <span>{progressPct}% complete</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Milestone markers */}
        <div className="relative h-0">
          {MILESTONES.slice(0, -1).map(m => (
            <div
              key={m}
              className="absolute top-0 w-px h-2 bg-gray-400"
              style={{ left: `${m}%`, marginTop: '-8px' }}
            />
          ))}
        </div>
      </div>

      {/* Milestone celebration */}
      {milestone && milestone < 100 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-center animate-bounce-soft">
          <p className="text-amber-700 font-semibold text-sm">
            🎉 {milestone}% complete — keep going!
          </p>
        </div>
      )}

      {/* Question card */}
      <div className="card animate-slide-up" key={item.id}>
        {/* Type indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`badge-pill text-xs ${
            item.type === 'likert_1_5'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-purple-50 text-purple-600'
          }`}>
            {item.type === 'likert_1_5' ? '📊 Rate your agreement' : '⚖️ Choose one'}
          </span>
          {db.questionnaire.instructions && currentIndex === 0 && (
            <span className="text-xs text-gray-400">{db.questionnaire.instructions}</span>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
          {item.type === 'forced_choice' ? 'Which describes you better?' : item.text}
        </h2>

        {/* Likert response */}
        {item.type === 'likert_1_5' && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                onClick={() => handleLikertResponse(val)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 hover:scale-[1.01]
                  ${currentResponse === val
                    ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                  ${currentResponse === val ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {val}
                </span>
                <span className="text-sm">{LIKERT_LABELS[val - 1]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Forced choice response */}
        {item.type === 'forced_choice' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Choose the statement that best describes you:</p>
            {/* Parse 'A: text  B: text' format from item.text */}
            {Object.entries(item.choices).map(([optKey, mapping]) => {
              const dominantColourForChoice = Object.keys(mapping)[0]
              const cfg = colourConfig(dominantColourForChoice)
              // Extract option text: "A: some text  B: other text" → split by "  B:" or just label
              const textMatch = item.text.match(new RegExp(`${optKey}:\\s*(.+?)(?=\\s{2,}[A-B]:|$)`))
              const optText = textMatch ? textMatch[1].trim() : `Option ${optKey}`
              return (
                <button
                  key={optKey}
                  onClick={() => handleForcedChoice(optKey)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 hover:scale-[1.01]
                    ${currentResponse === optKey
                      ? `${cfg.border} ${cfg.bgLight} ${cfg.textDark} font-medium`
                      : 'border-gray-200 hover:border-gray-400'
                    }`}
                >
                  <span className="font-bold text-xs text-gray-400 mr-2">{optKey}</span>
                  <span className="text-sm leading-relaxed">{optText}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        {currentResponse !== undefined && currentIndex < totalItems - 1 && (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="px-4 py-2 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Next →
          </button>
        )}
      </div>

      {/* Save/resume note */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Progress is saved automatically. You can continue where you left off.
      </p>
    </div>
  )
}
