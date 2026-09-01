/**
 * Unit tests for the behavioural domain model (run with node directly)
 * Usage: node src/domains.test.js
 */
import { readFileSync } from 'fs'
import { DOMAINS, buildDomains } from './domains.js'

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

const scores = { dominantColour: 'cool_blue', secondaryColour: 'fiery_red' }

console.log('\n--- domain definitions map to real db.json fields ---')
{
  assert('every domain names a field that exists on every colour',
    DOMAINS.every(d => db.scoring.colour_keys.every(c => db.colours[c][d.field] !== undefined)))
  assert('every domain is phrased as a user question, not a report section',
    DOMAINS.every(d => typeof d.question === 'string' && d.question.length > 0))
  assert('domain keys are unique', new Set(DOMAINS.map(d => d.key)).size === DOMAINS.length)
  assert('covers the seven behavioural fields', DOMAINS.length === 7)
}

console.log('\n--- buildDomains blends dominant and secondary ---')
{
  const domains = buildDomains(scores, db)
  assert('returns a domain per definition', domains.length === DOMAINS.length)
  assert('primary is the dominant colour', domains.every(d => d.primary.colourKey === 'cool_blue'))
  assert('secondary is the secondary colour', domains.every(d => d.secondary.colourKey === 'fiery_red'))
  assert('primary names resolve', domains.every(d => d.primary.colourName === 'Cool Blue'))

  const comms = domains.find(d => d.key === 'communication')
  assert('communication pulls from communication_cues',
    comms.primary.items.every(i => db.colours.cool_blue.communication_cues.includes(i)))
  assert('communication does not leak how_to_work_with content',
    !comms.primary.items.some(i => db.colours.cool_blue.how_to_work_with.includes(i)))

  const env = domains.find(d => d.key === 'environment')
  assert('string-valued fields are normalised to arrays', Array.isArray(env.primary.items))
  assert('best_environment has content', env.primary.items.length > 0)
  assert('no item is a bare prefix artefact (e.g. "Best environment: ")',
    domains.every(d => d.primary.items.every(i => !/^Best environment:/i.test(i))))

  assert('every domain carries at least one item',
    domains.every(d => d.primary.items.length > 0 || d.secondary.items.length > 0))
  assert('all content traces back to db.json',
    domains.every(d => d.primary.items.every(i => toArr(db.colours.cool_blue[d.field]).includes(i))))
}

console.log('\n--- edge cases ---')
{
  assert('no scores returns empty', buildDomains(null, db).length === 0)

  // A profile whose dominant and secondary are the same colour should not
  // duplicate the same lines into both slots.
  const same = buildDomains({ dominantColour: 'earth_green', secondaryColour: 'earth_green' }, db)
  assert('identical dominant/secondary leaves secondary empty',
    same.every(d => d.secondary.items.length === 0))
  assert('…while primary still has content', same.every(d => d.primary.items.length > 0))

  // Works for every colour pairing in the product.
  let allOk = true
  for (const a of db.scoring.colour_keys) {
    for (const b of db.scoring.colour_keys) {
      const built = buildDomains({ dominantColour: a, secondaryColour: b }, db)
      if (built.length !== DOMAINS.length) allOk = false
    }
  }
  assert('every dominant/secondary pairing produces a full set', allOk)
}

function toArr(v) { return Array.isArray(v) ? v : [v] }

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
process.exit(failed > 0 ? 1 : 0)
