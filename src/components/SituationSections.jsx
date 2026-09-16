import React from 'react'

/**
 * Renders behavioural content as situations a person can place themselves in
 * ("on a good day", "when you overdo it") rather than as a list of attributes.
 *
 * Shared by Results (the report card) and Profile (the persistent version) so
 * the two can't drift apart. Content still comes entirely from db.json — see
 * src/situations.js.
 */

// Tone comes from the model, not from a component guessing at keys. A caution
// frame must never be tinted like a compliment: "when you overdo it" reading
// as praise is exactly the misunderstanding this page is trying to remove.
const TONE = {
  positive: { icon: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15', rule: 'bg-emerald-500/60' },
  caution: { icon: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20', rule: 'bg-amber-500/60' },
  neutral: { icon: 'bg-gray-100 text-gray-700 ring-1 ring-gray-900/[0.04]', rule: 'bg-gray-300' },
}

export function SituationJumpLinks({ situations, idPrefix, heading = 'Jump to' }) {
  if (!situations?.length) return null
  return (
    <nav aria-label={heading} className="card mb-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">{heading}</p>
      <ul className="flex flex-wrap gap-2">
        {situations.map(s => (
          <li key={s.key}>
            <a
              href={`#${idPrefix}-${s.key}`}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700
                ring-1 ring-gray-900/[0.04] hover:bg-gray-100 hover:text-gray-900 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              <span aria-hidden="true">{s.icon}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function SituationSections({ situations, idPrefix = 'situation' }) {
  if (!situations?.length) return null

  return (
    <div className="space-y-6">
      {situations.map(s => {
        const tone = TONE[s.tone] || TONE.neutral
        return (
          <section key={s.key} id={`${idPrefix}-${s.key}`} className="card scroll-mt-24">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`grid place-items-center w-9 h-9 rounded-xl text-base leading-none shrink-0 ${tone.icon}`}
              >
                {s.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 text-lg tracking-tight">{s.label}</h2>
                <p className="text-sm text-gray-500 mt-1">{s.blurb}</p>
              </div>
            </div>

            <ul className="space-y-2 mt-4">
              {s.primary.items.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-xl ${s.primary.cfg.bgLight} ring-1 ring-gray-900/[0.03]`}
                >
                  <span aria-hidden="true" className={`${s.primary.cfg.text} mt-0.5 shrink-0`}>▸</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            {s.secondary.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  From your supporting{' '}
                  <span className={`font-medium ${s.secondary.cfg.text}`}>
                    {s.secondary.cfg.emoji} {s.secondary.colourName}
                  </span>{' '}
                  energy
                </p>
                <ul className="space-y-2">
                  {s.secondary.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className={`${s.secondary.cfg.text} mt-0.5 shrink-0 text-xs`}>▸</span>
                      <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
