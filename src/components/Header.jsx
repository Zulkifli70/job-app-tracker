export function Header() {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Career Command Center</p>
        <h1>Track every application, interview, and decision from one place.</h1>
        <p className="hero__copy">
          A structured dashboard for managing your job search with a pipeline view,
          detailed notes, and local-first persistence.
        </p>
      </div>
      <div className="hero__panel">
        <span className="hero__badge">Local-first</span>
        <p>
          Your applications, notes, and stage changes stay in browser storage, so
          refreshing the page does not wipe the pipeline.
        </p>
      </div>
    </header>
  )
}
