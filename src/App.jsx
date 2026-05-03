import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CompareBar from './components/CompareBar.jsx'
import Home from './pages/Home.jsx'

const Browse = lazy(() => import('./pages/Browse.jsx'))
const RoleDetail = lazy(() => import('./pages/RoleDetail.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const Bookmarks = lazy(() => import('./pages/Bookmarks.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))

function Loading() {
  return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Loading...</div>
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roles" element={<Browse />} />
            <Route path="/roles/:slug" element={<RoleDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Suspense>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}
