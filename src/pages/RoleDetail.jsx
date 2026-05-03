import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function RoleDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { roles, bookmarks, compareList, dispatch, formatCTC, formatINR, ctcToINR } = useApp()
  const role = roles.find(r => r.id === slug)
  const [tab, setTab] = useState('overview')
  const [expanded, setExpanded] = useState(false)

  if (!role) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h2>Role not found</h2><button className="btn btn--primary" onClick={() => navigate('/roles')}>Browse Roles</button></div>

  const isBookmarked = bookmarks.includes(role.id)
  const isComparing = compareList.includes(role.id)
  const showINRTooltip = role.currency !== 'INR'
  const inrValue = showINRTooltip ? ctcToINR(role.ctc, role.currency) : null

  const compRows = [
    ['Base Salary', role.baseSalary],
    ['Gross (p.a.)', role.gross],
    ['Fixed Take Home', role.fixedTakeHome],
    ['1st Year CTC', role.firstYearCTC],
    ['Joining Bonus', role.joiningBonus],
    ['Retention Bonus', role.retentionBonus],
    ['Relocation Bonus', role.relocationBonus],
  ].filter(([, v]) => v > 0)

  return (
    <div className="role-detail" id="role-detail">
      <button className="role-detail__back" onClick={() => navigate(-1)}>← Back</button>

      <div className="role-detail__header">
        <div className="role-detail__company">{role.company}</div>
        <div className="role-detail__designation">{role.designation}</div>
        <div className="role-detail__highlights">
          <span className={`badge badge--${role.roleTag}`} style={{ fontSize: 'var(--fs-sm)', padding: '6px 16px' }}>
            {role.roleTag.replace('-', ' ')}
          </span>
          <span className="badge badge--info" style={{ fontSize: 'var(--fs-sm)', padding: '6px 16px' }}>
            {formatCTC(role.ctc, role.currency)}
            {showINRTooltip && inrValue > 0 && ` ≈ ${formatINR(inrValue)}`}
          </span>
          {role.hasCGPACriteria && role.cgpaRequired && (
            <span className="badge badge--info" style={{ fontSize: 'var(--fs-sm)', padding: '6px 16px' }}>CGPA ≥ {role.cgpaRequired}</span>
          )}
          <span className={`badge ${role.hasBond ? 'badge--bond' : 'badge--no-bond'}`} style={{ fontSize: 'var(--fs-sm)', padding: '6px 16px' }}>
            {role.hasBond ? `Bond: ${role.bondDuration}` : 'No Bond'}
          </span>
        </div>
        <div className="role-detail__actions">
          <button className={`btn ${isBookmarked ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', payload: role.id })}>
            {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <button className={`btn ${isComparing ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => dispatch({ type: 'TOGGLE_COMPARE', payload: role.id })}>
            {isComparing ? '✓ Comparing' : '+ Compare'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'tab--active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab ${tab === 'compensation' ? 'tab--active' : ''}`} onClick={() => setTab('compensation')}>Compensation</button>
      </div>

      {tab === 'overview' && (
        <>
          {role.jobDescription && role.jobDescription !== 'Attached' && (
            <div className="detail-section">
              <h3 className="detail-section__title">Job Description</h3>
              <div className={`detail-section__content ${!expanded ? 'detail-section__content--truncated' : ''}`}>
                {role.jobDescription}
              </div>
              <button className="read-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            </div>
          )}

          {role.skills.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section__title">Required Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                {role.skills.map((s, i) => <span key={i} className="badge badge--info">{s}</span>)}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3 className="detail-section__title">Eligibility</h3>
            <table className="comp-table">
              <tbody>
                {role.hasCGPACriteria && <tr><td>CGPA Criteria</td><td>≥ {role.cgpaRequired || 'Not specified'}</td></tr>}
                {!role.hasCGPACriteria && <tr><td>CGPA Criteria</td><td>None</td></tr>}
                <tr><td>Backlog Eligible</td><td>{role.backlogEligible === true ? 'Yes' : role.backlogEligible === false ? 'No' : '—'}</td></tr>
                {role.hasBond && <tr><td>Bond</td><td>{role.bondDuration} — ₹{role.bondAmount?.toLocaleString('en-IN') || '—'}</td></tr>}
              </tbody>
            </table>
          </div>

          {role.additionalInfo && role.additionalInfo !== 'NA' && role.additionalInfo !== 'No' && (
            <div className="detail-section">
              <h3 className="detail-section__title">Additional Information</h3>
              <div className="detail-section__content">{role.additionalInfo}</div>
            </div>
          )}
        </>
      )}

      {tab === 'compensation' && (
        <>
          <div className="detail-section">
            <h3 className="detail-section__title">Compensation Breakdown</h3>
            {role.ctcBreakup && <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)', whiteSpace: 'pre-wrap' }}>{role.ctcBreakup}</p>}
            <table className="comp-table">
              <thead><tr><th>Component</th><th>Amount</th></tr></thead>
              <tbody>
                <tr style={{ fontWeight: 700 }}><td>CTC</td><td>{formatCTC(role.ctc, role.currency)}</td></tr>
                {compRows.map(([label, val]) => (
                  <tr key={label}><td>{label}</td><td>{role.currency === 'INR' ? formatINR(val) : val.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {role.perks && (
            <div className="detail-section">
              <h3 className="detail-section__title">Perks & Benefits</h3>
              <div className="detail-section__content">{role.perks}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
