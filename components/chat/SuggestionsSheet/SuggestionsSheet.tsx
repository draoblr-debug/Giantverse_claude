import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SuggestionsSheet.module.css';
import { OptionSelector } from '../OptionSelector/OptionSelector';
import { AgreementSlider } from '../AgreementSlider/AgreementSlider';
import { QuestionOption } from '@/stores/scenario.store';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  options: QuestionOption[];
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  sliderValue: number;
  onSliderChange: (val: number) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function SuggestionsSheet({
  isOpen,
  onClose,
  options,
  selectedOptionIndex,
  onSelectOption,
  sliderValue,
  onSliderChange,
  onSubmit,
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
              selectedOptionIndex={selectedOptionIndex}
              onSelect={onSelectOption}
              disabled={disabled}
            />

            <AnimatePresence>
              {selectedOptionIndex !== null && (
                <motion.div
                  className={styles.sliderSection}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                  <h4 className={styles.sliderTitle}>How strongly do you relate?</h4>
                  <AgreementSlider
                    value={sliderValue}
                    onChange={onSliderChange}
                    disabled={disabled}
                  />
                  <button 
                    className={styles.submitBtn} 
                    onClick={onSubmit}
                    disabled={disabled}
                  >
                    Confirm Answer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
