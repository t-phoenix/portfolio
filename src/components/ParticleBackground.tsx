import { useEffect, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { type Container, type ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { useReducedMotion } from '../hooks';

const ParticleBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Particles loaded', container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: !prefersReducedMotion,
            mode: 'push',
          },
          onHover: {
            enable: !prefersReducedMotion,
            mode: 'grab',
          },
        },
        modes: {
          push: {
            quantity: 2,
          },
          grab: {
            distance: 150,
            links: {
              opacity: 0.5,
            },
          },
        },
      },
      particles: {
        color: {
          value: '#0099ff',
        },
        links: {
          color: '#0099ff',
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: !prefersReducedMotion,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
      reduceDuplicates: true,
    }),
    [prefersReducedMotion]
  );

  if (prefersReducedMotion) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0 -z-10"
    />
  );
};

export default ParticleBackground;

