import { useState } from 'react';
import styles from './CustomAnswerBox.module.css';

interface Props {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function CustomAnswerBox({ onSubmit, disabled }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <p className={styles.prompt}>Or write your own response:</p>
      <textarea 
        className={styles.textarea} 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I would choose to..."
        disabled={disabled}
        rows={3}
      />
      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={disabled || !text.trim()}
      >
        Submit Custom Answer
      </button>
    </form>
  );
}
