export default function Projects({ projects }) {
  return (
    <section className="card">
      <h2>Projects</h2>
      <div className="grid">
        {projects.map((p) => (
          <article key={p.name} className="project">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="chips">
              {p.tech.map((t) => (
                <span key={t} className="chip small">{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
