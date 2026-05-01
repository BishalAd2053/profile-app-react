export default function About({ profile }) {
  return (
    <section className="card">
      <h2>About</h2>
      <p>{profile.bio}</p>
    </section>
  );
}
