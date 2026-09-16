/**
 * Unit tests for the interpretation layer (run with node directly)
 * Usage: node src/interpret.test.js
 */
import { readFileSync } from 'fs'
import { describeBalance, describePolarity } from './interpret.js'

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

const { flat_profile, moderate } = db.interpretation_rules.balance_vs_intensity.range_thresholds
const guidance = db.interpretation_rules.balance_vs_intensity.guidance

console.log('\n--- describeBalance: thresholds come from db.json ---')
{
  assert('db defines flat_profile threshold as 1', flat_profile === 1)
  assert('db defines moderate threshold as 2.5', moderate === 2.5)

  assert('range 0.5 → flat_profile', describeBalance({ range: 0.5 }, db).key === 'flat_profile')
  assert('range 1.5 → moderate', describeBalance({ range: 1.5 }, db).key === 'moderate')
  assert('range 4.0 → high', describeBalance({ range: 4.0 }, db).key === 'high')

  // Boundaries are exclusive-below: range === threshold falls into the band above.
  assert('range exactly 1 → moderate (not flat)', describeBalance({ range: 1 }, db).key === 'moderate')
  assert('range exactly 2.5 → high (not moderate)', describeBalance({ range: 2.5 }, db).key === 'high')

  // Regression guard for the bug this module fixes. The previous implementation
  // branched on balanceIndex (1 - range/6) against 0.8/0.5, which put the
  // moderate/high boundary at range 3.0 instead of the spec's 2.5 — so a
  // profile at 2.7 was labelled "moderately differentiated" when the spec
  // classifies it as high, with materially different advice.
  assert('range 2.7 → high (was misclassified as moderate)', describeBalance({ range: 2.7 }, db).key === 'high')
  const legacyKey = (1 - 2.7 / 6) >= 0.8 ? 'flat_profile' : (1 - 2.7 / 6) >= 0.5 ? 'moderate' : 'high'
  assert('…and that genuinely differs from the old logic', legacyKey === 'moderate')

  assert('returns the canonical db guidance string', describeBalance({ range: 4.0 }, db).guidance === guidance.high)
  assert('guidance is non-empty for every band',
    ['flat_profile', 'moderate', 'high'].every(k => typeof guidance[k] === 'string' && guidance[k].length > 0))
}

console.log('\n--- describePolarity: poles and direction from db.json ---')
{
  const rg = describePolarity('red_vs_green', 2.0, db)
  assert('red_vs_green resolves', rg !== null)
  assert('positive pole is the first colour in the metric (task and pace)',
    /task and pace/i.test(rg.positivePole))
  assert('negative pole is the second (people and harmony)',
    /people and harmony/i.test(rg.negativePole))
  assert('poles are capitalised for display', /^[A-Z]/.test(rg.positivePole) && /^[A-Z]/.test(rg.negativePole))
  assert('poles never contain the word "versus"',
    !/versus/i.test(rg.positivePole) && !/versus/i.test(rg.negativePole))

  const by = describePolarity('blue_vs_yellow', -1.5, db)
  assert('blue_vs_yellow resolves', by !== null)
  assert('positive pole is precision and analysis', /precision and analysis/i.test(by.positivePole))
  assert('negative pole is spontaneity and enthusiasm', /spontaneity and enthusiasm/i.test(by.negativePole))

  // Marker placement: 0 is centre, positive leans toward the positive pole.
  assert('value 0 sits at the midpoint', describePolarity('red_vs_green', 0, db).percent === 50)
  assert('positive value sits past the midpoint', describePolarity('red_vs_green', 3, db).percent > 50)
  assert('negative value sits before the midpoint', describePolarity('red_vs_green', -3, db).percent < 50)
  assert('max +6 clamps to 100', describePolarity('red_vs_green', 6, db).percent === 100)
  assert('min -6 clamps to 0', describePolarity('red_vs_green', -6, db).percent === 0)
  assert('out-of-range values stay clamped', describePolarity('red_vs_green', 99, db).percent === 100)

  assert('original numeric value is preserved for explainability', describePolarity('red_vs_green', 2.0, db).value === 2.0)
  assert('unknown polarity key returns null', describePolarity('not_a_polarity', 1, db) === null)
  assert('non-numeric value returns null', describePolarity('red_vs_green', undefined, db) === null)
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
process.exit(failed > 0 ? 1 : 0)
