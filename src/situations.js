// Explicit extension so this module runs under plain node (situations.test.js)
// as well as through Vite.
import { colourConfig } from './colours.js'
import { buildDomains } from './domains.js'

/**
 * The same behavioural content, arranged as situations rather than categories.
 *
 * Results used to answer "what are your traits?" A person leaving a 32-item
 * assessment is asking something more specific: how do I show up on a good
 * day, and what happens to me under pressure? db.json already holds the
 * answer — `strengths` is the energy working, `blind_spots` is that same
 * energy overdone, `under_pressure` is the stress response — but the app was
 * presenting them as a flat list of attributes, so the story was invisible.
 *
 * Nothing here is new content. `label` and `blurb` are presentation chrome
 * (as in DOMAINS); every behavioural claim still comes from db.json.
 *
 * Not modelled: how you communicate with close people versus strangers.
 * db.json has one flat `communication_cues` list, and splitting it would mean
 * inventing psychological claims rather than presenting authored ones.
 */
export const SITUATIONS = [
  {
    key: 'good_day',
    field: 'strengths',
    label: 'On a good day',
    blurb: 'This energy working the way it should — what people value you for.',
    icon: '☀️',
    tone: 'positive',
  },
  {
    key: 'day_to_day',
    field: 'typical_behaviours',
    label: 'On an ordinary day',
    blurb: 'Your baseline. The patterns people notice without thinking about them.',
    icon: '🔄',
    tone: 'neutral',
  },
  {
    key: 'overdone',
    field: 'blind_spots',
    label: 'When you overdo it',
    blurb: 'Not a different person — the same strengths turned up too far.',
    icon: '⚠️',
    tone: 'caution',
  },
  {
    key: 'under_pressure',
    field: 'under_pressure',
    label: 'Under real pressure',
    blurb: 'What intensifies when the stakes rise and time runs short.',
    icon: '🌡️',
    tone: 'caution',
  },
  {
    key: 'best_environment',
    field: 'best_environment',
    label: 'Where you do your best work',
    blurb: 'The conditions that keep you on the good-day side of that line.',
    icon: '🏞️',
    tone: 'positive',
  },
]

/** How you land on other people — the relational half of the picture. */
export const RELATIONAL = [
  {
    key: 'communication',
    field: 'communication_cues',
    label: 'How you come across',
    blurb: 'Your default tone, and what you tend to ask for.',
    icon: '💬',
    tone: 'neutral',
  },
  {
    key: 'working_with',
    field: 'how_to_work_with',
    label: 'How others should work with you',
    blurb: 'Worth sending to the people you work alongside.',
    icon: '🤝',
    tone: 'neutral',
  },
]

/** Rearrange the (already tested) domain content into a set of frames. */
function arrange(frames, scores, db) {
  const byField = new Map(buildDomains(scores, db).map(d => [d.field, d]))
  return frames
    .map(frame => {
      const domain = byField.get(frame.field)
      if (!domain) return null
      return { ...frame, primary: domain.primary, secondary: domain.secondary }
    })
    .filter(Boolean)
}

/** The situational spine: good day → ordinary → overdone → pressure → thriving. */
export function buildSituations(scores, db) {
  if (!scores) return []
  return arrange(SITUATIONS, scores, db)
}

/** How you come across, and how people should handle you. */
export function buildRelational(scores, db) {
  if (!scores) return []
  return arrange(RELATIONAL, scores, db)
}

/** db.json stores some fields as a bare string rather than an array. */
function toItems(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * "fiery_red_score - earth_green_score" → ['fiery_red', 'earth_green'].
 * Colour keys use underscores, so splitting on the hyphen is unambiguous.
 */
function parsePolarityPair(metric) {
  if (typeof metric !== 'string') return null
  const pair = metric.split('-').map(part => part.trim().replace(/_score$/, ''))
  return pair.length === 2 && pair[0] && pair[1] ? pair : null
}

/** The colour sitting at the far end of the dominant colour's polarity axis. */
function findOpposite(colourKey, db) {
  const polarities = db?.interpretation_rules?.polarities
  if (!polarities || !colourKey) return null

  for (const polarity of Object.values(polarities)) {
    const pair = parsePolarityPair(polarity?.metric)
    if (!pair) continue
    if (pair[0] === colourKey) return { key: pair[1], definition: polarity.definition }
    if (pair[1] === colourKey) return { key: pair[0], definition: polarity.definition }
  }
  return null
}

/**
 * Your opposite energy — where interpersonal friction actually comes from.
 *
 * Deliberately NOT the same thing as buildLowEnergy(). That one is empirical
 * (whichever colour you happened to score lowest); this one is structural,
 * fixed by the polarity axes db.json defines. They often coincide, but not
 * always: a Cool Blue lead whose lowest score is Earth Green still has
 * Sunshine Yellow as their opposite. Conflating the two would quietly
 * misattribute friction to the wrong colour, so `isAlsoLowest` lets the UI
 * say which situation the reader is in.
 */
export function buildOppositeType(scores, db) {
  const dominantKey = scores?.dominantColour
  const opposite = findOpposite(dominantKey, db)
  if (!opposite) return null

  const colour = db.colours?.[opposite.key]
  if (!colour) return null

  const sorted = scores.sortedColours || []
  const lowestKey = sorted[sorted.length - 1] ?? null

  return {
    colourKey: opposite.key,
    colourName: colour.display_name,
    cfg: colourConfig(opposite.key),
    coreDrive: colour.core_drive,
    definition: opposite.definition ?? null,
    score: scores.spectrumScores?.[opposite.key] ?? null,
    theirBehaviours: toItems(colour.typical_behaviours),
    workingWithThem: toItems(colour.how_to_work_with),
    isAlsoLowest: lowestKey === opposite.key,
  }
}
