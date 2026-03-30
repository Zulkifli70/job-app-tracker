import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { DashboardOverview } from './components/DashboardOverview'
import { PipelineBoard } from './components/PipelineBoard'
import './App.css'

const STORAGE_KEY = 'job-app-theme'

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="app-shell">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <DashboardOverview />
      <PipelineBoard />
    </div>
  )
}

export default App
