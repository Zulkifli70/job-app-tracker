import { Header } from './components/Header'
import { DashboardOverview } from './components/DashboardOverview'
import { PipelineBoard } from './components/PipelineBoard'
import { ApplicationDetails } from './components/ApplicationDetails'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <DashboardOverview />
      <PipelineBoard />
      <ApplicationDetails />
    </div>
  )
}

export default App
