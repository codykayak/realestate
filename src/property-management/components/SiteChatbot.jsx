import { useCallback, useEffect, useRef, useState } from 'react';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import { sendPmChatMessage } from '../lib/pmChatClient';
import cb from './siteChatbot.module.css';

const WELCOME =
  'Hi! I can answer questions about ManyDoors AI using everything on this site — product modules, ROI, integrations, support, and FAQs. What would you like to know?';

export default function SiteChatbot({ open, onOpenChange }) {
  const { config } = usePm();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const apiMessages = next
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .filter((m, i) => !(i === 0 && m.role === 'assistant' && m.content === WELCOME))
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await sendPmChatMessage(apiMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message || 'Could not reach the chat service.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry — I could not connect right now. Email ${config.supportEmail} or try again in a moment.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [config.supportEmail, input, loading, messages]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={cb.root}>
      {open && (
        <div className={cb.panel} role="dialog" aria-label={`${config.productName} assistant`}>
          <header className={cb.head}>
            <div>
              <div className={cb.title}>{config.productName} Assistant</div>
              <div className={cb.sub}>Powered by Gemini · answers from site content</div>
            </div>
            <button
              type="button"
              className={cb.close}
              onClick={() => onOpenChange(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className={cb.messages} ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? cb.bubbleUser : cb.bubbleBot}>
                {m.content}
              </div>
            ))}
            {loading && <div className={cb.typing}>Thinking…</div>}
            {error && <div className={cb.errorHint}>{error}</div>}
          </div>

          <div className={cb.composer}>
            <textarea
              ref={inputRef}
              className={cb.input}
              rows={2}
              placeholder="Ask about features, ROI, integrations, support…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <button type="button" className={cb.send} onClick={send} disabled={loading || !input.trim()}>
              <Icon name="bolt" size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={cb.fab}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
      >
        <Icon name="chat" size={22} />
      </button>
    </div>
  );
}
