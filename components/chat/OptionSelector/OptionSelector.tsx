import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QuestionOption } from '@/stores/scenario.store';
import { Send } from 'lucide-react';
import styles from './OptionSelector.module.css';

interface Props {
  options: QuestionOption[];
  onDirectSubmit: (index: number, value: number) => void;
  disabled?: boolean;
}

function OptionItem({ opt, idx, onDirectSubmit, disabled }: { opt: QuestionOption, idx: number, onDirectSubmit: (index: number, value: number) => void, disabled?: boolean }) {
  const [value, setValue] = useState(0);

  return (
    <motion.div 
      className={styles.optionCard}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
    >
      <div className={styles.optionText}>{opt.text}</div>
      <div className={styles.sliderRow}>
        <div className={styles.sliderWrapper}>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            className={styles.slider}
            disabled={disabled}
            style={{ '--val': `${value}%` } as React.CSSProperties}
          />
          <span className={styles.sliderValue}>{value}%</span>
        </div>
        <button 
          className={styles.submitBtn}
          onClick={() => onDirectSubmit(idx, value / 100)}
          disabled={disabled}
          title="Submit"
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export function OptionSelector({ options, onDirectSubmit, disabled }: Props) {
  if (!options || options.length === 0) return null;

  return (
    <div className={styles.container}>
      {options.map((opt, idx) => (
        <OptionItem key={idx} opt={opt} idx={idx} onDirectSubmit={onDirectSubmit} disabled={disabled} />
      ))}
    </div>
  );
}
