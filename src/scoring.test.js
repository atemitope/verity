/**
 * Unit tests for scoring engine (run with node directly — no test framework needed)
 * Usage: node src/scoring.test.js
 */
import { readFileSync } from 'fs'
import { computeScores, generateReport } from './scoring.js'

const db = JSON.parse(readFileSync('./public/db.json', 'utf8'))

let passed = 0
let failed = 0

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ ${label}`)
    failed++
  }
}

// Helper: build response vector
function allLikert(value) {
  const responses = {}
  db.questionnaire.items.forEach(item => {
    if (item.type === 'likert_1_5') responses[item.id] = value
    else responses[item.id] = 'A'
  })
  return responses
}

console.log('\n=== Scoring Engine Tests ===\n')

// Test 1: All-min responses → all scores near 0
console.log('Test 1: All minimum Likert (1) responses')
{
  const r = allLikert(1)
  const s = computeScores(r, db)
  Object.values(s.spectrumScores).forEach(v => {
    assert(`Score ${v.toFixed(3)} >= 0`, v >= 0)
    assert(`Score ${v.toFixed(3)} <= 6`, v <= 6)
  })
  assert('Dominant colour is a valid key', db.scoring.colour_keys.includes(s.dominantColour))
  assert('Confidence is 0–100', s.confidence >= 0 && s.confidence <= 100)
}

// Test 2: All-max Likert responses → Likert-only colours score 6 from Likert items
// Note: forced-choice picks 'A' for all items, so FC colours are skewed.
// We only validate: all scores in [0,6] and confidence is valid.
console.log('\nTest 2: All maximum Likert (5) responses — scores in valid range')
{
  const r = allLikert(5)
  const s = computeScores(r, db)
  Object.values(s.spectrumScores).forEach(v => {
    assert(`Score ${v.toFixed(3)} >= 0`, v >= 0)
    assert(`Score ${v.toFixed(3)} <= 6`, v <= 6)
  })
  assert('Confidence is 0–100', s.confidence >= 0 && s.confidence <= 100)
  assert('Dominant colour valid', db.scoring.colour_keys.includes(s.dominantColour))
}

// Test 3: All Blue responses → Cool Blue dominant
console.log('\nTest 3: Blue-heavy responses → Cool Blue dominant')
{
  const responses = {}
  db.questionnaire.items.forEach(item => {
    if (item.type === 'likert_1_5') {
      const mapsToBlue = 'cool_blue' in (item.maps_to || {})
      responses[item.id] = mapsToBlue ? 5 : 1
    } else {
      // Pick the option that maps to cool_blue, else A
      const blueOpt = Object.entries(item.choices).find(([, m]) => 'cool_blue' in m)
      responses[item.id] = blueOpt ? blueOpt[0] : 'A'
    }
  })
  const s = computeScores(responses, db)
  assert('Cool Blue is dominant', s.dominantColour === 'cool_blue')
  assert('Cool Blue score is highest', s.spectrumScores['cool_blue'] === Math.max(...Object.values(s.spectrumScores)))
}

// Test 4: Normalisation formula
console.log('\nTest 4: Normalisation formula check')
{
  const r = allLikert(3)
  const s = computeScores(r, db)
  db.scoring.colour_keys.forEach(c => {
    const expected = 6 * s.rawPoints[c] / s.maxPoints[c]
    const actual = s.spectrumScores[c]
    assert(`${c}: 6 × raw/max = spectrum score`, Math.abs(expected - actual) < 0.001)
  })
}

// Test 5: Report generation
console.log('\nTest 5: Report structure')
{
  const r = allLikert(3)
  const s = computeScores(r, db)
  const report = generateReport(s, db)
  assert('strengths has 5 items', report.strengths.length === 5)
  assert('challenges has 5 items', report.challenges.length === 5)
  assert('commTips has 5 items', report.commTips.length === 5)
  assert('nextSteps has 3 items', report.nextSteps.length === 3)
  assert('profileSummary is a string', typeof report.profileSummary === 'string' && report.profileSummary.length > 0)
  assert('experiment has title', typeof report.experiment.title === 'string')
}

// Test 6: Confidence clamping
console.log('\nTest 6: Confidence always 0–100')
{
  for (let v = 1; v <= 5; v++) {
    const r = allLikert(v)
    const s = computeScores(r, db)
    assert(`Confidence for likert=${v} in [0,100]`, s.confidence >= 0 && s.confidence <= 100)
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
process.exit(failed > 0 ? 1 : 0)
