import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoadingPage from './pages/LoadingPage'
import ResultsPage from './pages/ResultsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/loading/:address" element={<LoadingPage />} />
      <Route path="/results/:address" element={<ResultsPage />} />
    </Routes>
  )
}

export default App
