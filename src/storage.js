const STORAGE_KEY = 'csp_app_state';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('State save failed', e);
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createInitialState() {
  return {
    view: 'home', // home | quiz | results | report | achievements | challenges | team
    responses: {},
    currentItemIndex: 0,
    scores: null,
    report: null,
    gamification: {
      xp: 0,
      level: 1,
      badges: [],
      questProgress: {},
      completedChallenges: {},
      tier: 'none',
      reflectionsAnswered: 0,
      experimentLog: [],
    },
    teamMembers: [],
    teamReport: null,
    assessmentComplete: false,
    reportRead: false,
    exportedReport: false,
    preferences: {
      reducedMotion: 'system', // 'system' | 'reduced' | 'full'
      explainerDefaultOpen: false,
    },
  };
}
