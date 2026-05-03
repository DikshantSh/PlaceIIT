import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import RoleCard from '../components/RoleCard.jsx'

const ITEMS_PER_PAGE = 24

export default function Browse() {
  const { filteredRoles, filters, searchQuery, sortBy, dispatch, roles } = useApp()
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q'); const sort = searchParams.get('sort'); const minCTC = searchParams.get('minCTC');
    const maxCGPA = searchParams.get('maxCGPA'); const tag = searchParams.get('tag'); const bond = searchParams.get('bond');
    const backlog = searchParams.get('backlog'); const company = searchParams.get('company'); const p = searchParams.get('page');

    if (q) dispatch({ type: 'SET_SEARCH', payload: q })
    if (sort) dispatch({ type: 'SET_SORT', payload: sort })
    if (minCTC) dispatch({ type: 'SET_FILTER', key: 'ctcMin', value: Number(minCTC) })
    if (maxCGPA) dispatch({ type: 'SET_FILTER', key: 'cgpaMax', value: Number(maxCGPA) })
    if (tag) dispatch({ type: 'SET_FILTER', key: 'roleTag', value: tag })
    if (company) dispatch({ type: 'SET_FILTER', key: 'company', value: company })
    if (bond !== null) dispatch({ type: 'SET_FILTER', key: 'bondOnly', value: bond === 'true' ? true : bond === 'false' ? false : null })
    if (backlog === 'true') dispatch({ type: 'SET_FILTER', key: 'backlogEligible', value: true })
    if (p) setPage(Number(p))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (sortBy !== 'ctc-desc') params.set('sort', sortBy)
    if (filters.ctcMin > 0) params.set('minCTC', filters.ctcMin)
    if (filters.cgpaMax < 10) params.set('maxCGPA', filters.cgpaMax)
    if (filters.roleTag) params.set('tag', filters.roleTag)
    if (filters.company) params.set('company', filters.company)
    if (filters.bondOnly !== null) params.set('bond', filters.bondOnly)
    if (filters.backlogEligible) params.set('backlog', 'true')
    if (page > 1) params.set('page', page)
    setSearchParams(params, { replace: true })
  }, [searchQuery, sortBy, filters, page, setSearchParams])

  const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE)
  const paged = filteredRoles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const setFilter = (key, value) => { dispatch({ type: 'SET_FILTER', key, value }); setPage(1) }

  return (
    <div className="container page-transition">
      <button className="fab-filter" onClick={() => setIsSidebarOpen(true)}>
        ⚙️ Filters
      </button>

      <div className="browse-layout">
        {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
        <aside className={`filters-sidebar ${isSidebarOpen ? 'filters-sidebar--open' : ''}`} id="filters-sidebar">
          <div className="sidebar-header-mobile">
            <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Filters</h3>
            <button className="btn-close" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Search</label>
            <input className="input" placeholder="Company, role, skill..." value={searchQuery}
              autoComplete="off"
              onChange={e => { dispatch({ type: 'SET_SEARCH', payload: e.target.value }); setPage(1) }} id="search-input" />
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Min CTC: ₹{(filters.ctcMin / 100000).toFixed(0)} LPA</label>
            <input type="range" min={0} max={5000000} step={100000} value={filters.ctcMin}
              onChange={e => setFilter('ctcMin', +e.target.value)} />
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Max CGPA Required: {filters.cgpaMax}</label>
            <input type="range" min={0} max={10} step={0.5} value={filters.cgpaMax}
              onChange={e => setFilter('cgpaMax', +e.target.value)} />
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Bond</label>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              {[{ l: 'Any', v: null }, { l: 'No Bond', v: false }, { l: 'Has Bond', v: true }].map(o => (
                <button key={String(o.v)} className={`hero__chip ${filters.bondOnly === o.v ? 'hero__chip--active' : ''}`}
                  style={filters.bondOnly === o.v ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' } : {}}
                  onClick={() => setFilter('bondOnly', o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          <label className="filter-toggle">
            <input type="checkbox" checked={filters.backlogEligible === true}
              onChange={e => setFilter('backlogEligible', e.target.checked ? true : null)} />
            Backlog Eligible Only
          </label>

          <div className="filter-group">
            <label className="filter-group__label">Role Tag</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
              {[null, 'super-dream', 'dream', 'core', 'standard'].map(t => (
                <button key={String(t)} className="hero__chip"
                  style={filters.roleTag === t ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' } : {}}
                  onClick={() => setFilter('roleTag', t)}>{t ? t.replace('-', ' ') : 'All'}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">Company</label>
            <input className="input" placeholder="Filter by company..." value={filters.company}
              autoComplete="off"
              onChange={e => setFilter('company', e.target.value)} />
          </div>

          <button className="btn btn--ghost" style={{ width: '100%' }}
            onClick={() => { dispatch({ type: 'RESET_FILTERS' }); setPage(1) }}>Reset All Filters</button>
        </aside>

        <div>
          <div className="results-header">
            <span className="results-header__count">Showing {filteredRoles.length} of {roles.length} roles</span>
            <div className="results-header__sort">
              <select value={sortBy} onChange={e => dispatch({ type: 'SET_SORT', payload: e.target.value })} id="sort-select">
                <option value="ctc-desc">CTC: High → Low</option>
                <option value="ctc-asc">CTC: Low → High</option>
                <option value="company-az">Company: A → Z</option>
                <option value="cgpa-asc">CGPA: Low → High</option>
              </select>
            </div>
          </div>

          {paged.length > 0 ? (
            <div className="roles-grid">{paged.map(r => <RoleCard key={r.id} role={r} />)}</div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <div className="empty-state__title">No roles found</div>
              <div className="empty-state__text">Try adjusting your filters or search query</div>
              <button className="btn btn--primary" onClick={() => { dispatch({ type: 'RESET_FILTERS' }); setPage(1) }}>Reset Filters</button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination" id="pagination">
              <button className="pagination__btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] < p - 1 && <span style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}
                    <button className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
                      onClick={() => setPage(p)}>{p}</button>
                  </React.Fragment>
                ))}
              <button className="pagination__btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
