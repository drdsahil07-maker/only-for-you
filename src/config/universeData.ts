import memory01 from '../../memory-01.jpg.png';
import memory02 from '../../memory-02.jpg.png';
import memory03 from '../../memory-03.jpg.png';
import memory04 from '../../memory-04.jpg.png';
import memory05 from '../../memory-05.jpg.png';
import memory06 from '../../memory-06.jpg.png';
import memory07 from '../../memory-07.jpg.png';
import memory08 from '../../memory-08.jpg.png';
import memory09 from '../../memory-09.jpg.png';
import memory10 from '../../memory-10.jpg.png';

export type SceneId =
  | 'scene-1-intro'
  | 'scene-memory-album'
  | 'scene-music-video'
  | 'scene-5-gift-collection'
  | 'scene-3-love-letter'
  | 'scene-6-birthday-invitation';

export interface MemoryAlbumPolaroid {
  id: string;
  title?: string;
  caption?: string;
  dateTag?: string;
  poem?: string;
  aspectVariant: 'portrait' | 'landscape' | 'square';
  cardStyle?: 'polaroid' | 'scrapbook-paper';
  paperTint?: 'cream' | 'blush' | 'rose-parchment';
  rotationDeg: number;
  tapeStyle: 'rose' | 'lavender' | 'peach' | 'cream';
  stickerType: 'heart' | 'bow' | 'sparkle' | 'star' | 'pressed-flower';
  illustrationVariant: 'chat-stars' | 'rain-umbrella' | 'warm-embrace' | 'evening-scooty' | 'birthday-wish';
  isFeatured?: boolean;
  spreadSide?: 'left' | 'right';
  /**
   * Original scrapbook image asset path (preserved completely with object-fit: contain).
   */
  imageUrl: string;
}

export interface SongTrackItem {
  id: string;
  title: string;
  artist: string;
  slotLabel: string;
  subtitle: string;
  durationLabel: string;
  dedication?: string;
  mediaType?: 'audio' | 'video';
  isPersonalRecording?: boolean;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  artworkVariant: 'cassette-bloom' | 'vinyl-rose' | 'piano-dream' | 'guitar-sunset' | 'music-box-star';
  audioUrl?: string;
  coverImageUrl?: string;
}

export interface VideoKeepsakeItem {
  id: string;
  title: string;
  subtitle: string;
  durationLabel?: string;
  dedication?: string;
  posterVariant?: 'starlight-reel' | 'acoustic-session';
  /**
   * Supply your local video file path (e.g. '/recordings/song-1.mp4') or valid video URL here when ready.
   */
  videoUrl?: string;
  /**
   * Supply your local audio file path (e.g. '/recordings/song-1.mp3') or valid audio URL here when ready.
   */
  audioUrl?: string;
  /**
   * Supply an optional custom thumbnail/poster image URL here when ready.
   */
  posterImageUrl?: string;
}

export interface GiftBoxExperience {
  id: 'song' | 'memory-box' | 'letter' | 'last-surprise';
  title: string;
  shapeVariant: 'tall-ribbon' | 'treasure-chest' | 'sealed-parcel' | 'starlight-round';
  ribbonColor: string;
  boxColor: string;
  lidColor: string;
  pedestalTint: string;
}

export interface SlideshowSlide {
  id: string;
  title: string;
  themeColor: string;
}

export const SCENE_META: {
  id: SceneId;
  label: string;
  icon: 'home' | 'gallery' | 'music' | 'letter' | 'gift';
}[] = [
  { id: 'scene-1-intro', label: 'Birthday', icon: 'home' },
  { id: 'scene-memory-album', label: 'Memories', icon: 'gallery' },
  { id: 'scene-6-birthday-invitation', label: 'Cake', icon: 'gift' },
  { id: 'scene-3-love-letter', label: 'Letter', icon: 'letter' },
  { id: 'scene-5-gift-collection', label: 'Surprise', icon: 'music' },
];

export const UNIVERSE_CONFIG = {
  project: {
    name: 'A Little World Made Just for You',
    tagline: 'Happy 20th Birthday, Baby!',
    welcomeDateDisplay: '09 NOVEMBER 2026',
    footerDateDisplay: '09.11.2026',
    targetDateIso: '2026-11-09T00:00:00',
  },
  scene1Intro: {
    welcomeBadge: 'HAPPY 20TH BIRTHDAY ♡',
    titleMain: 'Happy 20th Birthday,',
    titleAccent: 'Baby! ♡',
    titleCaps: 'A LITTLE WORLD MADE JUST FOR YOU',
    polaroidQuote: 'You Make This World So Special ♡',
    favouritePersonNote: 'My Favourite Person ♡',
    paperNote: 'Here’s a little world of all the things I love about you ♡',
    subtitleLines: ['A little world made', 'just for you ♡'],
    subtitle:
      'A romantic birthday journey through our favourite memories, songs from my heart, a 20-page love letter, your birthday cake, and a special final surprise made just for you.',
    buttonText: 'Continue to Our Memories →',
    topTapeNote: 'Every little thing about you feels special ♡',
    quoteNote: 'Some feelings are better written than said ♡',
  },
  homeCards: [
    {
      id: 'memories',
      sceneId: 'scene-memory-album' as SceneId,
      title: 'Our Memories',
      subtitle: '10 special memories in one place',
      illustration: 'photo',
      badge: '10 moments',
    },
    {
      id: 'songs',
      sceneId: 'scene-music-video' as SceneId,
      title: 'My Songs',
      subtitle: 'Songs I sang just for you',
      illustration: 'guitar',
      badge: '4 songs',
    },
    {
      id: 'letter',
      sceneId: 'scene-3-love-letter' as SceneId,
      title: 'A Letter',
      subtitle: 'A few words from my heart',
      illustration: 'letter',
      badge: 'For you',
    },
    {
      id: 'surprise',
      sceneId: 'scene-6-birthday-invitation' as SceneId,
      title: 'Birthday Cake',
      subtitle: 'Make a wish and cut your cake',
      illustration: 'gift',
      badge: 'Celebration',
    },
  ],
  scene3LoveLetter: {
    heading: 'A letter for you',
    nextButtonText: 'One More Surprise for You ♡',
    letterText: `**Meri Baby, Meri Wifeyyy, Meri Cuitie, Meri Betuuu… Meri Duniya. 🎀❤️**

Pata hai baby, main jab bhi aapke liye kuch likhne baithta hoon na, toh samajh hi nahi aata ki shuru kahan se karun. Dil mein itni saari baatein hain aapke liye ki words kam pad jaate hain. Kabhi-kabhi bas mann karta hai ki aap mere dil ke andar ek baar dekh lo, phir shayad aapko samajh aaye ki aap mere liye kitni special hain… kitni zyada. 🥹💗

---

Aap sirf meri favourite person nahi hain, aap meri woh feeling hain jise main kisi ek word mein explain hi nahi kar sakta. Aapka hona, aapse baatein karna, aapko dekhna, aapki awaaz sunna… pata nahi kyun, par aapki chhoti-chhoti baatein bhi mere dil ko itna sukoon deti hain.

Kabhi sochta hoon ki aakhir aap mein aisa kya hai jo mujhe baar-baar aapke paas le aata hai, aur phir yaad aata hai… **aap bas aap hain, aur mere liye aapse zyada pyaara kuch nahi.** ❤️

---

Aapko pata hai, mujhe aapki kaunsi baatein sabse zyada pasand hain?

Aapka baat-baat par muh ghuma lena, mujhse ruth jaana, phir meri baaton ka jawab sirf “hmm… hmm” mein dena. 😂💗 Aapka woh cute sa gussa, woh nakhre, woh mujhe manwane ke liye chup ho jaana… aur phir thodi der baad khud hi pyaar se baat karna.

Pata hai, main kabhi-kabhi aapko manate hue pareshan zaroor karta hoon, par sach kahun toh aapke ye saare nakhre mere liye duniya ki sabse pyaari cheezon mein se hain.

Aur aapka aankhon se darna… 🥹❤️ pata nahi aapko khud realise hota hai ya nahi, par aapki aisi chhoti-chhoti harkatein mujhe kitni cute lagti hain.

---

Kabhi aapki sharam, kabhi aapka nazrein chura lena, kabhi meri taraf dekhkar phir muh ghuma lena… baby, main kaise samjhaun ki ye sab dekhkar mere face par apne aap smile aa jaati hai?

Aapko shayad normal lagta hoga, par mere liye ye woh little moments hain jinhe main apne dil mein sambhal kar rakhna chahta hoon. 🎀

---

Aur jab aap mujhse ruth kar “hmm hmm” karti hain na, toh mann karta hai bas aapko pyaar se manaun, aapki saari narazgi door kar doon aur aap phir se apni cute si baatein karne lago.

Aapko pata hai, aapke nakhre bhi mujhe pyaare lagte hain aur aapka maan jaana bhi. Mujhe aapka har woh roop pasand hai jo aap mere saamne bina kisi darr ke dikhati hain. 🫶🏻

---

Aur meri jaan, aapka pyaar se mujhe dher saari kisses dena… uff! ❤️😭 Pata nahi aapko andaaza bhi hai ya nahi ki uss waqt main kitna khush ho jaata hoon.

Aapka itne pyaar se mere paas aana, mujhe kiss karna, apne pyaar se mujhe bilkul special feel karwana… baby, mere liye woh sirf kisses nahi hoti, woh aapka pyaar hota hai jo main feel kar paata hoon. Kabhi-kabhi lagta hai duniya ki saari tension side mein rakh doon aur bas aapke saath uss moment mein reh jaun.

---

**Par aapki ek baat hai jo mujhe sabse zyada pyaari lagti hai…**

Jab aap mere saamne ek chhoti si bachchi ban jaati hain. 🥹💗 Jab aap bina soche-samjhe apni cute si harkatein karti hain, bachchon ki tarah ruth jaati hain, nakhre karti hain, pyaar maangti hain, mujhe pareshan karti hain aur phir khud hi itna pyaar dene lagti hain ki main sab bhool jaata hoon.

Mujhe aapka woh version sabse zyada pasand hai jo shayad duniya ke saamne nahi, par mere saamne khul kar aata hai.

---

Baby, meri aapse ek chhoti si request hai… 🥺❤️

**Please, mere saamne hamesha aise hi khul kar bachchi bankar raha kariye.**

Aapko mere saamne mature banne ki, har waqt strong dikhne ki ya apni cute harkaton ko rokne ki koi zaroorat nahi hai. Aapka mann kare toh bachchon ki tarah baatein kariye, nakhre kariye, ruth jaiye, muh ghuma lijiye, “hmm hmm” kariye, pyaar maangiye, khul kar hansiye… jo bhi aapka mann kare, kariye. Aapko kabhi ye sochne ki zaroorat nahi ki main kya sochunga.

---

Mujhe aapki ye harkatein sach mein sabse zyada achhi lagti hain. Inhi mein mujhe aapka woh pyaara sa dil dikhta hai jo mere saamne bina kisi jhijhak ke apna bachpana jee paata hai.

Aur pata hai, jab aap aise hoti hain na, mujhe bahut sukoon milta hai. Aisa lagta hai ki aap mere saath comfortable hain, mujh par bharosa karti hain aur apne dil ki har chhoti-badi feeling mere saamne rakh sakti hain.

---

Main chahta hoon ki aap mere saamne sirf pyaar hi nahi, apni har feeling bhi khul kar dikha sakein. Khushi ho, gussa ho, rona ho, bachpana ho ya bina wajah ki koi cute si baat… aapko kuch chhupane ki zaroorat nahi hai.

Main chahta hoon ki humare rishte mein aapko hamesha apna asli self rehne ki jagah mile. **Aapko badalne ki nahi, aapko samajhne ki koshish karna chahta hoon.** 🤍

---

Baby, mujhe nahi pata ki main aapko har baar perfectly samajh paunga ya nahi, par main aapko samajhne ki koshish hamesha karna chahta hoon. Kabhi meri galti ho jaaye toh mujhe bata dena. Kabhi bura lage toh mujhse keh dena. Kabhi bas pyaar chahiye ho toh woh bhi maang lena.

Aapko mere saamne apni feelings ko chhota samajhne ki zaroorat nahi hai. Aapki har feeling mere liye important hai, kyunki aap mere liye important hain. ❤️

---

Aur meri betuuu, thank you. Sach mein, thank you so much. 🥹🫶🏻

**Thank you for being with me in every situation.** Mere achhe dino mein, mere difficult dino mein, jab main khush hota hoon, jab main pareshan hota hoon, jab main overthink karta hoon aur jab mujhe khud samajh nahi aata ki main kya feel kar raha hoon… thank you for being there.

Thank you for listening to me, mujhe apna samajhne ke liye, mujhe pyaar dene ke liye aur meri life ka itna important hissa banne ke liye.

---

Ho sakta hai main har baar words mein express na kar paun ki aap mere liye kya hain. Ho sakta hai kabhi main apni feelings theek se bata na paun. Par please kabhi ye mat sochiyega ki aapka pyaar mere liye chhoti si baat hai.

Aapka pyaar mere liye bahut zyada important hai. Aapka thoda sa time, aapki ek smile, aapka pyaar se baat karna, aapka mujhe yaad karna… main in sab cheezon ko dil se feel karta hoon.

---

Aapne mujhe ye ehsaas dilaya hai ki kisi ka hona bhi kitni badi khushi ho sakti hai. Kisi ka message aane ka intezaar karna, kisi ki awaaz sun kar smile karna, kisi ki chhoti si baat ko poore din yaad rakhna… aapke saath ye sab feelings aur bhi special ho gayi hain. Aur main in sab ke liye dil se thankful hoon. ❤️

Mujhe humari story bhi bahut pyaari lagti hai. Pehle baatein, phir friendship, phir dheere-dheere ek doosre ka itna important ban jaana… aur phir 9 March 2026 ko humara relationship mein aana. Kabhi-kabhi sochta hoon ki kitni saari chhoti-chhoti baatein milkar humein yahan tak laayi hain. Aur phir mann karta hai ki hum aage bhi aise hi bahut saari memories banayein.

---

Mujhe humari first meeting yaad aati hai, woh pond, woh baarish, woh walk aur aapka mere saamne hona. Kuch moments aise hote hain na baby, jo chahe kitna bhi waqt beet jaaye, dil mein waise hi fresh rehte hain. Mere liye woh unhi moments mein se ek hai. Main chahta hoon ki aage bhi humari life mein aise bahut saare din aayein jinhe yaad karke hum dono smile karein. 🌧️🤍

---

Haan, distance kabhi-kabhi bahut annoying lagta hai. Mann karta hai ki jab aapko hug chahiye ho toh main bas aapke paas aa jaun. Jab aap ruth jaayein toh saamne baithkar aapko manaun. Jab aapki aankhon mein dekhna ho toh screen ke through nahi, sach mein aapke saamne rahun. Jab aap pyaar se dher saari kisses dein toh main bas aapko paas se dekh kar smile karta rahun. 🫂❤️

Par abhi hum jitna saath hain, main uss saath ko bhi dil se value karta hoon. Main chahta hoon ki hum dheere-dheere, pyaar se aur samajhdaari ke saath apni story aage badhayein. Har din perfect ho, ye zaroori nahi. Bas hum dono ek doosre ko samajhne ki koshish karte rahein, ek doosre ki khushi ka khayal rakhein aur apne rishte ko pyaar se sambhalte rahein.

---

**Aur ab meri birthday girl… meri jaan… HAPPY BIRTHDAY! 🎂🎀❤️**

Kaash aaj main aapke saamne hota. Kaash aapke birthday par sabse pehle aapko hug kar paata, aapke face par woh pyaari si smile dekh paata aur aapko bata paata ki aapka hona mere liye kitni badi khushi hai.

Aaj main aapke liye bas itna chahta hoon ki aap bahut khush rahein. Aapke dreams poore hon, aapko life mein bahut saari achhi cheezein milein, aap khud par proud feel karein aur aapko kabhi apni value par doubt na ho. Aap jitni pyaari doosron ko lagti hain, utna hi pyaar aap khud ko bhi dena seekhein.

---

Jab aap thak jaayein, aaram kariye. Jab mann udaas ho, apni feelings ko samajhne ke liye waqt lijiye. Jab khushi mile, use khul kar jeeyein. Aur jab bachchi banne ka mann kare na, toh please mere saamne bilkul mat rukiyega. 😂💗 Mujhe aapki woh cute si harkatein dekhkar sach mein bahut sukoon milta hai.

Aap meri favourite notification hain, meri favourite smile ki wajah hain, meri favourite person hain aur meri favourite headache bhi. 😂❤️ Aapke nakhre, aapka ruthna, aapka pyaar, aapki sharam, aapki bachchon wali harkatein… ye sab milkar aapko woh banate hain jisse main itna pyaar karta hoon.

Mujhe nahi chahiye ki aap mere liye perfect banein. Mujhe bas aap chahiye, apni saari cute habits ke saath, apni saari feelings ke saath, apne dreams aur apne asli self ke saath.

---

Aur agar kabhi aap mujhse poochhein ki aap mere liye kya hain, toh main shayad phir bhi words mein poora jawab na de paun. Bas itna keh paunga ki aap woh insaan hain jinke hone se meri life mein ek alag si warmth hai. Aap woh hain jinse baat karke mann halka hota hai, jinhe dekhkar smile aa jaati hai aur jinke saath main apni duniya ki chhoti-chhoti khushiyan share karna chahta hoon.

**Aapka pyaar mere liye bahut zyada hai, baby.** Aur main chahta hoon ki aap bhi mere saath utna hi safe, loved aur comfortable feel karein jitna main aapke saath karta hoon. Main aapko sirf pyaar karna nahi, aapke pyaar ki kadar karna bhi chahta hoon. ❤️

Happy Birthday, meri baby.  
Happy Birthday, meri wifeyyy.  
Happy Birthday, meri cuitie.  
Happy Birthday, meri betuuu.  
Happy Birthday, meri duniya. 🎂💗

---

Thank you for being you.  
Thank you for being with me in every situation.  
Thank you for giving me so much love.  
Aur sabse zyada, thank you for meri life mein aane ke liye.

**Aap aise hi rehna, meri jaan.** Apni cute si harkaton ke saath, apne pyaare se bachpane ke saath, apni smile aur apne dil ke saath. Mere saamne hamesha khul kar apni tarah rehna, kyunki aapka woh asli, pyaara sa version mere dil ke sabse kareeb hai.

I love you so, so much, meri baby. 🥹❤️🧿

**Forever aapka baby,**  
jo aapko dekhkar aaj bhi smile kar deta hai,  
aur jo chahta hai ki aapko hamesha ye yaad rahe…

**Aap bahut pyaari hain. Aap bahut important hain. Aur aapka hona mere liye bahut special hai.** 💌❤️`,
  },
  sceneMemoryAlbum: {
    heading: 'Our Memory Gallery',
    coverSubtitle: 'Keepsake Moments of Us',
    continueButtonText: 'Continue to Birthday Cake ♡',
    polaroids: [
      {
        id: 'mem-1',
        title: 'Our First Meet 🌧️',
        caption: 'Our First Meet 🌧️',
        poem: 'Ek hi chhatri ke neeche woh pehli mulaqaat,\nRimjhim si baarish aur darta hua mera haath.\nPata nahi tha tab ki jo dost bankar mil rahi hai,\nWahi ek din meri poori zindagi ban jaayegi. 🌧️🤍',
        aspectVariant: 'portrait',
        cardStyle: 'polaroid',
        paperTint: 'cream',
        rotationDeg: -1.4,
        tapeStyle: 'rose',
        stickerType: 'pressed-flower',
        illustrationVariant: 'chat-stars',
        imageUrl: memory01,
      },
      {
        id: 'mem-2',
        title: 'Our Friendship Days ❤️',
        caption: 'Our Friendship Days ❤️',
        poem: 'College ke raaste par achanak aapka dikh jaana,\nAur meri din bhar ki thakaan ka pal bhar mein mit jaana.\nWoh chupke se baatein, woh thodi sharam aur ghabrahat,\nAaj bhi bahut yaad aati hai humari woh masoom si dosti. ❤️',
        aspectVariant: 'landscape',
        cardStyle: 'scrapbook-paper',
        paperTint: 'blush',
        rotationDeg: 1.2,
        tapeStyle: 'cream',
        stickerType: 'bow',
        illustrationVariant: 'rain-umbrella',
        imageUrl: memory02,
      },
      {
        id: 'mem-3',
        title: 'Our Long-Distance World 🌙',
        caption: 'Our Long-Distance World 🌙',
        poem: 'Meelon ki doori thi, par humne screen par apna aashiyana bana liya,\nSaath mein movie dekhna, khana khana, aur aapka call par hi so jaana.\nWoh jhagde aur phir video call par hi aapka maan jaana,\nUs ek screen ne humare darmiyaan ke faasle ko hamesha ke liye mita diya. 🌙✨',
        aspectVariant: 'portrait',
        cardStyle: 'polaroid',
        paperTint: 'rose-parchment',
        rotationDeg: -1.1,
        tapeStyle: 'lavender',
        stickerType: 'heart',
        illustrationVariant: 'warm-embrace',
        imageUrl: memory03,
      },
      {
        id: 'mem-4',
        title: '22 June 2026 ❤️',
        caption: '22 June 2026 ❤️',
        poem: 'Dosti se aage badhkar jab humne ek naya safar chuna,\nPehli baar saamne baithkar aapse dil ka haal kaha.\nWoh pehla "I Love You", woh humara pehla kiss,\n22 June 2026 hamesha ke liye meri rooh mein bas gaya. 🥹💋',
        aspectVariant: 'square',
        cardStyle: 'scrapbook-paper',
        paperTint: 'cream',
        rotationDeg: 1.5,
        tapeStyle: 'peach',
        stickerType: 'pressed-flower',
        illustrationVariant: 'warm-embrace',
        imageUrl: memory04,
      },
      {
        id: 'mem-5',
        title: 'An Unexpected Matching 💍',
        caption: 'An Unexpected Matching 💍',
        poem: 'Bina plan kiye humara woh matching outfits pehen lena,\nKismat ka bhi humare pyaar par muskura dena.\nUs din aapne mujhe woh pyaari si ring di thi…\nSorry, bacha, maine us ring ka us waqt dhyan nahi diya,\nPar aapki di hui har cheez mere dil ke sabse kareeb hai. 💍🤍',
        aspectVariant: 'portrait',
        cardStyle: 'polaroid',
        paperTint: 'blush',
        rotationDeg: -0.9,
        tapeStyle: 'rose',
        stickerType: 'sparkle',
        illustrationVariant: 'evening-scooty',
        imageUrl: memory05,
      },
      {
        id: 'mem-6',
        title: 'Aapko Paakar Sab Kuch Paa Liya 🥹',
        caption: 'Aapko Paakar Sab Kuch Paa Liya 🥹',
        poem: 'Aapko paakar laga, ab aur kya maangoon khuda se,\nJaise meri har adhoori khwahish poori ho gayi aapse.\nNa kisi aur cheez ki chahat, na koi aur armaan,\nAap saath ho toh lagta hai, mil gaya mujhe mera poora jahaan. 🥹❤️',
        aspectVariant: 'landscape',
        cardStyle: 'scrapbook-paper',
        paperTint: 'rose-parchment',
        rotationDeg: 1.3,
        tapeStyle: 'cream',
        stickerType: 'bow',
        illustrationVariant: 'chat-stars',
        imageUrl: memory06,
      },
      {
        id: 'mem-7',
        title: 'The Day Time Stood Still ⏳',
        caption: 'The Day Time Stood Still ⏳',
        poem: 'Woh din jab main aapke saath tha, sab kuch tham sa gaya tha,\nDuniya ki saari daud bhoolkar bas ek sukoon sa mil gaya tha.\nDil chahta tha ki waqt ki sui yahin ruk jaaye,\nKyunki aapke paas hone ke baad, mujhe aur kuch nahi chahiye tha. ⏳🕊️',
        aspectVariant: 'portrait',
        cardStyle: 'polaroid',
        paperTint: 'cream',
        rotationDeg: -1.5,
        tapeStyle: 'lavender',
        stickerType: 'heart',
        illustrationVariant: 'rain-umbrella',
        imageUrl: memory07,
      },
      {
        id: 'mem-8',
        title: 'A Kiss to Remember 💋',
        caption: 'A Kiss to Remember 💋',
        poem: 'Aapke ghar aana aur woh meethi si mulaqaat,\nAapka pyaar se kareeb aana aur woh pyara sa kiss.\nBina kisi shor ke, bas do dilon ka sukoon,\nYeh lamha hamesha mere dil mein zinda rahega. 💋❤️',
        aspectVariant: 'square',
        cardStyle: 'scrapbook-paper',
        paperTint: 'blush',
        rotationDeg: 1.1,
        tapeStyle: 'peach',
        stickerType: 'pressed-flower',
        illustrationVariant: 'evening-scooty',
        imageUrl: memory08,
      },
      {
        id: 'mem-9',
        title: '',
        caption: '',
        poem: '',
        aspectVariant: 'portrait',
        cardStyle: 'polaroid',
        paperTint: 'rose-parchment',
        rotationDeg: -1.2,
        tapeStyle: 'rose',
        stickerType: 'star',
        illustrationVariant: 'birthday-wish',
        imageUrl: memory09,
      },
      {
        id: 'mem-10',
        title: '22 July 2026 | Our Last Hug 🫂',
        caption: '22 July 2026 | Our Last Hug 🫂',
        poem: '22 July 2026… kaash mujhe pata hota ki woh humara aakhri hug tha.\nAgar pata hota na baby, toh thodi der aur kass ke pakad leta,\nAapke gale lagkar thoda aur ro leta, aur apne dil ka saara dard keh deta.\n\nAapki yaad hamesha mere saath rahegi, baby…\n\nWoh hug meri zindagi ki sabse special memories mein se ek rahega.\n\nAur ek baat hamesha yaad rakhiyega,\n\nMain hamesha aapka tha, aapka hoon aur hamesha aapka hi rahunga. I promise. 🫂❤️',
        aspectVariant: 'portrait',
        cardStyle: 'scrapbook-paper',
        paperTint: 'cream',
        rotationDeg: 1.3,
        tapeStyle: 'peach',
        stickerType: 'heart',
        illustrationVariant: 'warm-embrace',
        imageUrl: memory10,
      },
    ] as MemoryAlbumPolaroid[],
  },
  sceneMusic: {
    heading: 'A Special Message for You ♡',
    subtitle: 'Something from my heart, made just for you.',
    continueButtonText: 'Return to Our Memories ♡',
    videos: [
      {
        id: 'personal-video',
        title: 'A Special Message for You ♡',
        subtitle: 'Something from my heart, made just for you.',
        dedication: 'Recorded with all my love, just for you.',
        posterVariant: 'starlight-reel',
        videoUrl: '', // Add uploaded recording file path when ready
        audioUrl: '',
        posterImageUrl: '',
      },
    ] as VideoKeepsakeItem[],
  },
  scene5Gifts: {
    headline: 'For You',
    continueToInviteButton: 'Continue to Birthday Celebration →',
    gifts: [
      {
        id: 'song',
        title: 'A Song From Me',
        shapeVariant: 'tall-ribbon',
        ribbonColor: '#D98AA7',
        boxColor: '#F9DCE5',
        lidColor: '#F3C4D3',
        pedestalTint: 'from-[#FFF9FB] via-[#FCEBF1] to-[#F9DCE5]/70',
      },
      {
        id: 'memory-box',
        title: 'Our Memory Box',
        shapeVariant: 'treasure-chest',
        ribbonColor: '#9B7EDE',
        boxColor: '#E8DDF8',
        lidColor: '#D9C7F3',
        pedestalTint: 'from-[#FCFAFF] via-[#F2EAFC] to-[#E8DDF8]/75',
      },
      {
        id: 'letter',
        title: 'A Letter for You',
        shapeVariant: 'sealed-parcel',
        ribbonColor: '#E29578',
        boxColor: '#FFE5D9',
        lidColor: '#FCD5C5',
        pedestalTint: 'from-[#FFFCF9] via-[#FFF1E8] to-[#FFE5D9]/75',
      },
      {
        id: 'last-surprise',
        title: 'One Last Surprise',
        shapeVariant: 'starlight-round',
        ribbonColor: '#C87898',
        boxColor: '#FFF3EC',
        lidColor: '#F9DCE5',
        pedestalTint: 'from-[#FFFDFB] via-[#FCEFF4] to-[#E8DDF8]/65',
      },
    ] as GiftBoxExperience[],
    songSlideshowPlaceholders: [
      {
        id: 'slide-1',
        title: 'Moment I',
        themeColor: '#F9DCE5',
      },
      {
        id: 'slide-2',
        title: 'Moment II',
        themeColor: '#E8DDF8',
      },
      {
        id: 'slide-3',
        title: 'Moment III',
        themeColor: '#FFE5D9',
      },
    ] as SlideshowSlide[],
  },
  scene6Invitation: {
    heading: 'A Little Birthday Magic ♡',
    invitation: 'Make a wish, baby…',
    dateBadge: 'November 9, 2026',
    wishHeading: 'A Little Wish From My Heart ♡',
    /**
     * Supply your personal birthday wish text here when ready.
     * Paragraph breaks (\n\n) and line breaks (\n) are preserved verbatim.
     * When empty, a beautiful sealed keepsake card is displayed with the heading.
     */
    birthdayWishText: '',
  },
  backgroundMusic: {
    defaultVolume: 0.75,
    defaultTrackId: 'opening',
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
  },
};
