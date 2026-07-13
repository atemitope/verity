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
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-semibold text-gray-700 tnums">Question {currentIndex + 1} <span className="text-gray-500 font-normal">of {totalItems}</span></span>
          <span className="text-gray-500 tnums">{progressPct}% complete</span>
        </div>
        <div className="relative w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Milestone markers */}
        <div className="relative h-0">
          {MILESTONES.slice(0, -1).map(m => (
            <div
              key={m}
              className="absolute top-0 w-0.5 h-2.5 bg-white/70"
              style={{ left: `${m}%`, marginTop: '-10px' }}
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
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`badge-pill text-xs ring-1 ${
            item.type === 'likert_1_5'
              ? 'bg-blue-50 text-blue-600 ring-blue-500/10'
              : 'bg-purple-50 text-purple-600 ring-purple-500/10'
          }`}>
            {item.type === 'likert_1_5' ? '📊 Rate your agreement' : '⚖️ Choose one'}
          </span>
          {db.questionnaire.instructions && currentIndex === 0 && (
            <span className="text-xs text-gray-500">{db.questionnaire.instructions}</span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 leading-snug tracking-tight">
          {item.type === 'forced_choice' ? 'Which describes you better?' : item.text}
        </h2>

        {/* Likert response */}
        {item.type === 'likert_1_5' && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                onClick={() => handleLikertResponse(val)}
                className={`group w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left
                  transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out
                  active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                  ${currentResponse === val
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium shadow-[0_2px_8px_-2px_rgba(59,130,246,0.35)]'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/60'
                  }`}
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 tnums transition-colors duration-150
                  ${currentResponse === val ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
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
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left
                    transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out
                    active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
                    ${currentResponse === optKey
                      ? `${cfg.border} ${cfg.bgLight} ${cfg.textDark} font-medium shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                >
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                    ${currentResponse === optKey ? `${cfg.bg} text-white` : 'bg-gray-100 text-gray-500'}`}>
                    {optKey}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{optText}</span>
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
          className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-[background-color,color,transform] duration-150 active:scale-[0.97]"
        >
          ← Back
        </button>
        {currentResponse !== undefined && currentIndex < totalItems - 1 && (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="px-4 py-2 rounded-lg text-sm text-blue-600 font-medium hover:text-blue-800 hover:bg-blue-50 transition-[background-color,color,transform] duration-150 active:scale-[0.97]"
          >
            Next →
          </button>
        )}
      </div>

      {/* Save/resume note */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Progress is saved automatically. You can continue where you left off.
      </p>
    </div>
  )
}
