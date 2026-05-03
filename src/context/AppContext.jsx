import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import rolesData from '../data/roles.json'

const AppContext = createContext()

const EXCHANGE_RATES = { INR: 1, USD: 85, JPY: 0.57, EUR: 93, GBP: 108 }

function formatCTC(ctc, currency) {
  if (!ctc || ctc === 0) return 'Not disclosed'
  if (currency === 'INR') {
    if (ctc >= 10000000) return `₹${(ctc / 10000000).toFixed(2)} Cr`
    if (ctc >= 100000) return `₹${(ctc / 100000).toFixed(1)} LPA`
    return `₹${ctc.toLocaleString('en-IN')}`
  }
  const sym = { USD: '$', JPY: '¥', EUR: '€', GBP: '£' }[currency] || ''
  return `${sym}${ctc.toLocaleString()}`
}

function formatINR(amount) {
  if (!amount || amount === 0) return '—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

function ctcToINR(ctc, currency) {
  return Math.round(ctc * (EXCHANGE_RATES[currency] || 1))
}

const initialState = {
  roles: rolesData,
  searchQuery: '',
  filters: { ctcMin: 0, ctcMax: 20000000, cgpaMax: 10, bondOnly: null, backlogEligible: null, roleTag: null, company: '' },
  sortBy: 'ctc-desc',
  compareList: JSON.parse(localStorage.getItem('placeiit-compare') || '[]'),
  bookmarks: JSON.parse(localStorage.getItem('placeiit-bookmarks') || '[]'),
  theme: localStorage.getItem('placeiit-theme') || 'dark',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH': return { ...state, searchQuery: action.payload }
    case 'SET_FILTER': return { ...state, filters: { ...state.filters, [action.key]: action.value } }
    case 'RESET_FILTERS': return { ...state, filters: initialState.filters, searchQuery: '' }
    case 'SET_SORT': return { ...state, sortBy: action.payload }
    case 'TOGGLE_BOOKMARK': {
      const id = action.payload
      const bm = state.bookmarks.includes(id) ? state.bookmarks.filter(b => b !== id) : [...state.bookmarks, id]
      localStorage.setItem('placeiit-bookmarks', JSON.stringify(bm))
      return { ...state, bookmarks: bm }
    }
    case 'TOGGLE_COMPARE': {
      const id = action.payload
      let cl = state.compareList.includes(id) ? state.compareList.filter(c => c !== id) : state.compareList.length < 3 ? [...state.compareList, id] : state.compareList
      localStorage.setItem('placeiit-compare', JSON.stringify(cl))
      return { ...state, compareList: cl }
    }
    case 'CLEAR_COMPARE': {
      localStorage.setItem('placeiit-compare', '[]')
      return { ...state, compareList: [] }
    }
    case 'SET_THEME': {
      localStorage.setItem('placeiit-theme', action.payload)
      return { ...state, theme: action.payload }
    }
    default: return state
  }
}

const fuseOptions = { keys: ['company', 'designation', { name: 'skills', weight: 0.5 }, { name: 'jobDescription', weight: 0.3 }], threshold: 0.35, includeScore: true }

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => { document.documentElement.setAttribute('data-theme', state.theme) }, [state.theme])

  const fuse = useMemo(() => new Fuse(state.roles, fuseOptions), [state.roles])

  const filteredRoles = useMemo(() => {
    let results = state.roles
    if (state.searchQuery.trim()) {
      results = fuse.search(state.searchQuery).map(r => r.item)
    }
    const f = state.filters
    results = results.filter(r => {
      if (r.ctcINR < f.ctcMin || r.ctcINR > f.ctcMax) return false
      if (f.cgpaMax < 10 && r.cgpaRequired !== null && r.cgpaRequired > f.cgpaMax) return false
      if (f.bondOnly === true && !r.hasBond) return false
      if (f.bondOnly === false && r.hasBond) return false
      if (f.backlogEligible === true && r.backlogEligible !== true) return false
      if (f.roleTag && r.roleTag !== f.roleTag) return false
      if (f.company && !r.company.toLowerCase().includes(f.company.toLowerCase())) return false
      return true
    })
    switch (state.sortBy) {
      case 'ctc-desc': results.sort((a, b) => b.ctcINR - a.ctcINR); break
      case 'ctc-asc': results.sort((a, b) => a.ctcINR - b.ctcINR); break
      case 'company-az': results.sort((a, b) => a.company.localeCompare(b.company)); break
      case 'cgpa-asc': results.sort((a, b) => (a.cgpaRequired || 0) - (b.cgpaRequired || 0)); break
    }
    return results
  }, [state.roles, state.searchQuery, state.filters, state.sortBy, fuse])

  const stats = useMemo(() => ({
    totalRoles: state.roles.length,
    totalCompanies: new Set(state.roles.map(r => r.company)).size,
    avgCTC: Math.round(state.roles.filter(r => r.currency === 'INR' && r.ctc > 0).reduce((s, r) => s + r.ctc, 0) / state.roles.filter(r => r.currency === 'INR' && r.ctc > 0).length),
    maxCTC: Math.max(...state.roles.map(r => r.ctcINR)),
  }), [state.roles])

  const value = { ...state, filteredRoles, stats, dispatch, formatCTC, formatINR, ctcToINR, EXCHANGE_RATES }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() { return useContext(AppContext) }
