import React from 'react';
import { QuestionOption } from '@/stores/scenario.store';
import styles from './OptionSelector.module.css';

interface Props {
  options: QuestionOption[];
  onDirectSubmit: (index: number, value: number) => void;
  disabled?: boolean;
}

export function OptionSelector({ options, onDirectSubmit, disabled }: Props) {
  if (!options || options.length === 0) return null;
  const percentages = [0, 25, 50, 75, 100];

  return (
    <div className={styles.container}>
      {options.map((opt, idx) => (
        <div key={idx} className={styles.optionCard}>
          <div className={styles.optionText}>{opt.text}</div>
          <div className={styles.percentagesRow}>
            {percentages.map(pct => (
              <button 
                key={pct}
                className={styles.percentCircle}
                onClick={() => onDirectSubmit(idx, pct / 100)}
                disabled={disabled}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
