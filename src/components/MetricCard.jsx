export function MetricCard({ label, value, detail, tone = 'default' }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__label">{label}</p>
      <h3>{value}</h3>
      <p className="metric-card__detail">{detail}</p>
    </article>
  )
}
