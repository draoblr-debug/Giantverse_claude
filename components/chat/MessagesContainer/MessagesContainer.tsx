import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MessagesContainer.module.css';

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

interface Props {
  messages: ChatMessage[];
  isGenerating: boolean;
}

export function MessagesContainer({ messages, isGenerating }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className={styles.container}>
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`${styles.messageWrapper} ${
              msg.role === 'assistant' ? styles.wrapperAssistant : styles.wrapperUser
            }`}
          >
            <div
              className={`${styles.bubble} ${
                msg.role === 'assistant' ? styles.assistantBubble : styles.userBubble
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isGenerating && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`${styles.messageWrapper} ${styles.wrapperAssistant}`}
          >
            <div className={`${styles.bubble} ${styles.assistantBubble} ${styles.typingBubble}`}>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}
                className={styles.dot}
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                className={styles.dot}
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                className={styles.dot}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} className={styles.bottomAnchor} />
    </div>
  );
}
