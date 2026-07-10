import React from 'react';
import { QuestionOption } from '@/stores/scenario.store';
import styles from './OptionSelector.module.css';

interface Props {
  options: QuestionOption[];
  selectedOptionIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function OptionSelector({ options, selectedOptionIndex, onSelect, disabled }: Props) {
  if (!options || options.length === 0) return null;

  return (
    <div className={styles.container}>
      {options.map((opt, idx) => (
        <button
          key={idx}
          className={`${styles.optionBtn} ${selectedOptionIndex === idx ? styles.selected : ''}`}
          onClick={() => onSelect(idx)}
          disabled={disabled}
        >
          {opt.text}
        </button>
      ))}
    </div>
  );
}
