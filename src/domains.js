// Explicit extension so this module runs under plain node (domains.test.js)
// as well as through Vite.
import { colourConfig } from './colours.js'

/**
 * The behavioural domains a person actually wants to ask about.
 *
 * db.json is already organised this way — every colour carries
 * typical_behaviours, communication_cues, strengths, blind_spots,
 * under_pressure, best_environment and how_to_work_with. The app had been
 * flattening those into a linear report, so there was no way to ask
 * "how do I communicate?" This turns them back into first-class areas.
 *
 * `question` and `blurb` are presentation labels (UI chrome, the same way
 * Report.jsx has always titled its sections). Every piece of behavioural
 * content itself comes from db.json.
 */
export const DOMAINS = [
  {
    key: 'behaviour',
    field: 'typical_behaviours',
    question: 'How you behave day to day',
    blurb: 'The patterns people are most likely to notice in you.',
    icon: '🔄',
  },
  {
    key: 'communication',
    field: 'communication_cues',
    question: 'How you communicate',
    blurb: 'Your default tone, and what you tend to ask for.',
    icon: '💬',
  },
  {
    key: 'strengths',
    field: 'strengths',
    question: "What you're great at",
    blurb: 'Where this pattern is most valuable to a team.',
    icon: '💪',
  },
  {
    key: 'blind_spots',
    field: 'blind_spots',
    question: 'What to watch for',
    blurb: 'The same pattern, when it works against you.',
    icon: '👀',
  },
  {
    key: 'under_pressure',
    field: 'under_pressure',
    question: 'How you are under pressure',
    blurb: 'What tends to intensify when things get hard.',
    icon: '🌡️',
  },
  {
    key: 'environment',
    field: 'best_environment',
    question: 'Where you do your best work',
    blurb: 'The conditions that let this pattern work well.',
    icon: '🏞️',
  },
  {
    key: 'working_with',
    field: 'how_to_work_with',
    question: 'How others should work with you',
    blurb: 'Worth sharing with the people you work alongside.',
    icon: '🤝',
  },
]

/** db.json stores some fields as a bare string rather than an array. */
function toItems(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Build every domain for a person, blending dominant and secondary energies
 * the way the rest of the app does (dominant leads, secondary supports).
 *
 * Returns domains that have at least one item, so a sparse db entry degrades
 * to fewer sections rather than rendering an empty heading.
 */
export function buildDomains(scores, db) {
  if (!scores) return []

  const dominantKey = scores.dominantColour
  const secondaryKey = scores.secondaryColour
  const dominant = db.colours[dominantKey]
  const secondary = db.colours[secondaryKey]
  if (!dominant) return []

  return DOMAINS.map(domain => {
    const primaryItems = toItems(dominant[domain.field])
    const secondaryItems = secondary && secondaryKey !== dominantKey
      ? toItems(secondary[domain.field])
      : []

    return {
      ...domain,
      primary: {
        colourKey: dominantKey,
        colourName: dominant.display_name,
        cfg: colourConfig(dominantKey),
        items: primaryItems,
      },
      secondary: {
        colourKey: secondaryKey,
        colourName: secondary?.display_name ?? null,
        cfg: colourConfig(secondaryKey),
        items: secondaryItems,
      },
    }
  }).filter(d => d.primary.items.length > 0 || d.secondary.items.length > 0)
}
