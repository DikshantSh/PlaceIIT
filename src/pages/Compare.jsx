import { useApp } from '../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Compare() {
  const { roles, compareList, dispatch, formatCTC, formatINR } = useApp()
  const navigate = useNavigate()
  const selected = compareList.map(id => roles.find(r => r.id === id)).filter(Boolean)

  if (selected.length === 0) {
    return (
      <div className="container empty-state">
        <div className="empty-state__icon">⚖️</div>
        <div className="empty-state__title">No roles to compare</div>
        <div className="empty-state__text">Add roles from the Browse page using the "+ Compare" button</div>
        <button className="btn btn--primary" onClick={() => navigate('/roles')}>Browse Roles</button>
      </div>
    )
  }

  const fields = [
    { label: 'CTC', get: r => formatCTC(r.ctc, r.currency), best: 'max', raw: r => r.ctcINR },
    { label: 'Base Salary', get: r => formatINR(r.baseSalary), best: 'max', raw: r => r.baseSalary },
    { label: 'Gross', get: r => formatINR(r.gross), best: 'max', raw: r => r.gross },
    { label: 'Fixed Take Home', get: r => formatINR(r.fixedTakeHome), best: 'max', raw: r => r.fixedTakeHome },
    { label: '1st Year CTC', get: r => formatINR(r.firstYearCTC), best: 'max', raw: r => r.firstYearCTC },
    { label: 'Joining Bonus', get: r => formatINR(r.joiningBonus), best: 'max', raw: r => r.joiningBonus },
    { label: 'CGPA Required', get: r => r.cgpaRequired || 'None', best: 'min', raw: r => r.cgpaRequired || 0 },
    { label: 'Bond', get: r => r.hasBond ? `${r.bondDuration}` : 'No', best: 'bool-false', raw: r => r.hasBond },
    { label: 'Backlog Eligible', get: r => r.backlogEligible === true ? 'Yes' : r.backlogEligible === false ? 'No' : '—', best: 'bool-true', raw: r => r.backlogEligible },
  ]

  const getWinner = (field) => {
    const vals = selected.map(r => field.raw(r))
    if (field.best === 'max') return vals.indexOf(Math.max(...vals))
    if (field.best === 'min') return vals.indexOf(Math.min(...vals.filter(v => v > 0)))
    if (field.best === 'bool-false') { const idx = vals.indexOf(false); return idx >= 0 ? idx : -1 }
    if (field.best === 'bool-true') { const idx = vals.indexOf(true); return idx >= 0 ? idx : -1 }
    return -1
  }

  return (
    <div className="container" style={{ padding: 'var(--sp-8) 0' }}>
      <div className="section-header">
        <h1 className="section-header__title">Compare Roles</h1>
        <button className="btn btn--ghost" onClick={() => dispatch({ type: 'CLEAR_COMPARE' })}>Clear All</button>
      </div>
      <div className="compare-grid" id="compare-grid">
        {selected.map((role, colIdx) => (
          <div className="card compare-card" key={role.id}>
            <div className="compare-card__header">
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>{role.company}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>{role.designation}</div>
              <span className={`badge badge--${role.roleTag}`} style={{ marginTop: 'var(--sp-2)' }}>{role.roleTag.replace('-',' ')}</span>
            </div>
            {fields.map((field) => {
              const winnerIdx = getWinner(field)
              const isWinner = winnerIdx === colIdx && selected.length > 1
              const isDanger = field.label === 'Bond' && role.hasBond
              return (
                <div className="compare-row" key={field.label}>
                  <span className="compare-row__label">{field.label}</span>
                  <span className={`compare-row__value ${isWinner ? 'compare-row__value--winner' : ''} ${isDanger ? 'compare-row__value--danger' : ''}`}>
                    {field.get(role)}
                  </span>
                </div>
              )
            })}
            <button className="btn btn--ghost" style={{ width: '100%', marginTop: 'var(--sp-4)' }}
              onClick={() => dispatch({ type: 'TOGGLE_COMPARE', payload: role.id })}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}
