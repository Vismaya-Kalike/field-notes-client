import { Routes, Route, Navigate } from 'react-router-dom'
import DistrictsList from './components/DistrictsList'
import LearningCentresList from './components/LearningCentresList'
import LearningCentreDetail from './components/LearningCentreDetail'
import ReportDetail from './components/ReportDetail'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/logo_with_text.png"
                alt="Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/districts" replace />} />
        <Route path="/districts" element={<DistrictsList />} />
        <Route path="/districts/:state/:district" element={<LearningCentresList />} />
        <Route path="/districts/:state/:district/centre/:centreId" element={<LearningCentreDetail />} />
        <Route path="/districts/:state/:district/centre/:centreId/report/:reportId" element={<ReportDetail />} />
      </Routes>
    </div>
  )
}

export default App
