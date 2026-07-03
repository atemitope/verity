/**
 * Client-side PDF export of the Colour Spectrum Profile report.
 *
 * Renders a vector/text PDF (selectable text) from the already-generated
 * `report` (state.report) and `scores` (state.scores) objects plus `db`.
 * No report content is hardcoded here — everything comes from those inputs.
 *
 * Uses jsPDF (well-maintained, tiny, no DOM/canvas screenshot needed).
 */
import { jsPDF } from 'jspdf'
import { colourConfig } from './colours'

// A4 portrait, points. 1pt = 1/72 inch.
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN * 2

const COLOURS = {
  ink: [31, 41, 55], // gray-800
  muted: [107, 114, 128], // gray-500
  faint: [156, 163, 175], // gray-400
  line: [229, 231, 235], // gray-200
  white: [255, 255, 255],
  amberBg: [255, 251, 235],
  amberInk: [180, 83, 9],
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/**
 * Build and trigger download of the report PDF.
 * @returns {string} the filename used.
 */
export function exportReportPdf(state, db) {
  const { report, scores } = state
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const domCfg = colourConfig(scores.dominantColour)
  const secCfg = colourConfig(scores.secondaryColour)
  const domName = db.colours[scores.dominantColour].display_name
  const secName = db.colours[scores.secondaryColour].display_name

  let y = MARGIN

  // ---- helpers -------------------------------------------------------------
  function ensureSpace(needed) {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function setFont(size, style = 'normal', rgb = COLOURS.ink) {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(rgb[0], rgb[1], rgb[2])
  }

  /** Draw wrapped paragraph text; returns new y. */
  function paragraph(text, { size = 10, style = 'normal', rgb = COLOURS.ink, lineGap = 4, x = MARGIN, width = CONTENT_W, indent = 0 } = {}) {
    if (text == null || text === '') return
    setFont(size, style, rgb)
    const lines = doc.splitTextToSize(String(text), width - indent)
    const lineH = size * 1.15
    lines.forEach((ln) => {
      ensureSpace(lineH)
      doc.text(ln, x + indent, y)
      y += lineH
    })
    y += lineGap
  }

  function sectionHeading(title) {
    ensureSpace(30)
    y += 6
    setFont(13, 'bold', COLOURS.ink)
    doc.text(title, MARGIN, y)
    y += 6
    doc.setDrawColor(COLOURS.line[0], COLOURS.line[1], COLOURS.line[2])
    doc.setLineWidth(0.75)
    doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 14
  }

  function bullet(text, dotRgb = domCfg ? hexToRgb(domCfg.hex) : COLOURS.muted) {
    setFont(10, 'normal', COLOURS.ink)
    const indent = 16
    const lines = doc.splitTextToSize(String(text), CONTENT_W - indent)
    const lineH = 10 * 1.15
    ensureSpace(lineH * lines.length + 3)
    // marker
    doc.setFillColor(dotRgb[0], dotRgb[1], dotRgb[2])
    doc.circle(MARGIN + 4, y - 3, 2.2, 'F')
    lines.forEach((ln, i) => {
      doc.text(ln, MARGIN + indent, y)
      y += lineH
    })
    y += 3
  }

  // ---- cover banner --------------------------------------------------------
  const banner = hexToRgb(domCfg.hex)
  doc.setFillColor(banner[0], banner[1], banner[2])
  doc.rect(0, 0, PAGE_W, 132, 'F')
  setFont(10, 'normal', COLOURS.white)
  doc.text('Colour Spectrum Profile Report', MARGIN, 46)
  setFont(22, 'bold', COLOURS.white)
  doc.text(`${domName}  ·  ${secName}`, MARGIN, 76)
  if (report.blurbLabel) {
    setFont(12, 'normal', COLOURS.white)
    doc.text(String(report.blurbLabel), MARGIN, 98)
  }
  setFont(9, 'normal', COLOURS.white)
  doc.text(`Generated ${new Date().toLocaleDateString()}`, MARGIN, 118)
  y = 132 + 28

  // ---- profile summary -----------------------------------------------------
  sectionHeading('Profile Summary')
  paragraph(report.profileSummary, { size: 10.5, lineGap: 8 })

  const domDrive = db.colours[scores.dominantColour].core_drive
  const secDrive = db.colours[scores.secondaryColour].core_drive
  paragraph(`Core drive (${domName}): ${domDrive}`, { size: 9.5, rgb: COLOURS.muted, lineGap: 2 })
  paragraph(`Supporting drive (${secName}): ${secDrive}`, { size: 9.5, rgb: COLOURS.muted, lineGap: 8 })

  // ---- spectrum scores -----------------------------------------------------
  sectionHeading('Spectrum Scores & Explainability')
  db.scoring.colour_keys.forEach((c) => {
    const cfg = colourConfig(c)
    const rgb = hexToRgb(cfg.hex)
    const score = scores.spectrumScores[c]
    const name = db.colours[c].display_name
    ensureSpace(30)
    setFont(9.5, 'bold', COLOURS.ink)
    doc.text(name, MARGIN, y)
    setFont(9, 'normal', COLOURS.muted)
    const raw = scores.rawPoints[c]
    const max = scores.maxPoints[c]
    const label = `${raw.toFixed(0)} / ${max.toFixed(0)} pts  →  ${score.toFixed(2)}/6`
    doc.text(label, PAGE_W - MARGIN, y, { align: 'right' })
    y += 6
    // bar track
    const barW = CONTENT_W
    const barH = 7
    doc.setFillColor(COLOURS.line[0], COLOURS.line[1], COLOURS.line[2])
    doc.roundedRect(MARGIN, y, barW, barH, 3, 3, 'F')
    // fill
    const fillW = Math.max(2, (score / 6) * barW)
    doc.setFillColor(rgb[0], rgb[1], rgb[2])
    doc.roundedRect(MARGIN, y, fillW, barH, 3, 3, 'F')
    y += barH + 12
  })
  paragraph(
    `Confidence: ${scores.confidence}%  ·  Balance index: ${scores.balanceIndex.toFixed(2)}  ·  Top gap: ${scores.topGap.toFixed(2)}`,
    { size: 8.5, rgb: COLOURS.faint, lineGap: 8 }
  )

  // ---- strengths -----------------------------------------------------------
  sectionHeading('Strengths')
  report.strengths.forEach((s) => bullet(s, hexToRgb(domCfg.hex)))
  paragraph(`3 from ${domName}, 2 from ${secName}`, { size: 8.5, rgb: COLOURS.faint, lineGap: 6 })

  // ---- challenges ----------------------------------------------------------
  sectionHeading('Possible Challenges')
  report.challenges.forEach((s) => bullet(s, COLOURS.muted))

  // ---- communication tips --------------------------------------------------
  sectionHeading('Communication Tips')
  report.commTips.forEach((s) => bullet(s, hexToRgb(secCfg.hex)))

  // ---- under pressure ------------------------------------------------------
  sectionHeading('Under Pressure')
  paragraph('Stress pattern', { size: 9.5, style: 'bold', lineGap: 1 })
  paragraph(report.underPressure.pattern, { size: 10, rgb: COLOURS.muted, lineGap: 6 })
  paragraph('Mitigation', { size: 9.5, style: 'bold', lineGap: 1 })
  paragraph(report.underPressure.mitigation, { size: 10, rgb: COLOURS.muted, lineGap: 8 })

  // ---- how to work with you ------------------------------------------------
  sectionHeading('How to Work With You')
  report.howToWorkWith.forEach((s) => bullet(s, hexToRgb(domCfg.hex)))

  // ---- next steps ----------------------------------------------------------
  sectionHeading('Next Steps')
  report.nextSteps.forEach((step) => {
    const cfg = colourConfig(step.colour)
    const nm = db.colours[step.colour].display_name
    paragraph(nm, { size: 9.5, style: 'bold', rgb: hexToRgb(cfg.hex), lineGap: 1 })
    paragraph(step.text, { size: 10, rgb: COLOURS.ink, lineGap: 7 })
  })

  // ---- 14-day experiment ---------------------------------------------------
  sectionHeading('14-Day Experiment')
  paragraph(report.experiment.title, { size: 11, style: 'bold', rgb: hexToRgb(domCfg.hex), lineGap: 3 })
  paragraph(report.experiment.description, { size: 10, rgb: COLOURS.ink, lineGap: 6 })
  const prompts = (db.reflection_prompts && db.reflection_prompts.weekly_checkin) || []
  if (prompts.length) {
    paragraph('Daily check-in prompts:', { size: 9, style: 'bold', rgb: COLOURS.muted, lineGap: 3 })
    prompts.forEach((p) => paragraph(`•  ${p}`, { size: 9, rgb: COLOURS.muted, lineGap: 1, indent: 6 }))
    y += 4
  }

  // ---- disclaimer ----------------------------------------------------------
  ensureSpace(70)
  y += 8
  const disclaimer =
    'Disclaimer: This report is generated from a self-reported behavioural preference questionnaire. ' +
    'It is intended as a tool for self-awareness and professional development, not a clinical or psychological assessment. ' +
    'Colour Spectrum Profile is not a clinical instrument and is not the proprietary Insights Discovery® Preference Evaluator.'
  setFont(8, 'normal', COLOURS.amberInk)
  const dLines = doc.splitTextToSize(disclaimer, CONTENT_W - 20)
  const boxH = dLines.length * (8 * 1.25) + 18
  ensureSpace(boxH)
  doc.setFillColor(COLOURS.amberBg[0], COLOURS.amberBg[1], COLOURS.amberBg[2])
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 6, 6, 'F')
  let dy = y + 14
  dLines.forEach((ln) => {
    doc.text(ln, MARGIN + 10, dy)
    dy += 8 * 1.25
  })
  y += boxH

  // ---- page footers (numbers) ---------------------------------------------
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    setFont(8, 'normal', COLOURS.faint)
    doc.text(
      `Colour Spectrum Profile  ·  Page ${i} of ${pageCount}`,
      PAGE_W / 2,
      PAGE_H - 24,
      { align: 'center' }
    )
  }

  const filename = 'colour-spectrum-profile.pdf'
  doc.save(filename)
  return filename
}
