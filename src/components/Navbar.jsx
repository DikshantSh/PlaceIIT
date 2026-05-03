import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Navbar() {
  const { theme, dispatch, bookmarks } = useApp()

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo">PlaceIIT</NavLink>
        <ul className="navbar__links">
          <li><NavLink to="/roles" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Browse Roles</NavLink></li>
          <li><NavLink to="/analytics" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Analytics</NavLink></li>
          <li><NavLink to="/compare" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>Compare</NavLink></li>
          <li>
            <NavLink to="/bookmarks" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
              Bookmarks {bookmarks.length > 0 && <span className="badge badge--info">{bookmarks.length}</span>}
            </NavLink>
          </li>
        </ul>
        <div className="navbar__actions">
          <button
            className="theme-toggle"
            onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })}
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
