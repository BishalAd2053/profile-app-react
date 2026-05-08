import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `You are Bishal's AI assistant embedded on his personal portfolio website. You answer questions about Bishal Adhikari — his background, skills, experience, and projects. Be friendly, concise, and professional.

Here is Bishal's profile information:

Name: Bishal Adhikari
Title: Full Stack Java Developer
Location: Virginia, United States
Email: bishaladhikari348@gmail.com

Bio: Full-stack software engineer with 6+ years building enterprise applications, mostly in financial services. Currently at JPMorgan Chase on the Account Management platform — Spring Boot microservices for account creation, message transformation, and rule validation, with front-ends in React and Angular. He enjoys modernization work (Spring Boot 2.x → 3.5, Angular → React) and has been exploring Spring AI and MCP-based developer tooling lately.

Skills: Java, Spring Boot, Spring AI, React, Angular, TypeScript, Kafka, Microservices, Kubernetes, Docker, Oracle, AWS

Experience:
1. Software Engineer / Full Stack Java Developer at JPMorgan Chase & Co. (Jun 2024 — Present) — Builds Spring Boot microservices for the Account Management System. Leads Spring Boot 3.x modernization, contributes to Angular-to-React migration, and built a custom MCP server and Spring AI tooling.
2. Full Stack Java Developer at Rail Inc (Apr 2022 — Jun 2024) — Developed Spring Boot microservices with REST APIs secured by OAuth2, Basic Auth, and API keys. Built Kafka producers/consumers for event-driven workflows.
3. Full Stack Java Developer at Allstate (Aug 2020 — Mar 2022) — Built Spring Boot REST APIs and reusable Angular components, integrated with AWS services and Kafka.
4. Java Backend Developer at Deloitte (Nov 2018 — Jul 2020) — Designed Spring MVC / Hibernate backends and Apache Camel integration routes.

Projects:
1. Personal Profile Site — React 18 + Spring Boot 3.3, with a three.js hero scene, admin editor, and full Docker Compose deployment.
2. Custom MCP Server — Python MCP server with integrations for Jira, Figma, Bitbucket, and Kubernetes.
3. Spring AI Developer Agent — Hackathon project — an AI agent built with Spring AI that augments VS Code and IntelliJ copilot workflows.
4. Spring Boot 3 Modernization — Led migration of an enterprise platform from Spring Boot 2.6 to 3.5 / Spring Framework 6.

Social:
- GitHub: https://github.com/BishalAd2053
- LinkedIn: https://www.linkedin.com/in/bishal-adhikari-a478a4305

Rules:
- Only answer questions related to Bishal's profile, skills, experience, projects, and professional background.
- If someone asks something unrelated, politely redirect them to ask about Bishal.
- Keep responses concise (2-4 sentences unless more detail is requested).
- Be enthusiastic about Bishal's work and achievements.
- If asked about contacting Bishal, point them to the Contact section on the website or his email.`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Bishal's AI assistant. Ask me anything about his skills, experience, or projects!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Bishal Portfolio Chatbot'
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
          messages: apiMessages,
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! Something went wrong. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)} aria-label="Open chat">
          <FaRobot />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <FaRobot />
              <span>Ask about Bishal</span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                <div className="chatbot-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg assistant">
                <div className="chatbot-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask me about Bishal..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
