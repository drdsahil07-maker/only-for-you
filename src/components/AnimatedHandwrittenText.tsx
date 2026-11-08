import React from 'react';
import { motion } from 'motion/react';

interface AnimatedHandwrittenTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export const AnimatedHandwrittenText: React.FC<AnimatedHandwrittenTextProps> = ({
  text,
  as: Tag = 'h1',
  className = '',
  staggerDelay = 0.032,
  initialDelay = 0.05,
}) => {
  const words = text.split(' ');
  let charCounter = 0;

  return (
    <Tag
      aria-label={text}
      className={className}
      style={{ textWrap: 'balance' }}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, cIdx) => {
            const delay = initialDelay + charCounter * staggerDelay;
            charCounter += 1;
            return (
              <motion.span
                key={cIdx}
                aria-hidden="true"
                initial={{ opacity: 0, y: 7, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.36,
                  delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
          {wordIdx < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  );
};
