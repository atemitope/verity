import React from 'react'
import { colourConfig } from '../colours'

function Section({ id, title, icon, children }) {
  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2.5 tracking-tight">
        <span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-xl bg-gray-100 text-base leading-none shrink-0">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

/**
 * Marks a shift in what the reader is doing: getting oriented, reading about
 * themselves, deciding what to act on, or checking the maths. The report was
 * ten visually identical cards, so nothing signalled where they were.
 */
function GroupHeading({ label, hint }) {
  return (
    <div className="mt-10 mb-4 px-1">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</p>
      {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

const CONTENTS = [
  { id: 'how-to-use', label: 'How to use this report' },
  { id: 'summary', label: 'Profile summary' },
  { id: 'great-at', label: "What you're great at" },
  { id: 'watch-for', label: 'What to watch for' },
  { id: 'communicate', label: 'How you communicate' },
  { id: 'pressure', label: 'Under pressure' },
  { id: 'work-with', label: 'Working with you' },
  { id: 'next', label: 'What to try next' },
  { id: 'experiment', label: '14-day experiment' },
  { id: 'appendix', label: 'Appendix' },
]

function BulletList({ items, cfg }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${cfg.bgLight} ring-1 ring-gray-900/[0.03]`}>
          <span className={`${cfg.text} mt-0.5 shrink-0`}>▸</span>
          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Report({ db, state, onExport, onExportPdf, onNavigate }) {
  const { report, scores } = state
  const domCfg = colourConfig(scores.dominantColour)
  const secCfg = colourConfig(scores.secondaryColour)
  const domColour = db.colours[scores.dominantColour]
  const secColour = db.colours[scores.secondaryColour]

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Cover */}
      <div className={`card sheen relative overflow-hidden mb-6 ring-0 bg-gradient-to-br ${domCfg.hero} ${domCfg.heroFg} text-center py-9 shadow-[0_10px_30px_-8px_rgba(16,24,40,0.35)]`}>
        <p className={`${domCfg.heroFgSoft} text-xs uppercase tracking-[0.15em] mb-2 relative`}>Verity Report</p>
        <h1 className="text-3xl font-bold mb-2 tracking-tight relative">
          {domCfg.emoji} {domColour.display_name} · {secCfg.emoji} {secColour.display_name}
        </h1>
        {report.blurbLabel && (
          <p className="text-lg font-medium mt-2 relative">{report.blurbLabel}</p>
        )}
        <p className={`${domCfg.heroFgSoft} text-xs mt-3 relative tnums`}>
          Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Export */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={onExportPdf}
          className="btn-primary bg-indigo-600 text-sm"
        >
          📄 Download PDF
        </button>
        <button
          onClick={onExport}
          className="btn-primary bg-gray-800 text-sm"
        >
          📥 Export JSON
        </button>
        <button
          onClick={() => onNavigate('challenges')}
          className="btn-primary bg-gradient-to-r from-orange-700 to-red-600 text-sm"
        >
          ⚡ Start Challenges
        </button>
      </div>

      {/* Contents — the report is ten sections long, so it needs to be
          returnable-to rather than a single scroll. */}
      <nav aria-label="Report contents" className="card mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">Contents</p>
        <ul className="flex flex-wrap gap-2">
          {CONTENTS.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-block text-sm px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 ring-1 ring-gray-900/[0.04]
                  hover:bg-gray-100 hover:text-gray-900 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* "Purpose and how to use this report" — spec'd in db.json's
          report_templates section list but never built. Orientation for
          someone who has just met this report for the first time. */}
      <div className="card mb-6">
        <Section id="how-to-use" title="How to use this report" icon="🧭">
          <p className="text-gray-700 leading-relaxed">
            {db.report_templates.individual_report_v1.purpose}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            Each section answers a question about how you tend to work. Nothing here is a verdict —
            these are patterns you'll recognise more in some situations than others. The scoring
            behind them is in the appendix at the end.
          </p>
        </Section>
      </div>

      <div className="card mb-6">
        <Section id="summary" title="Profile Summary" icon="🎯">
          <p className="text-gray-700 leading-relaxed">{report.profileSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl ${domCfg.bgLight} ring-1 ${domCfg.ring}`}>
              <p className={`text-xs ${domCfg.text} font-semibold mb-1 uppercase tracking-wide`}>Core drive</p>
              <p className="text-sm text-gray-700 leading-relaxed">{domColour.core_drive}</p>
            </div>
            <div className={`p-3 rounded-xl ${secCfg.bgLight} ring-1 ${secCfg.ring}`}>
              <p className={`text-xs ${secCfg.text} font-semibold mb-1 uppercase tracking-wide`}>Supporting drive</p>
              <p className="text-sm text-gray-700 leading-relaxed">{secColour.core_drive}</p>
            </div>
          </div>
        </Section>
      </div>


      <GroupHeading
        label="Your patterns"
        hint="How you tend to work, described five ways."
      />

      <div className="card mb-6">
        <Section id="great-at" title="What you're great at" icon="💪">
          <BulletList items={report.strengths} cfg={domCfg} />
          <p className="text-xs text-gray-500 mt-2">3 from {domColour.display_name}, 2 from {secColour.display_name}</p>
        </Section>
      </div>

      <div className="card mb-6">
        <Section id="watch-for" title="What to watch for" icon="👀">
          <BulletList items={report.challenges} cfg={{ bgLight: 'bg-gray-50', text: 'text-gray-500' }} />
        </Section>
      </div>

      <div className="card mb-6">
        <Section id="communicate" title="How you communicate" icon="💬">
          <BulletList items={report.commTips} cfg={secCfg} />
        </Section>
      </div>

      <div className="card mb-6">
        <Section id="pressure" title="How you are under pressure" icon="🌡️">
          <div className={`p-4 rounded-xl ${domCfg.bgLight} mb-3`}>
            <p className="text-sm text-gray-700 font-medium mb-1">Stress pattern:</p>
            <p className="text-sm text-gray-600 leading-relaxed">{report.underPressure.pattern}</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50">
            <p className="text-sm text-gray-700 font-medium mb-1">Mitigation:</p>
            <p className="text-sm text-gray-600 leading-relaxed">{report.underPressure.mitigation}</p>
          </div>
        </Section>
      </div>

      <div className="card mb-6">
        <Section id="work-with" title="How others should work with you" icon="🤝">
          <BulletList items={report.howToWorkWith} cfg={domCfg} />
        </Section>
      </div>

      <GroupHeading
        label="What to do about it"
        hint="Small, specific things to try — not a personality verdict."
      />

      <div className="card mb-6">
        <Section id="next" title="What to try next" icon="🎯">
          <div className="space-y-3">
            {report.nextSteps.map((step, i) => {
              const cfg = colourConfig(step.colour)
              return (
                <div key={i} className={`p-4 rounded-xl ring-1 ${cfg.ring} ${cfg.bgLight} transition-transform duration-150 hover:-translate-y-0.5`}>
                  <p className={`text-xs font-semibold ${cfg.text} mb-1 uppercase tracking-wide`}>
                    {cfg.emoji} {db.colours[step.colour].display_name}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{step.text}</p>
                </div>
              )
            })}
          </div>
        </Section>
      </div>

      <div className="card mb-6">
        <Section id="experiment" title="14-Day Experiment" icon="🧪">
          <div className={`p-4 rounded-xl ${domCfg.bgMed}`}>
            <h3 className={`font-bold ${domCfg.textDark} mb-2`}>{report.experiment.title}</h3>
            <p className="text-sm text-gray-700 mb-4">{report.experiment.description}</p>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Daily check-in prompts:</p>
              {db.reflection_prompts.weekly_checkin.map((prompt, i) => (
                <p key={i} className="text-xs text-gray-500 mb-1">• {prompt}</p>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Spec section 11, "Appendix: scoring transparency and exports".
          Moved out of position 3 so the narrative is not interrupted by
          maths — every number is still here, in full. */}
      <GroupHeading
        label="Reference"
        hint="Every number behind the sections above."
      />

      <div className="card mb-6 bg-gray-50/60">
        <Section id="appendix" title="Appendix: scoring transparency" icon="📊">
          {db.scoring.colour_keys.map(c => {
            const cfg = colourConfig(c)
            const score = scores.spectrumScores[c]
            return (
              <div key={c} className="mb-3 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{cfg.emoji} {db.colours[c].display_name}</span>
                  <span className="text-gray-500 tnums">
                    {scores.rawPoints[c].toFixed(0)} / {scores.maxPoints[c].toFixed(0)} pts → <strong className="text-gray-700">{score.toFixed(2)}/6</strong>
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden ring-1 ring-gray-900/[0.04]">
                  <div className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full spectrum-fill`} style={{ width: `${(score / 6) * 100}%` }} />
                </div>
              </div>
            )
          })}
          <p className="text-xs text-gray-500 mt-3 tnums">
            Confidence: {scores.confidence}% · Balance index: {scores.balanceIndex.toFixed(2)} · Top gap: {scores.topGap.toFixed(2)}
          </p>
        </Section>
      </div>

      <div className="card mb-6 bg-amber-50 ring-1 ring-amber-500/15">
        <p className="text-xs text-amber-800/90 leading-relaxed">
          <strong>Disclaimer:</strong> This report is generated from a self-reported behavioural preference questionnaire.
          It is intended as a tool for self-awareness and professional development, not a clinical or psychological assessment.
          Results are not verified against the proprietary Insights Discovery® instrument.
        </p>
      </div>
    </div>
  )
}
