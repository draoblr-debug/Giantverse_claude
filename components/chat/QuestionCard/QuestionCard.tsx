import { motion, AnimatePresence } from 'framer-motion';
import styles from './QuestionCard.module.css';
import { Question } from '@/stores/scenario.store';

interface Props {
  question: Question | null;
  isGenerating: boolean;
}

export function QuestionCard({ question, isGenerating }: Props) {
  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {isGenerating || !question ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.loading}
          >
            <div className={styles.pulse} />
            <p>Analyzing trajectory...</p>
          </motion.div>
        ) : (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.content}
            role="group"
            aria-labelledby="question-text"
          >
            <h2 id="question-text" className={styles.scenario}>{question.scenario}</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
