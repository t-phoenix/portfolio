import { motion } from 'framer-motion';
import { useInView, useReducedMotion } from '../../hooks';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  fullWidth?: boolean;
}

const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  fullWidth = false,
}: FadeInProps) => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const prefersReducedMotion = useReducedMotion();

  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : {
              opacity: 0,
              ...directions[direction],
            }
      }
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : {}
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={fullWidth ? 'w-full' : ''}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;

