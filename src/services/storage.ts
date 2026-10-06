import {
  CoupleSpace,
  ChatMessage,
  TicTacToeState,
  Connect4State,
  QuizQuestion,
  MemoryItem,
  DailyChallenge,
  DailyChallengeState,
  CoupleProject,
  RelationshipCheckIn,
  PactRule,
  DeepLetter,
  OchoGameState,
  GalleryMediaItem,
} from '../types';

/**
 * ARCHITECTURE FOR FIREBASE INTEGRATION:
 * -------------------------------------
 * This storage service is designed to be swapped cleanly with Firebase Firestore & Auth:
 * - Couples: doc(firestore, 'couples', spaceCode)
 * - Messages: collection(firestore, `couples/${spaceCode}/messages`)
 * - Games: doc(firestore, `couples/${spaceCode}/games`, gameId)
 * - Memories: collection(firestore, `couples/${spaceCode}/memories`)
 *
 * In this current v1 release, we provide:
 * 1. Safe localStorage persistence
 * 2. Cross-tab real-time sync using BroadcastChannel (open 2 browser tabs to experience instant two-partner sync)
 * 3. Clear simulated partner reactions and state updates
 */

const STORAGE_KEY_SPACE = 'loveplay_space_v1';
const STORAGE_KEY_MESSAGES = 'loveplay_messages_v1';
const STORAGE_KEY_TICTACTOE = 'loveplay_tictactoe_v1';
const STORAGE_KEY_CONNECT4 = 'loveplay_connect4_v1';
const STORAGE_KEY_QUIZ = 'loveplay_quiz_v1';
const STORAGE_KEY_MEMORIES = 'loveplay_memories_v1';
const STORAGE_KEY_ACTIVE_USER = 'loveplay_active_user_v1';
const STORAGE_KEY_DAILY_CHALLENGE = 'loveplay_daily_challenge_v1';
const STORAGE_KEY_PROJECTS = 'loveplay_projects_v1';
const STORAGE_KEY_CHECKINS = 'loveplay_checkins_v1';
const STORAGE_KEY_PACT = 'loveplay_pact_v1';
const STORAGE_KEY_LETTERS = 'loveplay_letters_v1';
const STORAGE_KEY_OCHO = 'loveplay_ocho_v1';
const STORAGE_KEY_GALLERY = 'loveplay_gallery_v1';

export const ROMANTIC_DAILY_CHALLENGES: Omit<DailyChallenge, 'dateKey' | 'partner1Done' | 'partner2Done'>[] = [
  {
    id: 'ch_voice_memory',
    title: 'Le murmure d’un souvenir',
    description: 'Envoie une note vocale de 30 secondes racontant le moment précis où tu as su que tu tombais amoureux(se).',
    category: 'Voix & Murmures',
    icon: '🎙️',
  },
  {
    id: 'ch_snap_now',
    title: 'Ton regard là, tout de suite',
    description: 'Prends une photo spontanée sans filtre de ton visage ou de ta vue actuelle, et dis-moi ce que tu ferais si j’étais assis(e) à côté.',
    category: 'Photo spontanée',
    icon: '📸',
  },
  {
    id: 'ch_love_song',
    title: 'La mélodie qui te murmure mon nom',
    description: 'Partage dans notre chat la musique qui te fait le plus penser à nous aujourd’hui et écoutez-la au même moment.',
    category: 'Complicité',
    icon: '🎵',
  },
  {
    id: 'ch_touch_10s',
    title: 'Câlin longue distance',
    description: 'Ouvre le Toucher Simultané et pose ton doigt en pensant très fort à moi pendant au moins 15 secondes d’affilée.',
    category: 'Petite attention',
    icon: '🧸',
  },
  {
    id: 'ch_post_it',
    title: 'Mots d’amour sur papier',
    description: 'Écris 3 qualités qui te font fondre chez moi sur un petit mot manuscrit, prends-le en photo et glisse-le sous ton oreiller.',
    category: 'Mots doux',
    icon: '💌',
  },
  {
    id: 'ch_moon_look',
    title: 'Sous le même ciel',
    description: 'Regarde dehors en direction des nuages ou des étoiles et envoie un battement de cœur en sachant qu’on partage le même ciel.',
    category: 'Complicité',
    icon: '🌙',
  },
  {
    id: 'ch_reunion_wish',
    title: 'Les 5 premières minutes',
    description: 'Raconte-moi dans un mot doux ce que tu feras dans les 5 premières minutes dès qu’on se prendra dans les bras.',
    category: 'Mots doux',
    icon: '✈️',
  },
  {
    id: 'ch_outfit_love',
    title: 'Le détail que j’adore',
    description: 'Porte aujourd’hui le vêtement, parfum ou bijou que je préfère chez toi et envoie un petit clin d’œil en photo.',
    category: 'Petite attention',
    icon: '👗',
  },
  {
    id: 'ch_secret_dessert',
    title: 'La douceur partagée',
    description: 'Déguste une petite douceur (chocolat, café, viennoiserie) en imaginant qu’on la partage en tête-à-tête.',
    category: 'Petite attention',
    icon: '🥐',
  },
  {
    id: 'ch_three_reasons',
    title: 'Trois mercis d’amour',
    description: 'Écris 3 petites choses du quotidien que l’autre fait et qui illuminent tes journées à distance.',
    category: 'Mots doux',
    icon: '✨',
  },
  {
    id: 'ch_video_smile',
    title: 'Sourire volé',
    description: 'Envoie un sticker ou une photo avec ton plus grand sourire naturel pour illuminer la journée de ton amour.',
    category: 'Photo spontanée',
    icon: '🥰',
  },
  {
    id: 'ch_quiz_question',
    title: 'Devinette de couple',
    description: 'Pose une question intime ou insolite dans le Quiz amoureux ou le chat à laquelle seul(e) ton amour connaît la réponse.',
    category: 'Complicité',
    icon: '🔮',
  },
];

// Couple demo initial data
const DEFAULT_SPACE: CoupleSpace = {
  code: 'LOVE-7842',
  establishedDate: '2023-09-14',
  nextReunionDate: '2026-10-18', // In 2 weeks!
  distanceKm: 4070, // Burkina Faso <-> France
  partner1: {
    id: 'partner1',
    name: 'Moi',
    city: 'Ouagadougou (Burkina Faso)',
    timezone: 'Africa/Ouagadougou',
    avatarSeed: 'rose',
    status: 'Pense fort à toi depuis le Burkina 🇧🇫✨',
    lastActive: 'À l’instant',
    battery: 92,
  },
  partner2: {
    id: 'partner2',
    name: 'Mon amour',
    city: 'Paris (France)',
    timezone: 'Europe/Paris',
    avatarSeed: 'violet',
    status: 'Pense à toi depuis la France 🇫🇷💖',
    lastActive: 'Il y a 2 min',
    battery: 84,
  },
};

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'partner2',
    text: 'Bonjour mon ange ! Bien réveillée ? J’ai préparé mon café en pensant à ton sourire.',
    timestamp: Date.now() - 3600000 * 2,
    hasHeart: true,
  },
  {
    id: 'm2',
    senderId: 'partner1',
    text: 'Coucou mon amour 💕 Oui, ta voix me manque déjà tellement ce matin. Plus que 14 jours avant de te serrer dans mes bras !',
    timestamp: Date.now() - 3600000 * 1.5,
    hasHeart: true,
  },
  {
    id: 'm3',
    senderId: 'partner2',
    text: '14 petits jours... On se fait une partie de Puissance 4 ce midi ? Je veux ma revanche ! 😉',
    timestamp: Date.now() - 3600000 * 0.8,
    hasHeart: false,
  },
  {
    id: 'm4',
    senderId: 'partner1',
    text: 'Prépare-toi à perdre encore une fois alors ! Je t’aime fort.',
    timestamp: Date.now() - 3600000 * 0.5,
    hasHeart: true,
  },
];

const DEFAULT_TICTACTOE: TicTacToeState = {
  board: Array(9).fill(null),
  currentTurn: 'p1',
  winner: null,
  winningLine: null,
  scores: { p1: 3, p2: 2, draws: 1 },
};

const createEmptyConnect4Grid = (): Array<Array<'p1' | 'p2' | null>> =>
  Array(6).fill(null).map(() => Array(7).fill(null));

const DEFAULT_CONNECT4: Connect4State = {
  grid: createEmptyConnect4Grid(),
  currentTurn: 'p1',
  winner: null,
  winningCells: null,
  scores: { p1: 4, p2: 3 },
};

const DEFAULT_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Quel est ton souvenir préféré de notre premier voyage ensemble ?',
    category: 'Souvenirs',
    partner1Answer: 'Notre promenade sous la pluie tiède à Venise, quand on a partagé une seule glace pistache.',
    partner2Answer: 'Quand on s’est perdus dans les ruelles et qu’on riait aux éclats sans vouloir regarder la carte.',
    isRevealed: true,
  },
  {
    id: 'q2',
    question: 'Quel petit geste discret de l’autre te fait toujours chavirer le cœur ?',
    category: 'Complicité',
    partner1Answer: 'Quand tu me tires doucement vers toi pour embrasser mon front avant de dormir.',
    partner2Answer: 'Quand tu glisses ta main froide dans ma poche de manteau en hiver.',
    isRevealed: true,
  },
  {
    id: 'q3',
    question: 'Si on pouvait se téléporter ensemble là, tout de suite, où serions-nous ?',
    category: 'Futur',
    partner1Answer: 'Sur une plage déserte au crépuscule, juste tous les deux à écouter les vagues.',
    partner2Answer: 'Dans un petit chalet avec un feu de cheminée et toi blottie contre moi.',
    isRevealed: false,
  },
  {
    id: 'q4',
    question: 'Quelle est la chanson qui te rappelle immédiatement notre amour ?',
    category: 'Petits secrets',
    isRevealed: false,
  },
  {
    id: 'q5',
    question: 'Qu’est-ce qui te manque le plus quand on est séparés par la distance ?',
    category: 'Intimité',
    partner1Answer: 'Ton odeur sur mes draps et la chaleur de ta respiration la nuit.',
    isRevealed: false,
  },
  {
    id: 'q6',
    question: 'Quelle est la première chose qu’on fera à nos prochaines retrouvailles à l’aéroport ?',
    category: 'Futur',
    isRevealed: false,
  },
];

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem1',
    title: 'Coucher de soleil sur la plage',
    date: '18 Août 2024',
    location: 'Biarritz, France',
    note: 'Le vent dans tes cheveux, nos pieds dans le sable chaud. Tu m’as promis qu’on construirait notre vie ensemble.',
    imageUrl: '/src/assets/images/loveplay_memory_sunset_1791120165978.jpg',
  },
  {
    id: 'mem2',
    title: 'Notre premier rendez-vous timide',
    date: '14 Septembre 2023',
    location: 'Café de Flore, Paris',
    note: 'Trois heures à discuter sans voir le temps passer. J’ai su dès cette seconde que tu étais la bonne personne.',
    imageUrl: '/src/assets/images/loveplay_couple_art_1791120151244.jpg',
  },
  {
    id: 'mem3',
    title: 'Soirée film sous nos plaids à distance',
    date: '12 Décembre 2024',
    location: 'Appel vidéo Ouagadougou & Paris',
    note: 'On a lancé le film exactement à la même seconde. Tu t’es endormie avec la caméra allumée, le plus doux des spectacles.',
  },
];

export const DEFAULT_GALLERY_MEDIA: GalleryMediaItem[] = [
  {
    id: 'gal_1',
    type: 'photo',
    url: '/src/assets/images/loveplay_couple_art_1791120151244.jpg',
    title: 'Notre premier regard complice',
    caption: 'Ce moment magique où tout s’est éclairé dans nos yeux.',
    date: '14 Septembre 2024',
    location: 'Paris, France',
    addedBy: 'partner2',
    isFavorite: true,
    category: 'Retrouvailles',
  },
  {
    id: 'gal_2',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Un mot doux en direct pour toi 🎥',
    caption: 'Un bisou volé et un sourire envoyé à travers les kilomètres avant d’aller dormir.',
    date: '2 Octobre 2026',
    location: 'Appel Visio Ouagadougou 🇧🇫 & Paris 🇫🇷',
    addedBy: 'partner1',
    durationSeconds: 15,
    isFavorite: true,
    category: 'Visio & Quotidien',
  },
  {
    id: 'gal_3',
    type: 'photo',
    url: '/src/assets/images/loveplay_memory_sunset_1791120165978.jpg',
    title: 'Sous le même coucher de soleil 🌅',
    caption: '4 070 km entre le Burkina et la France, mais le même ciel chaleureux.',
    date: '28 Septembre 2026',
    location: 'Ouagadougou, Burkina Faso',
    addedBy: 'partner1',
    isFavorite: true,
    category: 'Moments tendres',
  },
  {
    id: 'gal_4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Balade en pensant à nous 🌿',
    caption: 'Je t’emmène avec moi dans chaque ruelle de ma journée.',
    date: '1 Octobre 2026',
    location: 'Paris, France',
    addedBy: 'partner2',
    durationSeconds: 15,
    isFavorite: false,
    category: 'Visio & Quotidien',
  },
];

// Broadcast Channel for cross-tab multi-user sync
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('loveplay_sync_channel');
  }
} catch {
  // BroadcastChannel unavailable
}

type SyncCallback = (event: { type: string; payload: unknown }) => void;
const syncListeners: Set<SyncCallback> = new Set();

if (channel) {
  channel.onmessage = (event) => {
    syncListeners.forEach((callback) => callback(event.data));
  };
}

export const StorageService = {
  subscribeSync(callback: SyncCallback): () => void {
    syncListeners.add(callback);
    return () => {
      syncListeners.delete(callback);
    };
  },

  broadcast(type: string, payload: unknown) {
    if (channel) {
      try {
        channel.postMessage({ type, payload });
      } catch {
        // Ignore
      }
    }
  },

  // Active user (which partner this device controls: 'partner1' or 'partner2')
  getActiveUserId(): 'partner1' | 'partner2' {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (saved === 'partner1' || saved === 'partner2') return saved;
    } catch {
      // Ignore
    }
    return 'partner1'; // Default: Camille
  },

  setActiveUserId(id: 'partner1' | 'partner2') {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, id);
      this.broadcast('USER_SWITCHED', id);
    } catch {
      // Ignore
    }
  },

  // Space management
  getSpace(): CoupleSpace {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SPACE);
      if (data) {
        const parsed: CoupleSpace = JSON.parse(data);
        // If the space is still on previous demo cities (Montréal, etc.), migrate to Burkina Faso & France
        if (
          parsed.partner2?.timezone === 'America/Toronto' ||
          parsed.partner2?.city?.includes('Montréal') ||
          (parsed.partner1?.city === 'Paris' && parsed.partner2?.city === 'Montréal') ||
          parsed.distanceKm === 5850
        ) {
          parsed.partner1.city = 'Ouagadougou (Burkina Faso)';
          parsed.partner1.timezone = 'Africa/Ouagadougou';
          parsed.partner2.city = 'Paris (France)';
          parsed.partner2.timezone = 'Europe/Paris';
          parsed.distanceKm = 4070;
          this.saveSpace(parsed);
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SPACE;
  },

  saveSpace(space: CoupleSpace) {
    try {
      localStorage.setItem(STORAGE_KEY_SPACE, JSON.stringify(space));
      this.broadcast('SPACE_UPDATED', space);
    } catch {
      // Ignore
    }
  },

  // Messages
  getMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_MESSAGES;
  },

  addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const messages = this.getMessages();
    const newMessage: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
    };
    const updated = [...messages, newMessage];
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
      this.broadcast('NEW_MESSAGE', newMessage);
    } catch {
      // Ignore
    }
    return newMessage;
  },

  toggleHeartMessage(id: string) {
    const messages = this.getMessages();
    const updated = messages.map((m) =>
      m.id === id ? { ...m, hasHeart: !m.hasHeart } : m
    );
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
      this.broadcast('MESSAGES_UPDATED', updated);
    } catch {
      // Ignore
    }
    return updated;
  },

  // Tic-Tac-Toe
  getTicTacToe(): TicTacToeState {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TICTACTOE);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_TICTACTOE;
  },

  saveTicTacToe(state: TicTacToeState) {
    try {
      localStorage.setItem(STORAGE_KEY_TICTACTOE, JSON.stringify(state));
      this.broadcast('TICTACTOE_UPDATED', state);
    } catch {
      // Ignore
    }
  },

  // Connect 4
  getConnect4(): Connect4State {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONNECT4);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_CONNECT4;
  },

  saveConnect4(state: Connect4State) {
    try {
      localStorage.setItem(STORAGE_KEY_CONNECT4, JSON.stringify(state));
      this.broadcast('CONNECT4_UPDATED', state);
    } catch {
      // Ignore
    }
  },

  // Quiz
  getQuiz(): QuizQuestion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_QUIZ);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_QUIZ;
  },

  saveQuiz(questions: QuizQuestion[]) {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZ, JSON.stringify(questions));
      this.broadcast('QUIZ_UPDATED', questions);
    } catch {
      // Ignore
    }
  },

  // Memories
  getMemories(): MemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MEMORIES);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_MEMORIES;
  },

  addMemory(memory: Omit<MemoryItem, 'id'>): MemoryItem {
    const memories = this.getMemories();
    const newMemory: MemoryItem = {
      ...memory,
      id: 'mem_' + Date.now(),
    };
    const updated = [newMemory, ...memories];
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(updated));
      this.broadcast('MEMORIES_UPDATED', updated);
    } catch {
      // Ignore
    }
    return newMemory;
  },

  deleteMessage(id: string) {
    const messages = this.getMessages().filter((m) => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
      this.broadcast('MESSAGES_UPDATED', messages);
    } catch {
      // Ignore
    }
    return messages;
  },

  deleteMemory(id: string) {
    const memories = this.getMemories().filter((m) => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
      this.broadcast('MEMORIES_UPDATED', memories);
    } catch {
      // Ignore
    }
    return memories;
  },

  toggleFavoriteMemory(id: string) {
    const memories = this.getMemories().map((m) =>
      m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
    );
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
      this.broadcast('MEMORIES_UPDATED', memories);
    } catch {
      // Ignore
    }
    return memories;
  },

  // ==========================================
  // GALLERY (PHOTOS & VIDEOS)
  // ==========================================
  getGalleryMedia(): GalleryMediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_GALLERY);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return DEFAULT_GALLERY_MEDIA;
  },

  saveGalleryMedia(items: GalleryMediaItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(items));
      this.broadcast('GALLERY_UPDATED', items);
    } catch {
      // Ignore
    }
  },

  addGalleryMedia(media: Omit<GalleryMediaItem, 'id'>): GalleryMediaItem {
    const items = this.getGalleryMedia();
    const newItem: GalleryMediaItem = {
      ...media,
      id: 'gal_' + Date.now(),
    };
    const updated = [newItem, ...items];
    this.saveGalleryMedia(updated);
    return newItem;
  },

  toggleFavoriteGalleryMedia(id: string): GalleryMediaItem[] {
    const items = this.getGalleryMedia().map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    this.saveGalleryMedia(items);
    return items;
  },

  deleteGalleryMedia(id: string): GalleryMediaItem[] {
    const items = this.getGalleryMedia().filter((item) => item.id !== id);
    this.saveGalleryMedia(items);
    return items;
  },

  updateUserStatus(userId: 'partner1' | 'partner2', newStatus: string) {
    const space = this.getSpace();
    if (userId === 'partner1') {
      space.partner1.status = newStatus;
      space.partner1.lastActive = 'À l’instant';
    } else {
      space.partner2.status = newStatus;
      space.partner2.lastActive = 'À l’instant';
    }
    this.saveSpace(space);
    return space;
  },

  importCoupleData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.space) this.saveSpace(data.space);
      if (data.messages) {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(data.messages));
        this.broadcast('MESSAGES_UPDATED', data.messages);
      }
      if (data.memories) {
        localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(data.memories));
        this.broadcast('MEMORIES_UPDATED', data.memories);
      }
      if (data.quiz) this.saveQuiz(data.quiz);
      if (data.tictactoe) this.saveTicTacToe(data.tictactoe);
      if (data.connect4) this.saveConnect4(data.connect4);
      if (data.galleryMedia) this.saveGalleryMedia(data.galleryMedia);
      return true;
    } catch {
      return false;
    }
  },

  // Daily Challenges
  getDailyChallengeState(): DailyChallengeState {
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY_CHALLENGE);
      if (saved) {
        const state: DailyChallengeState = JSON.parse(saved);
        // If today's challenge is already for today, return it
        if (state.currentChallenge && state.currentChallenge.dateKey === todayKey) {
          return state;
        }

        // It's a new day: check streak continuity
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().slice(0, 10);
        let newStreak = state.streakDays || 0;
        if (state.lastCompletedDate && state.lastCompletedDate !== yesterdayKey && state.lastCompletedDate !== todayKey) {
          // Missed a day
          newStreak = 0;
        }

        // Deterministic pick based on today's date
        const dayNumber = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
        const template = ROMANTIC_DAILY_CHALLENGES[Math.abs(dayNumber) % ROMANTIC_DAILY_CHALLENGES.length];

        const newState: DailyChallengeState = {
          currentChallenge: {
            ...template,
            dateKey: todayKey,
            partner1Done: false,
            partner2Done: false,
          },
          streakDays: newStreak,
          lastCompletedDate: state.lastCompletedDate,
          completedHistory: state.completedHistory || [],
        };
        this.saveDailyChallengeState(newState);
        return newState;
      }
    } catch {
      // Fallback below
    }

    // Default initial state
    const template = ROMANTIC_DAILY_CHALLENGES[0];
    const initial: DailyChallengeState = {
      currentChallenge: {
        ...template,
        dateKey: todayKey,
        partner1Done: true,
        partner1DoneAt: 'Ce matin à 09:15',
        partner1Note: 'Note vocale envoyée avec tout mon amour 💕',
        partner2Done: false,
      },
      streakDays: 3,
      lastCompletedDate: undefined,
      completedHistory: [
        {
          id: 'ch_love_song_prev',
          dateKey: '2026-10-04',
          title: 'La mélodie qui te murmure mon nom',
          description: 'Partage dans notre chat la musique qui te fait le plus penser à nous.',
          category: 'Complicité',
          icon: '🎵',
          partner1Done: true,
          partner1DoneAt: 'Hier à 14:20',
          partner2Done: true,
          partner2DoneAt: 'Hier à 15:05',
        },
        {
          id: 'ch_snap_now_prev',
          dateKey: '2026-10-03',
          title: 'Ton regard là, tout de suite',
          description: 'Prends une photo spontanée sans filtre de ton visage ou de ta vue actuelle.',
          category: 'Photo spontanée',
          icon: '📸',
          partner1Done: true,
          partner1DoneAt: 'Il y a 2 jours',
          partner2Done: true,
          partner2DoneAt: 'Il y a 2 jours',
        },
      ],
    };
    this.saveDailyChallengeState(initial);
    return initial;
  },

  saveDailyChallengeState(state: DailyChallengeState) {
    try {
      localStorage.setItem(STORAGE_KEY_DAILY_CHALLENGE, JSON.stringify(state));
      this.broadcast('DAILY_CHALLENGE_UPDATED', state);
    } catch {
      // Ignore
    }
  },

  toggleDailyChallengeDone(
    partnerId: 'partner1' | 'partner2',
    note?: string
  ): DailyChallengeState {
    const state = this.getDailyChallengeState();
    const challenge = { ...state.currentChallenge };
    const nowTimeStr = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    if (partnerId === 'partner1') {
      const willBeDone = !challenge.partner1Done;
      challenge.partner1Done = willBeDone;
      challenge.partner1DoneAt = willBeDone ? `Aujourd’hui à ${nowTimeStr}` : undefined;
      if (note) challenge.partner1Note = note;
    } else {
      const willBeDone = !challenge.partner2Done;
      challenge.partner2Done = willBeDone;
      challenge.partner2DoneAt = willBeDone ? `Aujourd’hui à ${nowTimeStr}` : undefined;
      if (note) challenge.partner2Note = note;
    }

    // Check if both completed
    let streakDays = state.streakDays;
    let lastCompletedDate = state.lastCompletedDate;
    let completedHistory = [...state.completedHistory];

    if (challenge.partner1Done && challenge.partner2Done) {
      if (lastCompletedDate !== challenge.dateKey) {
        streakDays += 1;
        lastCompletedDate = challenge.dateKey;
        // Add to history if not already in history
        if (!completedHistory.some((h) => h.dateKey === challenge.dateKey)) {
          completedHistory = [challenge, ...completedHistory];
        }
      }
    }

    const updatedState: DailyChallengeState = {
      currentChallenge: challenge,
      streakDays,
      lastCompletedDate,
      completedHistory,
    };

    this.saveDailyChallengeState(updatedState);
    return updatedState;
  },

  rerollDailyChallenge(): DailyChallengeState {
    const state = this.getDailyChallengeState();
    const currentId = state.currentChallenge.id;
    const remaining = ROMANTIC_DAILY_CHALLENGES.filter((c) => c.id !== currentId);
    const pick = remaining[Math.floor(Math.random() * remaining.length)] || ROMANTIC_DAILY_CHALLENGES[0];
    const todayKey = new Date().toISOString().slice(0, 10);

    const updatedState: DailyChallengeState = {
      ...state,
      currentChallenge: {
        ...pick,
        dateKey: todayKey,
        partner1Done: false,
        partner2Done: false,
      },
    };

    this.saveDailyChallengeState(updatedState);
    return updatedState;
  },

  saveLongestTouchRecord(seconds: number) {
    const space = this.getSpace();
    if (!space.longestTouchRecordSeconds || seconds > space.longestTouchRecordSeconds) {
      space.longestTouchRecordSeconds = seconds;
      this.saveSpace(space);
    }
  },

  exportCoupleData(): string {
    const data = {
      space: this.getSpace(),
      messages: this.getMessages(),
      memories: this.getMemories(),
      quiz: this.getQuiz(),
      tictactoe: this.getTicTacToe(),
      connect4: this.getConnect4(),
      projects: this.getProjects(),
      pactRules: this.getPactRules(),
      checkIns: this.getCheckIns(),
      letters: this.getDeepLetters(),
      galleryMedia: this.getGalleryMedia(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  // ==========================================
  // SERIOUS & FUTURE SECTION (NOTRE AVENIR)
  // ==========================================
  getProjects(): CoupleProject[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    const defaults: CoupleProject[] = [
      {
        id: 'proj_1',
        title: 'Emménager ensemble dans notre cocon',
        category: 'Logement',
        targetDate: '2026-12-01',
        completed: false,
        progressPercentage: 60,
        notes: 'Notre priorité absolue pour clore la distance et se réveiller ensemble chaque jour.',
        milestones: [
          { id: 'm1', text: 'Choisir la ville et les quartiers idéaux', done: true },
          { id: 'm2', text: 'Définir notre budget loyer et charges', done: true },
          { id: 'm3', text: 'Visiter 5 appartements lors des prochaines retrouvailles', done: false },
          { id: 'm4', text: 'Signer le bail et récupérer les clés ensemble', done: false },
        ],
      },
      {
        id: 'proj_2',
        title: 'Grand Voyage : road trip en Italie & Côte Amalfitaine',
        category: 'Voyage',
        targetDate: '2027-04-20',
        completed: false,
        progressPercentage: 45,
        notes: '2 semaines rien que nous deux : pasta, couchers de soleil et balades en vespa.',
        milestones: [
          { id: 'm10', text: 'Créer le tableau d’inspiration & itinéraire', done: true },
          { id: 'm11', text: 'Épargner 1 500 € chacun sur la cagnotte', done: true },
          { id: 'm12', text: 'Réserver les billets d’avion et logements de charme', done: false },
        ],
      },
      {
        id: 'proj_3',
        title: 'Cagnotte commune pour nos allers-retours & futur',
        category: 'Finances',
        completed: false,
        progressPercentage: 80,
        notes: 'Sécurité financière pour nos transports et nos projets communs sans stress.',
        milestones: [
          { id: 'm20', text: 'Ouvrir un espace d’épargne partagé', done: true },
          { id: 'm21', text: 'Verser un montant mensuel automatique', done: true },
        ],
      },
      {
        id: 'proj_4',
        title: 'Officialisation & Promesse solennelle (PACS / Bague)',
        category: 'Engagement',
        completed: false,
        progressPercentage: 30,
        notes: 'Un symbole fort devant nos proches pour marquer notre chemin parcouru.',
        milestones: [
          { id: 'm30', text: 'Partager nos visions et nos souhaits d’avenir', done: true },
          { id: 'm31', text: 'Choisir le moment intime idéal pour célébrer', done: false },
        ],
      },
    ];
    this.saveProjects(defaults);
    return defaults;
  },

  saveProjects(projects: CoupleProject[]) {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      this.broadcast('PROJECTS_UPDATED', projects);
    } catch {
      // Ignore
    }
  },

  addProject(project: Omit<CoupleProject, 'id'>) {
    const list = this.getProjects();
    const newProj: CoupleProject = {
      ...project,
      id: `proj_${Date.now()}`,
    };
    list.unshift(newProj);
    this.saveProjects(list);
    return newProj;
  },

  toggleProjectMilestone(projectId: string, milestoneId: string) {
    const list = this.getProjects().map((p) => {
      if (p.id === projectId && p.milestones) {
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        );
        const doneCount = updatedMilestones.filter((m) => m.done).length;
        const total = updatedMilestones.length;
        const autoProgress = total > 0 ? Math.round((doneCount / total) * 100) : p.progressPercentage;
        return {
          ...p,
          milestones: updatedMilestones,
          progressPercentage: autoProgress,
          completed: doneCount === total,
          completedDate: doneCount === total ? new Date().toISOString().slice(0, 10) : undefined,
        };
      }
      return p;
    });
    this.saveProjects(list);
  },

  toggleProjectCompleted(projectId: string) {
    const list = this.getProjects().map((p) => {
      if (p.id === projectId) {
        const nextDone = !p.completed;
        return {
          ...p,
          completed: nextDone,
          progressPercentage: nextDone ? 100 : 50,
          completedDate: nextDone ? new Date().toISOString().slice(0, 10) : undefined,
        };
      }
      return p;
    });
    this.saveProjects(list);
  },

  deleteProject(projectId: string) {
    const list = this.getProjects().filter((p) => p.id !== projectId);
    this.saveProjects(list);
  },

  // PACT RULES
  getPactRules(): PactRule[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PACT);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    const defaults: PactRule[] = [
      {
        id: 'pact_1',
        title: 'La règle du soleil couchant',
        description: 'Ne jamais s’endormir fâchés. Même si une discussion n’est pas terminée, on se rappelle toujours qu’on s’aime et qu’on fait équipe.',
        signedByPartner1: true,
        signedByPartner2: true,
        category: 'Communication',
      },
      {
        id: 'pact_2',
        title: 'L’écoute sans contre-attaque',
        description: 'Quand l’un de nous exprime un besoin ou une tristesse, l’autre écoute jusqu’au bout avec bienveillance sans se justifier immédiatement.',
        signedByPartner1: true,
        signedByPartner2: true,
        category: 'Communication',
      },
      {
        id: 'pact_3',
        title: 'Transparence & confiance absolue',
        description: 'Pas de secrets, pas de faux-fuyants. On préfère mille fois une vérité délicate dite avec tendresse qu’un silence pesant.',
        signedByPartner1: true,
        signedByPartner2: false,
        category: 'Confiance',
      },
      {
        id: 'pact_4',
        title: 'Le sanctuaire de notre couple',
        description: 'Malgré les obligations, les études et la fatigue de la distance, nous préservons chaque semaine un vrai moment de qualité rien qu’à nous.',
        signedByPartner1: true,
        signedByPartner2: true,
        category: 'Distance',
      },
      {
        id: 'pact_5',
        title: 'Grandir ensemble sans s’étouffer',
        description: 'Nous soutenons inconditionnellement les passions et projets personnels de l’autre. S’aimer, c’est s’élever mutuellement.',
        signedByPartner1: true,
        signedByPartner2: false,
        category: 'Avenir',
      },
    ];
    this.savePactRules(defaults);
    return defaults;
  },

  savePactRules(rules: PactRule[]) {
    try {
      localStorage.setItem(STORAGE_KEY_PACT, JSON.stringify(rules));
      this.broadcast('PACT_UPDATED', rules);
    } catch {
      // Ignore
    }
  },

  toggleSignPactRule(ruleId: string, partnerId: 'partner1' | 'partner2') {
    const list = this.getPactRules().map((r) => {
      if (r.id === ruleId) {
        if (partnerId === 'partner1') {
          return { ...r, signedByPartner1: !r.signedByPartner1 };
        } else {
          return { ...r, signedByPartner2: !r.signedByPartner2 };
        }
      }
      return r;
    });
    this.savePactRules(list);
  },

  addPactRule(title: string, description: string, category: PactRule['category'], signedBy: 'partner1' | 'partner2') {
    const list = this.getPactRules();
    const newRule: PactRule = {
      id: `pact_${Date.now()}`,
      title,
      description,
      category,
      signedByPartner1: signedBy === 'partner1',
      signedByPartner2: signedBy === 'partner2',
      isCustom: true,
    };
    list.push(newRule);
    this.savePactRules(list);
    return newRule;
  },

  // CHECK-INS
  getCheckIns(): RelationshipCheckIn[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHECKINS);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    const defaults: RelationshipCheckIn[] = [
      {
        id: 'chk_1',
        date: '2026-10-02',
        partnerId: 'partner1',
        scores: {
          emotionalConnection: 9,
          communication: 9,
          support: 10,
          intimacyFuture: 8,
        },
        celebration: 'J’ai adoré notre appel visio dimanche soir, on a tellement ri et j’ai senti qu’on était sur la même longueur d’onde.',
        gentleNeed: 'Juste un petit message quand tu te réveilles les matins où tu commences tôt, ça illumine toute ma journée.',
        gratitude: 'Ta patience et ta façon de me rassurer quand j’ai des moments de doute.',
      },
    ];
    this.saveCheckIns(defaults);
    return defaults;
  },

  saveCheckIns(checkins: RelationshipCheckIn[]) {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkins));
      this.broadcast('CHECKINS_UPDATED', checkins);
    } catch {
      // Ignore
    }
  },

  addCheckIn(checkIn: Omit<RelationshipCheckIn, 'id'>) {
    const list = this.getCheckIns();
    const item: RelationshipCheckIn = {
      ...checkIn,
      id: `chk_${Date.now()}`,
    };
    list.unshift(item);
    this.saveCheckIns(list);
    return item;
  },

  // DEEP LETTERS (SEALED)
  getDeepLetters(): DeepLetter[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LETTERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    const defaults: DeepLetter[] = [
      {
        id: 'let_1',
        senderId: 'partner1',
        title: 'À ouvrir quand la distance pèse trop lourd ce soir',
        sealTheme: 'rose',
        triggerLabel: 'Les soirs de coup de blues',
        content: `Mon amour,\n\nSi tu ouvres cette lettre ce soir, c’est probablement que ton lit te paraît trop grand, que l’écran ne suffit plus et que mon absence se fait trop ressentir.\n\nJe veux que tu fermes les yeux 10 secondes et que tu respires. Rappelle-toi que chaque seconde loin de toi n’est pas du temps perdu : c’est le pont solide que nous bâtissons vers notre avenir.\n\nCe que nous vivons est rare. Bientôt, il n’y aura plus de compte à rebours, plus de valises à refaire les larmes aux yeux. Il n’y aura que nous, nos matins tranquilles et notre vie à inventer.\n\nJe t’aime plus fort que les kilomètres. Tu es chez toi dans mon cœur.`,
        createdAt: '2026-10-01',
        openedAt: '2026-10-03',
      },
      {
        id: 'let_2',
        senderId: 'partner2',
        title: 'Pourquoi j’ai la certitude intime que c’est toi',
        sealTheme: 'blue',
        triggerLabel: 'Pour se rappeler notre force',
        content: `Mon trésor,\n\nJe voulais laisser une trace écrite de ce que je ressens au plus profond de moi.\n\nJe ne t’ai pas choisi par commodité. Je t’ai choisi parce qu’avec toi, je peux être 100% moi-même, sans masque et sans peur d’être jugé(e). Ta bienveillance, ton rire et ta fidélité me donnent une force immense.\n\nPeu importe les tempêtes sur la route, je sais qu’on saura les traverser main dans la main. Merci d’être mon repère, ma personne préférée et mon futur.`,
        createdAt: '2026-10-04',
      },
    ];
    this.saveDeepLetters(defaults);
    return defaults;
  },

  saveDeepLetters(letters: DeepLetter[]) {
    try {
      localStorage.setItem(STORAGE_KEY_LETTERS, JSON.stringify(letters));
      this.broadcast('LETTERS_UPDATED', letters);
    } catch {
      // Ignore
    }
  },

  addDeepLetter(letter: Omit<DeepLetter, 'id' | 'createdAt'>) {
    const list = this.getDeepLetters();
    const item: DeepLetter = {
      ...letter,
      id: `let_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    list.unshift(item);
    this.saveDeepLetters(list);
    return item;
  },

  openDeepLetter(letterId: string) {
    const list = this.getDeepLetters().map((l) =>
      l.id === letterId && !l.openedAt
        ? { ...l, openedAt: new Date().toISOString().slice(0, 10) }
        : l
    );
    this.saveDeepLetters(list);
  },

  // ==========================================
  // OCHO GAME PERSISTENCE
  // ==========================================
  getOchoScores(): { partner1: number; partner2: number } {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_OCHO}_scores`);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore
    }
    return { partner1: 0, partner2: 0 };
  },

  saveOchoScores(scores: { partner1: number; partner2: number }) {
    try {
      localStorage.setItem(`${STORAGE_KEY_OCHO}_scores`, JSON.stringify(scores));
      this.broadcast('OCHO_SCORES_UPDATED', scores);
    } catch {
      // Ignore
    }
  },
};
