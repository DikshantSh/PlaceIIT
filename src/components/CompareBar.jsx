import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function CompareBar() {
  const { compareList, dispatch } = useApp()
  const navigate = useNavigate()
  if (compareList.length === 0) return null

  return (
    <div className="compare-bar" id="compare-bar">
      <span className="compare-bar__count">{compareList.length}/3 roles selected</span>
      <button className="btn btn--primary" onClick={() => navigate('/compare')}>Compare Now</button>
      <button className="btn btn--ghost" onClick={() => dispatch({ type: 'CLEAR_COMPARE' })}>Clear</button>
    </div>
  )
}
