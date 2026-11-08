import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ambientMusic } from '../utils/ambientMusic';

interface SceneWelcomeGateProps {
  onEnter: () => void;
}

export const SceneWelcomeGate: React.FC<SceneWelcomeGateProps> = ({ onEnter }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (password.trim() === '0903') {
      setError(null);
      setIsSubmitting(true);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('birthday_unlocked', '1');
        } catch {
          // ignore
        }
      }
      // Start background music (A Thousand Years) inside the direct user submit gesture
      ambientMusic.initAndPlay();
      onEnter();
    } else {
      setError('Incorrect password. Try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <section
      aria-label="Password Entry"
      data-testid="welcome-gate"
      className="relative flex min-h-[90dvh] w-full flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#FDFBF9] via-[#FAF4F6] to-[#F7EDF1] px-4 py-8 select-none sm:px-6"
    >
      <div className="relative w-full max-w-sm">
        {/* Subtle Ambient Glowing Reveal Effect */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#F8DCE5]/70 via-[#F7D8E2]/50 to-[#FFEFE8]/60 blur-xl opacity-80"
        />

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl border border-[#F0DCE3] bg-white/95 p-7 shadow-sm backdrop-blur-xs sm:p-8"
        >
          <h1
            data-testid="password-heading"
            className="text-center font-sans text-xl font-medium tracking-tight text-[#2D2A26] sm:text-2xl"
          >
            Enter Password to Reveal Something Special ✨
          </h1>

          <form
            onSubmit={handleSubmit}
            className={`mt-6 flex flex-col gap-4 ${isShaking ? 'animate-shake' : ''}`}
          >
            <div className="relative w-full">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                autoFocus
                data-testid="password-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-xl border border-[#DCD5CB] bg-[#FCFBF9] px-4 py-3 text-center font-mono text-base tracking-widest text-[#2D2A26] transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-[#A8A199] focus:border-[#4A453E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4A453E]"
                aria-label="Enter Password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p
                role="alert"
                data-testid="password-error"
                className="text-center text-xs font-medium text-[#C83E62]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              data-testid="unlock-button"
              disabled={isSubmitting}
              className="mt-1 flex w-full min-h-[46px] items-center justify-center rounded-xl bg-[#2D2A26] px-5 py-3 text-sm font-medium text-[#FAF8F5] shadow-xs transition-all hover:bg-[#1A1816] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              Reveal
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
