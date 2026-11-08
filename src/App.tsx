/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { SceneId } from './config/universeData';
import { getNextScene, getPrevScene } from './utils/universeLogic';
import { ambientMusic } from './utils/ambientMusic';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { HeartProgressControl } from './components/HeartProgressControl';
import { SceneWelcomeGate } from './components/SceneWelcomeGate';
import { SceneMemoryAlbum } from './components/SceneMemoryAlbum';
import { Scene3LoveLetter } from './components/Scene3LoveLetter';
import { Scene6BirthdayInvitation } from './components/Scene6BirthdayInvitation';

export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('birthday_unlocked') === '1') {
          return true;
        }
      } catch {
        // Fallback for environments with disabled sessionStorage
      }
    }
    return false;
  });

  const [activeScene, setActiveScene] = useState<SceneId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const requestedScene = params.get('scene') as SceneId | null;
      const validScenes: SceneId[] = [
        'scene-memory-album',
        'scene-3-love-letter',
        'scene-6-birthday-invitation',
      ];
      if (requestedScene && validScenes.includes(requestedScene)) {
        return requestedScene;
      }
      if (requestedScene === 'scene-1-intro') {
        return 'scene-memory-album';
      }
    }
    return 'scene-memory-album';
  });

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState('A Thousand Years');
  const [audioError, setAudioError] = useState<string | null>(null);

  // If session was already unlocked (e.g. page refresh in Preview), mark controller unlocked
  useEffect(() => {
    if (hasEntered) {
      ambientMusic.markUnlockedFromSession();
    }
  }, [hasEntered]);

  // Keep URL in sync with activeScene for error-free page refreshes
  useEffect(() => {
    if (typeof window !== 'undefined' && hasEntered) {
      const url = new URL(window.location.href);
      url.searchParams.set('scene', activeScene);
      url.searchParams.set('enter', '1');
      window.history.replaceState(null, '', url.toString());
    }
  }, [activeScene, hasEntered]);

  // Synchronize background music track to destination scene without unnecessary restarts
  useEffect(() => {
    if (hasEntered) {
      ambientMusic.markUnlockedFromSession();
      void ambientMusic.syncScene(activeScene);
    }
  }, [activeScene, hasEntered]);

  // Subscribe to real audio state and poll as backup for time-based updates
  useEffect(() => {
    const syncFromState = () => {
      const state = ambientMusic.getState();
      setIsAudioPlaying(state.isPlaying);
      setIsAudioMuted(state.isMuted);
      setCurrentTrackTitle(state.currentTrackTitle);
      setAudioError(state.lastError);
    };

    const unsubscribe = ambientMusic.subscribe((state) => {
      setIsAudioPlaying(state.isPlaying);
      setIsAudioMuted(state.isMuted);
      setCurrentTrackTitle(state.currentTrackTitle);
      setAudioError(state.lastError);
    });

    const interval = setInterval(syncFromState, 400);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleToggleAudioMute = useCallback(async () => {
    const result = await ambientMusic.togglePlaybackFromGesture();
    setIsAudioPlaying(result.isPlaying);
    setIsAudioMuted(result.isMuted);
    setAudioError(result.error);
  }, []);

  const handleEnterGate = useCallback(() => {
    try {
      sessionStorage.setItem('birthday_unlocked', '1');
    } catch {
      // ignore
    }
    ambientMusic.markUnlockedFromSession();
    // Do not call initAndPlay() a second time if already unlocked from WelcomeGate click
    const state = ambientMusic.getState();
    if (!state.isPlaying && !state.isMuted && !state.hasUnlocked) {
      ambientMusic.initAndPlay();
    }
    const updated = ambientMusic.getState();
    setIsAudioPlaying(updated.isPlaying);
    setIsAudioMuted(updated.isMuted);
    setAudioError(updated.lastError);
    setHasEntered(true);
    setActiveScene('scene-memory-album');
  }, []);

  const handleRevisitWelcome = useCallback(() => {
    try {
      sessionStorage.removeItem('birthday_unlocked');
    } catch {
      // ignore
    }
    ambientMusic.stop();
    setHasEntered(false);
  }, []);

  const handleNextScene = useCallback(() => {
    setActiveScene((prev) => getNextScene(prev));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handlePrevScene = useCallback(() => {
    setActiveScene((prev) => getPrevScene(prev));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSelectScene = useCallback((sceneId: SceneId) => {
    setActiveScene(sceneId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {/* Outer Romantic Canvas: Ambient Backdrop on Desktop, Edge-to-Edge on Mobile */}
      <div className="relative flex min-h-dvh w-full items-center justify-center bg-gradient-to-br from-[#F8DCE5] via-[#FFF6EC] to-[#FCEAEF] overflow-x-hidden selection:bg-[#F8DCE5] selection:text-[#42232D]">
        <AmbientBackdrop activeScene={activeScene} />

        {/* Centered Mobile Canvas Frame (390–430px wide phone mockup on desktop, full viewport on mobile) */}
        <div className="relative z-10 flex min-h-dvh w-full max-w-[430px] flex-col justify-between overflow-x-hidden bg-[#FFF9F2] shadow-2xl transition-all sm:my-6 sm:min-h-[850px] sm:rounded-[2.75rem] sm:border-[7px] sm:border-[#FFFFFF]/90 sm:shadow-[0_25px_60px_-15px_rgba(66,35,45,0.25)]">
          {/* If visitor has not entered yet, show Full-Screen Password Welcome Gate */}
          {!hasEntered ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="welcome-gate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-1 flex-col justify-center"
              >
                <SceneWelcomeGate onEnter={handleEnterGate} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              {/* Sticky Mobile Top Header Bar with Back Button, Chapter Step & Sound (No Fixed Bottom Menu) */}
              <HeartProgressControl
                activeScene={activeScene}
                onSelectScene={handleSelectScene}
                onBack={handlePrevScene}
                isAudioPlaying={isAudioPlaying}
                isAudioMuted={isAudioMuted}
                onToggleAudioMute={handleToggleAudioMute}
                showBottomNav={false}
                currentTrackTitle={currentTrackTitle}
                audioError={audioError}
              />

              {/* Main Sequential Birthday Journey Viewport */}
              <main className="relative z-10 flex flex-1 flex-col justify-start pb-8 sm:pb-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScene}
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.99 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-1 flex-col justify-start"
                  >
                    {/* Step 2 (and alias): Our Memories (10 Uncropped Scrapbook Photos & Lightbox) */}
                    {(activeScene === 'scene-memory-album' || activeScene === 'scene-1-intro') && (
                      <SceneMemoryAlbum
                        onNext={() => handleSelectScene('scene-3-love-letter')}
                        onBack={handleRevisitWelcome}
                      />
                    )}

                    {/* Step 3: Love Letter Book (20-Page 3D Storybook) */}
                    {activeScene === 'scene-3-love-letter' && (
                      <Scene3LoveLetter
                        onNext={() => handleSelectScene('scene-6-birthday-invitation')}
                        onBack={() => handleSelectScene('scene-memory-album')}
                      />
                    )}

                    {/* Final Step: Cake Cutting + Personalized Birthday Wish */}
                    {activeScene === 'scene-6-birthday-invitation' && (
                      <Scene6BirthdayInvitation
                        onBack={() => handleSelectScene('scene-3-love-letter')}
                        onReturnHome={() => handleSelectScene('scene-memory-album')}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </main>
            </>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
