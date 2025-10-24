import { Routes, Route, Link } from 'react-router-dom'
import DistrictsList from './components/DistrictsList'
import LearningCentresList from './components/LearningCentresList'
import LearningCentreDetail from './components/LearningCentreDetail'
import CoordinatorFieldNoteDetail from './components/CoordinatorFieldNoteDetail'
import ChildFieldNotes from './components/ChildFieldNotes'
import ReportDetail from './components/ReportDetail'
import LLMAnalysisPlayground from './components/LLMAnalysisPlayground'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/">
                <img
                  src="/logo_with_text.png"
                  alt="Logo"
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                to="/playground"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                LLM Playground
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<DistrictsList />} />
        <Route path="/playground" element={<LLMAnalysisPlayground />} />
        <Route path="/:state/:district" element={<LearningCentresList />} />
        <Route path="/:state/:district/centre/:centreId" element={<LearningCentreDetail />} />
        <Route
          path="/:state/:district/centre/:centreId/coordinator-notes/:noteId"
          element={<CoordinatorFieldNoteDetail />}
        />
        <Route
          path="/:state/:district/centre/:centreId/child/:childId"
          element={<ChildFieldNotes />}
        />
        <Route path="/:state/:district/centre/:centreId/report/:reportId" element={<ReportDetail />} />
      </Routes>
    </div>
  )
}

export default App
