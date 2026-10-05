export interface UserProfile {
  id: 'partner1' | 'partner2';
  name: string;
  city: string;
  timezone: string;
  avatarSeed: string; // romantic avatar accent
  status: string; // e.g. "Pense à toi", "En ligne", "Au travail", "Dort doucement"
  lastActive: string;
  battery?: number;
}

export interface CoupleSpace {
  code: string;
  establishedDate: string; // e.g., "2024-06-14"
  nextReunionDate: string; // e.g., "2026-10-18"
  partner1: UserProfile;
  partner2: UserProfile;
  distanceKm: number;
  longestTouchRecordSeconds?: number;
  lastHeartbeatSent?: {
    from: 'partner1' | 'partner2';
    timestamp: number;
    message: string;
  };
}

export type TabType = 'home' | 'games' | 'serious' | 'chat' | 'memories';

export type GameId =
  | 'tictactoe'
  | 'connect4'
  | 'quiz'
  | 'truthordare'
  | 'memory'
  | 'wouldyourather'
  | 'battleship'
  | 'wheel'
  | 'ocho';

export interface TruthOrDareItem {
  id: string;
  type: 'truth' | 'dare';
  intensity: 'Doux' | 'Complice' | 'Piquant' | 'À distance';
  text: string;
}

export interface WouldYouRatherItem {
  id: string;
  optionA: string;
  optionB: string;
  partner1Choice?: 'A' | 'B';
  partner2Choice?: 'A' | 'B';
  isRevealed: boolean;
}

export interface PromiseItem {
  id: string;
  title: string;
  wonBy: 'partner1' | 'partner2';
  date: string;
  redeemed: boolean;
}

export interface TicTacToeState {
  board: Array<'p1' | 'p2' | null>;
  currentTurn: 'p1' | 'p2';
  winner: 'p1' | 'p2' | 'draw' | null;
  winningLine: number[] | null;
  scores: { p1: number; p2: number; draws: number };
}

export interface Connect4State {
  grid: Array<Array<'p1' | 'p2' | null>>; // 6 rows x 7 columns
  currentTurn: 'p1' | 'p2';
  winner: 'p1' | 'p2' | 'draw' | null;
  winningCells: Array<[number, number]> | null;
  scores: { p1: number; p2: number };
}

export interface QuizQuestion {
  id: string;
  question: string;
  category: 'Souvenirs' | 'Intimité' | 'Futur' | 'Complicité' | 'Petits secrets';
  partner1Answer?: string;
  partner2Answer?: string;
  isRevealed: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: 'partner1' | 'partner2';
  text: string;
  timestamp: number;
  hasHeart: boolean;
  imageUrl?: string;
  audioDuration?: number;
  reactionEmoji?: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location: string;
  note: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

export interface DailyChallenge {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: 'Voix & Murmures' | 'Photo spontanée' | 'Mots doux' | 'Complicité' | 'Petite attention';
  icon: string;
  partner1Done: boolean;
  partner1DoneAt?: string;
  partner1Note?: string;
  partner2Done: boolean;
  partner2DoneAt?: string;
  partner2Note?: string;
}

export interface DailyChallengeState {
  currentChallenge: DailyChallenge;
  streakDays: number;
  lastCompletedDate?: string;
  completedHistory: DailyChallenge[];
}

// Ocho Game Types
export type OchoCardColor = 'red' | 'blue' | 'green' | 'purple' | 'wild';
export type OchoCardValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '+2'
  | 'skip'
  | 'reverse'
  | '+4';

export interface OchoCard {
  id: string;
  color: OchoCardColor;
  value: OchoCardValue;
}

export interface OchoGameState {
  playerHand: OchoCard[];
  partnerHand: OchoCard[];
  deck: OchoCard[];
  discardPile: OchoCard[];
  currentColor: OchoCardColor;
  currentTurn: 'partner1' | 'partner2';
  direction: 1 | -1;
  winner: 'partner1' | 'partner2' | null;
  saidOcho: { partner1: boolean; partner2: boolean };
  lastActionNote: string;
  scores: { partner1: number; partner2: number };
}

// Serious / Mature Couple Section Types
export interface CoupleProject {
  id: string;
  title: string;
  category: 'Logement' | 'Voyage' | 'Finances' | 'Engagement' | 'Famille & Pro';
  targetDate?: string;
  completed: boolean;
  completedDate?: string;
  progressPercentage?: number; // 0-100
  notes?: string;
  milestones?: { id: string; text: string; done: boolean }[];
}

export interface RelationshipCheckIn {
  id: string;
  date: string;
  partnerId: 'partner1' | 'partner2';
  scores: {
    emotionalConnection: number; // 1-10
    communication: number; // 1-10
    support: number; // 1-10
    intimacyFuture: number; // 1-10
  };
  celebration: string; // Ce qui fonctionne à merveille
  gentleNeed: string; // Ce qui me ferait du bien
  gratitude: string; // Ce qui me rassure profondément chez toi
}

export interface PactRule {
  id: string;
  title: string;
  description: string;
  signedByPartner1: boolean;
  signedByPartner2: boolean;
  category: 'Communication' | 'Confiance' | 'Distance' | 'Avenir';
  isCustom?: boolean;
}

export interface DeepLetter {
  id: string;
  senderId: 'partner1' | 'partner2';
  title: string;
  sealTheme: 'blue' | 'rose' | 'amber' | 'purple';
  triggerLabel: string; // e.g. "À ouvrir quand la distance pèse trop"
  content: string;
  createdAt: string;
  openedAt?: string;
}
