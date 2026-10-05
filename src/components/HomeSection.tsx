import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Clock,
  MapPin,
  Gamepad2,
  MessageCircleHeart,
  Users,
  Share2,
  Compass,
  Fingerprint,
  Palette,
  CalendarHeart,
  Sun,
  Moon,
  Smile,
  Edit3,
  Check,
  X,
  Flame,
  CheckCircle2,
  ChevronRight,
  Target,
} from 'lucide-react';
import { CoupleSpace, TabType, DailyChallengeState } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface HomeSectionProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
  onNavigate: (tab: TabType) => void;
  onOpenSpaceModal: () => void;
  onSendHeartbeat: () => void;
  onOpenTouchSync: () => void;
  onOpenLoveCanvas: () => void;
  onOpenDateNight: () => void;
  onOpenTimezoneSync: () => void;
  onOpenDailyChallenge: () => void;
}

const PRESET_MOODS = [
  'Pense très fort à toi 🥰',
  'En train de sourire en pensant à nous ✨',
  'Écoute notre chanson en boucle 🎵',
  'Au travail, mais le cœur avec toi 💼',
  'Dort doucement sous la lune 🌙',
  'Besoin d’un gros câlin virtuel 🥺',
  'Hâte de te serrer dans mes bras 💕',
  'En train de préparer notre prochain appel 📱',
];

export const HomeSection: React.FC<HomeSectionProps> = ({
  space,
  activeUserId,
  onNavigate,
  onOpenSpaceModal,
  onSendHeartbeat,
  onOpenTouchSync,
  onOpenLoveCanvas,
  onOpenDateNight,
  onOpenTimezoneSync,
  onOpenDailyChallenge,
}) => {
  const [partner1Time, setPartner1Time] = useState('');
  const [partner2Time, setPartner2Time] = useState('');
  const [p1IsDay, setP1IsDay] = useState(true);
  const [p2IsDay, setP2IsDay] = useState(true);
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [heartSentMessage, setHeartSentMessage] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [isEditingReunionDate, setIsEditingReunionDate] = useState(false);
  const [reunionDateInput, setReunionDateInput] = useState(space.nextReunionDate);
  const [dailyChallengeState, setDailyChallengeState] = useState<DailyChallengeState>(() =>
    StorageService.getDailyChallengeState()
  );

  const me = activeUserId === 'partner1' ? space.partner1 : space.partner2;
  const myLove = activeUserId === 'partner1' ? space.partner2 : space.partner1;

  // Cross-tab sync for daily challenge
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'DAILY_CHALLENGE_UPDATED') {
        setDailyChallengeState(event.payload as DailyChallengeState);
      }
    });
    return unsubscribe;
  }, []);

  const isCurrentPartnerDone =
    activeUserId === 'partner1'
      ? dailyChallengeState.currentChallenge.partner1Done
      : dailyChallengeState.currentChallenge.partner2Done;

  const handleQuickValidateChallenge = () => {
    sound.playWin();
    const updated = StorageService.toggleDailyChallengeDone(activeUserId);
    setDailyChallengeState(updated);
    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#fda4af', '#f472b6', '#ec4899', '#fbbf24'],
      });
    } catch {
      // Ignore
    }
  };

  // Live clocks for both timezones & day/night detection
  useEffect(() => {
    const updateClocks = () => {
      try {
        const now = new Date();
        const p1Formatted = new Intl.DateTimeFormat('fr-FR', {
          timeZone: space.partner1.timezone,
          hour: '2-digit',
          minute: '2-digit',
        }).format(now);
        const p2Formatted = new Intl.DateTimeFormat('fr-FR', {
          timeZone: space.partner2.timezone,
          hour: '2-digit',
          minute: '2-digit',
        }).format(now);

        const p1Hour = parseInt(
          new Intl.DateTimeFormat('fr-FR', {
            timeZone: space.partner1.timezone,
            hour: 'numeric',
            hourCycle: 'h23',
          }).format(now),
          10
        );
        const p2Hour = parseInt(
          new Intl.DateTimeFormat('fr-FR', {
            timeZone: space.partner2.timezone,
            hour: 'numeric',
            hourCycle: 'h23',
          }).format(now),
          10
        );

        setPartner1Time(p1Formatted);
        setPartner2Time(p2Formatted);
        setP1IsDay(p1Hour >= 7 && p1Hour < 21);
        setP2IsDay(p2Hour >= 7 && p2Hour < 21);
      } catch {
        const fallback = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setPartner1Time(fallback);
        setPartner2Time(fallback);
      }
    };
    updateClocks();
    const interval = setInterval(updateClocks, 10000);
    return () => clearInterval(interval);
  }, [space.partner1.timezone, space.partner2.timezone]);

  // Days until next reunion calculation
  const daysUntilReunion = React.useMemo(() => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reunion = new Date(space.nextReunionDate);
      reunion.setHours(0, 0, 0, 0);
      const diffMs = reunion.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 14;
    }
  }, [space.nextReunionDate]);

  // Warm greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Douce matinée mon cœur';
    if (hour >= 12 && hour < 18) return 'Bel après-midi mon amour';
    if (hour >= 18 && hour < 22) return 'Douce soirée mon ange';
    return 'Douce nuit mon amour';
  };

  const handleHeartbeatClick = () => {
    sound.playHeartbeat();
    setHeartPulsing(true);
    setHeartSentMessage(true);
    onSendHeartbeat();

    // Trigger sweet heart confetti burst
    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#fda4af', '#f472b6', '#ec4899', '#c084fc'],
      });
    } catch {
      // Ignore
    }

    setTimeout(() => setHeartPulsing(false), 900);
    setTimeout(() => setHeartSentMessage(false), 3000);
  };

  const handleRetrouverMonAmour = () => {
    sound.playTap();
    // Prioritize Games or Chat
    onNavigate('games');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18122f] to-[#120e24] border border-white/[0.08] p-6 shadow-xl">
        {/* Subtle background art glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen overflow-hidden">
          <img
            src="/src/assets/images/loveplay_couple_art_1791120151244.jpg"
            alt="LovePlay"
            className="w-full h-full object-cover object-center filter blur-[1px]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-serif italic text-rose-300/90 tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Notre espace privé</span>
            </span>
            <button
              onClick={onOpenSpaceModal}
              className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono text-white/70 hover:text-white border border-white/[0.06] flex items-center gap-1 transition-all"
            >
              <span>{space.code}</span>
              <Share2 className="w-3 h-3 text-white/50" />
            </button>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-rose-100 tracking-tight leading-tight mb-2">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-white/70 max-w-md font-light leading-relaxed mb-6">
            Même à <span className="text-rose-300 font-medium">{space.distanceKm.toLocaleString('fr-FR')} km</span> de distance, chaque seconde, chaque jeu et chaque rire nous rapproche un peu plus.
          </p>

          {/* Primary CTA: « Retrouver mon amour » */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRetrouverMonAmour}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 active:scale-[0.98] transition-all"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Retrouver mon amour</span>
            </button>

            <button
              onClick={handleHeartbeatClick}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-rose-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                heartPulsing ? 'scale-105 border-rose-400/80 bg-rose-500/20' : ''
              }`}
            >
              <Heart
                className={`w-4 h-4 text-rose-400 ${
                  heartPulsing ? 'fill-rose-500 scale-125' : 'fill-rose-500/40'
                } transition-transform duration-300`}
              />
              <span>{heartSentMessage ? 'Battement envoyé ! 💖' : 'Lui envoyer un battement'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Two Profiles Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Partner 1 Card */}
        <div
          className={`relative rounded-2xl p-5 border transition-all ${
            activeUserId === 'partner1'
              ? 'bg-[#15102a] border-rose-500/30 shadow-lg shadow-rose-950/20'
              : 'bg-[#110e21] border-white/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-rose-950">
                {space.partner1.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-white">{space.partner1.name}</span>
                  {activeUserId === 'partner1' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                      Toi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/50 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-400/70" />
                  <span>{space.partner1.city}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs font-mono font-medium text-rose-200">
                {p1IsDay ? (
                  <Sun className="w-3 h-3 text-amber-400" />
                ) : (
                  <Moon className="w-3 h-3 text-indigo-400" />
                )}
                <span>{partner1Time || '--:--'}</span>
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                {p1IsDay ? 'En plein jour' : 'Sous les étoiles'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-white/70 italic text-[11px] truncate max-w-[200px]">
              « {space.partner1.status} »
            </span>
            {activeUserId === 'partner1' ? (
              <button
                onClick={() => {
                  sound.playTap();
                  setCustomStatusInput(space.partner1.status);
                  setIsEditingStatus(true);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-rose-500/20 text-rose-300 flex items-center gap-1 transition-colors"
                title="Modifier mon humeur"
              >
                <Edit3 className="w-2.5 h-2.5" />
                <span>Humeur</span>
              </button>
            ) : (
              <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>En ligne</span>
              </span>
            )}
          </div>
        </div>

        {/* Partner 2 Card */}
        <div
          className={`relative rounded-2xl p-5 border transition-all ${
            activeUserId === 'partner2'
              ? 'bg-[#15102a] border-purple-500/30 shadow-lg shadow-purple-950/20'
              : 'bg-[#110e21] border-white/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-purple-950">
                {space.partner2.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-white">{space.partner2.name}</span>
                  {activeUserId === 'partner2' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                      Toi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/50 mt-0.5">
                  <MapPin className="w-3 h-3 text-purple-400/70" />
                  <span>{space.partner2.city}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs font-mono font-medium text-purple-200">
                {p2IsDay ? (
                  <Sun className="w-3 h-3 text-amber-400" />
                ) : (
                  <Moon className="w-3 h-3 text-indigo-400" />
                )}
                <span>{partner2Time || '--:--'}</span>
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                {p2IsDay ? 'En plein jour' : 'Sous les étoiles'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-white/70 italic text-[11px] truncate max-w-[200px]">
              « {space.partner2.status} »
            </span>
            {activeUserId === 'partner2' ? (
              <button
                onClick={() => {
                  sound.playTap();
                  setCustomStatusInput(space.partner2.status);
                  setIsEditingStatus(true);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-purple-500/20 text-purple-300 flex items-center gap-1 transition-colors"
                title="Modifier mon humeur"
              >
                <Edit3 className="w-2.5 h-2.5" />
                <span>Humeur</span>
              </button>
            ) : (
              <span className="text-[10px] text-white/50">{space.partner2.lastActive}</span>
            )}
          </div>
        </div>
      </div>

      {/* Countdown To Next Reunion */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-[#16112c] to-purple-950/30 border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-300">
            <Compass className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-xs font-medium text-white/80 flex items-center gap-2">
              <span>Prochaines retrouvailles</span>
              <button
                onClick={() => {
                  sound.playTap();
                  setIsEditingReunionDate(!isEditingReunionDate);
                }}
                className="text-[10px] text-rose-300 hover:text-white underline decoration-rose-400/40"
              >
                {isEditingReunionDate ? 'Fermer' : 'Changer'}
              </button>
            </div>
            {isEditingReunionDate ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="date"
                  value={reunionDateInput}
                  onChange={(e) => setReunionDateInput(e.target.value)}
                  className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                />
                <button
                  onClick={() => {
                    sound.playTap();
                    const updated = { ...space, nextReunionDate: reunionDateInput };
                    StorageService.saveSpace(updated);
                    setIsEditingReunionDate(false);
                  }}
                  className="p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-400"
                  title="Valider la date"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-white/50">
                {new Date(space.nextReunionDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="font-serif text-2xl font-bold text-rose-200 tabular-nums">
            {daysUntilReunion} {daysUntilReunion <= 1 ? 'jour' : 'jours'}
          </div>
          <span className="text-[10px] text-rose-300/70 font-light">Chaque seconde compte</span>
        </div>
      </div>

      {/* Daily Challenge Card (Défis Quotidiens) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c133a] via-[#140f29] to-[#100d21] border border-rose-500/25 p-5 shadow-xl transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{dailyChallengeState.currentChallenge.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif italic text-rose-300">
                  Défi romantique du jour
                </span>
                {dailyChallengeState.streakDays > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                    <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400 animate-pulse" />
                    <span>{dailyChallengeState.streakDays} j</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                {dailyChallengeState.currentChallenge.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onOpenDailyChallenge();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-rose-200 border border-white/[0.08] flex items-center gap-1 transition-all active:scale-95"
          >
            <span>Détails</span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>

        <p className="text-xs text-white/70 font-light leading-relaxed mb-4">
          « {dailyChallengeState.currentChallenge.description} »
        </p>

        {/* Quick validation row */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {/* Camille check indicator */}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 transition-colors ${
                dailyChallengeState.currentChallenge.partner1Done
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
              }`}
            >
              {dailyChallengeState.currentChallenge.partner1Done ? '✓' : '○'} {space.partner1.name}
            </span>

            {/* Léo check indicator */}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 transition-colors ${
                dailyChallengeState.currentChallenge.partner2Done
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
              }`}
            >
              {dailyChallengeState.currentChallenge.partner2Done ? '✓' : '○'} {space.partner2.name}
            </span>
          </div>

          <button
            onClick={handleQuickValidateChallenge}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
              isCurrentPartnerDone
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white shadow-rose-950'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCurrentPartnerDone ? 'Défi validé !' : 'Je l’ai fait ! 💖'}</span>
          </button>
        </div>
      </div>

      {/* Status & Mood Modal */}
      {isEditingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#140f26] border border-white/10 rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-rose-400" />
                <h3 className="font-medium text-sm text-rose-100">Mon humeur du moment</h3>
              </div>
              <button
                onClick={() => setIsEditingStatus(false)}
                className="p-1 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-white/50">Choisis une pensée rapide :</span>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_MOODS.map((mood, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playTap();
                      StorageService.updateUserStatus(activeUserId, mood);
                      setIsEditingStatus(false);
                    }}
                    className="px-3 py-2 rounded-xl text-left text-xs bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-400/30 border border-white/[0.06] text-white/80 hover:text-white transition-all flex items-center justify-between"
                  >
                    <span>{mood}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] text-white/50">Ou écris ton propre mot :</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customStatusInput}
                  onChange={(e) => setCustomStatusInput(e.target.value)}
                  placeholder="Ex : Je cuisine en pensant à toi..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
                />
                <button
                  onClick={() => {
                    if (!customStatusInput.trim()) return;
                    sound.playTap();
                    StorageService.updateUserStatus(activeUserId, customStatusInput.trim());
                    setIsEditingStatus(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white text-xs font-medium"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mature & Serious Section Banner Card */}
      <div
        onClick={() => {
          sound.playTap();
          onNavigate('serious');
        }}
        className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-[#171131] via-[#1a133a] to-[#140e2b] border border-amber-400/20 hover:border-amber-400/40 shadow-xl cursor-pointer transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shadow-lg shadow-amber-950/40">
              <Compass className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm sm:text-base font-semibold text-white group-hover:text-amber-200 transition-colors">
                  Notre Avenir & Engagements
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Côté sérieux
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/60 font-light mt-0.5">
                Nos projets de vie, notre charte d’amour, nos points météo et lettres scellées.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-300 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
        </div>
      </div>

      {/* Quick Launch Activities Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Partager un moment maintenant
          </h2>
          <span className="text-[11px] text-rose-300/80">À deux en direct</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('games')}
            className="p-4 rounded-2xl bg-[#141026] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors">
              9 Jeux à deux
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Ocho, Morpion, Quiz, Roue...
            </div>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="p-4 rounded-2xl bg-[#141026] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-300 mb-3 group-hover:scale-105 transition-transform">
              <MessageCircleHeart className="w-4 h-4" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors">
              Mots doux
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Messagerie privée et vocaux
            </div>
          </button>
        </div>
      </div>
      {/* Presence & Complicity Features Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Moments de présence & complicité
          </h2>
          <span className="text-[11px] text-rose-300/80">Spécial distance</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Toucher Simultané */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenTouchSync();
            }}
            className="p-4 rounded-2xl bg-[#140f26] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-300 mb-3 group-hover:scale-105 transition-transform">
              <Fingerprint className="w-4 h-4 text-rose-400" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors">
              Toucher simultané
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Poser vos doigts ensemble
            </div>
          </button>

          {/* Ardoise de Câlins */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenLoveCanvas();
            }}
            className="p-4 rounded-2xl bg-[#140f26] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-105 transition-transform">
              <Palette className="w-4 h-4 text-purple-400" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors">
              Ardoise de câlins
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Dessin et mot manuscrit
            </div>
          </button>

          {/* Idées de Rendez-vous */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenDateNight();
            }}
            className="p-4 rounded-2xl bg-[#140f26] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
              <CalendarHeart className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors">
              Idées de date night
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Soirées virtuelles magiques
            </div>
          </button>

          {/* Synchroniseur de Fuseaux */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenTimezoneSync();
            }}
            className="p-4 rounded-2xl bg-[#140f26] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-300 mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors">
              Nos fuseaux horaires
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              L’instant parfait pour s’appeler
            </div>
          </button>

          {/* Défis Quotidiens */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenDailyChallenge();
            }}
            className="p-4 rounded-2xl bg-[#140f26] hover:bg-[#1a1433] border border-white/[0.06] hover:border-rose-400/20 text-left transition-all group col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-medium text-xs text-white group-hover:text-rose-200 transition-colors flex items-center justify-between">
              <span>Défis quotidiens</span>
              {dailyChallengeState.streakDays > 0 && (
                <span className="text-[10px] text-amber-300 font-bold">🔥 {dailyChallengeState.streakDays} j</span>
              )}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              Une attention romantique par jour
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
