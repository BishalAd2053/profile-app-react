import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const formRef = useRef();
  const [status, setStatus] = useState({ kind: 'idle' });

  const submit = async (e) => {
    e.preventDefault();
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setStatus({ kind: 'error', message: 'EmailJS not configured' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
        publicKey: PUBLIC_KEY,
      });
      setStatus({ kind: 'sent' });
      formRef.current.reset();
    } catch (err) {
      setStatus({ kind: 'error', message: err.text || 'Failed to send' });
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
