import { useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Contact() {
  const formRef = useRef();
  const [status, setStatus] = useState({ kind: 'idle' });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ kind: 'sending' });

    const formData = new FormData(formRef.current);
    const payload = {
      name: formData.get('from_name'),
      email: formData.get('from_email'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setStatus({ kind: 'sent' });
      formRef.current.reset();
    } catch (err) {
      setStatus({ kind: 'error', message: err.message || 'Failed to send' });
    }
  };

  return (
    <section className="card">
      <h2>Contact</h2>
      <form className="contact-form" ref={formRef} onSubmit={submit}>
        <label>
          <span>Name</span>
          <input type="text" name="from_name" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="from_email" required />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" required rows={4} />
        </label>
        <button type="submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Send'}
        </button>
        {status.kind === 'sent' && <p className="success">Thanks — message sent!</p>}
        {status.kind === 'error' && <p className="error">Error: {status.message}</p>}
      </form>
    </section>
  );
}
