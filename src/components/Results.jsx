import React, { useState } from 'react'
import { colourConfig } from '../colours'

function SpectrumBar({ colour, score, maxScore, label, cfg, rank }) {
  const pct = (score / 6) * 100
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{cfg.emoji}</span>
          <span className="font-medium text-sm text-gray-800">{label}</span>
          {rank === 0 && (
            <span className={`badge-pill text-[10px] py-0.5 ${cfg.bgLight} ${cfg.textDark} ring-1 ${cfg.ring}`}>Dominant</span>
          )}
        </div>
        <span className="text-sm font-bold text-gray-700 tnums tracking-tight">
          {score.toFixed(2)} <span className="text-gray-500 font-normal">/ 6</span>
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden ring-1 ring-gray-900/[0.04]">
        <div
          className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full spectrum-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Results({ db, state, onViewReport, onNavigate }) {
  const { scores } = state
  const [showExplainer, setShowExplainer] = useState(false)

  const colours = db.scoring.colour_keys
  const sorted = scores.sortedColours

  const dominantCfg = colourConfig(scores.dominantColour)
  const secondaryCfg = colourConfig(scores.secondaryColour)

  return (
    <div className="animate-fade-in">
      {/* Hero result */}
      <div className={`card sheen relative overflow-hidden mb-6 ring-0 bg-gradient-to-br ${dominantCfg.hero} ${dominantCfg.heroFg} shadow-[0_10px_30px_-8px_rgba(16,24,40,0.35)]`}>
        <div className="absolute -right-6 -bottom-8 text-[9rem] leading-none opacity-15 select-none" aria-hidden="true">
          {dominantCfg.emoji}
        </div>
        <div className="text-center py-4 relative">
          <p className={`${dominantCfg.heroFgSoft} text-xs uppercase tracking-[0.15em] mb-2`}>Your dominant energy</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">
            {dominantCfg.emoji} {db.colours[scores.dominantColour].display_name}
          </h1>
          <p className={`${dominantCfg.heroFgSoft} text-sm mb-4 max-w-md mx-auto leading-relaxed`}>{db.colours[scores.dominantColour].core_drive}</p>
          <div className="flex justify-center gap-3 text-sm">
            <div className={`${dominantCfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-4 py-2`}>
              <p className={`${dominantCfg.heroFgSoft} text-xs mb-0.5`}>Secondary</p>
              <p className="font-semibold">{secondaryCfg.emoji} {db.colours[scores.secondaryColour].display_name}</p>
            </div>
            <div className={`${dominantCfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-4 py-2`}>
              <p className={`${dominantCfg.heroFgSoft} text-xs mb-0.5`}>Confidence</p>
              <p className="font-semibold tnums">{scores.confidence}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spectrum scores */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Spectrum Scores</h2>
        {sorted.map((colourKey, i) => (
          <SpectrumBar
            key={colourKey}
            colour={colourKey}
            rank={i}
            score={scores.spectrumScores[colourKey]}
            cfg={colourConfig(colourKey)}
            label={db.colours[colourKey].display_name}
          />
        ))}
      </div>

      {/* Explainability panel */}
      <div className="card mb-6">
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="flex justify-between items-center w-full group focus:outline-none"
        >
          <h2 className="font-bold text-gray-900 group-hover:text-gray-600 transition-colors">🔍 Explainability Panel</h2>
          <span className={`text-gray-500 transition-transform duration-300 ${showExplainer ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showExplainer && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Raw vs Max */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Raw Points & Normalisation</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Colour</th>
                      <th className="pb-2 text-right">Raw</th>
                      <th className="pb-2 text-right">Max</th>
                      <th className="pb-2 text-right">Score (0–6)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colours.map(c => (
                      <tr key={c} className="border-b border-gray-50">
                        <td className="py-1.5 font-medium">{db.colours[c].display_name}</td>
                        <td className="py-1.5 text-right tnums">{scores.rawPoints[c].toFixed(1)}</td>
                        <td className="py-1.5 text-right tnums">{scores.maxPoints[c].toFixed(1)}</td>
                        <td className="py-1.5 text-right font-bold tnums">{scores.spectrumScores[c].toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">Formula: 6 × raw ÷ max</p>
            </div>

            {/* Derived metrics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Derived Metrics</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Top gap', value: scores.topGap.toFixed(3) },
                  { label: 'Range', value: scores.range.toFixed(3) },
                  { label: 'Balance index', value: scores.balanceIndex.toFixed(3) },
                  { label: 'Red–Green polarity', value: scores.polarityRedGreen.toFixed(3) },
                  { label: 'Blue–Yellow polarity', value: scores.polarityBlueYellow.toFixed(3) },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-2.5 ring-1 ring-gray-900/[0.03]">
                    <p className="text-xs text-gray-500">{m.label}</p>
                    <p className="font-bold tnums">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Confidence Score: {scores.confidence}%</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Spread', value: scores.confidenceInputs.spread.toFixed(3) },
                  { label: 'Top gap', value: scores.confidenceInputs.topGap.toFixed(3) },
                  { label: 'Forced alignment', value: `${(scores.confidenceInputs.forcedAlignment * 100).toFixed(0)}%` },
                  { label: 'Supporting (FC)', value: `${scores.confidenceInputs.forcedChoicesSupportingTop2Count}/${scores.confidenceInputs.totalForcedChoices}` },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-2.5 ring-1 ring-gray-900/[0.03]">
                    <p className="text-xs text-gray-500">{m.label}</p>
                    <p className="font-bold tnums">{m.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Confidence = 20 + 25×spread + 25×top_gap + 30×forced_alignment (−15 if spread &lt; 1).
                Not a claim of correctness against proprietary instruments.
              </p>
            </div>

            {/* Interpretation rules */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Balance Profile</h3>
              <p className="text-sm text-gray-600">
                {scores.balanceIndex >= 0.8
                  ? 'Flat profile — your energies are broadly balanced. All four colours contribute roughly equally.'
                  : scores.balanceIndex >= 0.5
                  ? 'Moderately differentiated — some colours emerge more strongly than others.'
                  : 'Strongly differentiated — clear dominant energy with significant contrasts.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onViewReport}
          className="btn-primary bg-gradient-to-r from-slate-700 to-slate-900 flex-1"
        >
          📄 Read Full Report
        </button>
        <button
          onClick={() => onNavigate('challenges')}
          className="btn-primary bg-gradient-to-r from-orange-700 to-red-600 flex-1"
        >
          ⚡ Start Challenges
        </button>
      </div>
    </div>
  )
}
