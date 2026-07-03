import React, { useState, useEffect, useCallback, useRef } from 'react'
import { loadState, saveState, createInitialState } from './storage'
import { fetchMe, getServerState, putServerState, login as authLogin, logout as authLogout } from './auth'
import { computeScores, generateReport } from './scoring'
import { awardXP, checkBadges, checkTier, completeChallenge, getProgressPercent, getLevelProgress } from './gamification'
import Header from './components/Header'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Results from './components/Results'
import Report from './components/Report'
import Achievements from './components/Achievements'
import Challenges from './components/Challenges'
import TeamMode from './components/TeamMode'
import MilestoneToast from './components/MilestoneToast'

export default function App() {
  const [db, setDb] = useState(null)
  const [state, setState] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  // Refs for server-sync coordination (auth is additive; anonymous flow is unchanged).
  const stateRef = useRef(null)
  const adoptedRef = useRef(false)   // has this session reconciled with the server yet?
  const syncReadyRef = useRef(false) // safe to start pushing local changes upstream?
  const syncTimer = useRef(null)

  // Load database
  useEffect(() => {
    fetch('/db.json')
      .then(r => r.json())
      .then(data => {
        setDb(data)
        const saved = loadState()
        setState(saved || createInitialState())
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load database:', err)
        setLoading(false)
      })
  }, [])

  // Detect an existing session on load (null when signed out — flow stays on-device).
  useEffect(() => {
    fetchMe().then(setUser)
  }, [])

  // Keep a live ref to state for the adoption effect below.
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Persist state locally on every change (offline / anonymous default: on-device).
  useEffect(() => {
    if (state) saveState(state)
  }, [state])

  // On sign-in, reconcile with the account: server state is the source of truth
  // across devices; if the account has none yet, seed it from local state.
  useEffect(() => {
    if (!user || adoptedRef.current) return
    adoptedRef.current = true
    getServerState().then(serverState => {
      if (serverState) {
        setState(serverState)
        showToast('Synced your profile from your account', 'info')
      } else if (stateRef.current) {
        putServerState(stateRef.current)
      }
      syncReadyRef.current = true
    })
  }, [user, showToast])

  // While signed in, debounce-push local changes up to the account.
  useEffect(() => {
    if (!user || !state || !syncReadyRef.current) return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => { putServerState(state) }, 800)
    return () => clearTimeout(syncTimer.current)
  }, [state, user])

  const updateState = useCallback((updates) => {
    setState(prev => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      return next
    })
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const navigate = useCallback((view) => {
    updateState({ view })
  }, [updateState])

  const handleQuizComplete = useCallback((responses) => {
    if (!db) return
    const scores = computeScores(responses, db)
    const report = generateReport(scores, db)
    let newState = {
      ...state,
      responses,
      scores,
      report,
      assessmentComplete: true,
      view: 'results',
    }
    newState = awardXP(newState, db, 'complete_questionnaire')
    newState = checkBadges(newState, db)
    newState = checkTier(newState, db)
    setState(newState)
    showToast('🎉 Profile complete! +200 XP earned', 'success')
  }, [db, state, showToast])

  const handleReportRead = useCallback(() => {
    if (!state.reportRead) {
      let newState = { ...state, reportRead: true }
      newState = checkTier(newState, db)
      newState = checkBadges(newState, db)
      setState(newState)
    }
  }, [state, db])

  const handleExport = useCallback(() => {
    if (!state.scores) return
    const payload = {
      exportedAt: new Date().toISOString(),
      responses: state.responses,
      scores: state.scores,
      report: state.report,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colour-spectrum-profile.json'
    a.click()
    URL.revokeObjectURL(url)

    let newState = { ...state, exportedReport: true }
    newState = awardXP(newState, db, 'export_report')
    newState = checkBadges(newState, db)
    setState(newState)
    showToast('Report exported! +50 XP', 'success')
  }, [state, db, showToast])

  const handleCompleteChallenge = useCallback((challengeId, outcomeNote) => {
    let newState = completeChallenge(state, db, challengeId, outcomeNote)
    setState(newState)
    showToast('Challenge complete! +150 XP', 'success')
  }, [state, db, showToast])

  const handleLogin = useCallback(() => authLogin(), [])

  const handleLogout = useCallback(async () => {
    await authLogout()
    setUser(null)
    adoptedRef.current = false
    syncReadyRef.current = false
    showToast('Signed out', 'info')
  }, [showToast])

  const handleReset = useCallback(() => {
    if (window.confirm('Reset your profile? All progress will be lost.')) {
      setState(createInitialState())
      showToast('Profile reset', 'info')
    }
  }, [showToast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-bounce-soft">🌈</div>
          <p className="text-xl font-light">Loading Colour Spectrum Profile…</p>
        </div>
      </div>
    )
  }

  if (!db || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load. Please refresh.</p>
      </div>
    )
  }

  const progressPercent = getProgressPercent(state)
  const levelProgress = getLevelProgress(state, db)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        state={state}
        db={db}
        onNavigate={navigate}
        progressPercent={progressPercent}
        levelProgress={levelProgress}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {state.view === 'home' && (
          <Home db={db} state={state} onStart={() => navigate('quiz')} onNavigate={navigate} />
        )}
        {state.view === 'quiz' && (
          <Quiz
            db={db}
            state={state}
            onComplete={handleQuizComplete}
            onUpdateState={updateState}
          />
        )}
        {state.view === 'results' && state.scores && (
          <Results
            db={db}
            state={state}
            onViewReport={() => { handleReportRead(); navigate('report') }}
            onNavigate={navigate}
          />
        )}
        {state.view === 'report' && state.report && (
          <Report
            db={db}
            state={state}
            onExport={handleExport}
            onNavigate={navigate}
          />
        )}
        {state.view === 'achievements' && (
          <Achievements db={db} state={state} onNavigate={navigate} />
        )}
        {state.view === 'challenges' && (
          <Challenges
            db={db}
            state={state}
            onComplete={handleCompleteChallenge}
            onNavigate={navigate}
          />
        )}
        {state.view === 'team' && (
          <TeamMode
            db={db}
            state={state}
            onUpdateState={updateState}
            onNavigate={navigate}
            showToast={showToast}
          />
        )}
      </main>

      {/* Disclaimer */}
      <footer className="text-center text-xs text-gray-400 pb-8 px-4">
        Colour Spectrum Profile is a behavioural preference tool for self-awareness and development.
        It is not a clinical instrument and is not the proprietary Insights Discovery® Preference Evaluator.
      </footer>

      {toast && <MilestoneToast toast={toast} />}
    </div>
  )
}
