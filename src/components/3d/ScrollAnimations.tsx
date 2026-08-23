import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax = ({ children, speed = 0.5, className = '' }: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.to(element, {
      y: `${speed * 100}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

interface RevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

export const Reveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 1,
  className = '',
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const directions = {
      up: { y: 100, x: 0 },
      down: { y: -100, x: 0 },
      left: { y: 0, x: 100 },
      right: { y: 0, x: -100 },
    };

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: directions[direction].y,
        x: directions[direction].x,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [direction, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

interface StaggerProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
  childClassName?: string;
}

export const StaggerReveal = ({
  children,
  stagger = 0.1,
  className = '',
  childClassName = '',
}: StaggerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;

    gsap.fromTo(
      items,
      {
        opacity: 0,
        y: 50,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [stagger]);

  return (
    <div ref={containerRef} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} className={childClassName}>
              {child}
            </div>
          ))
        : children}
    </div>
  );
};

interface PinSectionProps {
  children: ReactNode;
  pinDuration?: number;
  className?: string;
}

export const PinSection = ({ children, pinDuration = 1, className = '' }: PinSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const trigger = triggerRef.current;
    if (!element || !trigger) return;

    ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: `+=${pinDuration * 100}%`,
      pin: element,
      pinSpacing: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [pinDuration]);

  return (
    <div ref={triggerRef}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </div>
  );
};

interface ScaleOnScrollProps {
  children: ReactNode;
  scaleFrom?: number;
  scaleTo?: number;
  className?: string;
}

export const ScaleOnScroll = ({
  children,
  scaleFrom = 0.8,
  scaleTo = 1,
  className = '',
}: ScaleOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(
      element,
      { scale: scaleFrom },
      {
        scale: scaleTo,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'top center',
          scrub: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [scaleFrom, scaleTo]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

interface TextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

export const TextReveal = ({ text, className = '', wordClassName = '' }: TextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll('.word');

    gsap.fromTo(
      words,
      {
        opacity: 0,
        y: 20,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [text]);

  return (
    <div ref={containerRef} className={className} style={{ perspective: '1000px' }}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className={`word inline-block ${wordClassName}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
};
