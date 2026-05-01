export default function Skills({ skills }) {
  return (
    <section className="card">
      <h2>Skills</h2>
      <div className="chips">
        {skills.map((s) => (
          <span key={s} className="chip">{s}</span>
        ))}
      </div>
    </section>
  );
}
