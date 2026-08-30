import { colourConfig } from './colours'

/** Whole days between an ISO date and now. */
export function daysSince(isoDate) {
  if (!isoDate) return null
  const ms = Date.now() - new Date(isoDate).getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

/**
 * Builds a shareable "journey" recap from a person's scores + gamification.
 * Works for the owner (full state available) and for a shared-link viewer
 * (server/share.js's public endpoint also extracts gamification alongside
 * scores/report, so the same shape reaches both call sites).
 *
 * `memberSinceDays` is optional — only the owner's own view (via the
 * account-only `/api/auth/me`) has a real signed-in-since date; a shared
 * link never exposes account metadata, so the headline degrades gracefully
 * without it.
 */
export function buildRecap({ scores, gamification, db, memberSinceDays = null }) {
  if (!scores) return null

  const dominant = db.colours[scores.dominantColour]
  const cfg = colourConfig(scores.dominantColour)
  const challengesCompleted = gamification
    ? Object.values(gamification.completedChallenges || {}).filter(Boolean).length
    : 0
  const badgeCount = gamification?.badges?.length ?? 0
  const level = gamification?.level ?? 1

  const headline = memberSinceDays != null
    ? `${memberSinceDays} day${memberSinceDays === 1 ? '' : 's'} of ${dominant.display_name} energy`
    : `Leading with ${dominant.display_name} energy`

  return {
    dominantColour: scores.dominantColour,
    dominantName: dominant.display_name,
    coreDrive: dominant.core_drive,
    cfg,
    headline,
    level,
    badgeCount,
    challengesCompleted,
    memberSinceDays,
  }
}
