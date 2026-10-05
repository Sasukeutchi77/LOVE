import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  RotateCw,
  MessageCircleHeart,
  Calendar,
  Heart,
  ChevronRight,
  Send,
  History,
} from 'lucide-react';
import { CoupleSpace, DailyChallengeState } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
  onNavigateToChat?: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  space,
  activeUserId,
  onNavigateToChat,
}) => {
  const [challengeState, setChallengeState] = useState<DailyChallengeState>(() =>
    StorageService.getDailyChallengeState()
  );
  const [personalNoteInput, setPersonalNoteInput] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setChallengeState(StorageService.getDailyChallengeState());

    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'DAILY_CHALLENGE_UPDATED') {
        setChallengeState(event.payload as DailyChallengeState);
      }
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const { currentChallenge, streakDays, completedHistory } = challengeState;
  const isMeP1 = activeUserId === 'partner1';
  const myDone = isMeP1 ? currentChallenge.partner1Done : currentChallenge.partner2Done;
  const partnerDone = isMeP1 ? currentChallenge.partner2Done : currentChallenge.partner1Done;

  const meName = isMeP1 ? space.partner1.name : space.partner2.name;
  const partnerName = isMeP1 ? space.partner2.name : space.partner1.name;

  const bothDone = currentChallenge.partner1Done && currentChallenge.partner2Done;

  const handleToggleMyDone = () => {
    sound.playWin();
    const updated = StorageService.toggleDailyChallengeDone(
      activeUserId,
      personalNoteInput.trim() || undefined
    );
    setChallengeState(updated);
    setPersonalNoteInput('');
    setShowNoteField(false);

    try {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fda4af', '#f472b6', '#c084fc', '#fbbf24'],
      });
    } catch {
      // Ignore
    }
  };

  const handleReroll = () => {
    sound.playTap();
    const updated = StorageService.rerollDailyChallenge();
    setChallengeState(updated);
  };

  const handleShareToChat = () => {
    sound.playMessage();
    StorageService.addMessage({
      senderId: activeUserId,
      text: `🎯 Défi du jour : « ${currentChallenge.title} »\n${currentChallenge.description}\n\nRelevons-le ensemble aujourd’hui mon amour ! 💕`,
      hasHeart: true,
    });
    onClose();
    if (onNavigateToChat) {
      onNavigateToChat();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#140f26] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-xl shadow-md">
              {currentChallenge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif italic text-rose-300">
                  Rituel quotidien d’amour
                </span>
                {streakDays > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                    <span>{streakDays} j d’affilée</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-rose-100">
                Défi du jour
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Challenge Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1b1435] to-[#120e24] border border-white/[0.08] shadow-xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 font-medium text-[11px] border border-rose-400/20">
              {currentChallenge.category}
            </span>
            <span className="text-white/40 text-[11px] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-white/30" />
              <span>Aujourd’hui</span>
            </span>
          </div>

          <div>
            <h3 className="font-serif text-2xl font-semibold text-rose-100 leading-snug">
              « {currentChallenge.title} »
            </h3>
            <p className="text-sm text-white/80 font-light leading-relaxed mt-2">
              {currentChallenge.description}
            </p>
          </div>

          {/* Both Completed Celebration Banner */}
          {bothDone && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-rose-500/20 to-purple-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-in zoom-in-95 duration-300">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold block">Défi du jour accompli à deux ! 🎉</span>
                <span className="text-[11px] text-white/80">
                  Votre complicité grandit chaque jour malgré la distance. +1 jour à votre série !
                </span>
              </div>
            </div>
          )}

          {/* Validation Status for both partners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Partner 1 Status (Camille) */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                currentChallenge.partner1Done
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-100'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-500/30 flex items-center justify-center text-xs font-bold text-rose-200">
                    {space.partner1.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-white">
                    {space.partner1.name} {isMeP1 && '(Toi)'}
                  </span>
                </div>
                {currentChallenge.partner1Done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-white/30" />
                )}
              </div>
              <div className="text-[11px] mt-1.5 text-white/70">
                {currentChallenge.partner1Done ? (
                  <span className="text-emerald-300 font-medium">
                    ✓ Défi validé {currentChallenge.partner1DoneAt && `(${currentChallenge.partner1DoneAt})`}
                  </span>
                ) : (
                  <span className="italic">En attente d’action...</span>
                )}
              </div>
              {currentChallenge.partner1Note && (
                <p className="text-[10px] text-white/60 italic mt-1 border-t border-white/[0.06] pt-1">
                  « {currentChallenge.partner1Note} »
                </p>
              )}
            </div>

            {/* Partner 2 Status (Léo) */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                currentChallenge.partner2Done
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-100'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-200">
                    {space.partner2.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-white">
                    {space.partner2.name} {!isMeP1 && '(Toi)'}
                  </span>
                </div>
                {currentChallenge.partner2Done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-white/30" />
                )}
              </div>
              <div className="text-[11px] mt-1.5 text-white/70">
                {currentChallenge.partner2Done ? (
                  <span className="text-emerald-300 font-medium">
                    ✓ Défi validé {currentChallenge.partner2DoneAt && `(${currentChallenge.partner2DoneAt})`}
                  </span>
                ) : (
                  <span className="italic">En attente d’action...</span>
                )}
              </div>
              {currentChallenge.partner2Note && (
                <p className="text-[10px] text-white/60 italic mt-1 border-t border-white/[0.06] pt-1">
                  « {currentChallenge.partner2Note} »
                </p>
              )}
            </div>
          </div>

          {/* Optional Sweet Note field */}
          {showNoteField && !myDone && (
            <div className="pt-2 animate-in fade-in duration-200">
              <input
                type="text"
                value={personalNoteInput}
                onChange={(e) => setPersonalNoteInput(e.target.value)}
                placeholder="Ajoute un petit mot doux sur ton défi (optionnel)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>
          )}

          {/* Action Button for Current User */}
          <div className="pt-1">
            <button
              onClick={handleToggleMyDone}
              className={`w-full py-3.5 rounded-2xl font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                myDone
                  ? 'bg-white/[0.08] hover:bg-white/[0.12] text-rose-300 border border-rose-400/20'
                  : 'bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white shadow-rose-950/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {myDone ? 'Annuler ma validation' : `J’ai relevé le défi (${meName}) ! 💖`}
              </span>
            </button>
            {!myDone && !showNoteField && (
              <button
                onClick={() => setShowNoteField(true)}
                className="text-[11px] text-rose-300/80 hover:text-rose-200 mt-2 block mx-auto underline decoration-rose-400/40"
              >
                + Ajouter une petite note à ma validation
              </button>
            )}
          </div>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleReroll}
            className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-all"
            title="Tirer un autre défi romantique"
          >
            <RotateCw className="w-3.5 h-3.5 text-rose-300" />
            <span>Changer de défi</span>
          </button>

          <button
            onClick={handleShareToChat}
            className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-all"
            title="Partager ce défi dans notre conversation"
          >
            <MessageCircleHeart className="w-3.5 h-3.5 text-rose-300" />
            <span>Partager au chat</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setShowHistory(!showHistory);
            }}
            className={`py-2 px-3 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-all ${
              showHistory
                ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-white/70 hover:text-white'
            }`}
            title="Historique des défis passés"
          >
            <History className="w-3.5 h-3.5 text-purple-300" />
            <span>Historique ({completedHistory.length})</span>
          </button>
        </div>

        {/* Completed Challenges History Drawer */}
        {showHistory && (
          <div className="space-y-2 pt-2 border-t border-white/[0.08] animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-white/60 font-semibold uppercase tracking-wider">
              <span>Défis accomplis ensemble</span>
              <span className="text-[10px] text-rose-300">{streakDays} jours de flamme 🔥</span>
            </div>

            {completedHistory.length === 0 ? (
              <p className="text-xs text-white/40 italic p-3 text-center">
                Aucun défi archivé pour le moment. Validez votre premier défi ensemble !
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {completedHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <span className="font-medium text-white block">{item.title}</span>
                        <span className="text-[10px] text-white/40">{item.dateKey} · {item.category}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      ✓ Validé à deux
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
