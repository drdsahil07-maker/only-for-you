import React from 'react';
import { SceneId } from '../config/universeData';

interface AmbientBackdropProps {
  activeScene: SceneId;
}

const STARS = [
  { id: 's1', top: '6%', left: '9%', size: 15, delay: '0s' },
  { id: 's2', top: '11%', left: '86%', size: 17, delay: '0.7s' },
  { id: 's3', top: '22%', left: '16%', size: 12, delay: '1.4s' },
  { id: 's4', top: '19%', left: '75%', size: 14, delay: '2.1s' },
  { id: 's5', top: '44%', left: '6%', size: 13, delay: '0.4s' },
  { id: 's6', top: '48%', left: '92%', size: 15, delay: '1.3s' },
  { id: 's7', top: '76%', left: '12%', size: 14, delay: '1.8s' },
  { id: 's8', top: '80%', left: '85%', size: 15, delay: '0.6s' },
  { id: 's9', top: '14%', left: '46%', size: 11, delay: '2.5s' },
];

const FLOATING_HEARTS = [
  { id: 'h1', top: '15%', left: '22%', size: 18, delay: '0.3s' },
  { id: 'h2', top: '27%', left: '82%', size: 16, delay: '1.5s' },
  { id: 'h3', top: '60%', left: '10%', size: 20, delay: '0.9s' },
  { id: 'h4', top: '66%', left: '88%', size: 18, delay: '2.1s' },
  { id: 'h5', top: '85%', left: '26%', size: 15, delay: '1.2s' },
];

const GLOW_PARTICLES = [
  { id: 'g1', top: '18%', left: '34%', size: 10, delay: '0.2s' },
  { id: 'g2', top: '34%', left: '68%', size: 12, delay: '1.1s' },
  { id: 'g3', top: '72%', left: '20%', size: 9, delay: '1.9s' },
  { id: 'g4', top: '64%', left: '76%', size: 11, delay: '0.8s' },
];

const DRIFTING_PETALS = [
  { id: 'p1', left: '14%', delay: '0s', color: '#F9DCE5' },
  { id: 'p2', left: '38%', delay: '3.2s', color: '#E8DDF8' },
  { id: 'p3', left: '64%', delay: '1.7s', color: '#FFE5D9' },
  { id: 'p4', left: '84%', delay: '4.8s', color: '#D98AA7' },
];

export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({ activeScene }) => {
  const isTwilightIntro = activeScene === 'scene-1-intro';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-colors duration-700 ${
        isTwilightIntro
          ? 'bg-gradient-to-br from-[#F7DDE8] via-[#E8DDF8] to-[#FFF6EE]'
          : 'bg-gradient-to-br from-[#FFF9F2] via-[#FCEBF1] to-[#EFE7FA]'
      }`}
    >
      {/* Dreamy Pastel Ambient Lighting Halos */}
      <div
        className="absolute -top-28 -left-24 h-[520px] w-[520px] rounded-full blur-3xl transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(249, 220, 229, 0.88) 0%, rgba(249, 220, 229, 0) 70%)',
        }}
      />
      <div
        className="absolute top-1/5 -right-24 h-[540px] w-[540px] rounded-full blur-3xl transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(232, 221, 248, 0.9) 0%, rgba(232, 221, 248, 0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-28 left-1/4 h-[480px] w-[480px] rounded-full blur-3xl transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 229, 217, 0.85) 0%, rgba(255, 229, 217, 0) 72%)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.65) 0%, rgba(255, 249, 242, 0) 68%)',
        }}
      />

      {/* Layered Volumetric Pastel Clouds */}
      <svg
        viewBox="0 0 280 110"
        className="animate-float-cloud absolute top-10 left-[3%] h-24 w-60 opacity-80 sm:h-28 sm:w-72"
      >
        <defs>
          <linearGradient id="cloudGradTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F9DCE5" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path
          d="M45 86 H220 C238 86 250 74 250 58 C250 43 238 32 222 32 C216 16 198 6 178 6 C154 6 135 20 130 40 C122 34 110 30 96 30 C74 30 56 46 54 66 C38 66 26 75 26 86 Z"
          fill="url(#cloudGradTop)"
        />
      </svg>

      <svg
        viewBox="0 0 280 110"
        style={{ animationDelay: '2.5s' }}
        className="animate-float-cloud absolute bottom-8 right-[4%] h-24 w-60 opacity-80 sm:h-28 sm:w-72"
      >
        <defs>
          <linearGradient id="cloudGradBottom" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E8DDF8" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M45 86 H220 C238 86 250 74 250 58 C250 43 238 32 222 32 C216 16 198 6 178 6 C154 6 135 20 130 40 C122 34 110 30 96 30 C74 30 56 46 54 66 C38 66 26 75 26 86 Z"
          fill="url(#cloudGradBottom)"
        />
      </svg>

      {/* Soft Glowing Particles */}
      {GLOW_PARTICLES.map((p) => (
        <span
          key={p.id}
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
          }}
          className="animate-twinkle-star absolute rounded-full bg-[#FFFFFF]/80 shadow-[0_0_14px_4px_rgba(217,138,167,0.45)]"
        />
      ))}

      {/* Twinkling Fairytale Stars */}
      {STARS.map((star) => (
        <svg
          key={star.id}
          width={star.size}
          height={star.size}
          viewBox="0 0 24 24"
          fill="none"
          style={{ top: star.top, left: star.left, animationDelay: star.delay }}
          className="animate-twinkle-star absolute text-[#D98AA7]/70"
        >
          <path
            d="M12 1.5L14.4 9.6L22.5 12L14.4 14.4L12 22.5L9.6 14.4L1.5 12L9.6 9.6L12 1.5Z"
            fill="currentColor"
          />
        </svg>
      ))}

      {/* Gentle Floating Hearts */}
      {FLOATING_HEARTS.map((heart) => (
        <svg
          key={heart.id}
          width={heart.size}
          height={heart.size}
          viewBox="0 0 24 24"
          fill="none"
          style={{ top: heart.top, left: heart.left, animationDelay: heart.delay }}
          className="animate-float-gentle absolute text-[#D98AA7]/45"
        >
          <path
            d="M12 20.5C12 20.5 3.5 14.8 3.5 8.6C3.5 5.8 5.7 3.7 8.4 3.7C10.1 3.7 11.4 4.6 12 5.7C12.6 4.6 13.9 3.7 15.6 3.7C18.3 3.7 20.5 5.8 20.5 8.6C20.5 14.8 12 20.5 12 20.5Z"
            fill="currentColor"
          />
        </svg>
      ))}

      {/* Drifting Flower Petals */}
      {DRIFTING_PETALS.map((petal) => (
        <svg
          key={petal.id}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          style={{ left: petal.left, animationDelay: petal.delay }}
          className="animate-drift-petal absolute -top-6"
        >
          <path
            d="M12 2C7 7 5 13 9 18C12 21 16 19 17 15C19 10 16 5 12 2Z"
            fill={petal.color}
            fillOpacity="0.65"
          />
        </svg>
      ))}
    </div>
  );
};
