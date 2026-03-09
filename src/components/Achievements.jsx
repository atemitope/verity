import React from 'react'
import { getProgressPercent, getLevelProgress } from '../gamification'

const BADGE_ICONS = {
  badge_profile_complete: '🎯',
  badge_reflection: '🪞',
  badge_experiment_2w: '🧪',
  badge_team_ready: '👥',
}

const TIER_INFO = {
  none: { icon: '⬜', label: 'No tier yet', desc: 'Complete the questionnaire to begin' },
  tier_explorer: { icon: '🧭', label: 'Explorer', desc: 'You\'ve completed your profile and read your results' },
  tier_builder: { icon: '🔨', label: 'Builder', desc: 'You\'ve completed challenges and reflected on your results' },
  tier_leader: { icon: '👑', label: 'Leader', desc: 'You\'ve completed a 14-day experiment and embraced team mode' },
}

export default function Achievements({ db, state, onNavigate }) {
  const { gamification } = state
  const badges = db.gamification.mechanics_catalogue.badges
  const quests = db.gamification.mechanics_catalogue.quests
  const progressPct = getProgressPercent(state)
  const levelProgress = getLevelProgress(state, db)
  const xpPerLevel = db.gamification.mechanics_catalogue.levels.xp_per_level
  const maxLevel = db.gamification.mechanics_catalogue.levels.max_level
  const tierInfo = TIER_INFO[gamification.tier] || TIER_INFO['none']

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏆 Achievements</h1>

      {/* Level & XP */}
      <div className="card mb-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-purple-200 text-sm">Level</p>
            <p className="text-5xl font-black">{gamification.level}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-sm">Total XP</p>
            <p className="text-3xl font-bold">{gamification.xp}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-purple-200 mb-1">
            <span>Progress to level {Math.min(gamification.level + 1, maxLevel)}</span>
            <span>{levelProgress}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Overall Progress</h2>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Journey completion</span>
          <span className="font-bold text-gray-700">{progressPct}%</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-400 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {[25, 50, 75, 100].map(m => (
            <span key={m} className={progressPct >= m ? 'text-green-500 font-bold' : ''}>{m}%</span>
          ))}
        </div>
      </div>

      {/* Tier */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Current Tier</h2>
        <div className={`p-4 rounded-xl ${gamification.tier === 'none' ? 'bg-gray-50' : 'bg-indigo-50'}`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{tierInfo.icon}</span>
            <div>
              <p className="font-bold text-gray-900">{tierInfo.label}</p>
              <p className="text-sm text-gray-500">{tierInfo.desc}</p>
            </div>
          </div>
        </div>

        {/* Tier progression */}
        <div className="mt-4 space-y-2">
          {db.gamification.mechanics_catalogue.tiers.map(tier => {
            const info = TIER_INFO[tier.tier_id]
            const isUnlocked = gamification.tier === tier.tier_id ||
              (tier.tier_id === 'tier_explorer' && ['tier_builder', 'tier_leader'].includes(gamification.tier)) ||
              (tier.tier_id === 'tier_builder' && gamification.tier === 'tier_leader')
            return (
              <div key={tier.tier_id} className={`flex items-center gap-3 p-3 rounded-xl border ${isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isUnlocked ? 'text-green-800' : 'text-gray-500'}`}>{tier.name}</p>
                  <p className="text-xs text-gray-400">{tier.criteria}</p>
                </div>
                {isUnlocked && <span className="text-green-500 font-bold">✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Badges ({gamification.badges.length}/{badges.length})</h2>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(badge => {
            const earned = gamification.badges.includes(badge.badge_id)
            return (
              <div
                key={badge.badge_id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  earned
                    ? 'bg-amber-50 border-amber-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-3xl mb-1">{earned ? BADGE_ICONS[badge.badge_id] : '🔒'}</div>
                <p className={`font-bold text-sm ${earned ? 'text-amber-800' : 'text-gray-400'}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{badge.criteria}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quests */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Quests</h2>
        <div className="space-y-4">
          {quests.map(quest => {
            const progress = gamification.questProgress[quest.quest_id] || 0
            const pct = Math.round((progress / quest.steps.length) * 100)
            return (
              <div key={quest.quest_id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-900">{quest.name}</p>
                  <span className="text-xs text-gray-500">{progress}/{quest.steps.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="space-y-1">
                  {quest.steps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${i < progress ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{i < progress ? '✓' : '○'}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* XP history */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-3">XP Awards</h2>
        <div className="space-y-2 text-sm">
          {Object.entries(db.gamification.mechanics_catalogue.xp.default_awards).map(([action, xp]) => {
            const labels = {
              complete_questionnaire: '📝 Complete questionnaire',
              export_report: '📥 Export report',
              complete_next_step: '✅ Complete a challenge/next step',
            }
            return (
              <div key={action} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{labels[action] || action}</span>
                <span className="font-bold text-amber-600">+{xp} XP</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onNavigate('challenges')} className="btn-primary bg-orange-500 flex-1 text-sm">
          ⚡ Go to Challenges
        </button>
        <button onClick={() => onNavigate('results')} className="btn-primary bg-gray-700 flex-1 text-sm">
          📊 View Results
        </button>
      </div>
    </div>
  )
}
