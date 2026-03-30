export function Header({ theme, onToggleTheme }) {
  const nextTheme = theme === 'light' ? 'dark' : 'light'

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
        aria-label={`Switch to ${nextTheme} theme`}
        title={`Switch to ${nextTheme} theme`}
      >
        <img
          className="theme-toggle__icon"
          src={theme === 'light' ? '/moon.png' : '/sun.png'}
          alt=""
          aria-hidden="true"
        />
      </button>
    </header>
  )
}
