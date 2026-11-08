import { getSceneTargetTrack, BACKGROUND_MUSIC_CONFIG, SceneId } from './universeLogic';

export type TrackKey = 'opening' | 'letter' | 'cake';

export interface AmbientMusicState {
  isPlaying: boolean;
  isMuted: boolean;
  isSuppressed: boolean;
  hasUnlocked: boolean;
  currentTrackId: TrackKey;
  currentTrackTitle: string;
  currentTrackArtist: string;
  currentTime: number;
  duration: number;
  lastError: string | null;
}

type StateListener = (state: AmbientMusicState) => void;

/**
 * Shared persistent background music controller across all scenes.
 * Manages exactly one underlying HTMLAudioElement to prevent any overlapping audio.
 *
 * Mappings:
 * 1. Password Gate (unlock) -> A Thousand Years
 * 2. Opening Hub & Memories -> Continues A Thousand Years without restarting
 * 3. Cake Cutting -> Plays Perfect by Ed Sheeran from the beginning when cake cutting starts
 * 4. Love Letter -> Plays Darasal Raabta from the beginning when book is opened
 * 5. Small Surprise Room -> Stops all background music; remains silent until personal recording selected
 */
class AmbientMusicController {
  private audio: HTMLAudioElement | null = null;
  private isManualPaused = false;
  private isSuppressed = false;
  private hasUnlocked = false;
  private currentTrackId: TrackKey = 'opening';
  private currentSceneId: SceneId = 'scene-1-intro';
  private isCakeCutTriggered = false;
  private hasOpenedLoveLetter = false;
  private lastError: string | null = null;
  private listeners: Set<StateListener> = new Set();

  private isPlayPending = false;
  private pendingPlayPromise: Promise<boolean> | null = null;

  private savedPositions: Record<TrackKey, number> = {
    opening: 0,
    letter: 0,
    cake: 0,
  };

  private verifiedUrls: Record<TrackKey, string> = {
    opening: BACKGROUND_MUSIC_CONFIG.tracks.opening.url,
    letter: BACKGROUND_MUSIC_CONFIG.tracks.letter.url,
    cake: BACKGROUND_MUSIC_CONFIG.tracks.cake.url,
  };

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch {
        // Ignore subscriber error
      }
    });
  }

  public clearError(): void {
    this.lastError = null;
    this.notifyListeners();
  }

  /**
   * Restores unlocked session state when visitor refreshes an already-unlocked session.
   */
  public markUnlockedFromSession(): void {
    this.hasUnlocked = true;
    this.createAudio();
    this.notifyListeners();
  }

  private normalizeAudioUrl(url: string): string {
    if (!url) return '';
    try {
      const parsed = new URL(url, 'http://localhost');
      return decodeURIComponent(parsed.pathname).toLowerCase().replace(/\/+/g, '/');
    } catch {
      return decodeURIComponent(url).toLowerCase();
    }
  }

  private isSameTrackUrl(currentSrc: string, targetUrl: string, fallbackUrl?: string): boolean {
    if (!currentSrc || !targetUrl) return false;
    const normCurrent = this.normalizeAudioUrl(currentSrc);
    const normTarget = this.normalizeAudioUrl(targetUrl);
    if (
      normCurrent === normTarget ||
      normCurrent.endsWith(normTarget) ||
      normTarget.endsWith(normCurrent)
    ) {
      return true;
    }
    if (fallbackUrl) {
      const normFallback = this.normalizeAudioUrl(fallbackUrl);
      if (
        normCurrent === normFallback ||
        normCurrent.endsWith(normFallback) ||
        normFallback.endsWith(normCurrent)
      ) {
        return true;
      }
    }
    return false;
  }

  private createAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (this.audio) return this.audio;

    try {
      const config = BACKGROUND_MUSIC_CONFIG;
      const initialTrack = config.tracks.opening;

      const audio = new Audio();
      audio.src = this.verifiedUrls.opening || initialTrack.url;
      audio.loop = true;
      audio.muted = false;
      audio.volume = config.defaultVolume || 0.75;
      audio.preload = 'auto';

      audio.addEventListener('play', () => {
        this.lastError = null;
        this.notifyListeners();
      });

      audio.addEventListener('playing', () => {
        this.lastError = null;
        this.notifyListeners();
      });

      audio.addEventListener('pause', () => {
        this.notifyListeners();
      });

      audio.addEventListener('ended', () => {
        this.notifyListeners();
      });

      audio.addEventListener('volumechange', () => {
        this.notifyListeners();
      });

      audio.addEventListener('error', () => {
        const currentCfg = config.tracks[this.currentTrackId];
        if (
          currentCfg?.fallbackUrl &&
          !this.isSameTrackUrl(audio.src, currentCfg.fallbackUrl)
        ) {
          audio.src = currentCfg.fallbackUrl;
          audio.load();
          if (!this.isManualPaused && !this.isSuppressed && this.hasUnlocked) {
            void this.playCurrentAudio();
          }
        } else {
          this.lastError = `Unable to play "${currentCfg?.title || 'song'}". Tap to retry ♡`;
          this.notifyListeners();
        }
      });

      this.audio = audio;
      return audio;
    } catch {
      return null;
    }
  }

  /**
   * Executes audio.play() directly with play-promise tracking to prevent DOMException AbortError
   */
  private async playCurrentAudio(fromUserGesture = false): Promise<boolean> {
    const audio = this.createAudio();
    if (!audio) return false;

    // If audio is already actively playing the right track, no new play() call needed
    if (!audio.paused && !this.isPlayPending) {
      return true;
    }

    // If a play promise is already in flight, reuse it
    if (this.pendingPlayPromise) {
      return this.pendingPlayPromise;
    }

    const config = BACKGROUND_MUSIC_CONFIG;
    const currentCfg = config.tracks[this.currentTrackId];
    const targetUrl =
      this.verifiedUrls[this.currentTrackId] ||
      currentCfg?.url ||
      config.tracks.opening.url;

    if (!this.isSameTrackUrl(audio.src, targetUrl, currentCfg?.fallbackUrl)) {
      audio.src = targetUrl;
    }

    audio.muted = false;
    audio.volume = config.defaultVolume || 0.75;

    this.isPlayPending = true;

    const playOp = (async (): Promise<boolean> => {
      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          await playPromise;
        }
        this.lastError = null;
        this.notifyListeners();
        return !audio.paused;
      } catch (err: unknown) {
        // Fallback retry if primary path failed
        if (
          currentCfg?.fallbackUrl &&
          !this.isSameTrackUrl(audio.src, currentCfg.fallbackUrl)
        ) {
          try {
            audio.src = currentCfg.fallbackUrl;
            audio.muted = false;
            audio.volume = config.defaultVolume || 0.75;
            const retryPromise = audio.play();
            if (retryPromise && typeof retryPromise.then === 'function') {
              await retryPromise;
            }
            this.lastError = null;
            this.notifyListeners();
            return !audio.paused;
          } catch {
            // Proceed to error handling below
          }
        }

        const errorName = err instanceof Error ? err.name : '';
        if (errorName === 'NotAllowedError') {
          this.lastError = 'Browser blocked audio playback. Tap the music button to play ♡';
          this.attachUnlockGestureRetry();
        } else {
          this.lastError = `Unable to play "${currentCfg?.title || 'song'}". Tap to retry ♡`;
        }
        this.notifyListeners();
        return false;
      } finally {
        this.isPlayPending = false;
        this.pendingPlayPromise = null;
      }
    })();

    this.pendingPlayPromise = playOp;
    return playOp;
  }

  private attachUnlockGestureRetry(): void {
    if (typeof window === 'undefined') return;
    const handleUserGesture = () => {
      if (
        !this.isManualPaused &&
        !this.isSuppressed &&
        this.audio &&
        this.hasUnlocked &&
        this.audio.paused
      ) {
        void this.playCurrentAudio(true);
      }
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
    window.addEventListener('click', handleUserGesture, { once: true });
    window.addEventListener('touchstart', handleUserGesture, { once: true });
    window.addEventListener('keydown', handleUserGesture, { once: true });
  }

  private getExpectedTrackForScene(sceneId: SceneId): TrackKey | 'silent' {
    return getSceneTargetTrack(sceneId, this.isCakeCutTriggered, this.hasOpenedLoveLetter);
  }

  /**
   * Called upon entering correct password (0903) in the Welcome Gate.
   * Starts A Thousand Years synchronously inside the user gesture.
   */
  public initAndPlay(): boolean {
    const audio = this.createAudio();
    if (!audio) return false;

    this.hasUnlocked = true;
    this.isManualPaused = false;
    this.lastError = null;

    if (this.isSuppressed) {
      this.notifyListeners();
      return true;
    }

    // If A Thousand Years is already actively playing, keep playing seamlessly!
    if (
      !audio.paused &&
      this.currentTrackId === 'opening' &&
      this.isSameTrackUrl(
        audio.src,
        BACKGROUND_MUSIC_CONFIG.tracks.opening.url,
        BACKGROUND_MUSIC_CONFIG.tracks.opening.fallbackUrl
      )
    ) {
      audio.muted = false;
      audio.volume = BACKGROUND_MUSIC_CONFIG.defaultVolume || 0.75;
      this.notifyListeners();
      return true;
    }

    const restorePos = this.savedPositions[this.currentTrackId] || 0;
    if (restorePos > 0 && Math.abs(audio.currentTime - restorePos) > 0.5) {
      try {
        audio.currentTime = restorePos;
      } catch {
        // Safe guard
      }
    }

    void this.playCurrentAudio(true);
    return true;
  }

  /**
   * Synchronizes background track to the active scene without restarting unnecessarily.
   */
  public async syncScene(sceneId: SceneId): Promise<void> {
    this.currentSceneId = sceneId;
    if (!this.hasUnlocked) return;

    // When returning to early scenes (Birthday greeting, Memories), reset later triggers
    if (sceneId === 'scene-1-intro' || sceneId === 'scene-memory-album') {
      this.hasOpenedLoveLetter = false;
      this.isCakeCutTriggered = false;
    } else if (sceneId === 'scene-6-birthday-invitation') {
      this.hasOpenedLoveLetter = false;
    }

    const targetTrack = this.getExpectedTrackForScene(sceneId);
    if ((targetTrack as string) === 'silent') {
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
      }
      this.notifyListeners();
      return;
    }

    // If the active track is already the expected track:
    // e.g. Scene 1 (Greeting) -> Scene 2 (Memories) are both 'opening'
    // Do NOT restart or interrupt playback!
    if (this.currentTrackId === targetTrack) {
      if (
        this.audio &&
        this.audio.paused &&
        !this.isManualPaused &&
        !this.isSuppressed &&
        !this.isPlayPending
      ) {
        await this.playCurrentAudio(false);
      }
      this.notifyListeners();
      return;
    }

    const startFromBeginning =
      (targetTrack === 'letter' && this.currentTrackId !== 'letter') ||
      (targetTrack === 'cake' && this.currentTrackId !== 'cake');
    await this.requestTrack(targetTrack as TrackKey, { fromBeginning: startFromBeginning });
  }

  /**
   * Requests a specific track by key.
   * Switches cleanly on the single shared HTMLAudioElement without restarting if already on that track.
   */
  public async requestTrack(
    trackId: TrackKey,
    options?: { fromBeginning?: boolean; fromUserGesture?: boolean }
  ): Promise<boolean> {
    const config = BACKGROUND_MUSIC_CONFIG;
    const targetConfig = config.tracks[trackId];
    if (!targetConfig) return false;

    const fromBeginning = Boolean(options?.fromBeginning);
    const fromUserGesture = Boolean(options?.fromUserGesture);
    const audio = this.createAudio();
    if (!audio) return false;

    // If already assigned to this track on the audio element, continue without restarting
    if (
      this.currentTrackId === trackId &&
      this.isSameTrackUrl(audio.src, targetConfig.url, targetConfig.fallbackUrl)
    ) {
      if (fromBeginning) {
        this.savedPositions[trackId] = 0;
        try {
          audio.currentTime = 0;
        } catch {
          // Safe guard
        }
      }
      if (
        audio.paused &&
        !this.isManualPaused &&
        !this.isSuppressed &&
        this.hasUnlocked &&
        !this.isPlayPending
      ) {
        const restorePos = fromBeginning ? 0 : this.savedPositions[trackId] || 0;
        if (!fromBeginning && restorePos > 0 && Math.abs(audio.currentTime - restorePos) > 0.5) {
          try {
            audio.currentTime = restorePos;
          } catch {
            // Safe guard
          }
        }
        await this.playCurrentAudio(fromUserGesture);
      }
      this.notifyListeners();
      return true;
    }

    // Save previous track timestamp and pause before switching source
    this.savedPositions[this.currentTrackId] = audio.currentTime || 0;
    if (!audio.paused) {
      audio.pause();
    }
    this.isPlayPending = false;
    this.pendingPlayPromise = null;

    // Switch track source directly without blocking network probes
    const nextUrl =
      trackId === 'opening'
        ? targetConfig.url
        : this.verifiedUrls[trackId] || targetConfig.url;

    this.currentTrackId = trackId;
    if (fromBeginning) {
      this.savedPositions[trackId] = 0;
    }
    audio.src = nextUrl;

    const restorePos = fromBeginning ? 0 : this.savedPositions[trackId] || 0;
    try {
      audio.currentTime = restorePos;
    } catch {
      // Safe guard
    }

    if (!this.isManualPaused && !this.isSuppressed && this.hasUnlocked) {
      await this.playCurrentAudio(fromUserGesture);
    } else {
      this.notifyListeners();
    }

    return true;
  }

  /**
   * Triggered when visitor opens the Love Letter book.
   * Ensures previous song is paused and Darasal Raabta plays from the beginning.
   */
  public async triggerLoveLetterOpen(): Promise<boolean> {
    this.hasUnlocked = true;
    this.hasOpenedLoveLetter = true;
    this.isManualPaused = false;
    const isAlreadyPlayingLetter =
      this.currentTrackId === 'letter' && Boolean(this.audio && !this.audio.paused);
    return this.requestTrack('letter', {
      fromBeginning: !isAlreadyPlayingLetter,
      fromUserGesture: true,
    });
  }

  /**
   * Triggered when visitor starts the cake-cutting interaction in Scene 6.
   * Pauses the previous track and plays Perfect by Ed Sheeran from the beginning.
   */
  public async triggerCakeCut(): Promise<boolean> {
    this.hasUnlocked = true;
    this.isCakeCutTriggered = true;
    this.isManualPaused = false;
    const isAlreadyPlayingCake =
      this.currentTrackId === 'cake' && Boolean(this.audio && !this.audio.paused);
    return this.requestTrack('cake', {
      fromBeginning: !isAlreadyPlayingCake,
      fromUserGesture: true,
    });
  }

  /**
   * Resets cake cutting state when celebration is reset.
   */
  public resetCakeCut(): void {
    this.isCakeCutTriggered = false;
    if (this.currentSceneId === 'scene-6-birthday-invitation') {
      void this.requestTrack('cake');
    }
  }

  /**
   * Toggles play/pause directly inside the user's click/tap handler.
   */
  public toggleMute(): boolean {
    const audio = this.createAudio();
    if (!audio) return false;

    this.hasUnlocked = true;
    const isCurrentlyPlaying = !audio.paused && !this.isManualPaused;

    if (isCurrentlyPlaying) {
      this.savedPositions[this.currentTrackId] = audio.currentTime || 0;
      audio.pause();
      this.isManualPaused = true;
      this.lastError = null;
      this.notifyListeners();
      return true;
    } else {
      this.isManualPaused = false;
      this.lastError = null;

      if (!this.isSuppressed) {
        const expectedTrack = this.getExpectedTrackForScene(this.currentSceneId);
        if (expectedTrack === 'silent') {
          this.notifyListeners();
          return false;
        }
        const expectedCfg = BACKGROUND_MUSIC_CONFIG.tracks[expectedTrack];
        if (this.currentTrackId !== expectedTrack && expectedCfg) {
          this.currentTrackId = expectedTrack;
          audio.src = this.verifiedUrls[expectedTrack] || expectedCfg.url;
        }

        const restorePos = this.savedPositions[this.currentTrackId] || 0;
        if (restorePos > 0 && Math.abs(audio.currentTime - restorePos) > 0.5) {
          try {
            audio.currentTime = restorePos;
          } catch {
            // Safe guard
          }
        }
        void this.playCurrentAudio(true);
      } else {
        this.notifyListeners();
      }
      return false;
    }
  }

  /**
   * Async play/pause toggle that awaits audio.play() and returns the resulting playback state and any error.
   */
  public async togglePlaybackFromGesture(): Promise<{
    isPlaying: boolean;
    isMuted: boolean;
    error: string | null;
  }> {
    const audio = this.createAudio();
    if (!audio) {
      return {
        isPlaying: false,
        isMuted: true,
        error: 'Audio player is not supported in this browser.',
      };
    }

    this.hasUnlocked = true;
    const isCurrentlyPlaying = !audio.paused && !this.isManualPaused;

    if (isCurrentlyPlaying) {
      this.savedPositions[this.currentTrackId] = audio.currentTime || 0;
      audio.pause();
      this.isManualPaused = true;
      this.lastError = null;
      this.notifyListeners();
      return { isPlaying: false, isMuted: true, error: null };
    }

    this.isManualPaused = false;
    this.lastError = null;

    if (this.isSuppressed) {
      this.notifyListeners();
      return {
        isPlaying: false,
        isMuted: false,
        error: 'Background music is paused while your personal recording is playing.',
      };
    }

    const expectedTrack = this.getExpectedTrackForScene(this.currentSceneId);
    if (expectedTrack !== 'silent') {
      const expectedCfg = BACKGROUND_MUSIC_CONFIG.tracks[expectedTrack];
      if (this.currentTrackId !== expectedTrack && expectedCfg) {
        this.currentTrackId = expectedTrack;
        audio.src = this.verifiedUrls[expectedTrack] || expectedCfg.url;
      }
    }

    const restorePos = this.savedPositions[this.currentTrackId] || 0;
    if (restorePos > 0 && Math.abs(audio.currentTime - restorePos) > 0.5) {
      try {
        audio.currentTime = restorePos;
      } catch {
        // Safe guard
      }
    }

    const played = await this.playCurrentAudio(true);
    return {
      isPlaying: played,
      isMuted: this.isManualPaused,
      error: this.lastError,
    };
  }

  /**
   * Personal singing priority in Music Room:
   * When suppressed is true (recording starts), background music pauses with position saved.
   * When suppressed is false (recording ends), background music resumes, respecting destination scene.
   */
  public setSuppressed(suppressed: boolean): void {
    this.isSuppressed = suppressed;
    const audio = this.createAudio();
    if (!audio) return;

    if (suppressed) {
      if (!audio.paused) {
        this.savedPositions[this.currentTrackId] = audio.currentTime || 0;
        audio.pause();
      }
      this.notifyListeners();
    } else {
      if (!this.isManualPaused && this.hasUnlocked) {
        this.syncScene(this.currentSceneId).then(() => {
          const restorePos = this.savedPositions[this.currentTrackId] || 0;
          if (restorePos > 0 && Math.abs(audio.currentTime - restorePos) > 0.5) {
            try {
              audio.currentTime = restorePos;
            } catch {
              // Safe guard
            }
          }
          void this.playCurrentAudio(false);
        });
      } else {
        this.notifyListeners();
      }
    }
  }

  public getState(): AmbientMusicState {
    const isPlaying = Boolean(
      this.audio && !this.audio.paused && !this.isManualPaused && !this.isSuppressed
    );
    const config = BACKGROUND_MUSIC_CONFIG;
    const currentTrack = config.tracks[this.currentTrackId];

    return {
      isPlaying,
      isMuted: this.isManualPaused,
      isSuppressed: this.isSuppressed,
      hasUnlocked: this.hasUnlocked,
      currentTrackId: this.currentTrackId,
      currentTrackTitle: currentTrack?.title || 'A Thousand Years',
      currentTrackArtist: currentTrack?.artist || 'Christina Perri',
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio?.duration || 0,
      lastError: this.lastError,
    };
  }

  public stop(): void {
    if (this.audio) {
      this.savedPositions[this.currentTrackId] = this.audio.currentTime || 0;
      this.audio.pause();
      this.notifyListeners();
    }
  }
}

export const ambientMusic = new AmbientMusicController();
