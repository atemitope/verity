/**
 * Turns computed metrics into human-readable text, sourced entirely from
 * db.json's `interpretation_rules`.
 *
 * That block was authored to explain the numbers the scoring engine produces,
 * but nothing in the app read it — so the UI printed bare decimals and the
 * explanations went unused. Everything here is a pure function over
 * (scores, db), matching the style of scoring.js and gamification.js.
 */

/**
 * Classify how differentiated a profile is, per the thresholds in db.json.
 *
 * Note this reads `scores.range`, not `scores.balanceIndex`. The db defines
 * `range_thresholds`, and range is also what the engine calls `spread`.
 * Returns the canonical guidance text rather than a hardcoded paraphrase.
 *
 * @returns {{ key: string, guidance: string }}
 */
export function describeBalance(scores, db) {
  const rules = db.interpretation_rules.balance_vs_intensity;
  const { flat_profile, moderate } = rules.range_thresholds;

  const key =
    scores.range < flat_profile ? 'flat_profile' :
    scores.range < moderate ? 'moderate' :
    'high';

  return { key, guidance: rules.guidance[key] };
}

/**
 * Describe a polarity as two opposing poles plus a position between them.
 *
 * db.json states each definition as "<A> versus <B>" and each metric as
 * first-colour minus second-colour (e.g. fiery_red - earth_green), so A is
 * always the positive direction.
 *
 * Scores run 0–6, so a polarity runs -6..+6; `percent` maps that to 0–100
 * for placing a marker, clamped in case a metric ever falls outside range.
 *
 * @param {string} polarityKey e.g. 'red_vs_green'
 * @param {number} value the computed polarity (e.g. scores.polarityRedGreen)
 * @returns {{ positivePole: string, negativePole: string, value: number, percent: number }|null}
 */
export function describePolarity(polarityKey, value, db) {
  const polarity = db.interpretation_rules.polarities?.[polarityKey];
  if (!polarity || typeof value !== 'number') return null;

  const [positivePole, negativePole] = polarity.definition.split(/\s+versus\s+/i);
  if (!negativePole) return null;

  const percent = Math.min(100, Math.max(0, ((value + 6) / 12) * 100));

  return {
    positivePole: capitalise(positivePole.trim()),
    negativePole: capitalise(negativePole.trim()),
    value,
    percent,
  };
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
