import React from 'react';
import Particles from 'react-tsparticles';

const ParticlesBackground = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <Particles
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      options={{
        background: {
          color: {
            value: isDark ? '#0d0d0d' : '#f5f5f5',
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: { enable: false, mode: 'push' },
            onHover: { enable: false, mode: 'repulse' },
            resize: true,
          },
        },
        particles: {
          color: { value: '#1DB954' },
          links: {
            color: '#1DB954',
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          collisions: { enable: false },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'out' },
            random: true,
            speed: 0.6,
            straight: false,
          },
          number: { density: { enable: true, area: 800 }, value: 60 },
          opacity: { value: 0.3 },
          shape: { type: 'circle' },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
