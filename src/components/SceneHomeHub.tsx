import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Heart,
  Sparkles,
  Play,
  Pause,
  Disc,
  Lock,
} from 'lucide-react';
import { SceneId, UNIVERSE_CONFIG } from '../config/universeData';
import { ambientMusic } from '../utils/ambientMusic';

interface SceneHomeHubProps {
  onSelectScene: (sceneId: SceneId) => void;
  onNext?: () => void;
  onRevisitWelcome?: () => void;
}

const CELEBRATION_PETALS = [
  { id: 'bp1', left: '8%', top: '-20px', size: 16, duration: '9.5s', delay: '0.1s', drift: '28px', rot: '260deg' },
  { id: 'bp2', left: '22%', top: '-26px', size: 20, duration: '11.2s', delay: '1.4s', drift: '-34px', rot: '320deg' },
  { id: 'bp3', left: '38%', top: '-18px', size: 15, duration: '8.8s', delay: '0.7s', drift: '24px', rot: '220deg' },
  { id: 'bp4', left: '54%', top: '-28px', size: 22, duration: '12.4s', delay: '2.1s', drift: '-38px', rot: '300deg' },
  { id: 'bp5', left: '70%', top: '-22px', size: 17, duration: '10.1s', delay: '0.4s', drift: '30px', rot: '275deg' },
  { id: 'bp6', left: '86%', top: '-24px', size: 19, duration: '11.5s', delay: '1.8s', drift: '-26px', rot: '340deg' },
  { id: 'bp7', left: '15%', top: '-30px', size: 14, duration: '9.2s', delay: '3.2s', drift: '22px', rot: '290deg' },
  { id: 'bp8', left: '64%', top: '-20px', size: 18, duration: '10.8s', delay: '2.9s', drift: '-30px', rot: '310deg' },
];

const CELEBRATION_HEARTS = [
  { id: 'bh1', left: '12%', bottom: '-30px', size: 15, color: '#E56B8C', duration: '7.2s', delay: '0.2s', drift: '22px', rot: '16deg', opacity: 0.75 },
  { id: 'bh2', left: '28%', bottom: '-40px', size: 19, color: '#F3B8C9', duration: '8.6s', delay: '1.1s', drift: '-24px', rot: '-18deg', opacity: 0.7 },
  { id: 'bh3', left: '46%', bottom: '-35px', size: 14, color: '#D985A4', duration: '6.8s', delay: '0.5s', drift: '26px', rot: '22deg', opacity: 0.8 },
  { id: 'bh4', left: '66%', bottom: '-45px', size: 18, color: '#8F304C', duration: '8.1s', delay: '1.6s', drift: '-18px', rot: '-15deg', opacity: 0.6 },
  { id: 'bh5', left: '82%', bottom: '-35px', size: 16, color: '#E56B8C', duration: '7.5s', delay: '0.8s', drift: '24px', rot: '20deg', opacity: 0.75 },
  { id: 'bh6', left: '92%', bottom: '-40px', size: 13, color: '#F3B8C9', duration: '6.9s', delay: '2.3s', drift: '-20px', rot: '-14deg', opacity: 0.7 },
];

const CELEBRATION_SPARKLES = [
  { id: 'bs1', left: '14%', top: '14%', size: 16, duration: '2.5s', delay: '0.1s', color: '#FFAA5A' },
  { id: 'bs2', left: '84%', top: '12%', size: 18, duration: '3.0s', delay: '0.6s', color: '#E56B8C' },
  { id: 'bs3', left: '22%', top: '42%', size: 14, duration: '2.7s', delay: '1.2s', color: '#D985A4' },
  { id: 'bs4', left: '78%', top: '38%', size: 17, duration: '3.2s', delay: '0.4s', color: '#FFAA5A' },
  { id: 'bs5', left: '16%', top: '72%', size: 15, duration: '2.8s', delay: '0.9s', color: '#E56B8C' },
  { id: 'bs6', left: '86%', top: '68%', size: 16, duration: '2.6s', delay: '1.5s', color: '#FFAA5A' },
];

export const SceneHomeHub: React.FC<SceneHomeHubProps> = ({
  onSelectScene,
  onNext,
  onRevisitWelcome,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [trackTitle, setTrackTitle] = useState('A Thousand Years');
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ambientMusic.subscribe((state) => {
      setIsAudioPlaying(state.isPlaying);
      setIsAudioMuted(state.isMuted);
      setTrackTitle(state.currentTrackTitle);
      setAudioError(state.lastError);
    });
    return unsubscribe;
  }, []);

  const handleToggleSong = async () => {
    const res = await ambientMusic.togglePlaybackFromGesture();
    setIsAudioPlaying(res.isPlaying);
    setIsAudioMuted(res.isMuted);
    setAudioError(res.error);
  };

  const handleContinue = () => {
    if (onNext) {
      onNext();
    } else {
      onSelectScene('scene-memory-album');
    }
  };

  const activelyPlaying = isAudioPlaying && !isAudioMuted;

  return (
    <section
      aria-label="Birthday Greeting and Opening"
      data-testid="scene-home-hub"
      className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-between overflow-hidden px-3.5 pt-2 pb-4 text-center sm:px-6 sm:pt-4 sm:pb-6"
    >
      {/* ========================================================
          FALLING FLOWER PETALS, FLOATING HEARTS & SOFT SPARKLES
         ======================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      >
        {/* Falling Petals */}
        {CELEBRATION_PETALS.map((p) => (
          <div
            key={p.id}
            style={
              {
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size * 1.3}px`,
                '--duration': p.duration,
                '--delay': p.delay,
                '--drift-x': p.drift,
                '--rot': p.rot,
              } as React.CSSProperties
            }
            className="animate-drift-petal-particle absolute opacity-80"
          >
            <svg viewBox="0 0 20 26" className="h-full w-full">
              <path
                d="M10 0 C16 4 20 12 18 20 C16 26 8 26 3 20 C0 14 4 4 10 0 Z"
                fill="#F3B8C9"
                stroke="#E56B8C"
                strokeWidth="0.8"
                fillOpacity="0.85"
              />
            </svg>
          </div>
        ))}

        {/* Floating Hearts */}
        {CELEBRATION_HEARTS.map((h) => (
          <div
            key={h.id}
            style={
              {
                left: h.left,
                bottom: h.bottom,
                width: `${h.size}px`,
                height: `${h.size}px`,
                '--duration': h.duration,
                '--delay': h.delay,
                '--drift-x': h.drift,
                '--rot': h.rot,
                '--max-opacity': h.opacity,
              } as React.CSSProperties
            }
            className="animate-float-heart absolute"
          >
            <svg viewBox="0 0 24 24" className="h-full w-full" fill={h.color}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        ))}

        {/* Twinkling Sparkles */}
        {CELEBRATION_SPARKLES.map((s) => (
          <div
            key={s.id}
            style={
              {
                left: s.left,
                top: s.top,
                width: `${s.size}px`,
                height: `${s.size}px`,
                '--duration': s.duration,
                '--delay': s.delay,
                color: s.color,
              } as React.CSSProperties
            }
            className="animate-twinkle-sparkle absolute"
          >
            <Sparkles className="h-full w-full" />
          </div>
        ))}
      </div>

      {/* ========================================================
          WARM ROMANTIC BIRTHDAY REVEAL HERO
         ======================================================== */}
      <div className="relative z-10 flex w-full flex-col items-center">
        {/* Main Birthday Reveal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full overflow-hidden rounded-[1.75rem] border border-[#D985A4]/45 bg-gradient-to-b from-[#FFFDF9]/95 via-[#FFF6F9]/95 to-[#FCEAEF]/95 p-4 shadow-xl sm:p-5"
        >
          {/* Celebration Ribbon Tag */}
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#E56B8C]/35 bg-[#FFF0F5] px-3 py-0.5 text-[10px] font-semibold tracking-wider text-[#8F304C] shadow-2xs">
            <Sparkles className="h-3 w-3 text-[#E56B8C]" />
            <span>YOUR 20TH BIRTHDAY CELEBRATION</span>
            <Sparkles className="h-3 w-3 text-[#E56B8C]" />
          </div>

          {/* Primary Greeting Heading */}
          <motion.h1
            data-testid="birthday-reveal-heading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 font-handwritten text-3xl font-bold leading-snug text-[#42232D] sm:text-4xl"
          >
            Happy 20th Birthday, Meri Cutieee! 🎂🎀❤️
          </motion.h1>

          <div className="mt-1.5 flex items-center justify-center gap-2 text-[#E56B8C]">
            <span className="h-px w-8 bg-[#D985A4]/50" />
            <Heart className="h-3.5 w-3.5 fill-current animate-gentle-pulse" />
            <span className="h-px w-8 bg-[#D985A4]/50" />
          </div>

          {/* Original Keepsake Photo Card & Personal Birthday Message */}
          <div className="mt-2.5 flex flex-col items-center gap-2.5">
            <div className="relative mx-auto w-36 overflow-hidden rounded-2xl border border-[#D985A4]/45 bg-[#FFFDF9] p-1.5 shadow-md -rotate-1 sm:w-40">
              <img
                src={UNIVERSE_CONFIG.sceneMemoryAlbum.polaroids[0]?.imageUrl || '/memory-01.jpg.png'}
                alt="Birthday Keepsake Preview"
                className="h-28 w-full rounded-xl object-contain sm:h-32"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = '/memory-01.jpg.png';
                  }
                }}
              />
              <span className="mt-1 block font-handwritten text-xs font-bold text-[#42232D]">
                My Favourite Person ♡
              </span>
            </div>

            <div className="space-y-2 px-0.5 text-center font-serif text-[13px] leading-snug text-[#42232D]/95 sm:text-sm sm:leading-relaxed">
              <p className="font-semibold text-[#8F304C]">
                Meri pyaari Wifeyyy, meri Sweetheart, mera bachaaa, meri Baby! 🥹💗
              </p>

              <p>
                Aaj ka din sirf aapke naam! 🌷✨ Meri wish hai ki aapki life hamesha khushiyon, pyaar, cute surprises aur beautiful moments se bhari rahe. Aapki smile hamesha aise hi bani rahe, aapke saare dreams poore hon, aur aapko har din itna pyaar mile jitna aap deserve karti hain. 🧿🫶🏻
              </p>

              <p>
                Hamesha aise hi cute, naughty, thodi si nakhre wali aur apni pyaari si smile ke saath rehna, meri jaan! Aap mere liye bahut special hain. I hope aaj aapke face par sabse pyaari smile ho. 💋🎀💞
              </p>

              <p className="font-bold text-[#42232D]">
                Happy Birthday once again, meri Cutieee, meri Wifeyyy! I love you so much! 🎂❤️🫂
              </p>
            </div>
          </div>

          {/* Graceful Play/Pause Control for A Thousand Years */}
          <div className="mt-3 flex flex-col items-center">
            <button
              type="button"
              data-testid="greeting-music-toggle"
              onClick={handleToggleSong}
              aria-pressed={activelyPlaying}
              className="group inline-flex items-center gap-2 rounded-full border border-[#E56B8C]/40 bg-[#FFFFFF]/90 px-3.5 py-1.5 text-left shadow-xs transition-all hover:border-[#E56B8C] hover:bg-[#FFF0F5] active:scale-95 cursor-pointer"
            >
              <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#3C2434]">
                <Disc
                  className={`h-3.5 w-3.5 text-[#E56B8C] ${activelyPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#42232D] leading-tight">
                  {trackTitle}
                </span>
                <span className="text-[10px] font-medium text-[#8F304C]/80 leading-tight">
                  {activelyPlaying ? 'Playing softly for you · Tap to pause' : 'Paused · Tap to play our song'}
                </span>
              </div>
              <div className="ml-0.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#E56B8C] text-[#FFFFFF]">
                {activelyPlaying ? (
                  <Pause className="h-2.5 w-2.5 fill-current" />
                ) : (
                  <Play className="h-2.5 w-2.5 translate-x-0.5 fill-current" />
                )}
              </div>
            </button>

            {audioError && (
              <p className="mt-1 text-[11px] font-medium text-[#8F304C]">
                {audioError}
              </p>
            )}
          </div>

          {/* Primary Sequential Continue Button */}
          <div className="mt-3">
            <button
              type="button"
              data-testid="opening-continue-btn"
              onClick={handleContinue}
              className="cta-pill-romantic group flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-6 py-3 text-sm font-semibold text-[#FFFFFF] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:text-base cursor-pointer"
            >
              <span>Continue to Our Memories</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle Lock / Revisit Password Screen Link */}
      {onRevisitWelcome && (
        <div className="relative z-10 mt-3 text-center">
          <button
            type="button"
            onClick={onRevisitWelcome}
            className="inline-flex items-center gap-1.5 text-xs text-[#8F304C]/65 hover:text-[#E56B8C] transition-colors cursor-pointer"
          >
            <Lock className="h-3 w-3" />
            <span>Lock & Return to Password Screen</span>
          </button>
        </div>
      )}
    </section>
  );
};
