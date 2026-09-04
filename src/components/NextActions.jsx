import React from 'react'
import { colourConfig } from '../colours'

/**
 * The actions, with their content shown rather than hidden behind a button.
 *
 * Results used to end in "⚡ Start Challenges" and "📄 Read Full Report" —
 * two labels that ask for a click without showing what's on the other side.
 * The tailored content already existed (generateReport() picks next steps by
 * dominant, lowest and secondary colour, and an experiment from the dominant
 * colour's challenges); it was only ever rendered inside the report. Showing
 * it here means the reader can see the value before deciding to act on it.
 */
export default function NextActions({ db, state, onNavigate, onViewReport, id = 'next' }) {
  const { scores, report } = state
  if (!report) return null

  const completed = state.gamification?.completedChallenges || {}
  const dominantCfg = colourConfig(scores.dominantColour)

  // Feature the first challenge they haven't done yet, so this section keeps
  // moving instead of re-offering finished work.
  const dominantChallenges = db.gamification.mechanics_catalogue.challenges_by_colour[scores.dominantColour] || []
  const featured = dominantChallenges.find(c => !completed[c.challenge_id]) || null
  const allDone = dominantChallenges.length > 0 && !featured

  return (
    <section id={id} className="card scroll-mt-24">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid place-items-center w-9 h-9 rounded-xl bg-gray-100 text-base leading-none shrink-0 ring-1 ring-gray-900/[0.04]"
        >
          🎯
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 text-lg tracking-tight">What to do about it</h2>
          <p className="text-sm text-gray-500 mt-1">
            Picked for your pattern — one to amplify, one to watch, and something to try for two weeks.
          </p>
        </div>
      </div>

      {/* The 14-day experiment, shown in full rather than named. */}
      {featured && (
        <div className={`mt-5 rounded-2xl p-4 ${dominantCfg.bgLight} ring-1 ring-gray-900/[0.04]`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${dominantCfg.text} mb-1.5`}>
            Your 14-day experiment
          </p>
          <h3 className="font-bold text-gray-900">{featured.title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed mt-1.5">{featured.description}</p>
          <button
            onClick={() => onNavigate('challenges')}
            className={`btn-primary ${dominantCfg.solid} ${dominantCfg.solidFg} text-sm mt-4`}
          >
            Start this challenge
          </button>
        </div>
      )}

      {allDone && (
        <p className="mt-5 text-sm text-gray-600">
          You've completed every challenge for your dominant energy.{' '}
          <button
            onClick={() => onNavigate('challenges')}
            className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            Try one from another colour →
          </button>
        </p>
      )}

      {/* The three tailored next steps generateReport() already computed. */}
      {report.nextSteps?.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Three things to try
          </p>
          <ul className="space-y-2">
            {report.nextSteps.map((step, i) => {
              const cfg = colourConfig(step.colour)
              return (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 ring-1 ring-gray-900/[0.03]">
                  <span aria-hidden="true" className="shrink-0 mt-0.5 text-sm leading-none">{cfg.emoji}</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{step.text}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-sm text-gray-600 leading-relaxed">
          Everything above, plus your full strengths and communication breakdown, is written up as a
          document you can keep or send on.
        </p>
        <button
          onClick={onViewReport}
          className="btn-ghost ring-1 ring-gray-900/10 text-sm mt-3"
        >
          📄 Read the full report
        </button>
      </div>
    </section>
  )
}
