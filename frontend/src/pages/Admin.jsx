import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  isAuthed, setCredentials, clearCredentials,
  getAdminProfile, saveProfile
} from '../lib/api.js';

const empty = {
  name: '', title: '', location: '', bio: '', email: '', avatarUrl: '',
  social: { github: '', linkedin: '' },
  skills: [], experience: [], projects: []
};

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAuthed());
  const [profile, setProfile] = useState(empty);
  const [skillsText, setSkillsText] = useState('');
  const [status, setStatus] = useState({ kind: 'idle' });

  useEffect(() => {
    if (!authed) return;
    getAdminProfile()
      .then((p) => {
        setProfile({ ...empty, ...p, social: { ...empty.social, ...(p.social || {}) } });
        setSkillsText((p.skills || []).join(', '));
        setStatus({ kind: 'idle' });
      })
      .catch((e) => {
        if (e.message === 'UNAUTHORIZED') {
          setAuthed(false);
          setStatus({ kind: 'error', message: 'Session expired. Please log in.' });
        } else {
          setStatus({ kind: 'error', message: e.message });
        }
      });
  }, [authed]);

  if (!authed) {
    return (
      <LoginScreen
        onLogin={(u, p) => {
          setCredentials(u, p);
          setAuthed(true);
        }}
        message={status.kind === 'error' ? status.message : null}
      />
    );
  }

  const update = (patch) => setProfile((prev) => ({ ...prev, ...patch }));
  const updateSocial = (patch) =>
    setProfile((prev) => ({ ...prev, social: { ...prev.social, ...patch } }));

  const addExperience = () =>
    update({
      experience: [
        ...profile.experience,
        { role: '', company: '', period: '', summary: '' }
      ]
    });
  const removeExperience = (i) =>
    update({ experience: profile.experience.filter((_, idx) => idx !== i) });
  const editExperience = (i, patch) =>
    update({
      experience: profile.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    });

  const addProject = () =>
    update({
      projects: [...profile.projects, { name: '', description: '', tech: [] }]
    });
  const removeProject = (i) =>
    update({ projects: profile.projects.filter((_, idx) => idx !== i) });
  const editProject = (i, patch) =>
    update({
      projects: profile.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    });

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    const payload = {
      ...profile,
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean)
    };
    try {
      await saveProfile(payload);
      setStatus({ kind: 'saved', at: new Date() });
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        setAuthed(false);
        setStatus({ kind: 'error', message: 'Session expired. Please log in.' });
      } else {
        setStatus({ kind: 'error', message: err.message });
      }
    }
  };

  const handleLogout = () => {
    clearCredentials();
    setAuthed(false);
  };

  return (
    <>
      <header className="admin-bar">
        <div className="container admin-bar-inner">
          <h1>Admin · Edit Profile</h1>
          <div className="admin-actions">
            <Link to="/" className="btn-link">View site</Link>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <main className="container admin-main">
        <form onSubmit={handleSave} className="admin-form">

          <section className="card">
            <h2>Identity</h2>
            <div className="identity-row">
              <div className="avatar-preview">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar preview" />
                ) : (
                  <span>{profile.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="identity-fields">
                <div className="grid-2">
                  <Field label="Name" value={profile.name} onChange={(v) => update({ name: v })} />
                  <Field label="Title" value={profile.title} onChange={(v) => update({ title: v })} />
                  <Field label="Location" value={profile.location} onChange={(v) => update({ location: v })} />
                  <Field label="Email" type="email" value={profile.email} onChange={(v) => update({ email: v })} />
                </div>
                <Field
                  label="Avatar URL"
                  value={profile.avatarUrl}
                  onChange={(v) => update({ avatarUrl: v })}
                  placeholder="/avatar.jpg or https://…"
                />
              </div>
            </div>
            <Field
              label="Bio"
              multiline
              value={profile.bio}
              onChange={(v) => update({ bio: v })}
            />
          </section>

          <section className="card">
            <h2>Social</h2>
            <div className="grid-2">
              <Field label="GitHub URL" value={profile.social.github} onChange={(v) => updateSocial({ github: v })} />
              <Field label="LinkedIn URL" value={profile.social.linkedin} onChange={(v) => updateSocial({ linkedin: v })} />
            </div>
          </section>

          <section className="card">
            <h2>Skills</h2>
            <Field
              label="Comma-separated"
              value={skillsText}
              onChange={setSkillsText}
              placeholder="Java, React, Docker, …"
            />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Experience</h2>
              <button type="button" className="btn-secondary" onClick={addExperience}>+ Add</button>
            </div>
            {profile.experience.length === 0 && <p className="muted">No experience entries.</p>}
            {profile.experience.map((e, i) => (
              <div key={i} className="row-card">
                <div className="grid-2">
                  <Field label="Role" value={e.role} onChange={(v) => editExperience(i, { role: v })} />
                  <Field label="Company" value={e.company} onChange={(v) => editExperience(i, { company: v })} />
                  <Field label="Period" value={e.period} onChange={(v) => editExperience(i, { period: v })} placeholder="2022 — Present" />
                </div>
                <Field label="Summary" multiline value={e.summary} onChange={(v) => editExperience(i, { summary: v })} />
                <button type="button" className="btn-danger" onClick={() => removeExperience(i)}>Remove</button>
              </div>
            ))}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Projects</h2>
              <button type="button" className="btn-secondary" onClick={addProject}>+ Add</button>
            </div>
            {profile.projects.length === 0 && <p className="muted">No projects.</p>}
            {profile.projects.map((p, i) => (
              <div key={i} className="row-card">
                <Field label="Name" value={p.name} onChange={(v) => editProject(i, { name: v })} />
                <Field label="Description" multiline value={p.description} onChange={(v) => editProject(i, { description: v })} />
                <Field
                  label="Tech (comma-separated)"
                  value={(p.tech || []).join(', ')}
                  onChange={(v) =>
                    editProject(i, { tech: v.split(',').map((t) => t.trim()).filter(Boolean) })
                  }
                />
                <button type="button" className="btn-danger" onClick={() => removeProject(i)}>Remove</button>
              </div>
            ))}
          </section>

          <div className="save-bar">
            <button type="submit" className="btn-primary" disabled={status.kind === 'saving'}>
              {status.kind === 'saving' ? 'Saving…' : 'Save'}
            </button>
            {status.kind === 'saved' && (
              <span className="success">Saved at {status.at.toLocaleTimeString()}</span>
            )}
            {status.kind === 'error' && <span className="error">Error: {status.message}</span>}
          </div>
        </form>
      </main>
    </>
  );
}

function Field({ label, value, onChange, type = 'text', multiline = false, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function LoginScreen({ onLogin, message }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  return (
    <main className="container login-wrap">
      <form
        className="card login-card"
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(u, p);
        }}
      >
        <h1>Admin Login</h1>
        <Field label="Username" value={u} onChange={setU} />
        <Field label="Password" type="password" value={p} onChange={setP} />
        <button type="submit" className="btn-primary">Sign in</button>
        {message && <p className="error">{message}</p>}
        <p className="muted small-note">
          Default: <code>admin</code> / <code>admin</code> (set via env in docker-compose).
        </p>
        <p><Link to="/" className="muted">← Back to site</Link></p>
      </form>
    </main>
  );
}
