export function Header() {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Job Search Dashboard</p>
        <h1>Track every application, interview, and hiring decision in one place.</h1>
        <p className="hero__copy">
          A structured workspace for managing your job search with pipeline visibility,
          interview tracking, and detailed application records.
        </p>
      </div>
      <div className="hero__panel">
        <span className="hero__badge">Local Storage</span>
        <p>
          Your applications, notes, and stage updates are stored in the browser so
          your progress remains available between sessions.
        </p>
      </div>
    </header>
  )
}
