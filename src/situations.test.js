/**
 * Unit tests for the situational model (run with node directly)
 * Usage: node src/situations.test.js
 */
import { readFileSync } from 'fs'
import {
  SITUATIONS,
  RELATIONAL,
  buildSituations,
  buildRelational,
  buildOppositeType,
} from './situations.js'
import { buildLowEnergy } from './domains.js'

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

function toArr(v) { return Array.isArray(v) ? v : [v] }

const scores = {
  dominantColour: 'cool_blue',
  secondaryColour: 'fiery_red',
  sortedColours: ['cool_blue', 'fiery_red', 'sunshine_yellow', 'earth_green'],
  spectrumScores: { cool_blue: 5, fiery_red: 4, sunshine_yellow: 2.5, earth_green: 1 },
}

console.log('\n--- situation definitions map to real db.json fields ---')
{
  const frames = [...SITUATIONS, ...RELATIONAL]
  assert('every frame names a field present on every colour',
    frames.every(f => db.scoring.colour_keys.every(c => db.colours[c][f.field] !== undefined)))
  assert('frame keys are unique', new Set(frames.map(f => f.key)).size === frames.length)
  assert('every frame carries a situational label',
    frames.every(f => typeof f.label === 'string' && f.label.length > 0))
  assert('the spine runs good day → ordinary → overdone → pressure → environment',
    SITUATIONS.map(f => f.key).join(',') ===
      'good_day,day_to_day,overdone,under_pressure,best_environment')
}

console.log('\n--- the good-day / overdone split is the same energy, not two lists ---')
{
  const built = buildSituations(scores, db)
  const goodDay = built.find(s => s.key === 'good_day')
  const overdone = built.find(s => s.key === 'overdone')

  // This is the one that would be silently, embarrassingly wrong: showing
  // strengths under "when you overdo it" reads as praise where a caution belongs.
  assert('good day pulls from strengths',
    goodDay.primary.items.every(i => toArr(db.colours.cool_blue.strengths).includes(i)))
  assert('overdone pulls from blind_spots',
    overdone.primary.items.every(i => toArr(db.colours.cool_blue.blind_spots).includes(i)))
  assert('overdone never leaks a strength',
    overdone.primary.items.every(i => !toArr(db.colours.cool_blue.strengths).includes(i)))
  assert('under pressure pulls from under_pressure',
    built.find(s => s.key === 'under_pressure').primary.items
      .every(i => toArr(db.colours.cool_blue.under_pressure).includes(i)))
}

console.log('\n--- buildSituations keeps the dominant/secondary blend ---')
{
  const built = buildSituations(scores, db)
  assert('returns a section per situation', built.length === SITUATIONS.length)
  assert('primary is the dominant colour', built.every(s => s.primary.colourKey === 'cool_blue'))
  assert('secondary is the secondary colour', built.every(s => s.secondary.colourKey === 'fiery_red'))
  assert('every item traces back to db.json', built.every(s =>
    s.primary.items.every(i => toArr(db.colours.cool_blue[s.field]).includes(i))))
  assert('builds for every colour as dominant', db.scoring.colour_keys.every(c =>
    buildSituations({ ...scores, dominantColour: c, secondaryColour: c }, db).length === SITUATIONS.length))
  assert('returns nothing without scores', buildSituations(null, db).length === 0)
}

console.log('\n--- buildRelational ---')
{
  const built = buildRelational(scores, db)
  assert('returns both relational frames', built.length === RELATIONAL.length)
  assert('communication pulls from communication_cues',
    built.find(s => s.key === 'communication').primary.items
      .every(i => toArr(db.colours.cool_blue.communication_cues).includes(i)))
}

console.log('\n--- buildOppositeType is structural, not empirical ---')
{
  const opposite = buildOppositeType(scores, db)
  assert('cool_blue opposes sunshine_yellow', opposite.colourKey === 'sunshine_yellow')
  assert('carries the polarity definition from db.json',
    opposite.definition === db.interpretation_rules.polarities.blue_vs_yellow.definition)
  assert('reports the opposite colour score', opposite.score === 2.5)
  assert('content comes from the opposite colour', opposite.colourName === 'Sunshine Yellow')

  // The distinction the whole function exists for: here earth_green scores
  // lowest, but the structural opposite is still sunshine_yellow. Collapsing
  // the two would blame friction on the wrong colour.
  const low = buildLowEnergy(scores, db)
  assert('lowest energy is earth_green in this fixture', low.colourKey === 'earth_green')
  assert('opposite is NOT the lowest here', opposite.colourKey !== low.colourKey)
  assert('isAlsoLowest is false when they differ', opposite.isAlsoLowest === false)

  // …and true when they genuinely coincide.
  const coincide = buildOppositeType({
    dominantColour: 'cool_blue',
    sortedColours: ['cool_blue', 'fiery_red', 'earth_green', 'sunshine_yellow'],
    spectrumScores: { cool_blue: 5, fiery_red: 4, earth_green: 2, sunshine_yellow: 1 },
  }, db)
  assert('isAlsoLowest is true when they coincide', coincide.isAlsoLowest === true)
}

console.log('\n--- every colour resolves an opposite, and pairs are reciprocal ---')
{
  const expected = { cool_blue: 'sunshine_yellow', sunshine_yellow: 'cool_blue', fiery_red: 'earth_green', earth_green: 'fiery_red' }
  assert('all four colours resolve', db.scoring.colour_keys.every(c =>
    buildOppositeType({ dominantColour: c, sortedColours: [c], spectrumScores: {} }, db)?.colourKey === expected[c]))
  assert('opposition is reciprocal', db.scoring.colour_keys.every(c => {
    const o = buildOppositeType({ dominantColour: c, sortedColours: [c], spectrumScores: {} }, db).colourKey
    return buildOppositeType({ dominantColour: o, sortedColours: [o], spectrumScores: {} }, db).colourKey === c
  }))
  assert('a colour is never its own opposite', db.scoring.colour_keys.every(c =>
    buildOppositeType({ dominantColour: c, sortedColours: [c], spectrumScores: {} }, db).colourKey !== c))
  assert('returns null without a dominant colour', buildOppositeType({}, db) === null)
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
process.exit(failed > 0 ? 1 : 0)
