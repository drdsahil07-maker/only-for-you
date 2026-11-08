import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Calendar,
  Heart,
  Sparkles,
  Utensils,
  Wind,
  RotateCcw,
  ArrowLeft,
  Disc,
} from 'lucide-react';
import { UNIVERSE_CONFIG } from '../config/universeData';
import { ambientMusic } from '../utils/ambientMusic';

const CELEBRATION_PETALS = [
  { id: 'cp1', left: '8%', top: '-20px', size: 16, duration: '9.5s', delay: '0.1s', drift: '28px', rot: '260deg' },
  { id: 'cp2', left: '22%', top: '-26px', size: 20, duration: '11.2s', delay: '1.4s', drift: '-34px', rot: '320deg' },
  { id: 'cp3', left: '38%', top: '-18px', size: 15, duration: '8.8s', delay: '0.7s', drift: '24px', rot: '220deg' },
  { id: 'cp4', left: '54%', top: '-28px', size: 22, duration: '12.4s', delay: '2.1s', drift: '-38px', rot: '300deg' },
  { id: 'cp5', left: '70%', top: '-22px', size: 17, duration: '10.1s', delay: '0.4s', drift: '30px', rot: '275deg' },
  { id: 'cp6', left: '86%', top: '-24px', size: 19, duration: '11.5s', delay: '1.8s', drift: '-26px', rot: '340deg' },
];

const CELEBRATION_HEARTS = [
  { id: 'ch1', left: '12%', bottom: '-30px', size: 15, color: '#E56B8C', duration: '7.2s', delay: '0.2s', drift: '22px', rot: '16deg', opacity: 0.75 },
  { id: 'ch2', left: '28%', bottom: '-40px', size: 19, color: '#F3B8C9', duration: '8.6s', delay: '1.1s', drift: '-24px', rot: '-18deg', opacity: 0.7 },
  { id: 'ch3', left: '46%', bottom: '-35px', size: 14, color: '#D985A4', duration: '6.8s', delay: '0.5s', drift: '26px', rot: '22deg', opacity: 0.8 },
  { id: 'ch4', left: '66%', bottom: '-45px', size: 18, color: '#8F304C', duration: '8.1s', delay: '1.6s', drift: '-18px', rot: '-15deg', opacity: 0.6 },
  { id: 'ch5', left: '82%', bottom: '-35px', size: 16, color: '#E56B8C', duration: '7.5s', delay: '0.8s', drift: '24px', rot: '20deg', opacity: 0.75 },
];

const RibbonBow: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 32" fill="none" className={className} aria-hidden="true">
    <path
      d="M20 16 C14 8 4 6 6 15 C8 22 17 18 20 16 Z"
      fill="#F9C6D5"
      stroke="#D985A4"
      strokeWidth="1.5"
    />
    <path
      d="M20 16 C26 8 36 6 34 15 C32 22 23 18 20 16 Z"
      fill="#F9C6D5"
      stroke="#D985A4"
      strokeWidth="1.5"
    />
    <circle cx="20" cy="16" r="3.5" fill="#E56B8C" stroke="#D985A4" strokeWidth="1" />
    <path
      d="M18 18 C15 24 12 28 8 30 M22 18 C25 24 28 28 32 30"
      stroke="#E56B8C"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LittleFlower: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="7" r="4" fill="#F8DCE5" />
    <circle cx="17" cy="11" r="4" fill="#F8DCE5" />
    <circle cx="15" cy="17" r="4" fill="#F8DCE5" />
    <circle cx="9" cy="17" r="4" fill="#F8DCE5" />
    <circle cx="7" cy="11" r="4" fill="#F8DCE5" />
    <circle cx="12" cy="12" r="2.8" fill="#FFAA5A" />
  </svg>
);

type CelebrationPhase =
  | 'lit'
  | 'requesting-mic'
  | 'listening-for-blow'
  | 'extinguished'
  | 'cutting-cake'
  | 'wish-revealed';

interface Scene6BirthdayInvitationProps {
  onNext?: () => void;
  onBack?: () => void;
  onReturnHome?: () => void;
}

export const Scene6BirthdayInvitation: React.FC<Scene6BirthdayInvitationProps> = ({
  onNext,
  onBack,
  onReturnHome,
}) => {
  const [phase, setPhase] = useState<CelebrationPhase>('lit');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isKnifeCutting, setIsKnifeCutting] = useState(false);
  const [isSliceSeparated, setIsSliceSeparated] = useState(false);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  // Audio Context and Stream References
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const blowCounterRef = useRef<number>(0);
  const baselineRef = useRef<number>(20);
  const calibrationSamplesRef = useRef<number[]>([]);
  const isExtinguishedRef = useRef<boolean>(false);

  // Clean up all microphone streams and audio contexts
  const stopMicrophone = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    blowCounterRef.current = 0;
    setAudioLevel(0);
    setIsCalibrating(false);
  }, []);

  // Ensure microphone is freed on unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, [stopMicrophone]);

  // Trigger candle extinguishing sequence
  const handleExtinguish = useCallback(() => {
    if (isExtinguishedRef.current) return;
    isExtinguishedRef.current = true;
    stopMicrophone();
    setPhase('extinguished');
  }, [stopMicrophone]);

  // Start microphone listening for breath detection
  const handleStartMicListening = async () => {
    setMicError(null);
    setIsCalibrating(true);
    calibrationSamplesRef.current = [];
    blowCounterRef.current = 0;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Microphone detection is not supported in this browser. You can tap below to blow out your candles!');
      setIsCalibrating(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setPhase('listening-for-blow');

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let framesCount = 0;

      const checkBlow = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Breath / blow produces dominant turbulent air energy in low-frequency bands (bins 2 to 24, ~80Hz to 1kHz)
        let lowBandSum = 0;
        const lowBandMax = Math.min(24, dataArray.length);
        for (let i = 2; i < lowBandMax; i++) {
          lowBandSum += dataArray[i];
        }
        const currentEnergy = lowBandSum / (lowBandMax - 2);

        // 1. Calibration phase (first ~35 frames, approx 500ms): measure ambient room baseline
        if (framesCount < 35) {
          calibrationSamplesRef.current.push(currentEnergy);
          framesCount += 1;
          if (framesCount === 35) {
            const sum = calibrationSamplesRef.current.reduce((a, b) => a + b, 0);
            baselineRef.current = Math.max(15, sum / calibrationSamplesRef.current.length);
            setIsCalibrating(false);
          }
          animationFrameRef.current = requestAnimationFrame(checkBlow);
          return;
        }

        // 2. Calibrated blow detection
        const baseline = baselineRef.current;
        const delta = Math.max(0, currentEnergy - baseline);
        // Normalized 0 to 1 for live UI breath feedback
        const normalized = Math.min(1, delta / 65);
        setAudioLevel(normalized);

        // Sustained blow requires increased energy significantly above ambient baseline
        if (delta > 32 && currentEnergy > 55) {
          blowCounterRef.current += 1;
          // Must sustain blow across consecutive frames to prevent single coughs or claps
          if (blowCounterRef.current >= 6) {
            handleExtinguish();
            return;
          }
        } else {
          blowCounterRef.current = Math.max(0, blowCounterRef.current - 1);
        }

        animationFrameRef.current = requestAnimationFrame(checkBlow);
      };

      animationFrameRef.current = requestAnimationFrame(checkBlow);
    } catch {
      setMicError('Microphone permission was not granted. No worries, you can tap to blow out the candles!');
      setIsCalibrating(false);
      stopMicrophone();
    }
  };

  const handleCancelMic = () => {
    stopMicrophone();
    setPhase('lit');
    setMicError(null);
  };

  // Start realistic cake cutting sequence
  const handleCutCake = () => {
    if (phase !== 'extinguished') return;
    setPhase('cutting-cake');
    setIsKnifeCutting(true);

    // Cake-cutting begins -> immediately trigger designated 'cake' track (Perfect by Ed Sheeran)
    // If available, pauses previous background track and plays Perfect; otherwise gracefully maintains ambient music
    ambientMusic.triggerCakeCut();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cutDuration = prefersReducedMotion ? 100 : 1100;
    const revealDelay = prefersReducedMotion ? 200 : 1400;

    // Knife presses down, slice separates outward, and celebratory particles burst
    setTimeout(() => {
      setIsKnifeCutting(false);
      setIsSliceSeparated(true);
      setShowConfetti(true);

      setTimeout(() => {
        setPhase('wish-revealed');
        setIsEnvelopeOpen(true);
      }, revealDelay);

      setTimeout(() => {
        setShowConfetti(false);
      }, 4200);
    }, cutDuration);
  };

  // Reset celebration to re-live the moment
  const handleResetCelebration = () => {
    ambientMusic.setSuppressed(false);
    ambientMusic.resetCakeCut();
    stopMicrophone();
    isExtinguishedRef.current = false;
    setIsSliceSeparated(false);
    setIsKnifeCutting(false);
    setIsEnvelopeOpen(false);
    setShowConfetti(false);
    setMicError(null);
    setPhase('lit');
  };

  const isCandleLit =
    phase === 'lit' || phase === 'requesting-mic' || phase === 'listening-for-blow';
  const config = UNIVERSE_CONFIG.scene6Invitation;

  return (
    <section
      aria-label="Birthday Cake Celebration"
      data-testid="scene-6-birthday-invitation"
      className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-between px-4 pt-3 pb-10 text-center sm:px-6"
    >
      {/* ========================================================
          CELEBRATORY HEARTS & SPARKLES ON CAKE CUT
         ======================================================== */}
      {showConfetti && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0.3,
                opacity: 1,
              }}
              animate={{
                x: `${10 + (i * 3.1) % 80}vw`,
                y: `${10 + (i * 3.4) % 80}vh`,
                scale: [0.5, 1.2, 0.75],
                rotate: [0, (i % 2 === 0 ? 1 : -1) * 360],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2.4 + (i % 4) * 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute"
            >
              {i % 3 === 0 ? (
                <Heart className="h-5 w-5 fill-[#E56B8C] text-[#E56B8C]" />
              ) : i % 3 === 1 ? (
                <Sparkles className="h-4 w-4 text-[#FFAA5A]" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-[#F3B8C9]" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ========================================================
          HEADER: "A Little Birthday Magic ♡" & "Make a wish, baby…"
         ======================================================== */}
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-handwritten text-4xl font-bold text-[#42232D] sm:text-5xl">
          {config.heading || 'A Little Birthday Magic ♡'}
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-[#8F304C]/85 font-medium">
          {config.invitation || 'Make a wish, baby…'}
        </p>

        {/* Date Tag: November 9, 2026 */}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 px-3.5 py-0.5 text-xs font-semibold text-[#8F304C] shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-[#E56B8C]" />
          <span>{config.dateBadge || 'November 9, 2026'}</span>
        </div>
      </div>

      {/* ========================================================
          CENTERPIECE: LAYERED BIRTHDAY CAKE WITH CANDLES & CUT SLICE
         ======================================================== */}
      <div className="relative my-auto flex w-full flex-col items-center py-2">
        <div className="relative flex h-64 w-full max-w-[320px] items-center justify-center sm:h-72">
          {/* Ambient Candlelight Warm Halo */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 rounded-full transition-opacity duration-1000 ${
              isCandleLit
                ? 'bg-gradient-to-tr from-[#F8DCE5] via-[#FFE1D3] to-[#FFF6EC] opacity-90 blur-2xl'
                : 'bg-gradient-to-tr from-[#F8DCE5] via-[#FFF6EC] to-[#FCEAEF] opacity-35 blur-xl'
            }`}
          />

          {/* Layered Birthday Cake SVG */}
          <svg
            viewBox="0 0 280 240"
            className="relative h-full w-full drop-shadow-md select-none"
            role="img"
            aria-label="Layered birthday cake with candles"
          >
            <defs>
              <linearGradient id="cakeStandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="100%" stopColor="#F8DCE5" />
              </linearGradient>
              <linearGradient id="knifeBlade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
            </defs>

            {/* Cake Stand Pedestal */}
            <ellipse
              cx="140"
              cy="216"
              rx="98"
              ry="12"
              fill="url(#cakeStandGrad)"
              stroke="#7C4352"
              strokeWidth="1.5"
            />
            <path
              d="M125 216 L130 228 L150 228 L155 216 Z"
              fill="#E56B8C"
              stroke="#7C4352"
              strokeWidth="1.2"
            />
            <ellipse
              cx="140"
              cy="228"
              rx="44"
              ry="6"
              fill="#F3B8C9"
              stroke="#7C4352"
              strokeWidth="1.2"
            />

            {/* Bottom Cake Tier (Strawberry-Rose Sponge with Cream Swirls) */}
            <rect
              x="55"
              y="142"
              width="170"
              height="64"
              rx="14"
              fill="#F9C6D5"
              stroke="#7C4352"
              strokeWidth="2"
            />
            {/* Sponge Layer Strip in Middle */}
            <rect x="56" y="172" width="168" height="6" fill="#F0B5C6" />
            <path
              d="M55 198 Q72 210 89 198 T123 198 T157 198 T191 198 T225 198"
              fill="none"
              stroke="#E56B8C"
              strokeWidth="3.5"
            />
            {/* Cream Piping Swirls */}
            <path
              d="M55 156 Q72 168 89 156 T123 156 T157 156 T191 156 T225 156"
              fill="none"
              stroke="#FFF9F2"
              strokeWidth="3"
            />

            {/* Exposed Sponge Interior when slice is separated */}
            {isSliceSeparated && (
              <g>
                <path
                  d="M172 142 L198 174 L172 206 Z"
                  fill="#FFF4EA"
                  stroke="#7C4352"
                  strokeWidth="1.2"
                />
                <line x1="172" y1="172" x2="198" y2="174" stroke="#E56B8C" strokeWidth="2.5" />
                <line x1="172" y1="188" x2="185" y2="190" stroke="#F0B5C6" strokeWidth="2" />
              </g>
            )}

            {/* Top Cake Tier (Vanilla Cream Frosting) */}
            <rect
              x="78"
              y="96"
              width="124"
              height="50"
              rx="12"
              fill="#FFFDF9"
              stroke="#7C4352"
              strokeWidth="2"
            />
            <rect x="79" y="120" width="122" height="4" fill="#FCEAEF" />
            {/* Top Tier Scalloped Edge */}
            <path
              d="M78 138 Q94 148 109 138 T140 138 T171 138 T202 138"
              fill="none"
              stroke="#F3B8C9"
              strokeWidth="3"
            />

            {/* Cake Inscription */}
            <text
              x="140"
              y="118"
              textAnchor="middle"
              className="font-handwritten text-[13px] font-bold"
              fill="#42232D"
            >
              Happy Birthday
            </text>
            <text
              x="140"
              y="132"
              textAnchor="middle"
              className="font-handwritten text-[13px] font-bold"
              fill="#E56B8C"
            >
              My Love ♡
            </text>

            {/* 6 Birthday Candles */}
            {[98, 114, 131, 149, 166, 182].map((cx, i) => (
              <g key={cx}>
                {/* Candle body with soft stripes */}
                <rect
                  x={cx - 3.5}
                  y="62"
                  width="7"
                  height="34"
                  rx="2"
                  fill={i % 2 === 0 ? '#FFE1D3' : '#F8DCE5'}
                  stroke="#7C4352"
                  strokeWidth="1.2"
                />
                <line
                  x1={cx - 3}
                  y1="72"
                  x2={cx + 3}
                  y2="76"
                  stroke="#E56B8C"
                  strokeWidth="1"
                />
                <line
                  x1={cx - 3}
                  y1="82"
                  x2={cx + 3}
                  y2="86"
                  stroke="#E56B8C"
                  strokeWidth="1"
                />
                {/* Wick */}
                <line x1={cx} y1="56" x2={cx} y2="62" stroke="#42232D" strokeWidth="1.4" />

                {/* Candle Flame (Visible when lit, flickers gently) */}
                {isCandleLit ? (
                  <g
                    className="animate-candle-flame"
                    style={{ animationDelay: `${(i * 0.18) % 1.2}s` }}
                  >
                    <ellipse cx={cx} cy="49" rx="4" ry="7" fill="#FFAA5A" />
                    <ellipse cx={cx} cy="50" rx="2.2" ry="4.5" fill="#FFFDF9" />
                  </g>
                ) : (
                  /* Rising Wisps of Smoke when Extinguished */
                  <g
                    className="animate-smoke-wisp"
                    style={{ '--sx': `${(i - 2.5) * 3}px` } as React.CSSProperties}
                  >
                    <path
                      d={`M${cx} 55 Q${cx + 3} 46 ${cx - 2} 38 T${cx + 2} 26`}
                      stroke="rgba(143, 48, 76, 0.45)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            ))}

            {/* Knife Cutting Animation Motion */}
            {isKnifeCutting && (
              <g
                className="transition-transform duration-700 ease-in-out"
                transform="translate(0, 10)"
              >
                {/* Cake Knife Blade pressing down */}
                <path
                  d="M174 70 L195 190 L181 190 L166 70 Z"
                  fill="url(#knifeBlade)"
                  stroke="#42232D"
                  strokeWidth="1.5"
                />
                <line x1="180" y1="70" x2="180" y2="190" stroke="#CBD5E1" strokeWidth="1" />
                {/* Knife Rose Handle */}
                <rect x="162" y="48" width="12" height="24" rx="3" fill="#8F304C" stroke="#42232D" strokeWidth="1" />
                <circle cx="168" cy="54" r="2" fill="#FFAA5A" />
              </g>
            )}

            {/* Cut Line indicator */}
            {(isSliceSeparated || isKnifeCutting) && !isSliceSeparated && (
              <path
                d="M140 142 L185 178 L140 206"
                stroke="#8F304C"
                strokeWidth="2"
                strokeDasharray="3 2"
                fill="none"
              />
            )}

            {/* Separated Triangular Cake Slice on its own Plate */}
            {isSliceSeparated && (
              <g
                className="transition-transform duration-1000 ease-out"
                transform="translate(42, 12)"
              >
                {/* Small Dessert Plate */}
                <ellipse
                  cx="200"
                  cy="198"
                  rx="34"
                  ry="9"
                  fill="#FFFDF9"
                  stroke="#E56B8C"
                  strokeWidth="1.2"
                />
                {/* Triangular Cut Slice */}
                <path
                  d="M185 152 L215 176 L185 196 Z"
                  fill="#F9C6D5"
                  stroke="#7C4352"
                  strokeWidth="1.5"
                />
                {/* Cream frosting top & layer */}
                <path d="M185 152 L215 176" stroke="#FFFDF9" strokeWidth="3.5" />
                <path d="M185 174 L205 188" stroke="#FCEAEF" strokeWidth="2.5" />
                {/* Little strawberry heart on top of slice */}
                <circle cx="198" cy="164" r="3.5" fill="#E56B8C" />
              </g>
            )}
          </svg>
        </div>

        {/* Status Prompt Under Cake */}
        <div className="relative mt-2 max-w-xs">
          <div className="rounded-2xl border border-[#D985A4]/35 bg-gradient-to-b from-[#FFFDF9] to-[#FCEFE9] px-4 py-2 text-center shadow-2xs">
            <p className="font-handwritten text-lg font-bold text-[#42232D]">
              {phase === 'lit' || phase === 'requesting-mic' || phase === 'listening-for-blow'
                ? 'Blow gently into your microphone to make a wish ♡'
                : phase === 'extinguished'
                ? 'Candles extinguished! ♡ Now cut your cake'
                : phase === 'cutting-cake'
                ? 'Cutting the sweetest slice for you…'
                : 'A sweet slice just for you ♡'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          INTERACTION CONTROLS BY CELEBRATION PHASE
         ======================================================== */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3 pt-2">
        {/* PHASE 1: CANDLES LIT -> PROMPT TO BLOW */}
        {phase === 'lit' && (
          <div className="flex flex-col w-full items-center gap-2.5">
            <button
              type="button"
              data-testid="blow-candles-mic-btn"
              onClick={() => setPhase('requesting-mic')}
              className="group relative flex w-full min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-6 py-3.5 text-sm font-semibold text-[#FFFFFF] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Wind className="h-4 w-4" />
              <span>Blow Out the Candles</span>
            </button>

            {/* Direct Tap Alternative */}
            <button
              type="button"
              data-testid="blow-candles-tap-btn"
              onClick={handleExtinguish}
              className="text-xs text-[#8F304C]/80 hover:text-[#E56B8C] transition-colors cursor-pointer underline underline-offset-2"
            >
              Or tap here to blow out candles
            </button>
          </div>
        )}

        {/* PHASE 2: PERMISSION EXPLANATION CARD */}
        {phase === 'requesting-mic' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full rounded-3xl border border-[#F8DCE5] bg-[#FFFFFF]/95 p-4 shadow-lg text-center"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F5] text-[#E56B8C]">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="mt-2 font-handwritten text-2xl font-bold text-[#42232D]">
              Blow to Extinguish ♡
            </h3>
            <p className="mt-1 text-xs text-[#8F304C]/80 leading-relaxed">
              We use your device microphone to detect your real breath blowing the candles out. Sound is measured locally in real time and is never recorded or stored.
            </p>

            {micError && (
              <p className="mt-2 text-[11px] font-medium text-[#C83E62]">
                {micError}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartMicListening}
                className="w-full rounded-full bg-gradient-to-r from-[#E56B8C] to-[#C83E62] py-2.5 text-xs font-semibold text-[#FFFFFF] shadow-xs cursor-pointer hover:brightness-105 active:scale-[0.98]"
              >
                Enable Microphone & Blow
              </button>

              <button
                type="button"
                onClick={handleExtinguish}
                className="w-full rounded-full border border-[#F8DCE5] bg-[#FFFDF9] py-2 text-xs font-medium text-[#8F304C] hover:bg-[#FFF0F5] cursor-pointer"
              >
                Tap to Blow Out Candles Instead
              </button>

              <button
                type="button"
                onClick={handleCancelMic}
                className="text-[11px] text-[#8F304C]/60 hover:text-[#8F304C] pt-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: LIVE BLOW DETECTION FEEDBACK */}
        {phase === 'listening-for-blow' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full rounded-3xl border border-[#F8DCE5] bg-[#FFFFFF]/95 p-4 shadow-lg text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[#E56B8C]">
              <Wind className="h-5 w-5 animate-pulse" />
              <span className="font-handwritten text-2xl font-bold text-[#42232D]">
                {isCalibrating ? 'Calibrating microphone…' : 'Blow gently now! ♡'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8F304C]/80">
              {isCalibrating
                ? 'Measuring background noise for clean breath detection…'
                : 'Blow softly right into your microphone to extinguish the candles'}
            </p>

            {/* Live Breath Volume Level Bar */}
            <div className="mt-3.5 flex items-center gap-2">
              <Mic className="h-4 w-4 text-[#8F304C]/60 shrink-0" />
              <div className="h-3 w-full rounded-full bg-[#FCEAEF] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E56B8C] to-[#C83E62] transition-all duration-75"
                  style={{ width: `${Math.round(audioLevel * 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleExtinguish}
                className="text-xs text-[#E56B8C] font-semibold hover:underline cursor-pointer"
              >
                Tap to Blow Out Candles
              </button>
              <button
                type="button"
                onClick={handleCancelMic}
                className="text-xs text-[#8F304C]/60 hover:text-[#8F304C] cursor-pointer"
              >
                Stop
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 4: CANDLES EXTINGUISHED -> CUT CAKE BUTTON */}
        {phase === 'extinguished' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col w-full items-center gap-2"
          >
            <button
              type="button"
              data-testid="cut-cake-btn"
              onClick={handleCutCake}
              className="group relative flex w-full min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#E56B8C] via-[#DC5679] to-[#C83E62] px-8 py-3.5 text-base font-semibold text-[#FFFFFF] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Utensils className="h-5 w-5" />
              <span>Cut the Cake ♡</span>
            </button>
          </motion.div>
        )}

        {/* PHASE 5: CUTTING IN PROGRESS */}
        {phase === 'cutting-cake' && (
          <div className="flex items-center gap-2 text-sm font-semibold text-[#E56B8C]">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Slicing your birthday cake…</span>
          </div>
        )}
      </div>

      {/* ========================================================
          PHASE 6: FINAL BIRTHDAY WISH REVEAL (Romantic Scrapbook Letter Card)
          Appears immediately after cake cutting completes in the SAME scene.
         ======================================================== */}
      <AnimatePresence>
        {phase === 'wish-revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-4 w-full max-w-lg overflow-hidden rounded-3xl border border-[#E5B5C5]/70 bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F6] to-[#FFF4F7] p-4.5 sm:p-7 shadow-2xl text-center"
          >
            {/* Top Scrapbook Washi Tape */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 left-1/2 z-20 h-5 w-28 -translate-x-1/2 -rotate-1 rounded-xs bg-[#F8DCE5]/90 border-t border-b border-[#FFFFFF]/80 shadow-2xs"
            />

            {/* Falling Celebration Petals & Floating Hearts in Wish Reveal */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
            >
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
                  className="animate-drift-petal-particle absolute opacity-70"
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
            </div>

            {/* Scrapbook Envelope Top Flap Header */}
            <div className="relative z-10 mb-2.5 flex items-center justify-between border-b border-[#E5B5C5]/40 pb-2">
              <div className="flex items-center gap-1">
                <LittleFlower className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B76E79]">
                  Birthday Letter
                </span>
              </div>
              <RibbonBow className="h-5 w-7 text-[#E56B8C]" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B76E79]">
                  Meri Baby ♡
                </span>
                <LittleFlower className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Celebration Badge */}
            <div className="relative z-10 mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#E56B8C]/35 bg-[#FFF0F5] px-3.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#8F304C] shadow-2xs">
              <Sparkles className="h-3 w-3 text-[#FFAA5A]" />
              <span>A SPECIAL LETTER FOR YOU • 20TH BIRTHDAY</span>
              <Sparkles className="h-3 w-3 text-[#FFAA5A]" />
            </div>

            {/* Complete Personalized Birthday Wish Heading */}
            <h2
              data-testid="birthday-reveal-heading"
              className="relative z-10 mt-2.5 font-handwritten text-3xl font-bold leading-snug text-[#42232D] sm:text-4xl"
            >
              Happy Birthday, Meri Baby! 🎂❤️
            </h2>

            <div className="relative z-10 mt-1.5 flex items-center justify-center gap-2 text-[#E56B8C]">
              <span className="h-px w-10 bg-[#D985A4]/50" />
              <Heart className="h-3.5 w-3.5 fill-current text-[#E56B8C] animate-gentle-pulse" />
              <span className="h-px w-10 bg-[#D985A4]/50" />
            </div>

            {/* Keepsake Couple Photo Polaroid */}
            <div className="relative z-10 mt-3 flex justify-center">
              <div className="relative mx-auto w-36 overflow-hidden rounded-2xl border border-[#D985A4]/45 bg-[#FFFDF9] p-1.5 shadow-md -rotate-1 sm:w-40">
                <img
                  src={UNIVERSE_CONFIG.sceneMemoryAlbum.polaroids[0]?.imageUrl || '/memory-01.jpg.png'}
                  alt="Birthday Keepsake"
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
            </div>

            {/* Exact Personalized Birthday Wish Letter Text */}
            <div className="relative z-10 mt-4 rounded-2xl border border-dashed border-[#E5B5C5]/60 bg-[#FFFFFF]/90 p-3.5 sm:p-5 shadow-xs">
              <div className="space-y-3.5 text-left font-serif text-[13.5px] leading-relaxed text-[#42232D]/95 sm:text-[14.5px] sm:leading-relaxed">
                <p className="font-semibold text-[#8F304C] text-center font-handwritten text-lg sm:text-xl">
                  Meri pyaari baby, aapko janamdin ki bahut bahut badhai! 🥹🎀
                </p>

                <p>
                  I wish you a life full of happiness, love, success and countless blessings. Bhagwan aapki har wish poori karein, aapko hamesha khush rakhein aur aapki smile kabhi kam na hone dein. 🧿❤️
                </p>

                <p>
                  Aur meri ek chhoti si wish hai… Aapki life mein jitni bhi pareshaniyan aayein, Bhagwan please un sabko meri life mein de dena, lekin meri baby ko hamesha khush rakhna. Aap pehle hi bahut kuch face kar chuki hain.
                </p>

                <div className="rounded-xl border border-[#E5B5C5]/40 bg-[#FFF5F8]/70 p-3 sm:p-3.5 space-y-2.5">
                  <p className="italic text-[#8F304C] font-medium">
                    Baby, mujhe aapse ek baat dil se kehni hai. Kabhi kabhi mujhe lagta hai ki main aapki life ka sabse bada villain ban gaya hoon. Maine kai baar aapko hurt kiya hai aur iska mujhe sach mein bahut regret hota hai.
                  </p>

                  <p>
                    Us din bhi mujhe apne aap par bahut gussa aa raha hai. Aapne apne papa se kiya hua promise todkar mujhse baat ki, aur main apne emotions control nahi kar paaya. Main apni problems batane laga, jabki aap khud fever mein thi aur aapko rest ki zarurat thi.
                  </p>

                  <p>
                    Mujhe us waqt aapka khayal rakhna chahiye tha, aapko samajhna chahiye tha, lekin main aisa nahi kar paaya.
                  </p>

                  <p className="font-semibold text-[#C83E62]">
                    I am really sorry, baby. Please mujhe maaf kar dijiye. 🥺❤️
                  </p>
                </div>

                <p>
                  Main ye nahi chahta ki meri wajah se aap kabhi apni khushi, sukoon ya apna health compromise karein. Main chahta hoon ki aap hamesha khush rahein, apna khayal rakhein aur bina kisi tension ke muskurayein.
                </p>

                <p>
                  Aap mere liye bahut special hain, meri cutieee. Aapki khushi mere liye bahut मायने rakhti hai.
                </p>

                <p className="font-bold text-[#8F304C] text-center font-handwritten text-lg sm:text-xl pt-1">
                  Once again, Happy Birthday, meri wifeyyy, meri betuuu, my sweetheart! 🎂💗
                </p>

                <p className="font-semibold text-[#42232D] text-center pt-0.5">
                  I love you so much. May God always protect your beautiful smile. 🫂❤️
                </p>
              </div>
            </div>

            {/* Music Indicator: Perfect Playing Softly */}
            <div className="relative z-10 mt-3.5 inline-flex items-center gap-2 rounded-full border border-[#E56B8C]/40 bg-[#FFFFFF]/90 px-3.5 py-1 text-xs text-[#8F304C] shadow-2xs">
              <Disc className="h-3.5 w-3.5 animate-spin text-[#E56B8C]" style={{ animationDuration: '4s' }} />
              <span className="font-medium">Playing softly: Perfect — Ed Sheeran ♡</span>
            </div>

            {/* Reset / Relight action to let visitor replay the cake celebration */}
            <div className="relative z-10 mt-4 flex items-center justify-center pt-1">
              <button
                type="button"
                data-testid="relight-candles-btn"
                onClick={handleResetCelebration}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 px-4 py-2 text-xs font-semibold text-[#8F304C] shadow-2xs hover:bg-[#FFF0F5] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Light the candles again</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Back Navigation Control */}
      {onBack && (
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            data-testid="cake-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 px-4 py-1.5 text-xs font-semibold text-[#8F304C] shadow-2xs transition-colors hover:bg-[#FFF0F5] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Love Letter</span>
          </button>
        </div>
      )}
    </section>
  );
};
