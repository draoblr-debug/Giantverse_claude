import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SuggestionsSheet.module.css';
import { OptionSelector } from '../OptionSelector/OptionSelector';
import { QuestionOption } from '@/stores/scenario.store';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  options: QuestionOption[];
  onDirectSubmit: (index: number, value: number) => void;
  disabled: boolean;
}

export function SuggestionsSheet({
  isOpen,
  onClose,
  options,
  onDirectSubmit,
  disabled
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.sheet}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>Quick Thoughts</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.content}>
            <OptionSelector
              options={options}
              onDirectSubmit={onDirectSubmit}
              disabled={disabled}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
