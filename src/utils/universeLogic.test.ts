import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getSceneIndex,
  getNextScene,
  getPrevScene,
  canNavigateBack,
  advanceStorybookChapter,
  previousStorybookChapter,
  calculateCountdown,
  transitionCakeState,
  formatTwoDigits,
  paginateLetterText,
  getHandwritingCharDelay,
} from './universeLogic.ts';

test('scene navigation transitions sequentially through the 5-step birthday journey', () => {
  assert.equal(getSceneIndex('scene-memory-album'), 0);
  assert.equal(canNavigateBack('scene-memory-album'), false);

  // 1. Password unlock -> 2. Memories gallery
  const s1 = 'scene-memory-album';
  assert.equal(canNavigateBack(s1), false);

  // 2. Memories gallery -> 3. Love Letter book
  const s2 = getNextScene(s1);
  assert.equal(s2, 'scene-3-love-letter');
  assert.equal(canNavigateBack(s2), true);

  // 3. Love Letter book -> 4. Birthday cake & celebration wish (Final Scene)
  const s3 = getNextScene(s2);
  assert.equal(s3, 'scene-6-birthday-invitation');
  assert.equal(canNavigateBack(s3), true);

  // Next from final scene stays on final scene
  assert.equal(getNextScene(s3), 'scene-6-birthday-invitation');

  // Backwards transitions
  assert.equal(getPrevScene(s3), 'scene-3-love-letter');
  assert.equal(getPrevScene(s2), 'scene-memory-album');
  assert.equal(getPrevScene(s1), 'scene-memory-album');
});

test('advanceStorybookChapter steps one chapter at a time and signals scene advance on final chapter', () => {
  const step1 = advanceStorybookChapter(0, 7);
  assert.equal(step1.nextIndex, 1);
  assert.equal(step1.shouldAdvanceScene, false);

  const finalStep = advanceStorybookChapter(6, 7);
  assert.equal(finalStep.nextIndex, 6);
  assert.equal(finalStep.shouldAdvanceScene, true);

  assert.equal(previousStorybookChapter(3), 2);
  assert.equal(previousStorybookChapter(0), 0);
});

test('calculateCountdown returns accurate days, hours, minutes, and seconds before target date', () => {
  const now = Date.parse('2026-10-18T00:00:00Z');
  const target = Date.parse('2026-11-09T02:30:15Z');
  const result = calculateCountdown(now, target);

  assert.equal(result.isReached, false);
  assert.equal(result.days, 22);
  assert.equal(result.hours, 2);
  assert.equal(result.minutes, 30);
  assert.equal(result.seconds, 15);
});

test('transitionCakeState transitions from unlit to lit to cut with confetti and resets cleanly', () => {
  const step1 = transitionCakeState('unlit', 'LIGHT_CANDLES');
  assert.equal(step1.nextState, 'lit');
  assert.equal(step1.showConfetti, false);

  const step2 = transitionCakeState(step1.nextState, 'CUT_CAKE');
  assert.equal(step2.nextState, 'cut');
  assert.equal(step2.showConfetti, true);

  const step3 = transitionCakeState(step2.nextState, 'RESET');
  assert.equal(step3.nextState, 'unlit');
  assert.equal(step3.showConfetti, false);
});

test('formatTwoDigits pads single digits and preserves double digits', () => {
  assert.equal(formatTwoDigits(9), '09');
  assert.equal(formatTwoDigits(11), '11');
});

test('paginateLetterText returns empty array when letter is not yet supplied and paginates multi-page letters verbatim without splitting words', () => {
  assert.deepEqual(paginateLetterText(''), []);
  assert.deepEqual(paginateLetterText('   \n  '), []);

  const multiParagraphLetter = [
    'My dearest love,\nEvery moment since September 5, 2023 has felt like a quiet chapter from a favourite novel.',
    'Walking beside the rainy pond with you, sharing our first warm embrace, and riding through the evening breeze remain my favourite memories.',
    'Since March 9, 2026, my world has been brighter, softer, and fuller because you are in it.',
    'Happy Birthday on November 9, 2026. Here is to every page we have yet to write together.',
  ].join('\n\n');

  const pages = paginateLetterText(multiParagraphLetter, {
    charsPerLine: 45,
    maxLinesPerPage: 5,
  });

  assert.equal(pages.length >= 3, true);
  assert.equal(pages.join('\n\n'), multiParagraphLetter);

  // Verify natural handwriting timing variation
  assert.equal(getHandwritingCharDelay('.', 1) > getHandwritingCharDelay('a', 1), true);
  assert.equal(getHandwritingCharDelay('\n', 2) > getHandwritingCharDelay(',', 2), true);
});

test('album photo navigation wraps cleanly forward and backward across all 10 scrapbook photos', async () => {
  const { getNextAlbumPhotoIndex, getPrevAlbumPhotoIndex } = await import('./universeLogic.ts');
  assert.equal(getNextAlbumPhotoIndex(0, 10), 1);
  assert.equal(getNextAlbumPhotoIndex(9, 10), 0);
  assert.equal(getPrevAlbumPhotoIndex(0, 10), 9);
  assert.equal(getPrevAlbumPhotoIndex(5, 10), 4);
});

test('formatPlaybackTime and clampSeekTime format audio timestamps and clamp seek positions', async () => {
  const {
    formatPlaybackTime,
    clampSeekTime,
    createSilentTestWavDataUrl,
  } = await import('./universeLogic.ts');
  assert.equal(formatPlaybackTime(0), '00:00');
  assert.equal(formatPlaybackTime(84.7), '01:24');
  assert.equal(formatPlaybackTime(-5), '00:00');
  assert.equal(clampSeekTime(42, 180), 42);
  assert.equal(clampSeekTime(-10, 180), 0);
  assert.equal(clampSeekTime(240, 180), 180);
  assert.equal(createSilentTestWavDataUrl(2).startsWith('data:audio/wav;base64,'), true);
});

test('Phase 22: all three uploaded audio files exist and map to Opening/Memories, Love Letter, and Cake Cutting, plus Final Surprise scene requirements', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { getSceneTargetTrack } = await import('./universeLogic.ts');

  // Verify scene-to-track mapping logic for 5-step sequence
  assert.equal(getSceneTargetTrack('scene-1-intro', false), 'opening');
  assert.equal(getSceneTargetTrack('scene-memory-album', false), 'opening');
  assert.equal(getSceneTargetTrack('scene-3-love-letter', false, false), 'opening');
  assert.equal(getSceneTargetTrack('scene-3-love-letter', false, true), 'letter');
  assert.equal(getSceneTargetTrack('scene-6-birthday-invitation', false), 'cake');
  assert.equal(getSceneTargetTrack('scene-6-birthday-invitation', true), 'cake');

  // Verify all three uploaded audio assets exist on disk in root and public
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'a-thousand-years.mp3.mp3')), true);
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'public/a-thousand-years.mp3.mp3')), true);
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'Darasal Raabta 320 Kbps.mp3')), true);
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'public/Darasal Raabta 320 Kbps.mp3')), true);
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'Perfect - Ed Sheeran.mp3')), true);
  assert.equal(fs.existsSync(path.resolve(process.cwd(), 'public/Perfect - Ed Sheeran.mp3')), true);

  // Verify universeData.ts preserves 20-page Love Letter, 10 photos, and 3-song mapping
  const universeDataSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/config/universeData.ts'),
    'utf8'
  );
  assert.equal(universeDataSrc.includes("title: 'A Thousand Years'"), true);
  assert.equal(universeDataSrc.includes("url: '/a-thousand-years.mp3.mp3'"), true);
  assert.equal(universeDataSrc.includes("title: 'Darasal Raabta'"), true);
  assert.equal(universeDataSrc.includes("url: '/Darasal Raabta 320 Kbps.mp3'"), true);
  assert.equal(universeDataSrc.includes("title: 'Perfect'"), true);
  assert.equal(universeDataSrc.includes("url: '/Perfect - Ed Sheeran.mp3'"), true);
  assert.equal(universeDataSrc.includes("artist: 'Ed Sheeran'"), true);

  // Verify 10 memory photos (mem-1 through mem-10)
  for (let i = 1; i <= 10; i++) {
    assert.equal(universeDataSrc.includes(`id: 'mem-${i}'`), true);
  }

  // Verify 20-page Love Letter (19 '---' page separators = 20 pages)
  const letterMatch = universeDataSrc.match(/letterText:\s*`([\s\S]*?)`,/);
  assert.equal(Boolean(letterMatch), true);
  const letterPages = letterMatch![1]
    .split(/\n\s*---\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  assert.equal(letterPages.length, 20);

  // Verify SceneWelcomeGate enforces 0903 password gate without displaying 0903 in user-facing text
  const welcomeGateSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/SceneWelcomeGate.tsx'),
    'utf8'
  );
  assert.equal(welcomeGateSrc.includes("password.trim() === '0903'"), true);
  assert.equal(welcomeGateSrc.includes('Enter Password to Reveal Something Special ✨'), true);
  assert.equal(welcomeGateSrc.includes('Reveal'), true);
  assert.equal(welcomeGateSrc.includes('Incorrect password. Try again.'), true);
  assert.equal(welcomeGateSrc.includes('Happy Birthday'), false);
  assert.equal(welcomeGateSrc.includes('My Baby'), false);

  // Verify Scene6BirthdayInvitation reveals complete personalized wish and ends here (no video button)
  const birthdayInvitationSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/Scene6BirthdayInvitation.tsx'),
    'utf8'
  );
  assert.equal(birthdayInvitationSrc.includes('Happy Birthday, Meri Baby! 🎂❤️'), true);
  assert.equal(birthdayInvitationSrc.includes('One Last Surprise for You ♡'), false);

  // Verify Scene3LoveLetter preserves "On Your 20th Birthday ♡" cover inscription
  const loveLetterSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/Scene3LoveLetter.tsx'),
    'utf8'
  );
  assert.equal(loveLetterSrc.includes('On Your 20th Birthday ♡'), true);
  assert.equal(loveLetterSrc.includes('This 20-Page Book Is for You'), true);
});

test('Phase 25: sequential memory gallery through 10 photos', () => {
  const memoryAlbumSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/SceneMemoryAlbum.tsx'),
    'utf8'
  );
  // Opening page requirements
  assert.equal(memoryAlbumSrc.includes('Our Memories ♡'), true);
  assert.equal(memoryAlbumSrc.includes('Little moments, endless memories.'), true);
  assert.equal(memoryAlbumSrc.includes('Open Our Memories →'), true);

  // Single photo slideshow requirements (Previous, Next, Counter)
  assert.equal(memoryAlbumSrc.includes('Memory {currentIndex + 1} of {totalPhotos}'), true);
  assert.equal(memoryAlbumSrc.includes('Previous'), true);
  assert.equal(memoryAlbumSrc.includes('Next Memory'), true);

  // Final page requirements
  assert.equal(memoryAlbumSrc.includes('Every memory with you is special ♡'), true);
  assert.equal(memoryAlbumSrc.includes('Read My Love Letter →'), true);

  // Verify universeData has exactly 10 photos and no placeholder cards
  const universeDataSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/config/universeData.ts'),
    'utf8'
  );
  for (let i = 1; i <= 10; i++) {
    assert.equal(universeDataSrc.includes(`id: 'mem-${i}'`), true);
  }
  assert.equal(universeDataSrc.includes('Ek hi chhatri ke neeche'), true);
  assert.equal(universeDataSrc.includes('Aapko paakar laga, ab aur kya maangoon khuda se'), true);
  assert.equal(universeDataSrc.includes('Main hamesha aapka tha, aapka hoon aur hamesha aapka hi rahunga. I promise. 🫂❤️'), true);
  assert.equal(universeDataSrc.includes('Friends to Partner'), false);
  assert.equal(universeDataSrc.includes('Matching Outfits'), false);
  assert.equal(universeDataSrc.includes('Forever Us'), false);
  assert.equal(universeDataSrc.includes('Our Special World'), false);
});

test('Phase 22: AmbientMusicController manages single audio instance across unlock, Memories, recording suppression, Love Letter, and Cake cutting', async () => {
  let createdInstances = 0;

  class MockAudio {
    src = '';
    loop = false;
    volume = 1;
    preload = '';
    currentTime = 0;
    duration = 240;
    paused = true;

    constructor() {
      createdInstances += 1;
    }

    addEventListener() {}

    async play() {
      this.paused = false;
    }

    pause() {
      this.paused = true;
    }
  }

  const g = globalThis as unknown as Record<string, unknown>;
  g.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  g.Audio = MockAudio;

  const { ambientMusic } = await import('./ambientMusic.ts');

  // 1. Before password unlock, music is not playing
  assert.equal(ambientMusic.getState().hasUnlocked, false);
  assert.equal(ambientMusic.getState().isPlaying, false);

  // 2. Password 0903 unlock -> starts A Thousand Years
  ambientMusic.initAndPlay();
  let state = ambientMusic.getState();
  assert.equal(state.hasUnlocked, true);
  assert.equal(state.isPlaying, true);
  assert.equal(state.currentTrackId, 'opening');
  assert.equal(state.currentTrackTitle, 'A Thousand Years');
  assert.equal(createdInstances, 1);

  // Simulate playback advancing to 35s, then navigate to Memories
  const internalAudio = (ambientMusic as unknown as { audio: MockAudio }).audio;
  internalAudio.currentTime = 35;
  await ambientMusic.syncScene('scene-memory-album');
  assert.equal(ambientMusic.getState().currentTrackId, 'opening');
  assert.equal(internalAudio.currentTime, 35); // Did not restart!
  assert.equal(createdInstances, 1);

  // 3. Personal singing recording starts -> pauses background track, preserves position
  internalAudio.currentTime = 48;
  ambientMusic.setSuppressed(true);
  assert.equal(internalAudio.paused, true);
  assert.equal(ambientMusic.getState().isPlaying, false);

  // Personal singing recording ends -> resumes A Thousand Years from 48s
  ambientMusic.setSuppressed(false);
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(internalAudio.paused, false);
  assert.equal(internalAudio.currentTime, 48);
  assert.equal(ambientMusic.getState().currentTrackId, 'opening');

  // 4. Navigate from Memories to Love Letter book -> A Thousand Years continues on cover
  internalAudio.currentTime = 52;
  await ambientMusic.syncScene('scene-3-love-letter');
  assert.equal(ambientMusic.getState().currentTrackId, 'opening');
  assert.equal(internalAudio.currentTime, 52);

  // Opening the Love Letter book pauses A Thousand Years and plays Darasal Raabta from beginning (0s)
  await ambientMusic.triggerLoveLetterOpen();
  state = ambientMusic.getState();
  assert.equal(state.currentTrackId, 'letter');
  assert.equal(state.currentTrackTitle, 'Darasal Raabta');
  assert.equal(internalAudio.src, '/Darasal Raabta 320 Kbps.mp3');
  assert.equal(internalAudio.currentTime, 0);
  assert.equal(internalAudio.paused, false);

  // 5. Navigate to Cake Cutting -> pauses Darasal and plays Perfect by Ed Sheeran from beginning (0s)
  internalAudio.currentTime = 25;
  await ambientMusic.syncScene('scene-6-birthday-invitation');
  state = ambientMusic.getState();
  assert.equal(state.currentTrackId, 'cake');
  assert.equal(state.currentTrackTitle, 'Perfect');
  assert.equal(internalAudio.src, '/Perfect - Ed Sheeran.mp3');
  assert.equal(internalAudio.currentTime, 0);
  assert.equal(internalAudio.paused, false);

  // Cake cutting interaction continues Perfect without restarting
  internalAudio.currentTime = 14;
  await ambientMusic.triggerCakeCut();
  assert.equal(ambientMusic.getState().currentTrackId, 'cake');
  assert.equal(internalAudio.currentTime, 14); // seamless, didn't reset!
  assert.equal(internalAudio.paused, false);
  assert.equal(ambientMusic.getState().isPlaying, true);

  const pauseRes = await ambientMusic.togglePlaybackFromGesture();
  assert.equal(pauseRes.isPlaying, false);
  assert.equal(pauseRes.isMuted, true);
  assert.equal(internalAudio.paused, true);

  const playRes = await ambientMusic.togglePlaybackFromGesture();
  assert.equal(playRes.isPlaying, true);
  assert.equal(playRes.isMuted, false);
  assert.equal(internalAudio.paused, false);
  assert.equal(internalAudio.volume, 0.75);
});



