import React from 'react'

export default function MilestoneToast({ toast }) {
  const colors = {
    success: 'from-green-700 to-emerald-700',
    error: 'from-red-600 to-rose-600',
    info: 'from-blue-600 to-indigo-600',
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
      <div
        role="status"
        aria-live="polite"
        className={`bg-gradient-to-r ${colors[toast.type] || colors.success} text-white px-6 py-3 rounded-2xl
          shadow-[0_4px_12px_rgba(16,24,40,0.18),0_16px_40px_-8px_rgba(16,24,40,0.35)]
          ring-1 ring-white/15 text-sm font-medium max-w-sm text-center`}
      >
        {toast.message}
      </div>
    </div>
  )
}
