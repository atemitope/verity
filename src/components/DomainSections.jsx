import React from 'react'

/**
 * Renders the behavioural domains as answers to questions a person actually
 * asks ("How do I communicate?"), rather than as report sections.
 *
 * Shared by the Profile view (browsable) and the Report (document), so the
 * two can't drift apart.
 */
export default function DomainSections({ domains, showJumpLinks = true, idPrefix = 'domain' }) {
  if (!domains?.length) return null

  return (
    <div>
      {showJumpLinks && (
        <nav aria-label="Jump to a question" className="card mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            What would you like to know?
          </p>
          <ul className="flex flex-wrap gap-2">
            {domains.map(d => (
              <li key={d.key}>
                <a
                  href={`#${idPrefix}-${d.key}`}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700
                    ring-1 ring-gray-900/[0.04] hover:bg-gray-100 hover:text-gray-900 transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  <span aria-hidden="true">{d.icon}</span>
                  {d.question}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="space-y-6">
        {domains.map(d => (
          <section key={d.key} id={`${idPrefix}-${d.key}`} className="card scroll-mt-24">
            <h2 className="font-bold text-gray-900 text-lg tracking-tight flex items-center gap-2.5">
              <span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-xl bg-gray-100 text-base leading-none shrink-0">
                {d.icon}
              </span>
              {d.question}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 mb-4">{d.blurb}</p>

            <ul className="space-y-2">
              {d.primary.items.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-xl ${d.primary.cfg.bgLight} ring-1 ring-gray-900/[0.03]`}
                >
                  <span aria-hidden="true" className={`${d.primary.cfg.text} mt-0.5 shrink-0`}>▸</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            {d.secondary.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  From your supporting{' '}
                  <span className={`font-medium ${d.secondary.cfg.text}`}>
                    {d.secondary.cfg.emoji} {d.secondary.colourName}
                  </span>{' '}
                  energy
                </p>
                <ul className="space-y-2">
                  {d.secondary.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className={`${d.secondary.cfg.text} mt-0.5 shrink-0 text-xs`}>▸</span>
                      <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
