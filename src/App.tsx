import { useState } from 'react'
import DistrictsList from './components/DistrictsList'
import LearningCentresList from './components/LearningCentresList'
import LearningCentreDetail from './components/LearningCentreDetail'

type View = 'districts' | 'centres' | 'detail'

interface ViewState {
  view: View
  selectedDistrict?: string
  selectedState?: string
  selectedCentreId?: string
}

function App() {
  const [viewState, setViewState] = useState<ViewState>({ view: 'districts' })

  const handleDistrictSelect = (district: string, state: string) => {
    setViewState({
      view: 'centres',
      selectedDistrict: district,
      selectedState: state
    })
  }

  const handleCentreSelect = (centreId: string) => {
    setViewState({
      ...viewState,
      view: 'detail',
      selectedCentreId: centreId
    })
  }

  const handleBackToDistricts = () => {
    setViewState({ view: 'districts' })
  }

  const handleBackToCentres = () => {
    setViewState({
      view: 'centres',
      selectedDistrict: viewState.selectedDistrict,
      selectedState: viewState.selectedState
    })
  }

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
      {viewState.view === 'districts' && (
        <DistrictsList onDistrictSelect={handleDistrictSelect} />
      )}

      {viewState.view === 'centres' && viewState.selectedDistrict && viewState.selectedState && (
        <LearningCentresList
          district={viewState.selectedDistrict}
          state={viewState.selectedState}
          onCentreSelect={handleCentreSelect}
          onBack={handleBackToDistricts}
        />
      )}

      {viewState.view === 'detail' && viewState.selectedCentreId && (
        <LearningCentreDetail
          centreId={viewState.selectedCentreId}
          onBack={handleBackToCentres}
        />
      )}
    </div>
  )
}

export default App
