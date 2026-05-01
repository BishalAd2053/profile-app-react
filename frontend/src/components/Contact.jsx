import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ kind: 'idle' });

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus({ kind: 'sent' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ kind: 'error', message: err.message });
    }
  };

  return (
    <section className="card">
      <h2>Contact</h2>
      <form className="contact-form" onSubmit={submit}>
        <label>
          <span>Name</span>
          <input type="text" required value={form.name} onChange={update('name')} />
        </label>
        <label>
          <span>Email</span>
          <input type="email" required value={form.email} onChange={update('email')} />
        </label>
        <label>
          <span>Message</span>
          <textarea required rows={4} value={form.message} onChange={update('message')} />
        </label>
        <button type="submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Send'}
        </button>
        {status.kind === 'sent' && <p className="success">Thanks — message received.</p>}
        {status.kind === 'error' && <p className="error">Error: {status.message}</p>}
      </form>
    </section>
  );
}
