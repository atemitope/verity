/**
 * Scoring engine — implements DB scoring rules exactly.
 * All values derived from the database; no hardcoded scoring.
 */

export function computeScores(responses, db) {
  const colours = db.scoring.colour_keys; // ['cool_blue','earth_green','sunshine_yellow','fiery_red']
  const items = db.questionnaire.items;

  // Initialise accumulators
  const rawPoints = {};
  const maxPoints = {};
  colours.forEach(c => { rawPoints[c] = 0; maxPoints[c] = 0; });

  let forcedChoicesSupportingTop2Count = 0;
  let totalForcedChoices = 0;

  // First pass: raw + max
  items.forEach(item => {
    const response = responses[item.id];
    if (response === undefined || response === null) return;

    if (item.type === 'likert_1_5') {
      // points = response - 1  (scale 1-5 → 0-4)
      const points = Number(response) - 1;
      Object.entries(item.maps_to).forEach(([colour, weight]) => {
        rawPoints[colour] += points * weight;
        maxPoints[colour] += 4 * weight;
      });
    } else if (item.type === 'forced_choice') {
      // response is 'A' or 'B'; chosen option awards 4 points
      // DB format: item.choices = { A: { colour_key: weight }, B: { colour_key: weight } }
      totalForcedChoices++;
      if (response && item.choices[response]) {
        Object.entries(item.choices[response]).forEach(([colour, weight]) => {
          rawPoints[colour] += 4 * weight;
        });
      }
      // max_points: each choice option contributes 4 to its colour
      Object.entries(item.choices).forEach(([optKey, mapping]) => {
        Object.entries(mapping).forEach(([colour, weight]) => {
          maxPoints[colour] += 4 * weight;
        });
      });
    }
  });

  // Normalise 0–6
  const spectrumScores = {};
  colours.forEach(c => {
    spectrumScores[c] = maxPoints[c] > 0
      ? parseFloat((6 * rawPoints[c] / maxPoints[c]).toFixed(3))
      : 0;
  });

  // Sort colours by score descending
  const sorted = colours.slice().sort((a, b) => spectrumScores[b] - spectrumScores[a]);
  const dominantColour = sorted[0];
  const secondaryColour = sorted[1];

  // Forced-choice alignment for top 2
  items.filter(i => i.type === 'forced_choice').forEach(item => {
    const response = responses[item.id];
    if (!response || !item.choices[response]) return;
    const chosenColours = Object.keys(item.choices[response]);
    if (chosenColours.some(c => c === dominantColour || c === secondaryColour)) {
      forcedChoicesSupportingTop2Count++;
    }
  });

  // Derived metrics
  const scoreValues = colours.map(c => spectrumScores[c]);
  const maxScore = Math.max(...scoreValues);
  const secondMax = sorted.map(c => spectrumScores[c])[1];
  const minScore = Math.min(...scoreValues);

  const topGap = parseFloat((maxScore - secondMax).toFixed(3));
  const range = parseFloat((maxScore - minScore).toFixed(3));
  const balanceIndex = parseFloat((1 - range / 6).toFixed(3));
  const polarityRedGreen = parseFloat((spectrumScores['fiery_red'] - spectrumScores['earth_green']).toFixed(3));
  const polarityBlueYellow = parseFloat((spectrumScores['cool_blue'] - spectrumScores['sunshine_yellow']).toFixed(3));

  // Confidence score
  const spread = range;
  const forcedAlignment = totalForcedChoices > 0
    ? forcedChoicesSupportingTop2Count / totalForcedChoices
    : 0;
  let confidenceRaw = 20 + 25 * spread + 25 * topGap + 30 * forcedAlignment;
  if (spread < 1.0) confidenceRaw -= 15;
  const confidence = Math.min(100, Math.max(0, Math.round(confidenceRaw)));

  return {
    spectrumScores,
    rawPoints,
    maxPoints,
    dominantColour,
    secondaryColour,
    topGap,
    range,
    balanceIndex,
    polarityRedGreen,
    polarityBlueYellow,
    confidence,
    confidenceInputs: { spread, topGap, forcedAlignment, forcedChoicesSupportingTop2Count, totalForcedChoices },
    sortedColours: sorted,
  };
}

export function generateReport(scores, db) {
  const { dominantColour, secondaryColour, sortedColours, spectrumScores } = scores;
  const colours = db.colours;
  const templates = db.report_templates.individual_report_v1;
  const nextStepsLib = db.output_templates.next_steps_library;
  const lowestColour = sortedColours[sortedColours.length - 1];

  const dom = colours[dominantColour];
  const sec = colours[secondaryColour];
  const low = colours[lowestColour];

  // Find combination blurb (order-insensitive)
  const topTwo = new Set([dominantColour, secondaryColour]);
  const blurb = db.combination_blurbs.find(b => {
    const keys = new Set(b.top_two);
    return [...topTwo].every(k => keys.has(k)) && [...keys].every(k => topTwo.has(k));
  });

  // Profile summary
  const profileSummary = blurb
    ? blurb.blurb
    : `Your profile is led by ${dom.display_name} energy, with ${sec.display_name} as your supporting energy. This combination shapes how you approach work, relationships, and decisions.`;

  // Strengths: up to 3 from dominant (using strengths + typical_behaviours), 2 from secondary
  const domStrengths = [
    ...dom.strengths,
    ...(dom.typical_behaviours || []),
  ].slice(0, 3);
  const secStrengths = [
    ...sec.strengths,
    ...(sec.typical_behaviours || []),
  ].slice(0, 2);
  const strengths = [...domStrengths, ...secStrengths];

  // Challenges: up to 3 from lowest blind spots + typical_behaviours, 2 from dominant
  const lowChallenges = [
    ...low.blind_spots,
    ...(low.typical_behaviours || []).map(t => `Tendency to: ${t.toLowerCase()}`),
  ].slice(0, 3);
  const domChallenges = [
    ...dom.blind_spots,
  ].slice(0, 2);
  const challenges = [...lowChallenges, ...domChallenges];

  // Communication tips: how_to_work_with + comm_cues + watch-out (ensure 5)
  const commTipsRaw = [
    ...dom.how_to_work_with,
    ...dom.communication_cues,
    ...sec.how_to_work_with,
    ...sec.communication_cues.slice(0, 1),
    `Watch out: ${low.communication_cues[0] || 'be mindful of different communication styles'}`,
  ];
  const commTips = commTipsRaw.slice(0, 5);

  // Under pressure (under_pressure may be an array or string)
  const underPressureText = Array.isArray(dom.under_pressure)
    ? dom.under_pressure.join('; ')
    : dom.under_pressure;
  const underPressure = {
    pattern: underPressureText,
    mitigation: `Try to pause and reconnect with your ${sec.display_name} energy as a counterbalance.`,
  };

  // How to work with you
  const howToWorkWith = [
    ...dom.how_to_work_with,
    ...sec.how_to_work_with,
    ...(dom.best_environment || []).map(e => `Best environment: ${e}`),
  ].slice(0, 5);

  // Next steps: 1 from dominant, 1 from lowest, 1 from secondary
  // nextStepsLib is keyed by colour, each value is an array of strings
  const nextSteps = [
    { colour: dominantColour, text: (nextStepsLib[dominantColour] || [])[0] },
    { colour: lowestColour, text: (nextStepsLib[lowestColour] || [])[0] },
    { colour: secondaryColour, text: (nextStepsLib[secondaryColour] || [])[1] },
  ].filter(n => n.text);

  // 14-day experiment (derived from dominant challenges)
  const gameChallenges = db.gamification.mechanics_catalogue.challenges_by_colour[dominantColour] || [];
  const experiment = gameChallenges[0] || { title: 'Behaviour Experiment', description: 'Practise one new behaviour daily for 14 days.' };

  return {
    profileSummary,
    strengths,
    challenges,
    commTips,
    underPressure,
    howToWorkWith,
    nextSteps,
    experiment,
    blurbLabel: blurb?.label,
  };
}
