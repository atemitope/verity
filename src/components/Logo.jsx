import React from 'react'

/**
 * The Verity mark: four arcs forming a ring, one per colour energy
 * (Cool Blue, Earth Green, Sunshine Yellow, Fiery Red).
 *
 * Geometric rather than pictorial so it stays legible from 16px (favicon)
 * up to hero size, on both light and dark surfaces.
 *
 * Pass `title` to expose it as an image to assistive tech; omit it for
 * decorative use (the default), where it is hidden from screen readers.
 */
export default function Logo({ className = '', title }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <g fill="none" strokeWidth="5" strokeLinecap="round">
        <path d="M17.15 5.06A11 11 0 0 1 26.94 14.85" stroke="#3b82f6" />
        <path d="M26.94 17.15A11 11 0 0 1 17.15 26.94" stroke="#22c55e" />
        <path d="M14.85 26.94A11 11 0 0 1 5.06 17.15" stroke="#eab308" />
        <path d="M5.06 14.85A11 11 0 0 1 14.85 5.06" stroke="#ef4444" />
      </g>
    </svg>
  )
}
