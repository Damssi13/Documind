import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${API}/document/upload`, form);
      setUploadMsg(`✅ Uploaded — ${res.data.chunks} chunks indexed`);
    } catch {
      setUploadMsg('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat/ask`, { question });
      const botMsg: Message = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <aside className="sidebar-panel">
        <div>
          <p className="eyebrow">Document intelligence</p>
          <h1 className="logo">📄 DocuMind</h1>
          <p className="subtitle">AI Business Document Assistant</p>
        </div>

        <div className="upload-card">
          <p className="upload-title">Upload a PDF</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="file-input"
          />
          {uploading && <p className="upload-status">Indexing document...</p>}
          {uploadMsg && <p className="upload-status">{uploadMsg}</p>}
        </div>

        <div className="side-note">
          <span className="side-note-dot" />
          Answers are grounded in your uploaded files.
        </div>
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <h2 className="chat-title">Ask your documents</h2>
            <p className="chat-subtitle">Upload once, then ask naturally.</p>
          </div>
        </header>

        <section className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <p>Upload a PDF and ask anything about it.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message-row ${msg.role}`}
            >
              <div className="message-meta">{msg.role === 'user' ? 'You' : 'DocuMind'}</div>
              <p className="msg-text">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <p className="sources">
                  📎 Sources: {msg.sources.join(', ')}
                </p>
              )}
            </div>
          ))}
          {loading && (
            <div className="message-row assistant">
              <div className="message-meta">DocuMind</div>
              <p className="msg-text">Thinking...</p>
            </div>
          )}
        </section>

        <div className="input-row">
          <input
            className="chat-input"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Ask a question about your documents..."
            disabled={loading}
          />
          <button className="send-btn" onClick={handleAsk} disabled={loading}>
            {loading ? '...' : 'Ask'}
          </button>
        </div>
      </main>
    </div>
  );
}