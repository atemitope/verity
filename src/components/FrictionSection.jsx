import React from 'react'

function ColourColumns({ energy }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          People who lead with it tend to
        </p>
        <ul className="space-y-2">
          {energy.theirBehaviours.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span aria-hidden="true" className={`${energy.cfg.text} mt-0.5 shrink-0 text-xs`}>▸</span>
              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Working well with them
        </p>
        <ul className="space-y-2">
          {energy.workingWithThem.map((item, i) => (
            <li
              key={i}
              className={`flex items-start gap-2.5 p-3 rounded-xl ${energy.cfg.bgLight} ring-1 ring-gray-900/[0.03]`}
            >
              <span aria-hidden="true" className={`${energy.cfg.text} mt-0.5 shrink-0`}>▸</span>
              <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Where friction comes from.
 *
 * Two different things live here and the difference matters. Your *opposite*
 * energy is structural — fixed by the polarity axes in db.json, and where
 * misunderstandings concentrate whatever you scored. Your *least-used* energy
 * is empirical: whichever colour you happened to score lowest. They often
 * coincide; when they don't, saying so is more honest than picking one and
 * hoping. A low score also isn't a deficit — it's where your instincts differ
 * most from other people, which is what interpretation_rules warns about.
 */
export default function FrictionSection({ opposite, lowEnergy, id = 'friction' }) {
  if (!opposite && !lowEnergy) return null

  const showsSeparateLowest =
    opposite && lowEnergy && !opposite.isAlsoLowest && lowEnergy.colourKey !== opposite.colourKey

  return (
    <section id={id} className="card scroll-mt-24">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid place-items-center w-9 h-9 rounded-xl bg-gray-100 text-base leading-none shrink-0 ring-1 ring-gray-900/[0.04]"
        >
          🧲
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 text-lg tracking-tight">Where friction comes from</h2>
          <p className="text-sm text-gray-500 mt-1">
            Most misunderstandings aren't about the work. They're about the gap between how you
            operate and how the person across from you does.
          </p>
        </div>
      </div>

      {opposite && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Your opposite energy is{' '}
            <span className={`font-medium ${opposite.cfg.text}`}>
              {opposite.cfg.emoji} {opposite.colourName}
            </span>
            {typeof opposite.score === 'number' && (
              <span className="tnums text-gray-500"> ({opposite.score.toFixed(1)}/6)</span>
            )}
            {opposite.definition && (
              <>
                {' '}— the far end of the same axis:{' '}
                <span className="italic">{opposite.definition.toLowerCase()}</span>
              </>
            )}
            .{' '}
            {opposite.isAlsoLowest
              ? "It's also your lowest score, so this is the clearest place to expect friction."
              : "That's true whatever you scored on it."}
          </p>
          <ColourColumns energy={opposite} />
        </div>
      )}

      {showsSeparateLowest && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Separately, the energy you use <em>least</em> is{' '}
            <span className={`font-medium ${lowEnergy.cfg.text}`}>
              {lowEnergy.cfg.emoji} {lowEnergy.colourName}
            </span>
            {typeof lowEnergy.score === 'number' && (
              <span className="tnums text-gray-500"> ({lowEnergy.score.toFixed(1)}/6)</span>
            )}
            . Not a weakness — just the instinct you reach for last, so it's the one you're most
            likely to overlook in someone else.
          </p>
          <ColourColumns energy={lowEnergy} />
        </div>
      )}

      {!opposite && lowEnergy && <div className="mt-4"><ColourColumns energy={lowEnergy} /></div>}
    </section>
  )
}
