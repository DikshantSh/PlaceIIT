import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function RoleCard({ role }) {
  const { bookmarks, compareList, dispatch, formatCTC, formatINR, ctcToINR } = useApp()
  const navigate = useNavigate()
  const isBookmarked = bookmarks.includes(role.id)
  const isComparing = compareList.includes(role.id)
  const showINRTooltip = role.currency !== 'INR'
  const inrValue = showINRTooltip ? ctcToINR(role.ctc, role.currency) : null

  return (
    <div className="card role-card" onClick={() => navigate(`/roles/${role.id}`)} id={`role-${role.id}`}>
      <div className="role-card__header">
        <div>
          <div className="role-card__company">{role.company}</div>
          <div className="role-card__designation">{role.designation}</div>
        </div>
        <span className={`badge badge--${role.roleTag}`}>{role.roleTag.replace('-', ' ')}</span>
      </div>

      <div className="role-card__ctc">
        {formatCTC(role.ctc, role.currency)}
        {showINRTooltip && inrValue > 0 && (
          <span className="role-card__ctc-tooltip" title={`≈ ${formatINR(inrValue)} (approx)`}>
            {' '}≈ {formatINR(inrValue)}
          </span>
        )}
      </div>

      <div className="role-card__meta">
        {role.hasCGPACriteria && role.cgpaRequired && (
          <span className="badge badge--info">CGPA ≥ {role.cgpaRequired}</span>
        )}
        <span className={`badge ${role.hasBond ? 'badge--bond' : 'badge--no-bond'}`}>
          {role.hasBond ? `Bond: ${role.bondDuration || 'Yes'}` : 'No Bond'}
        </span>
      </div>

      {role.skills.length > 0 && (
        <div className="role-card__skills">
          {role.skills.slice(0, 4).map((s, i) => <span key={i} className="role-card__skill">{s}</span>)}
          {role.skills.length > 4 && <span className="role-card__skill">+{role.skills.length - 4}</span>}
        </div>
      )}

      <div className="role-card__actions" onClick={e => e.stopPropagation()}>
        <button
          className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', payload: role.id })}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          aria-label="Toggle bookmark"
        >
          {isBookmarked ? '★' : '☆'}
        </button>
        <button
          className={`btn btn--ghost`}
          style={isComparing ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' } : {}}
          onClick={() => dispatch({ type: 'TOGGLE_COMPARE', payload: role.id })}
          aria-label="Toggle compare"
        >
          {isComparing ? '✓ Comparing' : '+ Compare'}
        </button>
      </div>
    </div>
  )
}
