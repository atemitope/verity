import React, { useState } from 'react'

/**
 * The three post-results reflection prompts from db.json.
 *
 * These were authored for exactly this moment — the last one asks for "one
 * small change you can run for 14 days", which is the 14-day experiment the
 * challenges implement — but nothing ever rendered them. Wiring them up does
 * three things at once: it turns a page you read into a page you use, it
 * introduces the next actions in the reader's own words instead of a bare
 * button, and it feeds gamification.reflectionsAnswered, which gates the
 * Reflector badge and the Builder tier and was previously unreachable.
 */
export default function ReflectionPrompts({ db, answers = {}, onSave, id = 'reflect' }) {
  const prompts = db.reflection_prompts?.post_results || []
  const [drafts, setDrafts] = useState({})
  const [justSaved, setJustSaved] = useState(null)

  if (!prompts.length) return null

  const answeredCount = prompts.filter((_, i) => (answers[i] || '').trim().length > 0).length

  const draftFor = i => (drafts[i] !== undefined ? drafts[i] : answers[i] || '')

  const handleSave = i => {
    const text = draftFor(i).trim()
    if (!text) return
    onSave(i, text)
    setDrafts(d => ({ ...d, [i]: undefined }))
    setJustSaved(i)
    setTimeout(() => setJustSaved(cur => (cur === i ? null : cur)), 2000)
  }

  return (
    <section id={id} className="card scroll-mt-24">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid place-items-center w-9 h-9 rounded-xl bg-gray-100 text-base leading-none shrink-0 ring-1 ring-gray-900/[0.04]"
        >
          ✍️
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900 text-lg tracking-tight">Make it yours</h2>
          <p className="text-sm text-gray-500 mt-1">
            A profile you recognise is more useful than one you agree with. Three questions —
            answer them in your own words and they stay with your profile.
          </p>
        </div>
        <span className="text-xs text-gray-500 tnums shrink-0 pt-1">{answeredCount}/{prompts.length}</span>
      </div>

      <ol className="space-y-5 mt-5">
        {prompts.map((prompt, i) => {
          const saved = (answers[i] || '').trim()
          const draft = draftFor(i)
          const dirty = draft.trim() !== saved
          return (
            <li key={i}>
              <label htmlFor={`${id}-prompt-${i}`} className="flex items-start gap-2.5 mb-2">
                <span
                  aria-hidden="true"
                  className={`grid place-items-center w-5 h-5 rounded-full text-[11px] font-semibold shrink-0 mt-0.5 tnums ${
                    saved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {saved ? '✓' : i + 1}
                </span>
                <span className="text-sm font-medium text-gray-800 leading-snug">{prompt}</span>
              </label>
              <textarea
                id={`${id}-prompt-${i}`}
                rows={2}
                value={draft}
                onChange={e => setDrafts(d => ({ ...d, [i]: e.target.value }))}
                placeholder="Your answer…"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 leading-relaxed
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleSave(i)}
                  disabled={!dirty || !draft.trim()}
                  className="btn-ghost ring-1 ring-gray-900/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saved && !dirty ? 'Saved' : 'Save answer'}
                </button>
                {justSaved === i && (
                  <span className="text-xs text-emerald-700 animate-fade-in">Saved ✓</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {answeredCount < prompts.length && (
        <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-100">
          Answer all three to earn the <span className="font-medium text-gray-700">Reflector</span> badge.
        </p>
      )}
    </section>
  )
}
