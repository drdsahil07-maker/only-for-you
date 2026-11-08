import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  BookOpen,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { UNIVERSE_CONFIG } from '../config/universeData';
import { ambientMusic } from '../utils/ambientMusic';

interface Scene3LoveLetterProps {
  onNext: () => void;
  onBack?: () => void;
  letterTextOverride?: string;
}

type DiaryState = 'closed' | 'opening' | 'open';

/**
 * Formats handwritten text, styling **bold** highlights in deep rose and preserving line breaks
 */
function renderHandwrittenText(text: string, isFinalPage = false) {
  const paragraphs = text.split(/\n{2,}/);

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n');

    return (
      <p
        key={pIdx}
        className={`mb-2 text-left font-handwritten tracking-[0.01em] text-[#3D1E10] select-text last:mb-0 ${
          isFinalPage
            ? 'text-[15px] sm:text-[16px] leading-[21px] sm:leading-[23px]'
            : 'text-[16px] sm:text-[18px] leading-[23px] sm:leading-[26px]'
        }`}
      >
        {lines.map((line, lIdx) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <React.Fragment key={lIdx}>
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const inner = part.slice(2, -2);
                  return (
                    <strong
                      key={partIdx}
                      className="font-bold text-[#8F304C]"
                    >
                      {inner}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              })}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </p>
    );
  });
}

/**
 * Interactive Corner Stickers that bounce on tap/hover
 */
const InteractiveCornerSticker: React.FC<{
  type: 'bow' | 'flower' | 'star' | 'heart';
  position: 'top-right' | 'bottom-right';
}> = ({ type, position }) => {
  const [bounced, setBounced] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBounced(true);
    setTimeout(() => setBounced(false), 600);
  };

  const posClass = position === 'top-right' ? 'top-2.5 right-2.5' : 'bottom-2.5 right-2.5';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      animate={bounced ? { scale: [1, 1.35, 0.9, 1.15, 1], rotate: [0, -12, 12, -6, 0] } : {}}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      className={`absolute ${posClass} z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/75 shadow-2xs backdrop-blur-xs cursor-pointer select-none`}
      title="Tap me ♡"
      aria-label="Interactive scrapbook sticker"
    >
      {type === 'bow' && <span className="text-sm">🎀</span>}
      {type === 'flower' && <span className="text-sm">🌸</span>}
      {type === 'star' && <span className="text-sm text-[#E56B8C]">✨</span>}
      {type === 'heart' && <span className="text-sm text-[#E56B8C]">💖</span>}
    </motion.button>
  );
};

export const Scene3LoveLetter: React.FC<Scene3LoveLetterProps> = ({
  onNext,
  onBack,
  letterTextOverride,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const [diaryState, setDiaryState] = useState<DiaryState>('closed');
  const [currentPage, setCurrentPage] = useState(0);

  // 3D Page Turn State
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [isTurning, setIsTurning] = useState(false);
  const [turningFromPage, setTurningFromPage] = useState(0);

  const rawLetterText =
    letterTextOverride || UNIVERSE_CONFIG.scene3LoveLetter.letterText;

  // Derive exactly 20 balanced pages from letterText
  const pages = useMemo(() => {
    if (!rawLetterText || rawLetterText.trim().length === 0) return [];
    return rawLetterText
      .split(/\n\s*---\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [rawLetterText]);

  const totalPages = Math.max(1, pages.length); // Exactly 20
  const safePageIndex = Math.min(currentPage, totalPages - 1);

  // Open diary sequence
  const handleOpenDiary = () => {
    if (diaryState !== 'closed') return;
    ambientMusic.triggerLoveLetterOpen();
    if (prefersReducedMotion) {
      setDiaryState('open');
      return;
    }
    setDiaryState('opening');
    setTimeout(() => {
      setDiaryState('open');
    }, 650);
  };

  const handleCloseDiary = () => {
    setDiaryState('closed');
    setCurrentPage(0);
    setTurnDirection(null);
    setIsTurning(false);
  };

  // 3D Page Turn Handlers with click protection
  const handleNextPage = useCallback(() => {
    if (isTurning || safePageIndex >= totalPages - 1) return;
    setIsTurning(true);
    setTurnDirection('next');
    setTurningFromPage(safePageIndex);

    const turnDuration = prefersReducedMotion ? 60 : 540;

    setTimeout(() => {
      setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
      setTurnDirection(null);
      setIsTurning(false);
    }, turnDuration);
  }, [isTurning, safePageIndex, totalPages, prefersReducedMotion]);

  const handlePrevPage = useCallback(() => {
    if (isTurning || safePageIndex <= 0) return;
    setIsTurning(true);
    setTurnDirection('prev');
    setTurningFromPage(safePageIndex);

    const turnDuration = prefersReducedMotion ? 60 : 540;

    setTimeout(() => {
      setCurrentPage((prev) => Math.max(0, prev - 1));
      setTurnDirection(null);
      setIsTurning(false);
    }, turnDuration);
  }, [isTurning, safePageIndex, prefersReducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    if (diaryState !== 'open') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diaryState, handleNextPage, handlePrevPage]);

  // Current and target page text
  const activePageText = pages[safePageIndex] || '';
  const isFinalPage = safePageIndex === totalPages - 1;

  // Sticker variant for current page
  const stickerType =
    safePageIndex % 4 === 0
      ? 'bow'
      : safePageIndex % 4 === 1
      ? 'flower'
      : safePageIndex % 4 === 2
      ? 'star'
      : 'heart';

  return (
    <section
      aria-label="Love Letter Storybook"
      data-testid="scene-3-love-letter"
      className="relative z-10 flex flex-1 flex-col items-center justify-center px-2 py-3 text-center sm:px-4 sm:py-5"
    >
      {/* Gentle Romantic Floating Ambient Hearts */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <div className="absolute top-8 left-[12%] h-64 w-64 -translate-x-1/2 rounded-full bg-[#F8DCE5]/40 blur-3xl" />
        <div className="absolute right-[10%] bottom-8 h-72 w-72 translate-x-1/2 rounded-full bg-[#FFE5D9]/45 blur-3xl" />
        <div className="animate-float-gentle absolute top-6 left-[8%] text-[#E56B8C]/40">
          <Heart className="h-4 w-4 fill-current" />
        </div>
        <div
          className="animate-float-gentle absolute top-12 right-[10%] text-[#D98AA7]/40"
          style={{ animationDelay: '1.4s' }}
        >
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {diaryState !== 'open' ? (
          /* ========================================================
             STAGE 1: CLOSED PHYSICAL DIARY WITH 3D COVER
             ======================================================== */
          <motion.div
            key="closed-diary-stage"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="perspective-book relative flex w-full max-w-sm flex-col items-center justify-center py-4"
          >
            {/* The Leather Diary Cover */}
            <motion.div
              animate={
                diaryState === 'opening'
                  ? {
                      rotateY: -140,
                      x: -25,
                      boxShadow: '0 30px 60px -10px rgba(66, 16, 30, 0.6)',
                    }
                  : { rotateY: 0, x: 0 }
              }
              transition={{ duration: 0.65, ease: [0.35, 0.05, 0.25, 1] }}
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
              }}
              className="storybook-leather-cover relative flex min-h-[460px] w-full max-w-[320px] flex-col items-center justify-between rounded-r-[2rem] rounded-l-[0.75rem] p-6 text-center text-[#FFF9F2] shadow-2xl sm:min-h-[500px] sm:max-w-[340px] sm:p-7"
            >
              {/* Gold Filigree Embossed Stitched Border */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-2.5 rounded-r-[1.6rem] rounded-l-[0.5rem] border border-[#FFD2DF]/45 border-dashed"
              />

              {/* Book Spine Edge Shadow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/45 via-black/15 to-transparent rounded-l-[0.75rem]"
              />

              {/* Satin Bookmark Ribbon hanging out from top */}
              <div
                aria-hidden="true"
                className="absolute -top-3 left-10 flex flex-col items-center select-none"
              >
                <div className="h-10 w-4 bg-[#E56B8C] shadow-md border-b-2 border-white/50" />
                <div className="h-0 w-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-[#E56B8C]" />
              </div>

              {/* Cover Header */}
              <div className="relative z-10 mt-3 flex flex-col items-center px-2">
                <h2 className="font-handwritten text-[28px] leading-tight font-bold tracking-tight text-[#FFFFFF] drop-shadow-sm sm:text-[34px]">
                  On Your 20th Birthday ♡
                </h2>
                <p className="mt-1.5 font-display text-xs font-medium tracking-[0.08em] text-[#F8DCE5]/95 sm:text-sm">
                  This 20-Page Book Is for You
                </p>
              </div>

              {/* Center Medallion: Gold Wax Heart Seal Stamp */}
              <div className="relative z-10 my-3 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#A83254] via-[#8F304C] to-[#5A1C2E] p-2 shadow-lg border-2 border-[#FFD2DF]/60">
                <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-[#FFD2DF]/70">
                  <Heart className="h-12 w-12 fill-[#FFFDF9] text-[#FFFDF9] drop-shadow-md animate-gentle-pulse" />
                </div>
              </div>

              {/* Cover Bottom Inscription & Action */}
              <div className="relative z-10 mb-1.5 w-full px-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Heart className="h-3 w-3 shrink-0 fill-current text-[#E56B8C]" />
                  <p className="font-handwritten text-base leading-snug text-[#F8DCE5] sm:text-lg">
                    Made with all my love, just for you 🎀
                  </p>
                </div>

                <button
                  type="button"
                  data-testid="open-diary-button"
                  onClick={handleOpenDiary}
                  className="mt-3.5 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-6 py-3 text-sm font-semibold text-[#FFFFFF] shadow-md transition-all hover:scale-103 active:scale-97 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Open Storybook →</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* ========================================================
             STAGE 2: OPEN PHYSICAL STORYBOOK (EXACTLY 20 PROPERLY FILLED PAGES)
             ======================================================== */
          <motion.div
            key="open-diary-stage"
            data-testid="open-diary-stage"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="perspective-book relative mx-auto flex w-full max-w-md flex-col items-center"
          >
            {/* The Storybook Physical Frame */}
            <div className="relative w-full max-w-[360px] sm:max-w-[400px]">
              {/* Underlying Physical Page Sheets for Depth */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-y-2 translate-x-1.5 rounded-r-[2rem] rounded-l-[0.6rem] border border-[#D98AA7]/30 bg-[#FFF7EE] shadow-md"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-y-1 translate-x-1 rounded-r-[2rem] rounded-l-[0.6rem] border border-[#D98AA7]/30 bg-[#FFFBF5] shadow-sm"
              />

              {/* Main Physical Storybook Page Canvas */}
              <div className="storybook-page-ivory transform-style-preserve-3d relative flex min-h-[480px] sm:min-h-[520px] w-full flex-col justify-between overflow-hidden rounded-r-[2rem] rounded-l-[0.6rem] p-5 pt-3.5 text-left shadow-2xl sm:p-7 sm:pt-4">
                {/* Book Spine Crease Gradient on Left */}
                <div
                  aria-hidden="true"
                  className="storybook-spine-crease pointer-events-none absolute inset-y-0 left-0 z-30 w-7 rounded-l-[0.6rem]"
                />

                {/* Satin Bookmark Ribbon from Top */}
                <div
                  aria-hidden="true"
                  className="absolute -top-1 left-9 z-30 select-none"
                >
                  <div className="h-9 w-3.5 rounded-b-xs bg-[#E56B8C] shadow-sm flex items-end justify-center pb-0.5">
                    <Heart className="h-2 w-2 fill-white text-white" />
                  </div>
                </div>

                {/* Top Corner Washi Tape */}
                <div
                  aria-hidden="true"
                  className="washi-tape pointer-events-none absolute -top-2.5 right-12 z-20 h-4.5 w-20 rotate-2 rounded-xs bg-[#F8DCE5]/90 border-t border-b border-white/80 shadow-2xs"
                />

                {/* Interactive Corner Sticker */}
                <InteractiveCornerSticker type={stickerType} position="top-right" />

                {/* Header: Book Title & Close Control */}
                <header className="relative z-20 flex items-center justify-between border-b border-[#D98AA7]/30 pb-2 pl-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#E56B8C]" />
                    <span className="font-handwritten text-lg font-bold text-[#42232D] sm:text-xl">
                      A letter for you ♡
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseDiary}
                    aria-label="Close storybook"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8F304C]/75 hover:text-[#E56B8C] transition-colors cursor-pointer mr-6"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Back to Cover</span>
                  </button>
                </header>

                {/* ========================================================
                    3D PHYSICAL PAGE TURN ANIMATION STACK
                    ======================================================== */}
                <div className="relative z-10 flex-1 my-2 flex flex-col justify-start overflow-hidden pl-4 pr-1">
                  {/* Underneath Base Page (Always visible, fits without scrolling) */}
                  <div
                    data-testid="storybook-page-content"
                    className="min-h-[330px] sm:min-h-[365px] w-full flex flex-col justify-between overflow-hidden"
                  >
                    <div className="overflow-hidden">
                      {renderHandwrittenText(activePageText, isFinalPage)}
                    </div>

                    {/* Final Ending Flourish Stamp on Page 20 */}
                    {isFinalPage && (
                      <div className="mt-1 flex flex-col items-center justify-center select-none">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#A83254] to-[#8F304C] text-[#FFF9F2] shadow-xs">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                        <span className="mt-0.5 font-handwritten text-xs font-bold text-[#8F304C]">
                          Forever with all my love ♡
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3D Turning Paper Leaf during active page turn */}
                  {isTurning && turnDirection && (
                    <motion.div
                      aria-hidden="true"
                      style={{
                        transformOrigin: 'left center',
                        transformStyle: 'preserve-3d',
                      }}
                      initial={
                        turnDirection === 'next'
                          ? { rotateY: 0 }
                          : { rotateY: -160 }
                      }
                      animate={
                        turnDirection === 'next'
                          ? { rotateY: -160 }
                          : { rotateY: 0 }
                      }
                      transition={{
                        duration: prefersReducedMotion ? 0.05 : 0.52,
                        ease: [0.35, 0.05, 0.25, 1],
                      }}
                      className="pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-r-[2rem] bg-[#FFFDF9] shadow-2xl pl-4 pr-1"
                    >
                      {/* Dynamic Paper Turn Shadow Overlay */}
                      <div className="storybook-turn-shadow absolute inset-0 pointer-events-none" />

                      {/* Content on the turning paper */}
                      <div className="min-h-[330px] sm:min-h-[365px] w-full flex flex-col justify-between overflow-hidden pt-0.5">
                        <div className="overflow-hidden opacity-90">
                          {renderHandwrittenText(
                            pages[turningFromPage] || '',
                            turningFromPage === totalPages - 1
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer: Cute Scrapbook Navigation & Explicit Page X / 20 Counter */}
                <footer className="relative z-20 flex items-center justify-between border-t border-[#D98AA7]/30 pt-2 pl-3">
                  {/* Previous Button */}
                  <button
                    type="button"
                    data-testid="storybook-prev-page"
                    onClick={handlePrevPage}
                    disabled={safePageIndex <= 0 || isTurning}
                    aria-label="Previous book page"
                    className={`inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      safePageIndex > 0 && !isTurning
                        ? 'border border-[#F8DCE5] bg-[#FFFFFF] text-[#8F304C] shadow-2xs hover:bg-[#FFF0F5]'
                        : 'border border-transparent bg-transparent text-[#42232D]/30 cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  {/* Mandatory Page Indicator: Page X / 20 */}
                  <div
                    data-testid="letter-page-indicator"
                    className="flex items-center gap-1 font-display text-xs font-semibold italic text-[#8F304C]"
                  >
                    <span className="text-[#E56B8C]">♡</span>
                    <span>
                      Page {safePageIndex + 1} / {totalPages}
                    </span>
                    <span className="text-[#E56B8C]">♡</span>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    data-testid="storybook-next-page"
                    onClick={handleNextPage}
                    disabled={safePageIndex >= totalPages - 1 || isTurning}
                    aria-label="Next book page"
                    className={`inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      safePageIndex < totalPages - 1 && !isTurning
                        ? 'border border-[#F8DCE5] bg-[#FFFFFF] text-[#8F304C] shadow-2xs hover:bg-[#FFF0F5]'
                        : 'border border-transparent bg-transparent text-[#42232D]/30 cursor-not-allowed'
                    }`}
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </footer>
              </div>
            </div>

            {/* Final CTA Button on Page 20 to Navigate to Birthday Cake */}
            {isFinalPage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-3.5 text-center"
              >
                <button
                  type="button"
                  data-testid="storybook-continue-btn"
                  onClick={onNext}
                  className="group relative inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-8 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-md transition-all hover:scale-103 active:scale-97 cursor-pointer"
                >
                  <span>Continue to Birthday Cake ♡</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Sequential Scene Controls Below Storybook */}
      <div className="relative z-20 mt-4 flex items-center justify-center gap-3">
        {onBack && (
          <button
            type="button"
            data-testid="letter-back-scene-btn"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 px-4 py-1.5 text-xs font-semibold text-[#8F304C] shadow-2xs transition-colors hover:bg-[#FFF0F5] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Our Memories</span>
          </button>
        )}

        {(!isFinalPage || diaryState !== 'open') && (
          <button
            type="button"
            data-testid="letter-continue-scene-btn"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E56B8C]/40 bg-[#FFF0F5]/95 px-4 py-1.5 text-xs font-semibold text-[#8F304C] shadow-2xs transition-colors hover:bg-[#E56B8C] hover:text-[#FFFFFF] cursor-pointer"
          >
            <span>Continue to Birthday Cake ♡</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
