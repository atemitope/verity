import React from 'react'
import { colourConfig } from '../colours'

function Section({ title, icon, children }) {
  return (
    <div className="mb-6">
      <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

function BulletList({ items, cfg }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className={`flex items-start gap-2 p-3 rounded-xl ${cfg.bgLight}`}>
          <span className={`${cfg.text} mt-0.5`}>▸</span>
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
      <div className={`card mb-6 bg-gradient-to-br ${domCfg.gradient} text-white text-center py-8`}>
        <p className="text-white/80 text-sm mb-1">Colour Spectrum Profile Report</p>
        <h1 className="text-3xl font-bold mb-2">
          {domCfg.emoji} {domColour.display_name} · {secCfg.emoji} {secColour.display_name}
        </h1>
        {report.blurbLabel && (
          <p className="text-white/90 text-lg font-medium mt-2">{report.blurbLabel}</p>
        )}
        <p className="text-white/70 text-xs mt-3">
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
          className="btn-primary bg-gray-700 text-sm"
        >
          📥 Export JSON
        </button>
        <button
          onClick={() => onNavigate('challenges')}
          className="btn-primary bg-orange-500 text-sm"
        >
          ⚡ Start Challenges
        </button>
      </div>

      <div className="card mb-6">
        <Section title="Profile Summary" icon="🎯">
          <p className="text-gray-700 leading-relaxed">{report.profileSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl ${domCfg.bgLight}`}>
              <p className={`text-xs ${domCfg.text} font-semibold mb-1`}>Core drive</p>
              <p className="text-sm text-gray-700">{domColour.core_drive}</p>
            </div>
            <div className={`p-3 rounded-xl ${secCfg.bgLight}`}>
              <p className={`text-xs ${secCfg.text} font-semibold mb-1`}>Supporting drive</p>
              <p className="text-sm text-gray-700">{secColour.core_drive}</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="Spectrum Scores & Explainability" icon="📊">
          {db.scoring.colour_keys.map(c => {
            const cfg = colourConfig(c)
            const score = scores.spectrumScores[c]
            return (
              <div key={c} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{cfg.emoji} {db.colours[c].display_name}</span>
                  <span className="text-gray-500">
                    {scores.rawPoints[c].toFixed(0)} / {scores.maxPoints[c].toFixed(0)} pts → <strong>{score.toFixed(2)}/6</strong>
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cfg.fill} rounded-full spectrum-fill`} style={{ width: `${(score / 6) * 100}%` }} />
                </div>
              </div>
            )
          })}
          <p className="text-xs text-gray-400 mt-3">
            Confidence: {scores.confidence}% · Balance index: {scores.balanceIndex.toFixed(2)} · Top gap: {scores.topGap.toFixed(2)}
          </p>
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="Strengths" icon="💪">
          <BulletList items={report.strengths} cfg={domCfg} />
          <p className="text-xs text-gray-400 mt-2">3 from {domColour.display_name}, 2 from {secColour.display_name}</p>
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="Possible Challenges" icon="⚠️">
          <BulletList items={report.challenges} cfg={{ bgLight: 'bg-gray-50', text: 'text-gray-500' }} />
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="Communication Tips" icon="💬">
          <BulletList items={report.commTips} cfg={secCfg} />
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="Under Pressure" icon="🌡️">
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
        <Section title="How to Work With You" icon="🤝">
          <BulletList items={report.howToWorkWith} cfg={domCfg} />
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="Next Steps" icon="🎯">
          <div className="space-y-3">
            {report.nextSteps.map((step, i) => {
              const cfg = colourConfig(step.colour)
              return (
                <div key={i} className={`p-4 rounded-xl border ${cfg.border} ${cfg.bgLight}`}>
                  <p className={`text-xs font-semibold ${cfg.text} mb-1`}>
                    {cfg.emoji} {db.colours[step.colour].display_name}
                  </p>
                  <p className="text-sm text-gray-700">{step.text}</p>
                </div>
              )
            })}
          </div>
        </Section>
      </div>

      <div className="card mb-6">
        <Section title="14-Day Experiment" icon="🧪">
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

      <div className="card mb-6 bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-700">
          <strong>Disclaimer:</strong> This report is generated from a self-reported behavioural preference questionnaire.
          It is intended as a tool for self-awareness and professional development, not a clinical or psychological assessment.
          Results are not verified against the proprietary Insights Discovery® instrument.
        </p>
      </div>
    </div>
  )
}
