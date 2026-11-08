import type { SceneId } from '../config/universeData';
export type { SceneId };

export type CakeState = 'unlit' | 'lit' | 'cut';
export type CakeAction = 'LIGHT_CANDLES' | 'CUT_CAKE' | 'RESET';

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isReached: boolean;
}

const SCENE_IDS: SceneId[] = [
  'scene-memory-album',
  'scene-3-love-letter',
  'scene-6-birthday-invitation',
];

export function getSceneIndex(sceneId: SceneId): number {
  if (sceneId === 'scene-1-intro') return 0;
  const idx = SCENE_IDS.indexOf(sceneId);
  return idx === -1 ? 0 : idx;
}

export function getNextScene(current: SceneId): SceneId {
  if (current === 'scene-1-intro') {
    return 'scene-3-love-letter';
  }
  const idx = SCENE_IDS.indexOf(current);
  if (idx !== -1 && idx < SCENE_IDS.length - 1) {
    return SCENE_IDS[idx + 1];
  }
  return 'scene-6-birthday-invitation';
}

export function getPrevScene(current: SceneId): SceneId {
  const idx = SCENE_IDS.indexOf(current);
  if (idx > 0) {
    return SCENE_IDS[idx - 1];
  }
  return 'scene-memory-album';
}

export function canNavigateBack(current: SceneId): boolean {
  return current !== 'scene-memory-album' && current !== 'scene-1-intro';
}

/**
 * Determines which background track key is assigned to a given scene and state.
 * 1. Password Entry & Memories ('scene-memory-album') -> 'opening' (A Thousand Years continues playing)
 * 2. Love Letter ('scene-3-love-letter') -> 'letter' (Darasal Raabta) once book opens, else 'opening'
 * 3. Cake Cutting & Birthday Wish ('scene-6-birthday-invitation') -> 'cake' (Perfect by Ed Sheeran)
 */
export function getSceneTargetTrack(
  sceneId: SceneId,
  isCakeCutTriggered = false,
  hasOpenedLoveLetter = false
): 'opening' | 'letter' | 'cake' | 'silent' {
  if (sceneId === 'scene-6-birthday-invitation') {
    return 'cake';
  }
  if (sceneId === 'scene-3-love-letter') {
    if (hasOpenedLoveLetter) {
      return 'letter';
    }
    return 'opening';
  }
  return 'opening';
}

export const BACKGROUND_MUSIC_CONFIG = {
  defaultVolume: 0.75,
  defaultTrackId: 'opening' as const,
  tracks: {
    opening: {
      id: 'opening',
      title: 'A Thousand Years',
      artist: 'Christina Perri',
      url: '/a-thousand-years.mp3.mp3',
      fallbackUrl: '/a-thousand-years.mp3',
      candidateUrls: [
        '/a-thousand-years.mp3.mp3',
        '/a-thousand-years.mp3',
      ],
    },
    letter: {
      id: 'letter',
      title: 'Darasal Raabta',
      artist: 'Atif Aslam',
      url: '/Darasal Raabta 320 Kbps.mp3',
      fallbackUrl: '/Darasal%20Raabta%20320%20Kbps.mp3',
      candidateUrls: [
        '/Darasal Raabta 320 Kbps.mp3',
        '/Darasal%20Raabta%20320%20Kbps.mp3',
      ],
    },
    cake: {
      id: 'cake',
      title: 'Perfect',
      artist: 'Ed Sheeran',
      url: '/Perfect - Ed Sheeran.mp3',
      fallbackUrl: '/Perfect%20-%20Ed%20Sheeran.mp3',
      candidateUrls: [
        '/Perfect - Ed Sheeran.mp3',
        '/Perfect%20-%20Ed%20Sheeran.mp3',
      ],
    },
  },
};

/**
 * Advances storybook chapter index one chapter at a time.
 * If already on the final chapter, signals completion (`shouldAdvanceScene: true`).
 */
export function advanceStorybookChapter(
  currentIndex: number,
  totalChapters: number
): { nextIndex: number; shouldAdvanceScene: boolean } {
  if (totalChapters <= 0) {
    return { nextIndex: 0, shouldAdvanceScene: true };
  }
  if (currentIndex + 1 < totalChapters) {
    return { nextIndex: currentIndex + 1, shouldAdvanceScene: false };
  }
  return { nextIndex: currentIndex, shouldAdvanceScene: true };
}

export function previousStorybookChapter(currentIndex: number): number {
  return Math.max(0, currentIndex - 1);
}

/**
 * Calculates deterministic countdown parts between current timestamp and target timestamp.
 */
export function calculateCountdown(nowMs: number, targetMs: number): CountdownBreakdown {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isReached: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isReached: false,
  };
}

/**
 * Deterministic state machine for the Birthday Room cake preview interactions.
 */
export function transitionCakeState(
  currentState: CakeState,
  action: CakeAction
): { nextState: CakeState; showConfetti: boolean; statusMessage: string } {
  switch (action) {
    case 'LIGHT_CANDLES':
      if (currentState === 'lit') {
        return {
          nextState: 'lit',
          showConfetti: false,
          statusMessage: 'The candles are glowing warmly. Make a birthday wish and cut the cake!',
        };
      }
      return {
        nextState: 'lit',
        showConfetti: false,
        statusMessage: 'Candles lit! Make a wish for November 9, 2026, then cut the cake.',
      };

    case 'CUT_CAKE':
      return {
        nextState: 'cut',
        showConfetti: true,
        statusMessage: 'Happy Birthday, my Wifeyyy ♡ Wishing you the sweetest year ahead!',
      };

    case 'RESET':
    default:
      return {
        nextState: 'unlit',
        showConfetti: false,
        statusMessage: 'Make a wish, blow out the candles, and cut your birthday cake!',
      };
  }
}

export function formatTwoDigits(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export interface LetterPaginationOptions {
  charsPerLine?: number;
  maxLinesPerPage?: number;
}

/**
 * Paginates a long handwritten love letter into multiple stationery pages
 * while preserving exact wording, paragraph breaks (\n\n), and line breaks (\n),
 * without ever splitting words or clipping paragraphs.
 * Returns an empty array if the input text has not been supplied yet.
 */
export function paginateLetterText(
  rawText: string,
  options: LetterPaginationOptions = {}
): string[] {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  const charsPerLine = options.charsPerLine ?? 52;
  const maxLinesPerPage = options.maxLinesPerPage ?? 9;
  const normalized = rawText.replace(/\r\n/g, '\n').trim();

  // Support explicit manual page breaks if "---" is placed on its own line
  const manualSections = normalized.split(/\n\s*---\s*\n/);
  const pages: string[] = [];

  const estimateVisualLines = (lineText: string): number => {
    const trimmed = lineText.trim();
    if (trimmed.length === 0) return 1;
    return Math.max(1, Math.ceil(trimmed.length / charsPerLine));
  };

  const splitOversizedSentenceGroup = (text: string, maxChars: number): string[] => {
    const words = text.split(/(\s+)/);
    const chunks: string[] = [];
    let current = '';

    for (const token of words) {
      if ((current + token).length > maxChars && current.trim().length > 0) {
        chunks.push(current.trimEnd());
        current = token.trimStart();
      } else {
        current += token;
      }
    }
    if (current.trim().length > 0) {
      chunks.push(current.trimEnd());
    }
    return chunks;
  };

  for (const section of manualSections) {
    const paragraphs = section.split(/\n{2,}/);
    let currentPageParagraphs: string[] = [];
    let currentPageLines = 0;

    const flushPage = () => {
      if (currentPageParagraphs.length > 0) {
        pages.push(currentPageParagraphs.join('\n\n'));
        currentPageParagraphs = [];
        currentPageLines = 0;
      }
    };

    for (const rawParagraph of paragraphs) {
      const explicitLines = rawParagraph.split('\n');
      const paragraphLineCost = explicitLines.reduce(
        (sum, line) => sum + estimateVisualLines(line),
        0
      );
      const spacingCost = currentPageParagraphs.length > 0 ? 1 : 0;

      if (currentPageLines + spacingCost + paragraphLineCost <= maxLinesPerPage) {
        currentPageParagraphs.push(rawParagraph);
        currentPageLines += spacingCost + paragraphLineCost;
      } else if (paragraphLineCost <= maxLinesPerPage) {
        flushPage();
        currentPageParagraphs.push(rawParagraph);
        currentPageLines = paragraphLineCost;
      } else {
        // Very long single paragraph that exceeds a full page: split cleanly along line or word boundaries
        let subLinesBuffer: string[] = [];
        let subLinesCount = 0;

        const flushSubParagraph = () => {
          if (subLinesBuffer.length > 0) {
            const subPara = subLinesBuffer.join('\n');
            const cost = subLinesCount;
            const gap = currentPageParagraphs.length > 0 ? 1 : 0;
            if (currentPageLines + gap + cost > maxLinesPerPage) {
              flushPage();
            }
            currentPageParagraphs.push(subPara);
            currentPageLines += (currentPageParagraphs.length > 1 ? 1 : 0) + cost;
            subLinesBuffer = [];
            subLinesCount = 0;
          }
        };

        for (const singleLine of explicitLines) {
          const lineVisualCost = estimateVisualLines(singleLine);
          if (lineVisualCost <= maxLinesPerPage) {
            if (subLinesCount + lineVisualCost > maxLinesPerPage) {
              flushSubParagraph();
            }
            subLinesBuffer.push(singleLine);
            subLinesCount += lineVisualCost;
          } else {
            flushSubParagraph();
            flushPage();
            const maxCharsPerPage = charsPerLine * maxLinesPerPage;
            const wordChunks = splitOversizedSentenceGroup(singleLine, maxCharsPerPage);
            for (const chunk of wordChunks) {
              const chunkCost = estimateVisualLines(chunk);
              if (currentPageLines + chunkCost > maxLinesPerPage && currentPageParagraphs.length > 0) {
                flushPage();
              }
              currentPageParagraphs.push(chunk);
              currentPageLines += chunkCost;
              if (currentPageLines >= maxLinesPerPage) {
                flushPage();
              }
            }
          }
        }
        flushSubParagraph();
      }
    }

    flushPage();
  }

  return pages;
}

/**
 * Returns a natural character-by-character delay (in ms) for handwriting reveal,
 * adding subtle pauses at punctuation and line breaks while remaining brisk enough
 * for comfortable reading of long letters.
 */
export function getHandwritingCharDelay(char: string, index: number): number {
  if (char === '\n') return 55;
  if (char === '.' || char === '!' || char === '?') return 48;
  if (char === ',' || char === ';' || char === ':' || char === '—') return 32;
  if (char === ' ') return 10;
  // Subtle deterministic variation between 12ms and 20ms per character
  return 13 + ((index * 7) % 8);
}

/**
 * Returns the next photo index in the Memory Album (wrapping cleanly around the album).
 */
export function getNextAlbumPhotoIndex(currentIndex: number, totalPhotos: number): number {
  if (totalPhotos <= 0) return 0;
  return (currentIndex + 1) % totalPhotos;
}

/**
 * Returns the previous photo index in the Memory Album (wrapping cleanly around the album).
 */
export function getPrevAlbumPhotoIndex(currentIndex: number, totalPhotos: number): number {
  if (totalPhotos <= 0) return 0;
  return (currentIndex - 1 + totalPhotos) % totalPhotos;
}

/**
 * Formats seconds into MM:SS tabular display (e.g. 84 -> '01:24').
 */
export function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${formatTwoDigits(mins)}:${formatTwoDigits(secs)}`;
}

/**
 * Clamps a requested seek time (in seconds) within [0, duration].
 */
export function clampSeekTime(targetSeconds: number, durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  if (!Number.isFinite(targetSeconds)) return 0;
  return Math.min(durationSeconds, Math.max(0, targetSeconds));
}

/**
 * Generates a valid, tiny 8kHz mono PCM WAV data URI of a specified duration (in seconds)
 * with a soft, nearly-inaudible chime tone so real HTML5 <audio> playback, seeking,
 * and timeupdate events can be verified end-to-end when ?testMedia=1 is active.
 */
export function createSilentTestWavDataUrl(durationSeconds = 4): string {
  const sampleRate = 8000;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const dataSize = numSamples; // 8-bit unsigned mono = 1 byte per sample
  const fileSize = 44 + dataSize;
  const buffer = new Uint8Array(fileSize);
  const view = new DataView(buffer.buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      buffer[offset + i] = str.charCodeAt(i);
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format = 1
  view.setUint16(22, 1, true); // Mono = 1 channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // Byte rate
  view.setUint16(32, 1, true); // Block align
  view.setUint16(34, 8, true); // 8 bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    // 128 is silence in 8-bit unsigned PCM
    buffer[44 + i] = 128;
  }

  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(buffer).toString('base64');
  return `data:audio/wav;base64,${base64}`;
}



