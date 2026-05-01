export default function Experience({ experience }) {
  return (
    <section className="card">
      <h2>Experience</h2>
      <ul className="timeline">
        {experience.map((e) => (
          <li key={e.role + e.company}>
            <div className="timeline-head">
              <strong>{e.role}</strong>
              <span className="muted">{e.period}</span>
            </div>
            <div className="company">{e.company}</div>
            <p>{e.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
