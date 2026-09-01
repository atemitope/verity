import React, { useState, useEffect } from 'react'
import { colourConfig } from '../colours'
import { buildDomains } from '../domains'
import { getShareStatus, createShareLink, revokeShareLink } from '../share'
import DomainSections from './DomainSections'

const TIER_LABELS = {
  tier_explorer: '🧭 Explorer',
  tier_builder: '🔨 Builder',
  tier_leader: '👑 Leader',
}

/**
 * A person's behavioural profile, browsable by the questions they actually
 * ask ("How do I communicate?"). Account and app settings live in Settings —
 * "profile" previously meant both, which made the real profile hard to find.
 */
export default function Profile({ db, state, user, onLogin, onNavigate }) {
  const { scores, gamification } = state
  const [shareToken, setShareToken] = useState(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) { setShareToken(null); return }
    getShareStatus().then(t => setShareToken(t))
  }, [user])

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null

  const handleCreateShare = async () => {
    setShareLoading(true)
    const token = await createShareLink()
    setShareToken(token)
    setShareLoading(false)
  }

  const handleRevokeShare = async () => {
    setShareLoading(true)
    const ok = await revokeShareLink()
    if (ok) setShareToken(null)
    setShareLoading(false)
  }

  const handleCopyShare = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — the URL is still selectable in the input.
    }
  }

  // No assessment yet: there is no profile to show.
  if (!scores) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Your profile</h1>
        <div className="card text-center py-8">
          <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
            Take the assessment to see how you communicate, what you're like under pressure,
            and how others can work with you.
          </p>
          <button onClick={() => onNavigate('quiz')} className="btn-primary bg-gray-900 hover:bg-gray-800 text-sm">
            Take the assessment
          </button>
        </div>
      </div>
    )
  }

  const dominantCfg = colourConfig(scores.dominantColour)
  const domains = buildDomains(scores, db)

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your profile</h1>

      {/* Identity: behaviour first, colour as the label for it. */}
      <div className={`card sheen relative overflow-hidden ring-0 bg-gradient-to-br ${dominantCfg.hero} ${dominantCfg.heroFg} shadow-[0_10px_30px_-8px_rgba(16,24,40,0.35)]`}>
        <div className="absolute -right-6 -bottom-8 text-[9rem] leading-none opacity-15 select-none" aria-hidden="true">
          {dominantCfg.emoji}
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`${dominantCfg.heroFgSoft} text-xs uppercase tracking-[0.15em] mb-1`}>Your dominant energy</p>
            <p className="text-2xl font-bold">{dominantCfg.emoji} {db.colours[scores.dominantColour].display_name}</p>
            <p className={`${dominantCfg.heroFgSoft} text-sm mt-1`}>{db.colours[scores.dominantColour].core_drive}</p>
          </div>
          <div className="flex gap-2">
            <div className={`${dominantCfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-3 py-2 text-center`}>
              <p className={`${dominantCfg.heroFgSoft} text-[10px] mb-0.5`}>Level</p>
              <p className="font-semibold tnums">{gamification.level}</p>
            </div>
            <div className={`${dominantCfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-3 py-2 text-center`}>
              <p className={`${dominantCfg.heroFgSoft} text-[10px] mb-0.5`}>Badges</p>
              <p className="font-semibold tnums">{gamification.badges.length}</p>
            </div>
            {gamification.tier !== 'none' && (
              <div className={`${dominantCfg.heroChip} backdrop-blur-sm ring-1 rounded-xl px-3 py-2 text-center`}>
                <p className={`${dominantCfg.heroFgSoft} text-[10px] mb-0.5`}>Tier</p>
                <p className="font-semibold">{TIER_LABELS[gamification.tier] || gamification.tier}</p>
              </div>
            )}
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('recap')}
            className={`text-xs font-medium ${dominantCfg.heroFgSoft} hover:opacity-80 transition-opacity underline underline-offset-2`}
          >
            View your journey →
          </button>
          <button
            onClick={() => onNavigate('report')}
            className={`text-xs font-medium ${dominantCfg.heroFgSoft} hover:opacity-80 transition-opacity underline underline-offset-2`}
          >
            Read the full report →
          </button>
        </div>
      </div>

      {/* The behavioural domains — the substance of the profile. */}
      <DomainSections domains={domains} idPrefix="profile" />

      {/* Sharing this profile */}
      {user && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1">Share your profile</h2>
          <p className="text-sm text-gray-500 mb-4">
            Anyone with this link can view your results. No sign-in required. You can revoke it anytime,
            and no one can search for or browse other people's profiles.
          </p>
          {shareToken ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={e => e.target.select()}
                className="min-w-0 flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-700"
              />
              <button onClick={handleCopyShare} className="btn-ghost ring-1 ring-gray-900/10 text-sm shrink-0">
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
              <button
                onClick={handleRevokeShare}
                disabled={shareLoading}
                className="btn-ghost ring-1 ring-red-500/20 text-red-700 hover:bg-red-50 text-sm shrink-0 disabled:opacity-40"
              >
                Revoke
              </button>
            </div>
          ) : (
            <button
              onClick={handleCreateShare}
              disabled={shareLoading}
              className="btn-primary bg-gray-900 hover:bg-gray-800 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {shareLoading ? 'Creating…' : 'Create link'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
