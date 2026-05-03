import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import RoleCard from '../components/RoleCard.jsx'

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!end) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return count;
}

export default function Home() {
  const { roles, stats, dispatch, formatINR } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const topRoles = roles.slice(0, 6)

  const countCompanies = useCountUp(stats.totalCompanies)
  const countRoles = useCountUp(stats.totalRoles)
  const countAvg = useCountUp(stats.avgCTC)
  const countMax = useCountUp(stats.maxCTC)

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
    <div className="page-transition">
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
            <div className="stat-card__value">{countCompanies}</div>
            <div className="stat-card__label">Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{countRoles}</div>
            <div className="stat-card__label">Roles</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatINR(countAvg)}</div>
            <div className="stat-card__label">Avg CTC</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatINR(countMax)}</div>
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
    </div>
  )
}
