import { useState } from 'react';
import axios from 'axios';

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
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>📄 DocuMind</h2>
        <p style={styles.subtitle}>AI Business Document Assistant</p>
        <div style={styles.uploadBox}>
          <p style={styles.uploadLabel}>Upload a PDF</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            style={styles.fileInput}
          />
          {uploading && <p style={styles.uploadStatus}>Indexing...</p>}
          {uploadMsg && <p style={styles.uploadStatus}>{uploadMsg}</p>}
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.empty}>
              <p>Upload a PDF and ask anything about it.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={msg.role === 'user' ? styles.userBubble : styles.botBubble}
            >
              <p style={styles.msgText}>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <p style={styles.sources}>
                  📎 Sources: {msg.sources.join(', ')}
                </p>
              )}
            </div>
          ))}
          {loading && (
            <div style={styles.botBubble}>
              <p style={styles.msgText}>Thinking...</p>
            </div>
          )}
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Ask a question about your documents..."
            disabled={loading}
          />
          <button style={styles.button} onClick={handleAsk} disabled={loading}>
            {loading ? '...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex', height: '100vh', fontFamily: 'sans-serif',
    background: '#f4f4f5',
  },
  sidebar: {
    width: 260, background: '#1e1e2e', color: '#fff',
    padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12,
  },
  logo: { margin: 0, fontSize: 20 },
  subtitle: { margin: 0, fontSize: 12, color: '#aaa' },
  uploadBox: {
    marginTop: 24, background: '#2a2a3e', borderRadius: 8,
    padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
  },
  uploadLabel: { margin: 0, fontSize: 13, color: '#ccc' },
  fileInput: { fontSize: 12, color: '#fff' },
  uploadStatus: { margin: 0, fontSize: 12, color: '#7ec8a4' },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: 24,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  empty: {
    margin: 'auto', color: '#888', fontSize: 15,
  },
  userBubble: {
    alignSelf: 'flex-end', background: '#4f46e5', color: '#fff',
    borderRadius: 12, padding: '10px 14px', maxWidth: '70%',
  },
  botBubble: {
    alignSelf: 'flex-start', background: '#fff', color: '#1e1e2e',
    borderRadius: 12, padding: '10px 14px', maxWidth: '70%',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  msgText: { margin: 0, fontSize: 14, lineHeight: 1.6 },
  sources: { margin: '6px 0 0', fontSize: 11, color: '#888' },
  inputRow: {
    display: 'flex', gap: 8, padding: '16px 24px',
    background: '#fff', borderTop: '1px solid #e5e5e5',
  },
  input: {
    flex: 1, padding: '10px 14px', fontSize: 14,
    border: '1px solid #ddd', borderRadius: 8, outline: 'none',
  },
  button: {
    padding: '10px 20px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer',
  },
};