import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import Experience from '../components/Experience.jsx';
import Projects from '../components/Projects.jsx';
import Contact from '../components/Contact.jsx';
import { getProfile } from '../lib/api.js';

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <main className="container">
        <div className="card error">
          <h2>Could not load profile</h2>
          <p>{error}</p>
          <p className="muted">Is the backend running on port 8080?</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="container">
        <div className="card">Loading…</div>
      </main>
    );
  }

  return (
    <>
      <Header profile={profile} />
      <main className="container">
        <About profile={profile} />
        <Skills skills={profile.skills} />
        <Experience experience={profile.experience} />
        <Projects projects={profile.projects} />
        <Contact />
      </main>
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React + Spring Boot.
          {' · '}
          <Link to="/admin" className="muted">Admin</Link>
        </p>
      </footer>
    </>
  );
}
