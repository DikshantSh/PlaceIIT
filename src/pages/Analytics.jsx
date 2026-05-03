import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const chartColors = ['#6c63ff','#a78bfa','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6']

export default function Analytics() {
  const { roles, formatINR, theme } = useApp()

  const textColor = theme === 'dark' ? '#9393a8' : '#555566'
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'

  const ctcDistribution = useMemo(() => {
    const buckets = [0,500000,1000000,1500000,2000000,2500000,3000000,4000000,5000000,10000000,Infinity]
    const labels = ['<5L','5-10L','10-15L','15-20L','20-25L','25-30L','30-40L','40-50L','50L-1Cr','>1Cr']
    const counts = new Array(labels.length).fill(0)
    roles.forEach(r => { for (let i = 0; i < buckets.length - 1; i++) { if (r.ctcINR >= buckets[i] && r.ctcINR < buckets[i+1]) { counts[i]++; break } } })
    return { labels, datasets: [{ label: 'Roles', data: counts, backgroundColor: 'rgba(108,99,255,0.7)', borderRadius: 6 }] }
  }, [roles])

  const topRoles = useMemo(() => {
    const top = [...roles].sort((a,b) => b.ctcINR - a.ctcINR).slice(0,10)
    return {
      labels: top.map(r => `${r.company} - ${r.designation}`.slice(0,35)),
      datasets: [{ label: 'CTC (INR)', data: top.map(r => r.ctcINR), backgroundColor: chartColors, borderRadius: 6 }]
    }
  }, [roles])

  const tagDist = useMemo(() => {
    const counts = {}; roles.forEach(r => { counts[r.roleTag] = (counts[r.roleTag]||0)+1 })
    return {
      labels: Object.keys(counts).map(t => t.replace('-',' ')),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#a855f7','#6366f1','#22c55e','#6b7280'], borderWidth: 0 }]
    }
  }, [roles])

  const bondDist = useMemo(() => {
    const bond = roles.filter(r => r.hasBond).length
    return {
      labels: ['No Bond', 'Has Bond'],
      datasets: [{ data: [roles.length - bond, bond], backgroundColor: ['#22c55e','#ef4444'], borderWidth: 0 }]
    }
  }, [roles])

  const cgpaDist = useMemo(() => {
    const buckets = { 'No Criteria': 0, '< 6': 0, '6-7': 0, '7-8': 0, '8+': 0 }
    roles.forEach(r => {
      if (!r.hasCGPACriteria || r.cgpaRequired === null) buckets['No Criteria']++
      else if (r.cgpaRequired < 6) buckets['< 6']++
      else if (r.cgpaRequired < 7) buckets['6-7']++
      else if (r.cgpaRequired < 8) buckets['7-8']++
      else buckets['8+']++
    })
    return {
      labels: Object.keys(buckets),
      datasets: [{ data: Object.values(buckets), backgroundColor: ['#6b7280','#22c55e','#3b82f6','#f59e0b','#ef4444'], borderWidth: 0 }]
    }
  }, [roles])

  const opts = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } } }
  const doughnutOpts = { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 16 } } } }

  return (
    <div className="container" style={{ padding: 'var(--sp-8) 0' }}>
      <h1 className="section-header__title" style={{ marginBottom: 'var(--sp-6)' }}>Placement Analytics</h1>
      <div className="analytics-grid" id="analytics-grid">
        <div className="card chart-card">
          <h3 className="chart-card__title">CTC Distribution</h3>
          <Bar data={ctcDistribution} options={opts} />
        </div>
        <div className="card chart-card">
          <h3 className="chart-card__title">Top 10 Highest Paying</h3>
          <Bar data={topRoles} options={{ ...opts, indexAxis: 'y' }} />
        </div>
        <div className="card chart-card">
          <h3 className="chart-card__title">Role Tags</h3>
          <Doughnut data={tagDist} options={doughnutOpts} />
        </div>
        <div className="card chart-card">
          <h3 className="chart-card__title">Bond Distribution</h3>
          <Doughnut data={bondDist} options={doughnutOpts} />
        </div>
        <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-card__title">CGPA Requirements</h3>
          <Bar data={cgpaDist} options={opts} />
        </div>
      </div>
    </div>
  )
}
