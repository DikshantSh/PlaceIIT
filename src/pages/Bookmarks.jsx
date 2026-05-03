import { useApp } from '../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'
import RoleCard from '../components/RoleCard.jsx'

export default function Bookmarks() {
  const { roles, bookmarks } = useApp()
  const navigate = useNavigate()
  const saved = roles.filter(r => bookmarks.includes(r.id))

  if (saved.length === 0) {
    return (
      <div className="container empty-state">
        <div className="empty-state__icon">📌</div>
        <div className="empty-state__title">No bookmarks yet</div>
        <div className="empty-state__text">Save roles you're interested in using the ☆ button</div>
        <button className="btn btn--primary" onClick={() => navigate('/roles')}>Browse Roles</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: 'var(--sp-8) 0' }}>
      <div className="section-header">
        <h1 className="section-header__title">Bookmarked Roles ({saved.length})</h1>
      </div>
      <div className="roles-grid">
        {saved.map(r => <RoleCard key={r.id} role={r} />)}
      </div>
    </div>
  )
}
