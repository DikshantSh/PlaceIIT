import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import RoleCard from '../components/RoleCard.jsx'

export default function Home() {
  const { roles, stats, dispatch, formatINR } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const topRoles = roles.slice(0, 6)

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch({ type: 'SET_SEARCH', payload: query })
    navigate('/roles')
  }

  const quickFilter = (key, value) => {
    dispatch({ type: 'RESET_FILTERS' })
    dispatch({ type: 'SET_FILTER', key, value })
    navigate('/roles')
  }

  return (
    <>
      <section className="hero" id="hero">
        <div className="container">
          <h1 className="hero__title">
            Explore <span>{stats.totalRoles}+ roles</span> from<br />{stats.totalCompanies} companies
          </h1>
          <p className="hero__sub">
            IIT Kharagpur Placement Insights — Search, filter, compare, and bookmark roles instantly.
          </p>
          <form className="hero__search" onSubmit={handleSearch}>
            <span className="hero__search-icon">🔍</span>
            <input
              className="input"
              type="text"
              placeholder="Search companies, roles, skills..."
              value={query}
              autoComplete="off"
              onChange={e => setQuery(e.target.value)}
              id="hero-search"
            />
          </form>
          <div className="hero__chips">
            <button className="hero__chip" onClick={() => quickFilter('ctcMin', 2500000)}>CTC &gt; 25 LPA</button>
            <button className="hero__chip" onClick={() => quickFilter('bondOnly', false)}>No Bond</button>
            <button className="hero__chip" onClick={() => quickFilter('cgpaMax', 7)}>CGPA ≤ 7</button>
            <button className="hero__chip" onClick={() => quickFilter('roleTag', 'super-dream')}>Super Dream</button>
            <button className="hero__chip" onClick={() => quickFilter('roleTag', 'dream')}>Dream</button>
            <button className="hero__chip" onClick={() => quickFilter('backlogEligible', true)}>Backlog OK</button>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="stats" id="stats-bar">
          <div className="stat-card">
            <div className="stat-card__value">{stats.totalCompanies}</div>
            <div className="stat-card__label">Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.totalRoles}</div>
            <div className="stat-card__label">Roles</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatINR(stats.avgCTC)}</div>
            <div className="stat-card__label">Avg CTC</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatINR(stats.maxCTC)}</div>
            <div className="stat-card__label">Highest CTC</div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="section-header">
          <h2 className="section-header__title">Top Paying Roles</h2>
          <button className="btn btn--ghost" onClick={() => navigate('/roles')}>View All →</button>
        </div>
        <div className="roles-grid">
          {topRoles.map(role => <RoleCard key={role.id} role={role} />)}
        </div>
      </section>
    </>
  )
}
