export function SectionCard({
  title,
  eyebrow,
  action,
  children,
  className = "",
  id,
  ...props
}) {
  return (
    <section
      id={id}
      className={`section-card ${className}`.trim()}
      {...props}
    >
      <div className="section-card__header">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {action ? <div className="section-card__action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
