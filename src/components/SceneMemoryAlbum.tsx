import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Sparkles,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { MemoryAlbumPolaroid, UNIVERSE_CONFIG } from '../config/universeData';

interface SceneMemoryAlbumProps {
  onNext: () => void;
  onBack?: () => void;
}

type MemoryViewState = 'opening' | 'slideshow' | 'final';

const TAPE_COLORS: Record<MemoryAlbumPolaroid['tapeStyle'], string> = {
  rose: 'rgba(249, 212, 224, 0.92)',
  lavender: 'rgba(232, 221, 248, 0.92)',
  peach: 'rgba(255, 229, 217, 0.92)',
  cream: 'rgba(255, 248, 235, 0.95)',
};

const PAPER_TINT_CLASSES: Record<
  NonNullable<MemoryAlbumPolaroid['paperTint']>,
  { outer: string; mat: string }
> = {
  cream: {
    outer: 'bg-gradient-to-b from-[#FFFEFC] via-[#FFF9F3] to-[#F9EFE6] border-[#D98AA7]/40',
    mat: 'bg-[#FFFDF9]',
  },
  blush: {
    outer: 'bg-gradient-to-b from-[#FFF9FB] via-[#FFF2F6] to-[#F9E4EC] border-[#D98AA7]/50',
    mat: 'bg-[#FFF6F9]',
  },
  'rose-parchment': {
    outer: 'bg-gradient-to-b from-[#FFFDF9] via-[#FDF4F0] to-[#F7E6EC] border-[#8A2432]/30',
    mat: 'bg-[#FFF9F5]',
  },
};

const ScrapbookCornerOrnament: React.FC<{
  type: MemoryAlbumPolaroid['stickerType'];
}> = ({ type }) => {
  switch (type) {
    case 'bow':
      return (
        <svg viewBox="0 0 32 24" className="h-5 w-6 drop-shadow-2xs" aria-hidden="true">
          <path
            d="M16 12 C10 4 3 6 5 12 C6 15 11 14 16 12 Z"
            fill="#D98AA7"
            stroke="#493449"
            strokeWidth="1.3"
          />
          <path
            d="M16 12 C22 4 29 6 27 12 C26 15 21 14 16 12 Z"
            fill="#D98AA7"
            stroke="#493449"
            strokeWidth="1.3"
          />
          <path
            d="M14 13 L10 22 M18 13 L22 22"
            stroke="#8A2432"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="12" r="2.6" fill="#FFF9F2" stroke="#493449" strokeWidth="1.2" />
        </svg>
      );
    case 'pressed-flower':
      return (
        <svg viewBox="0 0 28 28" className="h-5 w-5 drop-shadow-2xs" aria-hidden="true">
          <circle cx="14" cy="7.5" r="4.2" fill="#F4B8CE" stroke="#493449" strokeWidth="1" />
          <circle cx="20.5" cy="14" r="4.2" fill="#F4B8CE" stroke="#493449" strokeWidth="1" />
          <circle cx="14" cy="20.5" r="4.2" fill="#F4B8CE" stroke="#493449" strokeWidth="1" />
          <circle cx="7.5" cy="14" r="4.2" fill="#F4B8CE" stroke="#493449" strokeWidth="1" />
          <circle cx="14" cy="14" r="3.2" fill="#FFE5B4" stroke="#493449" strokeWidth="1" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#8A2432]" aria-hidden="true">
          <path
            d="M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#D98AA7]" aria-hidden="true">
          <path
            d="M12 2.5 L14.8 8.4 L21.3 9.3 L16.6 13.8 L17.7 20.3 L12 17.2 L6.3 20.3 L7.4 13.8 L2.7 9.3 L9.2 8.4 Z"
            fill="currentColor"
            stroke="#493449"
            strokeWidth="1.2"
          />
        </svg>
      );
    case 'heart':
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#8A2432]" aria-hidden="true">
          <path
            d="M12 20.5C12 20.5 3.5 14.8 3.5 8.6C3.5 5.8 5.7 3.7 8.4 3.7C10.1 3.7 11.4 4.6 12 5.7C12.6 4.6 13.9 3.7 15.6 3.7C18.3 3.7 20.5 5.8 20.5 8.6C20.5 14.8 12 20.5 12 20.5Z"
            fill="currentColor"
          />
        </svg>
      );
  }
};

export const SceneMemoryAlbum: React.FC<SceneMemoryAlbumProps> = ({
  onNext,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const photos = UNIVERSE_CONFIG.sceneMemoryAlbum.polaroids;
  const totalPhotos = photos.length;

  const [viewState, setViewState] = useState<MemoryViewState>('opening');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentPhoto = photos[currentIndex] || photos[0];
  const tint = PAPER_TINT_CLASSES[currentPhoto?.paperTint ?? 'cream'];

  const handleOpenMemories = () => {
    setCurrentIndex(0);
    setDirection(1);
    setViewState('slideshow');
  };

  const handleNextPhoto = useCallback(() => {
    if (currentIndex < totalPhotos - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setViewState('final');
    }
  }, [currentIndex, totalPhotos]);

  const handlePrevPhoto = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    } else {
      setViewState('opening');
    }
  }, [currentIndex]);

  // Keyboard navigation for desktop: Left/Right arrows
  useEffect(() => {
    if (viewState !== 'slideshow') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, handleNextPhoto, handlePrevPhoto]);

  return (
    <section
      aria-label="Our Memories Guided Experience"
      data-testid="scene-memory-album"
      className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-between overflow-hidden px-3.5 pt-3 pb-8 text-center sm:px-6 sm:pt-4"
    >
      <AnimatePresence mode="wait">
        {/* ========================================================
            STAGE 1: DEDICATED OPENING PAGE
           ======================================================== */}
        {viewState === 'opening' && (
          <motion.div
            key="memories-opening-stage"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-1 flex-col items-center justify-between"
          >
            <div className="w-full">
              {/* Scrapbook Note Header */}
              <div className="relative mx-auto mt-2 w-full max-w-sm rounded-[2rem] border border-[#D98AA7]/45 bg-gradient-to-b from-[#FFFDF9]/95 via-[#FFF6F9]/95 to-[#FCEAEF]/95 p-5 shadow-xl sm:p-6">
                {/* Washi Tape Strip */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 -rotate-1 rounded-xs bg-[#F8DCE5]/95 border-t border-b border-[#FFFFFF]/90 shadow-2xs"
                />

                <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#E56B8C]/35 bg-[#FFF0F5] px-3 py-0.5 text-[10px] font-semibold tracking-wider text-[#8F304C] shadow-2xs">
                  <Sparkles className="h-3 w-3 text-[#E56B8C]" />
                  <span>CHAPTER 1 OF 3</span>
                  <Sparkles className="h-3 w-3 text-[#E56B8C]" />
                </div>

                <h1
                  data-testid="memories-opening-heading"
                  className="mt-3 font-handwritten text-4xl font-bold leading-tight text-[#42232D] sm:text-5xl"
                >
                  Our Memories ♡
                </h1>

                <p
                  data-testid="memories-opening-subtitle"
                  className="mt-1.5 font-serif text-sm italic text-[#8F304C]/90 sm:text-base font-medium"
                >
                  Little moments, endless memories.
                </p>

                {/* Keepsake Album Emblem Card */}
                <div className="relative mx-auto mt-4 w-44 overflow-hidden rounded-2xl border border-[#D98AA7]/45 bg-[#FFFDF9] p-2 shadow-md -rotate-1 sm:w-48">
                  <img
                    src={photos[0]?.imageUrl || '/memory-01.jpg.png'}
                    alt="Our Memories Album Cover"
                    className="h-32 sm:h-36 w-full rounded-xl object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = 'true';
                        target.src = '/memory-01.jpg.png';
                      }
                    }}
                  />
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-[#8F304C]">
                    <Heart className="h-3 w-3 fill-current text-[#E56B8C]" />
                    <span className="font-handwritten text-xs font-bold text-[#42232D]">
                      {totalPhotos} Moments of Us
                    </span>
                  </div>
                </div>

                <p className="mt-3.5 px-2 font-serif text-xs leading-relaxed text-[#42232D]/85 sm:text-sm">
                  A quiet collection of moments that made my life softer, brighter, and full of love. Take your time walking through each one ♡
                </p>

                {/* Single Clear Open Button */}
                <div className="mt-5">
                  <button
                    type="button"
                    data-testid="open-memories-btn"
                    onClick={handleOpenMemories}
                    className="cta-pill-romantic group flex w-full min-h-[50px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] cursor-pointer sm:text-base"
                  >
                    <span>Open Our Memories →</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Back Navigation to Password Welcome Gate */}
            {onBack && (
              <div className="mt-4">
                <button
                  type="button"
                  data-testid="memories-back-btn"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F304C]/75 hover:text-[#E56B8C] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Lock & Return to Password Screen</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            STAGE 2: ONE PHOTO AT A TIME (SEQUENTIAL SLIDESHOW)
           ======================================================== */}
        {viewState === 'slideshow' && (
          <motion.div
            key="memories-slideshow-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex w-full flex-1 flex-col items-center justify-between"
            onTouchStart={(e) => {
              setTouchStartX(e.touches[0]?.clientX ?? null);
            }}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const endX = e.changedTouches[0]?.clientX ?? touchStartX;
              const deltaX = endX - touchStartX;
              if (deltaX < -45) {
                handleNextPhoto();
              } else if (deltaX > 45) {
                handlePrevPhoto();
              }
              setTouchStartX(null);
            }}
          >
            <div className="w-full">
              {/* Counter Pill */}
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setViewState('opening')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8F304C]/75 hover:text-[#E56B8C] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Album Cover</span>
                </button>

                <div
                  data-testid="memory-counter"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E56B8C]/40 bg-[#FFF0F5] px-3.5 py-1 text-xs font-semibold tracking-wider text-[#8F304C] shadow-2xs"
                >
                  <Heart className="h-3 w-3 fill-current text-[#E56B8C]" />
                  <span>Memory {currentIndex + 1} of {totalPhotos}</span>
                </div>

                <span className="font-mono-tabular text-[11px] font-semibold text-[#8F304C]/65">
                  {currentIndex + 1} / {totalPhotos}
                </span>
              </div>

              {/* Single Large Photo in Beautiful Scrapbook Polaroid Frame */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhoto.id}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: direction * 28, scale: 0.98 }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: -direction * 28, scale: 0.98 }
                  }
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative flex w-full flex-col rounded-3xl border p-3.5 pb-4 shadow-xl sm:p-5 sm:pb-5 ${tint.outer}`}
                >
                  {/* Washi Tape Strip */}
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: TAPE_COLORS[currentPhoto.tapeStyle] }}
                    className="washi-tape pointer-events-none absolute -top-2.5 left-1/2 z-10 h-5 w-24 -translate-x-1/2 -rotate-1 rounded-xs border-t border-b border-white/80 shadow-2xs"
                  />

                  {/* Corner Sticker */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#FFFDF9] shadow-2xs"
                  >
                    <ScrapbookCornerOrnament type={currentPhoto.stickerType} />
                  </span>

                  {/* Uncropped Original Photo Container (object-fit: contain) */}
                  <div
                    className={`relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#D98AA7]/35 p-2 sm:p-3 ${tint.mat}`}
                  >
                    <img
                      src={currentPhoto.imageUrl}
                      alt={currentPhoto.caption || `Couple memory ${currentIndex + 1}`}
                      data-testid={`gallery-single-photo-${currentIndex + 1}`}
                      style={{ objectFit: 'contain' }}
                      className="mx-auto block h-auto max-h-[48vh] sm:max-h-[55vh] w-auto max-w-full rounded-xl object-contain select-none"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const num = String(currentIndex + 1).padStart(2, '0');
                        if (!target.dataset.fallback1) {
                          target.dataset.fallback1 = 'true';
                          target.src = `/memory-${num}.jpg.png`;
                        } else if (!target.dataset.fallback2) {
                          target.dataset.fallback2 = 'true';
                          target.src = `/photos/memory-${num}.jpg.png`;
                        }
                      }}
                    />
                  </div>

                  {/* Caption & Personal Poetry */}
                  <div className="mt-3.5 flex flex-col items-center text-center">
                    {currentPhoto.caption ? (
                      <p
                        data-testid="memory-photo-caption"
                        className="font-handwritten text-2xl sm:text-3xl font-bold text-[#42232D]"
                      >
                        {currentPhoto.caption}
                      </p>
                    ) : null}

                    {currentPhoto.poem ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.08 }}
                        data-testid="memory-photo-poetry"
                        className="relative mt-3 w-full rounded-2xl border border-dashed border-[#D98AA7]/50 bg-gradient-to-b from-[#FFFDF9]/95 via-[#FFF6F9]/95 to-[#FCEFE9]/95 px-4 pt-4 pb-3.5 sm:px-5 sm:pt-4 sm:pb-4 shadow-2xs"
                      >
                        {/* Decorative Top Heart Accent */}
                        <div className="mx-auto -mt-6 mb-2 flex h-5 w-5 items-center justify-center rounded-full border border-[#F8DCE5] bg-[#FFFFFF] shadow-2xs">
                          <Heart className="h-3 w-3 fill-[#E56B8C] text-[#E56B8C]" />
                        </div>

                        <p className="font-handwritten text-[17px] sm:text-[19px] leading-[26px] sm:leading-[29px] text-[#42232D] whitespace-pre-line select-text">
                          {currentPhoto.poem}
                        </p>
                      </motion.div>
                    ) : null}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Clear Previous and Next Memory Controls Fully Visible on Mobile */}
            <div className="mt-4 flex w-full items-center justify-between gap-3">
              <button
                type="button"
                data-testid="memory-prev-btn"
                onClick={handlePrevPhoto}
                aria-label="Previous memory"
                className="flex flex-1 min-h-[46px] items-center justify-center gap-1.5 rounded-full border border-[#D98AA7]/45 bg-[#FFFFFF]/95 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#8F304C] shadow-xs transition-all hover:bg-[#FFF0F5] active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{currentIndex === 0 ? 'Album Cover' : 'Previous'}</span>
              </button>

              <button
                type="button"
                data-testid="memory-next-btn"
                onClick={handleNextPhoto}
                aria-label="Next memory"
                className="flex flex-1 min-h-[46px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{currentIndex === totalPhotos - 1 ? 'Finish Memories →' : 'Next Memory'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            STAGE 3: FINAL PAGE AFTER 10TH PHOTO
           ======================================================== */}
        {viewState === 'final' && (
          <motion.div
            key="memories-final-stage"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-1 flex-col items-center justify-between"
          >
            <div className="w-full">
              <div className="relative mx-auto mt-2 w-full max-w-sm rounded-[2rem] border border-[#D98AA7]/45 bg-gradient-to-b from-[#FFFDF9]/95 via-[#FFF6F9]/95 to-[#FCEAEF]/95 p-6 text-center shadow-xl sm:p-7">
                {/* Washi Tape Strip */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 -rotate-1 rounded-xs bg-[#F8DCE5]/95 border-t border-b border-[#FFFFFF]/90 shadow-2xs"
                />

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F5] text-[#E56B8C] shadow-xs">
                  <Heart className="h-7 w-7 fill-current animate-gentle-pulse" />
                </div>

                <h2
                  data-testid="memories-final-heading"
                  className="mt-3 font-handwritten text-3xl sm:text-4xl font-bold leading-tight text-[#42232D]"
                >
                  Every memory with you is special ♡
                </h2>

                <p className="mt-2 font-serif text-sm italic text-[#8F304C]/90 sm:text-base">
                  And the sweetest moments are still yet to come...
                </p>

                <p className="mt-3 font-serif text-xs leading-relaxed text-[#42232D]/85 sm:text-sm">
                  Next, let’s read the 20-page handwritten love letter I wrote just for you ♡
                </p>

                {/* Primary Button: Read My Love Letter → */}
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    data-testid="continue-to-love-letter-btn"
                    onClick={onNext}
                    className="cta-pill-romantic group flex w-full min-h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] cursor-pointer"
                  >
                    <span>Read My Love Letter →</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    data-testid="review-memories-btn"
                    onClick={() => {
                      setCurrentIndex(0);
                      setViewState('slideshow');
                    }}
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#8F304C]/75 hover:text-[#E56B8C] transition-colors cursor-pointer pt-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Review memories again from the start</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
