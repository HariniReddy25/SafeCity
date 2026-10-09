import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { postAiChatApi } from '../services/aiService';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  PhoneCall,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Shield,
  MessageSquare,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What should I do during a fire emergency?',
  'What steps to take after a road accident?',
  'How do I safely report suspicious activity?',
  'What details should I include in an emergency report?',
];

const AiSafetyAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your SafeCity AI Public Safety Assistant. How can I assist you with safety protocols or incident reporting guidance today?',
      actionSteps: [
        'Ask questions about fire, road accident, or medical safety.',
        'Learn what details to include when filing emergency reports.',
        'Remember: In immediate danger, call 112 / 100 / 101 directly.',
      ],
      disclaimer: '🚨 EMERGENCY NOTICE: Call emergency services (112 / 100 / 101) directly for immediate danger.',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await postAiChatApi(textToSend, 'Hyderabad');
      const aiMsg = {
        sender: 'ai',
        text: response.aiAnswer || 'SafeCity AI response generated.',
        actionSteps: response.actionSteps || [],
        disclaimer: response.emergencyDisclaimer,
        fallback: response.fallback,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'AI assistance is temporarily operating in offline fallback mode.',
          actionSteps: ['In immediate danger, contact local emergency dispatch (112/100/101) immediately.'],
          fallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* HERO HEADER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-lavender)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-lavender">AI SAFETY ASSISTANT</span>
          <span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: 600 }}>Phase 6 Active</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#581C87', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bot size={32} style={{ color: '#7C3AED' }} />
          SafeCity AI Public Safety Assistant
        </h1>
        <p style={{ color: '#6B21A8', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '720px' }}>
          Get instant guidance on emergency protocols, safety procedures, and report creation. AI assists with safety guidance and does not replace emergency dispatchers.
        </p>
      </div>

      {/* MANDATORY IMMEDIATE DANGER CALLOUT BANNER */}
      <div
        style={{
          backgroundColor: '#FEF2F2',
          border: '2px solid #FCA5A5',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={24} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
              IN IMMEDIATE DANGER OR LIFE-THREATENING EMERGENCY?
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#B91C1C', marginTop: '0.15rem', margin: 0 }}>
              Call official emergency dispatch immediately. AI assistant is for safety guidance only.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: '#DC2626', color: '#FFF', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', fontSize: '0.825rem' }}>
            📞 112 NATIONAL
          </span>
          <span style={{ backgroundColor: '#1E3A8A', color: '#FFF', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', fontSize: '0.825rem' }}>
            👮 100 POLICE
          </span>
          <span style={{ backgroundColor: '#B91C1C', color: '#FFF', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', fontSize: '0.825rem' }}>
            🚒 101 FIRE
          </span>
          <span style={{ backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', fontSize: '0.825rem' }}>
            🏥 108 AMBULANCE
          </span>
        </div>
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div>
        <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <HelpCircle size={15} /> Suggested Questions
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <Card hoverEffect={false} style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '1rem 1.25rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  backgroundColor: msg.sender === 'user' ? '#7C3AED' : 'var(--pastel-blue)',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#1E3A8A',
                  fontSize: '0.925rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.775rem', marginBottom: '0.35rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {msg.sender === 'user' ? 'You' : <><Sparkles size={14} /> SafeCity AI Assistant</>}
                </div>
                <div>{msg.text}</div>

                {/* ACTION STEPS LIST */}
                {msg.actionSteps && msg.actionSteps.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Recommended Action Steps:</div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                      {msg.actionSteps.map((step, sIdx) => (
                        <li key={sIdx} style={{ marginBottom: '0.2rem' }}>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#7C3AED', fontWeight: 700, fontSize: '0.875rem' }}>
              <Loader2 size={20} className="animate-spin" />
              <span>SafeCity AI is generating public safety guidance...</span>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1.5px solid var(--border-subtle)', paddingTop: '1rem' }}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI about safety procedures, fire guidance, road accidents..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <Button variant="primary" type="submit" icon={Send} disabled={loading || !inputQuery.trim()} style={{ backgroundColor: '#7C3AED' }}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AiSafetyAssistantPage;
