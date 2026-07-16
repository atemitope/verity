import React from 'react'
import { colourConfig } from '../colours'

// What the assessment gives you. Kept as plain language: these are labels,
// not decoration, so they carry no icons.
const DISCOVER = [
  'Your spectrum scores across all four colour energies',
  'Strengths and potential blind spots',
  'Communication tips for different styles',
  'Personalised next steps and experiments',
  'Colour-specific challenges to grow',
  'Optional team mode for group insights',
]

/**
 * One colour energy. The swatch is a full-height bar with no gap above or
 * below, so the four rows stack into a single continuous spectrum down the
 * panel's edge, which is the idea the whole product rests on.
 */
function EnergyRow({ colourKey, db, first }) {
  const colour = db.colours[colourKey]
  const cfg = colourConfig(colourKey)
  return (
    <div className="flex items-stretch">
      <span aria-hidden="true" className="w-2 shrink-0" style={{ backgroundColor: cfg.hex }} />
      <div className={`min-w-0 flex-1 p-4 ${first ? '' : 'border-t border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${cfg.textDark}`}>{colour.display_name}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{colour.core_drive}</p>
      </div>
    </div>
  )
}

export default function Home({ db, state, onStart, onNavigate }) {
  const hasResults = !!state.scores
  const colourKeys = db.scoring.colour_keys
  // Real count, derived the same way the quiz runner does it.
  const itemCount = db.questionnaire.items.length

  return (
    <div className="animate-fade-in">
      {/* Hero. Asymmetric split: the value prop leads (the brand wordmark already
          sits in the header), the four energies carry the visual instead of a
          decorative graphic. Collapses to one column < md. */}
      <section className="grid items-center gap-10 pb-14 pt-2 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
        <div className="stagger">
          <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
            Know how you actually work.
          </h1>
          <p className="mb-8 max-w-[46ch] text-lg leading-relaxed text-gray-600">
            A {itemCount}-question assessment maps your behavioural preferences across four
            colour energies, then turns them into practical next steps.
          </p>

          <div>
            {hasResults ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => onNavigate('results')}
                  className="btn-primary bg-gray-900 hover:bg-gray-800"
                >
                  View My Results
                </button>
                <button onClick={() => onNavigate('quiz')} className="btn-ghost ring-1 ring-gray-900/10">
                  Retake Quiz
                </button>
              </div>
            ) : (
              <button
                onClick={onStart}
                className="btn-primary group bg-gray-900 text-lg hover:bg-gray-800 px-8 py-4"
              >
                Start My Profile
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </button>
            )}
          </div>
        </div>

        {/* The four energies. Grouped by hairlines rather than four peer cards,
            and swatched with the real brand colour instead of an emoji. */}
        <div>
          <h2 className="sr-only">The four colour energies</h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-900/[0.05]">
            {colourKeys.map((key, i) => (
              <EnergyRow key={key} colourKey={key} db={db} first={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Snapshot, once a profile exists. Stays in the page's light theme. */}
      {hasResults && (
        <section className="pb-12">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Your profile at a glance</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-2xl bg-white p-5 shadow-card ring-1 ring-gray-900/[0.05] sm:grid-cols-4">
            {[
              { label: 'Dominant energy', value: db.colours[state.scores.dominantColour].display_name, key: state.scores.dominantColour },
              { label: 'Secondary energy', value: db.colours[state.scores.secondaryColour].display_name, key: state.scores.secondaryColour },
              { label: 'Confidence', value: `${state.scores.confidence}%` },
              { label: 'Tier', value: state.gamification.tier.replace('tier_', '') || 'None' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-gray-500">{stat.label}</dt>
                <dd className="mt-1 flex items-center gap-2">
                  {stat.key && (
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: colourConfig(stat.key).hex }}
                    />
                  )}
                  <span className="font-semibold capitalize text-gray-900 tnums">{stat.value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* What you get. Rule-separated two-column list, not a grid of cards. */}
      <section className="pb-12">
        <h2 className="mb-2 text-lg font-bold text-gray-900">What you'll discover</h2>
        <ul className="grid sm:grid-cols-2 sm:gap-x-10">
          {DISCOVER.map((item) => (
            <li
              key={item}
              className="border-t border-gray-200/80 py-3.5 text-sm leading-relaxed text-gray-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Interpretation note. Distinct from the mandated footer disclaimer. */}
      <p className="border-t border-gray-200/80 pt-5 text-xs leading-relaxed text-gray-500">
        This is a behavioural preference tool for self-awareness, not a clinical assessment.
        Results are indicative, not diagnostic.
      </p>
    </div>
  )
}
