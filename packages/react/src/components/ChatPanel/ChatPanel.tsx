import { type HTMLAttributes, forwardRef, type ReactNode, useState, useRef, useEffect } from 'react';
import styles from './ChatPanel.module.css';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isSelf?: boolean;
  coordinate?: { lat: number; lon: number };
}

export interface ChatPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  messages: ChatMessage[];
  onSend?: (text: string) => void;
  channel?: string;
  channels?: string[];
  onChannelChange?: (channel: string) => void;
  unreadCount?: number;
  children?: ReactNode;
}

export const ChatPanel = forwardRef<HTMLDivElement, ChatPanelProps>(
  (
    {
      messages,
      onSend,
      channel,
      channels,
      onChannelChange,
      unreadCount,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
      const trimmed = inputText.trim();
      if (trimmed && onSend) {
        onSend(trimmed);
        setInputText('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const formatTimestamp = (date: Date): string => {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      const s = date.getSeconds().toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    const classNames = [styles.chatPanel, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {/* Channel selector bar */}
        {channels && channels.length > 0 && (
          <div className={styles.channelBar}>
            <select
              className={styles.channelSelect}
              value={channel ?? ''}
              onChange={(e) => onChannelChange?.(e.target.value)}
              aria-label="Channel"
            >
              {channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </div>
        )}

        {/* Scrollable message list */}
        <div className={styles.messageList} role="log" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={[
                styles.messageBubble,
                msg.isSelf ? styles.self : styles.other,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={[
                styles.sender,
                msg.isSelf ? styles.senderSelf : styles.senderOther,
              ].filter(Boolean).join(' ')}>
                {msg.sender}
              </span>
              <span className={styles.text}>{msg.text}</span>
              {msg.coordinate && (
                <span className={styles.coordinate}>
                  {msg.coordinate.lat.toFixed(6)}, {msg.coordinate.lon.toFixed(6)}
                </span>
              )}
              <span className={styles.timestamp}>{formatTimestamp(msg.timestamp)}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Optional children slot */}
        {children}

        {/* Input bar */}
        <div className={styles.inputBar}>
          <input
            className={styles.input}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            aria-label="Message input"
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputText.trim()}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    );
  }
);

ChatPanel.displayName = 'ChatPanel';
