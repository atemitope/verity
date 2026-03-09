/**
 * Gamification engine — implements DB mechanics exactly.
 */

export function awardXP(state, db, action) {
  const awards = db.gamification.mechanics_catalogue.xp.default_awards;
  const xpEarned = awards[action] || 0;
  if (xpEarned === 0) return state;

  const newXP = state.gamification.xp + xpEarned;
  const xpPerLevel = db.gamification.mechanics_catalogue.levels.xp_per_level;
  const maxLevel = db.gamification.mechanics_catalogue.levels.max_level;
  const newLevel = Math.min(maxLevel, Math.floor(newXP / xpPerLevel) + 1);

  return {
    ...state,
    gamification: {
      ...state.gamification,
      xp: newXP,
      level: newLevel,
    },
  };
}

export function checkBadges(state, db) {
  const catalogue = db.gamification.mechanics_catalogue.badges;
  const earned = new Set(state.gamification.badges);
  const g = state.gamification;

  // badge_profile_complete
  if (state.assessmentComplete && !earned.has('badge_profile_complete')) {
    earned.add('badge_profile_complete');
  }
  // badge_reflection — 3 reflections
  if (g.reflectionsAnswered >= 3 && !earned.has('badge_reflection')) {
    earned.add('badge_reflection');
  }
  // badge_experiment_2w — 14-day experiment
  if (g.experimentLog.length >= 14 && !earned.has('badge_experiment_2w')) {
    earned.add('badge_experiment_2w');
  }
  // badge_team_ready — 2+ team members invited
  if (state.teamMembers.length >= 2 && !earned.has('badge_team_ready')) {
    earned.add('badge_team_ready');
  }

  const newBadges = [...earned];
  if (newBadges.length === state.gamification.badges.length) return state;

  return {
    ...state,
    gamification: { ...state.gamification, badges: newBadges },
  };
}

export function checkTier(state, db) {
  const tiers = db.gamification.mechanics_catalogue.tiers;
  const g = state.gamification;

  let tier = 'none';
  if (state.assessmentComplete && state.reportRead) {
    tier = 'tier_explorer';
  }
  const completedChallengesCount = Object.values(g.completedChallenges).filter(Boolean).length;
  if (completedChallengesCount >= 2 && g.reflectionsAnswered >= 1) {
    tier = 'tier_builder';
  }
  if (g.experimentLog.length >= 14 && state.teamMembers.length >= 1) {
    tier = 'tier_leader';
  }

  if (tier === state.gamification.tier) return state;
  return { ...state, gamification: { ...state.gamification, tier } };
}

export function completeChallenge(state, db, challengeId, outcomeNote) {
  if (state.gamification.completedChallenges[challengeId]) return state;

  let newState = {
    ...state,
    gamification: {
      ...state.gamification,
      completedChallenges: {
        ...state.gamification.completedChallenges,
        [challengeId]: { completed: true, note: outcomeNote, date: new Date().toISOString() },
      },
    },
  };
  newState = awardXP(newState, db, 'complete_next_step');
  newState = checkBadges(newState, db);
  newState = checkTier(newState, db);
  return newState;
}

export function getProgressPercent(state) {
  const items = [];
  if (state.assessmentComplete) items.push(1);
  if (state.reportRead) items.push(1);
  if (state.exportedReport) items.push(1);
  const challenges = Object.values(state.gamification.completedChallenges).filter(Boolean).length;
  if (challenges >= 1) items.push(1);
  if (challenges >= 3) items.push(1);
  if (state.gamification.reflectionsAnswered >= 3) items.push(1);
  if (state.gamification.experimentLog.length >= 7) items.push(1);
  if (state.gamification.experimentLog.length >= 14) items.push(1);
  const total = 8;
  return Math.round((items.length / total) * 100);
}

export function getLevelProgress(state, db) {
  const xpPerLevel = db.gamification.mechanics_catalogue.levels.xp_per_level;
  const xpIntoCurrentLevel = state.gamification.xp % xpPerLevel;
  return Math.round((xpIntoCurrentLevel / xpPerLevel) * 100);
}
