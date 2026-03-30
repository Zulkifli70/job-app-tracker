export function Header({ theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div>
        <h1>Job App Tracker</h1>
        <p className="app-header__copy">Track every opportunity in the theme you prefer.</p>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </header>
  )
}
