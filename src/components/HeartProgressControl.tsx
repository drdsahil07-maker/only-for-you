import React from 'react';
import {
  Home,
  Image as ImageIcon,
  Music,
  Gift,
  Mail,
  ChevronLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SCENE_META, SceneId } from '../config/universeData';

interface HeartProgressControlProps {
  activeScene: SceneId;
  onSelectScene: (sceneId: SceneId) => void;
  onBack?: () => void;
  onRestart?: () => void;
  isAudioPlaying?: boolean;
  isAudioMuted?: boolean;
  onToggleAudioMute?: () => void;
  showBottomNav?: boolean;
  currentTrackTitle?: string;
  audioError?: string | null;
}

export const HeartProgressControl: React.FC<HeartProgressControlProps> = ({
  activeScene,
  onSelectScene,
  onBack,
  isAudioPlaying = false,
  isAudioMuted = false,
  onToggleAudioMute,
  showBottomNav = false,
  currentTrackTitle = 'A Thousand Years',
  audioError = null,
}) => {
  const isHome = activeScene === 'scene-memory-album' || activeScene === 'scene-1-intro';

  const sceneOrder: SceneId[] = [
    'scene-memory-album',
    'scene-3-love-letter',
    'scene-6-birthday-invitation',
  ];
  const stepIndex = Math.max(0, sceneOrder.indexOf(activeScene));
  const stepNumber = stepIndex + 1;

  const getIcon = (type: 'home' | 'gallery' | 'music' | 'letter' | 'gift', isActive: boolean) => {
    const iconClass = `h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#E56B8C]' : 'text-[#8F304C]/65'}`;
    switch (type) {
      case 'home':
        return <Home className={iconClass} />;
      case 'gallery':
        return <ImageIcon className={iconClass} />;
      case 'music':
        return <Music className={iconClass} />;
      case 'letter':
        return <Mail className={iconClass} />;
      case 'gift':
        return <Gift className={iconClass} />;
    }
  };

  const getSceneTitle = (scene: SceneId): string => {
    switch (scene) {
      case 'scene-1-intro':
      case 'scene-memory-album':
        return 'Our Memories ♡';
      case 'scene-3-love-letter':
        return 'Love Letter Book ♡';
      case 'scene-6-birthday-invitation':
        return 'Birthday Cake & Wish ♡';
      default:
        return 'Our Little World ♡';
    }
  };

  return (
    <>
      {/* ========================================================
          MOBILE TOP APP BAR (Sticky top bar with Back, Chapter Step & Audio)
         ======================================================== */}
      <header
        role="navigation"
        aria-label="Birthday Journey Header"
        className="sticky top-0 z-40 mx-auto flex w-full max-w-md flex-col backdrop-blur-md bg-[#FFFDF9]/90 border-b border-[#F8DCE5]/60"
      >
        <div className="flex w-full items-center justify-between px-4 pt-2.5 pb-2 sm:px-6">
          {/* Left: Back Arrow (shown when not on Scene 1) or Subtle Decorative Heart */}
          <div className="flex w-10 items-center justify-start">
            {!isHome ? (
              <button
                type="button"
                data-testid="header-back-button"
                onClick={onBack ?? (() => onSelectScene('scene-1-intro'))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 text-[#42232D] shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Go back to previous scene"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <div
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 text-[#E56B8C] shadow-xs"
              >
                <span className="text-sm">🎀</span>
              </div>
            )}
          </div>

          {/* Center: Intimate Romantic Heading + Sequential Step Indicator */}
          <div className="flex flex-col items-center">
            <span className="font-handwritten text-xl sm:text-2xl font-bold tracking-tight text-[#42232D] leading-tight">
              {getSceneTitle(activeScene)}
            </span>
            <span
              data-testid="journey-step-indicator"
              className="text-[10px] font-semibold tracking-widest uppercase text-[#8F304C]/70"
            >
              Chapter {stepNumber} of {sceneOrder.length}
            </span>
          </div>

          {/* Right: Audio Music Experience Toggle */}
          <div className="flex w-10 items-center justify-end">
            {onToggleAudioMute && (
              <button
                type="button"
                data-testid="audio-toggle-button"
                onClick={onToggleAudioMute}
                aria-pressed={Boolean(isAudioPlaying && !isAudioMuted)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-[#F8DCE5] bg-[#FFFFFF]/90 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isAudioPlaying && !isAudioMuted
                    ? 'text-[#E56B8C] border-[#E56B8C]/40 bg-[#FFF0F5]'
                    : 'text-[#8F304C]/60 hover:text-[#8F304C]'
                }`}
                aria-label={
                  isAudioMuted || !isAudioPlaying
                    ? `Play background music (${currentTrackTitle})`
                    : `Pause background music (${currentTrackTitle})`
                }
                title={
                  isAudioMuted || !isAudioPlaying
                    ? `Play background music (${currentTrackTitle})`
                    : `Pause background music (${currentTrackTitle})`
                }
              >
                {isAudioMuted || !isAudioPlaying ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Thin Romantic Progress Bar Across Top Header */}
        <div className="h-1 w-full bg-[#F8DCE5]/45 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E56B8C] to-[#C83E62] transition-all duration-500 ease-out"
            style={{ width: `${Math.round((stepNumber / sceneOrder.length) * 100)}%` }}
          />
        </div>

        {audioError && (
          <button
            type="button"
            onClick={onToggleAudioMute}
            role="status"
            data-testid="audio-error-banner"
            className="mx-4 my-1.5 rounded-full border border-[#E56B8C]/40 bg-[#FFF0F5] px-3 py-1 text-center text-[11px] font-medium text-[#8F304C] shadow-2xs hover:bg-[#FFE5EE] transition-colors cursor-pointer"
          >
            {audioError}
          </button>
        )}
      </header>

      {/* Optional Bottom Nav (disabled in visitor-facing sequential journey) */}
      {showBottomNav && (
        <nav
          aria-label="Bottom Destination Tabs"
          className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md px-3 pb-safe pb-2"
        >
          <div className="flex items-center justify-around rounded-3xl border border-[#F8DCE5]/90 bg-[#FFFFFF]/92 px-2 py-1.5 shadow-lg backdrop-blur-md">
            {SCENE_META.map((item) => {
              const isActive = item.id === activeScene;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectScene(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-1 flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                    isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex h-7 items-center justify-center">
                    {getIcon(item.icon, isActive)}
                  </div>
                  <span
                    className={`mt-0.5 text-[11px] font-medium tracking-tight ${
                      isActive ? 'font-semibold text-[#E56B8C]' : 'text-[#8F304C]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
