import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Heart, ChevronLeft, ChevronRight, Plus, Eye, Scale } from 'lucide-react';
import { CoupleSpace, WouldYouRatherItem } from '../../types';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface WouldYouRatherGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const DEFAULT_DILEMMAS: WouldYouRatherItem[] = [
  {
    id: 'wyr1',
    optionA: 'Passer 6 mois dans une cabane isolée au coin du feu, coupés du monde rien que tous les deux',
    optionB: 'Partir 6 mois en voyage nomade à travers 10 pays en sac à dos',
    isRevealed: false,
  },
  {
    id: 'wyr2',
    optionA: 'Que je te cuisine chaque soir ton repas préféré avec amour',
    optionB: 'Que je te masse le dos et les épaules pendant 20 minutes chaque soir',
    isRevealed: false,
  },
  {
    id: 'wyr3',
    optionA: 'Dormir enlacés toute la nuit même s’il fait 32°C et qu’on étouffe un peu',
    optionB: 'Avoir un lit king-size géant avec chacun sa couette bien au frais',
    isRevealed: false,
  },
  {
    id: 'wyr4',
    optionA: 'Emménager ensemble dès le mois prochain dans un tout petit studio sous les toits',
    optionB: 'Attendre 1 an de plus à distance pour emménager direct dans la maison de nos rêves',
    isRevealed: false,
  },
  {
    id: 'wyr5',
    optionA: 'Un baiser passionné de cinéma sous une pluie d’orage d’été',
    optionB: 'Une grasse matinée câline sous la couette un dimanche d’hiver sans regarder l’heure',
    isRevealed: false,
  },
  {
    id: 'wyr6',
    optionA: 'Qu’on puisse lire dans les pensées de l’autre à chaque instant',
    optionB: 'Garder le mystère et être surpris chaque jour par un geste imprévu',
    isRevealed: false,
  },
];

export const WouldYouRatherGame: React.FC<WouldYouRatherGameProps> = ({
  space,
  activeUserId,
}) => {
  const [items, setItems] = useState<WouldYouRatherItem[]>(() => {
    try {
      const saved = localStorage.getItem('loveplay_wouldyourather_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_DILEMMAS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');

  // Cross-tab real-time sync
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'WOULD_YOU_RATHER_UPDATED') {
        setItems(event.payload as WouldYouRatherItem[]);
      }
    });
    return unsubscribe;
  }, []);

  const currentItem = items[currentIndex] || items[0];
  const isMeP1 = activeUserId === 'partner1';

  const myChoice = isMeP1 ? currentItem.partner1Choice : currentItem.partner2Choice;

  const revealedItems = items.filter((it) => it.isRevealed);
  const matchCount = revealedItems.filter(
    (it) => it.partner1Choice && it.partner1Choice === it.partner2Choice
  ).length;
  const compatibilityPct =
    revealedItems.length > 0 ? Math.round((matchCount / revealedItems.length) * 100) : null;

  const handleVote = (choice: 'A' | 'B') => {
    sound.playTap();
    const updated = items.map((item, idx) => {
      if (idx === currentIndex) {
        return {
          ...item,
          partner1Choice: isMeP1 ? choice : item.partner1Choice,
          partner2Choice: !isMeP1 ? choice : item.partner2Choice,
        };
      }
      return item;
    });

    setItems(updated);
    try {
      localStorage.setItem('loveplay_wouldyourather_v1', JSON.stringify(updated));
      StorageService.broadcast('WOULD_YOU_RATHER_UPDATED', updated);
    } catch {
      // Ignore
    }
  };

  const handleReveal = () => {
    sound.playWin();
    const updated = items.map((item, idx) =>
      idx === currentIndex ? { ...item, isRevealed: true } : item
    );
    setItems(updated);
    try {
      localStorage.setItem('loveplay_wouldyourather_v1', JSON.stringify(updated));
      StorageService.broadcast('WOULD_YOU_RATHER_UPDATED', updated);
    } catch {
      // Ignore
    }

    if (updated[currentIndex].partner1Choice === updated[currentIndex].partner2Choice) {
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#fda4af', '#f472b6', '#a855f7'],
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleResetVotes = () => {
    sound.playTap();
    const updated = [...items];
    updated[currentIndex] = {
      ...updated[currentIndex],
      partner1Choice: undefined,
      partner2Choice: undefined,
      isRevealed: false,
    };
    setItems(updated);
    try {
      localStorage.setItem('loveplay_wouldyourather_v1', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleAddNewDilemma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionA.trim() || !newOptionB.trim()) return;

    sound.playTap();
    const newItem: WouldYouRatherItem = {
      id: 'wyr_custom_' + Date.now(),
      optionA: newOptionA.trim(),
      optionB: newOptionB.trim(),
      isRevealed: false,
    };

    const updated = [...items, newItem];
    setItems(updated);
    try {
      localStorage.setItem('loveplay_wouldyourather_v1', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setNewOptionA('');
    setNewOptionB('');
    setShowAddModal(false);
    setCurrentIndex(updated.length - 1);
  };

  const p1Voted = Boolean(currentItem.partner1Choice);
  const p2Voted = Boolean(currentItem.partner2Choice);
  const isMatch = currentItem.partner1Choice === currentItem.partner2Choice;

  return (
    <div className="space-y-4">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-rose-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span>Tu préfères... Amoureux</span>
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-[11px] text-white/50">
              Dilemme {currentIndex + 1} sur {items.length}
            </span>
            {compatibilityPct !== null && (
              <>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {compatibilityPct}% d’accord
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-white/70 mt-0.5">
            {currentItem.isRevealed
              ? isMatch
                ? 'Même longueur d’onde ! 💖'
                : 'Les opposés s’attirent ! 🥰'
              : p1Voted && p2Voted
              ? 'Deux votes prêts à être révélés'
              : 'Votez secrètement chacun de votre côté'}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playTap();
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
            }}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 active:scale-95 transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
            }}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 active:scale-95 transition-all"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dilemma Options */}
      <div className="space-y-3">
        {/* Option A */}
        <button
          onClick={() => handleVote('A')}
          className={`w-full p-5 rounded-3xl text-left border transition-all active:scale-[0.99] relative overflow-hidden ${
            myChoice === 'A'
              ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/15 border-rose-400/50 shadow-lg shadow-rose-950/40'
              : 'bg-[#140f26] border-white/[0.08] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
              Option A
            </span>
            {myChoice === 'A' && (
              <span className="text-xs text-rose-300 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-rose-400" />
                <span>Ton vote</span>
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white/90 leading-relaxed">
            {currentItem.optionA}
          </p>

          {/* If revealed, show who chose this option */}
          {currentItem.isRevealed && (
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-2 text-xs">
              {currentItem.partner1Choice === 'A' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-medium">
                  {space.partner1.name} (💖)
                </span>
              )}
              {currentItem.partner2Choice === 'A' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-medium">
                  {space.partner2.name} (💜)
                </span>
              )}
              {!currentItem.partner1Choice && !currentItem.partner2Choice && (
                <span className="text-white/40 text-[10px]">Aucun vote</span>
              )}
            </div>
          )}
        </button>

        {/* OU Separator */}
        <div className="flex items-center justify-center -my-1 relative z-10">
          <span className="w-8 h-8 rounded-full bg-[#1b1433] border border-white/[0.1] text-xs font-serif font-bold text-rose-300 flex items-center justify-center shadow-md">
            OU
          </span>
        </div>

        {/* Option B */}
        <button
          onClick={() => handleVote('B')}
          className={`w-full p-5 rounded-3xl text-left border transition-all active:scale-[0.99] relative overflow-hidden ${
            myChoice === 'B'
              ? 'bg-gradient-to-r from-purple-500/20 to-rose-500/15 border-purple-400/50 shadow-lg shadow-purple-950/40'
              : 'bg-[#140f26] border-white/[0.08] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              Option B
            </span>
            {myChoice === 'B' && (
              <span className="text-xs text-purple-300 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-purple-400" />
                <span>Ton vote</span>
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white/90 leading-relaxed">
            {currentItem.optionB}
          </p>

          {/* If revealed, show who chose this option */}
          {currentItem.isRevealed && (
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-2 text-xs">
              {currentItem.partner1Choice === 'B' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-medium">
                  {space.partner1.name} (💖)
                </span>
              )}
              {currentItem.partner2Choice === 'B' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-medium">
                  {space.partner2.name} (💜)
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Reveal or Status Zone */}
      <div className="pt-2">
        {currentItem.isRevealed ? (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Heart className={`w-4 h-4 ${isMatch ? 'text-rose-400 fill-rose-400' : 'text-purple-400'}`} />
              <span>
                {isMatch
                  ? 'Vous avez choisi la même chose ! 💖'
                  : 'Des avis différents, plus de discussions au lit ! 😉'}
              </span>
            </div>
            <button
              onClick={handleResetVotes}
              className="text-[11px] text-white/40 hover:text-white transition-colors"
            >
              Recommencer
            </button>
          </div>
        ) : (
          <button
            onClick={handleReveal}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-xs font-medium text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 active:scale-98 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Révéler les choix de chacun</span>
          </button>
        )}
      </div>

      {/* Footer Add Custom */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-rose-300/80 hover:text-rose-200 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter notre propre dilemme</span>
        </button>

        <span className="text-[11px] text-white/40">
          Chiffrement privé de couple
        </span>
      </div>

      {/* Modal Add Dilemma */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="font-serif text-xl font-semibold text-rose-100 mb-2">
              Nouveau dilemme pour nous deux
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Deux options impossibles ou romantiques pour tester votre complicité.
            </p>

            <form onSubmit={handleAddNewDilemma} className="space-y-4">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">Option A</label>
                <textarea
                  rows={2}
                  required
                  value={newOptionA}
                  onChange={(e) => setNewOptionA(e.target.value)}
                  placeholder="Ex: Passer tout un week-end sous la pluie dans une verrière..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Option B</label>
                <textarea
                  rows={2}
                  required
                  value={newOptionB}
                  onChange={(e) => setNewOptionB(e.target.value)}
                  placeholder="Ex: Dîner sur un toit terrasse avec vue sur les étoiles..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-md shadow-rose-950"
                >
                  Ajouter au jeu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
