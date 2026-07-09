import React, { useRef, useEffect } from 'react';
import styles from './Composer.module.css';
import { Send, ChevronUp } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onOpenSuggestions: () => void;
  disabled: boolean;
}

export function Composer({ value, onChange, onSubmit, onOpenSuggestions, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px'; // Reset to min-height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 140) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className={styles.composerWrapper}>
      <div className={styles.composerContainer}>
        <button
          className={styles.suggestionsButton}
          onClick={onOpenSuggestions}
          disabled={disabled}
          title="Need inspiration?"
        >
          <ChevronUp size={20} />
          <span className={styles.suggestionsText}>Suggestions</span>
        </button>

        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={disabled}
            rows={1}
          />
          <button
            className={`${styles.sendButton} ${value.trim() && !disabled ? styles.sendActive : ''}`}
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
