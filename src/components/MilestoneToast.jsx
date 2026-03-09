import React from 'react'

export default function MilestoneToast({ toast }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className={`${colors[toast.type] || colors.success} text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-sm text-center`}>
        {toast.message}
      </div>
    </div>
  )
}
