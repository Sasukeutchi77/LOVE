import React, { useState } from 'react';
import { RotateCcw, Trophy, Sparkles, Compass, MapPin } from 'lucide-react';
import { CoupleSpace } from '../../types';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface BattleshipGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const GRID_SIZE = 5;

interface SecretTreasure {
  index: number;
  icon: string;
  name: string;
  secretNote: string;
}

const generateRandomTreasures = (): SecretTreasure[] => {
  const pool = [
    { icon: '🏝️', name: 'L’Île aux Baisers', secretNote: 'Un baiser passionné de 2 minutes sans s’arrêter !' },
    { icon: '💎', name: 'Le Trésor des Retrouvailles', secretNote: 'Un câlin géant dès la sortie de l’avion.' },
    { icon: '💌', name: 'La Bouteille aux Secrets', secretNote: 'Je te murmurerai un secret que je n’ai dit à personne.' },
  ];

  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
  }

  const arr = Array.from(indices);
  return pool.map((item, idx) => ({
    index: arr[idx],
    ...item,
  }));
};

export const BattleshipGame: React.FC<BattleshipGameProps> = ({
  space,
  activeUserId,
}) => {
  const [treasures, setTreasures] = useState<SecretTreasure[]>(() => generateRandomTreasures());
  const [revealedCells, setRevealedCells] = useState<number[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [autoPartnerMove, setAutoPartnerMove] = useState(true);
  const [isPartnerThinking, setIsPartnerThinking] = useState(false);
  const [discoveredList, setDiscoveredList] = useState<SecretTreasure[]>([]);

  const foundCount = revealedCells.filter((idx) =>
    treasures.some((t) => t.index === idx)
  ).length;

  const isGameOver = foundCount === 3;

  const handleCellClick = (idx: number) => {
    if (revealedCells.includes(idx) || isGameOver || isPartnerThinking) return;

    const hit = treasures.find((t) => t.index === idx);
    const newRevealed = [...revealedCells, idx];
    setRevealedCells(newRevealed);

    if (hit) {
      sound.playMatch();
      setDiscoveredList((prev) => [...prev, hit]);
      setScores((prev) => ({
        ...prev,
        [currentTurn]: prev[currentTurn] + 1,
      }));

      // If all 3 found
      if (discoveredList.length + 1 === 3) {
        sound.playWin();
        try {
          confetti({
            particleCount: 35,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fda4af', '#f472b6', '#a855f7'],
          });
        } catch {
          // Ignore
        }
      } else if (autoPartnerMove && currentTurn !== (activeUserId === 'partner1' ? 'p1' : 'p2')) {
        simulatePartnerMove(newRevealed);
      }
    } else {
      sound.playSplash();
      const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
      setCurrentTurn(nextTurn);

      if (autoPartnerMove && nextTurn !== (activeUserId === 'partner1' ? 'p1' : 'p2')) {
        simulatePartnerMove(newRevealed);
      }
    }
  };

  const simulatePartnerMove = (alreadyRevealed: number[]) => {
    setIsPartnerThinking(true);
    setTimeout(() => {
      // Find unrevealed cells
      const unrevealed = [];
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        if (!alreadyRevealed.includes(i)) unrevealed.push(i);
      }

      if (unrevealed.length === 0) {
        setIsPartnerThinking(false);
        return;
      }

      // Partner has a slight chance of guessing smart (radar intuition!)
      const remainingTreasures = treasures.filter((t) => !alreadyRevealed.includes(t.index));
      let chosenIdx: number;

      if (remainingTreasures.length > 0 && Math.random() < 0.35) {
        chosenIdx = remainingTreasures[0].index;
      } else {
        chosenIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      }

      const hit = treasures.find((t) => t.index === chosenIdx);
      const updatedRevealed = [...alreadyRevealed, chosenIdx];
      setRevealedCells(updatedRevealed);

      if (hit) {
        sound.playMatch();
        setDiscoveredList((prev) => [...prev, hit]);
        setScores((prev) => ({
          ...prev,
          p2: prev.p2 + 1,
        }));

        if (discoveredList.length + 1 === 3) {
          sound.playWin();
          try {
            confetti({
              particleCount: 35,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#fda4af', '#f472b6', '#a855f7'],
            });
          } catch {
            // Ignore
          }
          setIsPartnerThinking(false);
        } else {
          // Partner keeps playing on hit
          simulatePartnerMove(updatedRevealed);
        }
      } else {
        sound.playTap();
        setCurrentTurn('p1');
        setIsPartnerThinking(false);
      }
    }, 900);
  };

  const handleResetGame = () => {
    sound.playTap();
    setTreasures(generateRandomTreasures());
    setRevealedCells([]);
    setCurrentTurn('p1');
    setScores({ p1: 0, p2: 0 });
    setDiscoveredList([]);
    setIsPartnerThinking(false);
  };

  const currentTurnName = currentTurn === 'p1' ? space.partner1.name : space.partner2.name;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <span className="text-[11px] text-white/50 flex items-center gap-1">
            <Compass className="w-3 h-3 text-rose-300" />
            <span>Îles Secrètes d’Amour</span>
          </span>
          {isGameOver ? (
            <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-rose-300 text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {scores.p1 > scores.p2
                  ? `${space.partner1.name} a découvert le plus de trésors ! 💖`
                  : scores.p2 > scores.p1
                  ? `${space.partner2.name} remporte l’exploration ! 💜`
                  : 'Trésors partagés à égalité !'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-white/90">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTurn === 'p1' ? 'bg-rose-400' : 'bg-purple-400'
                } animate-pulse`}
              />
              <span>
                {isPartnerThinking
                  ? `${currentTurnName} sonde l’océan...`
                  : `Au tour de ${currentTurnName}`}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleResetGame}
          className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white transition-all active:scale-95 border border-white/[0.08]"
          title="Nouvelle carte"
          aria-label="Nouvelle carte"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 5x5 Map Grid */}
      <div className="max-w-[340px] mx-auto p-3.5 rounded-3xl bg-gradient-to-b from-[#181135] to-[#100c24] border border-white/[0.1] shadow-2xl">
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const isRevealed = revealedCells.includes(idx);
            const treasure = treasures.find((t) => t.index === idx);

            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={Boolean(isRevealed || isGameOver || isPartnerThinking)}
                aria-label={`Case mer ${idx + 1}`}
                className={`aspect-square rounded-2xl flex items-center justify-center text-xl transition-all duration-200 select-none ${
                  isRevealed
                    ? treasure
                      ? 'bg-rose-500/25 border-2 border-rose-400 scale-95 shadow-md shadow-rose-950 animate-bounce'
                      : 'bg-white/[0.02] border border-white/[0.04] text-white/20'
                    : 'bg-[#150f29] hover:bg-[#1d163a] border border-white/[0.06] active:scale-95'
                }`}
              >
                {isRevealed ? (
                  treasure ? (
                    treasure.icon
                  ) : (
                    <span className="text-xs text-white/30">~</span>
                  )
                ) : (
                  <span className="text-[10px] text-white/10">·</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Treasure count tracker */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] px-1 text-xs text-white/60">
          <span>Trésors trouvés :</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < discoveredList.length ? 'opacity-100 scale-110' : 'opacity-25 grayscale'
                } transition-all`}
              >
                🏝️
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Discovered Secrets Cards */}
      {discoveredList.length > 0 && (
        <div className="space-y-2 max-w-[340px] mx-auto">
          <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block px-1">
            Secrets d’amour découverts
          </span>
          {discoveredList.map((t, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-white/90 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <span className="text-lg">{t.icon}</span>
              <div>
                <div className="font-semibold text-rose-200">{t.name}</div>
                <div className="text-[11px] text-white/70 italic mt-0.5">
                  « {t.secretNote} »
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="max-w-[340px] mx-auto flex items-center justify-between text-xs text-white/60">
        <span className="text-[11px]">Réponse simulée de l’amour :</span>
        <button
          onClick={() => {
            sound.playTap();
            setAutoPartnerMove(!autoPartnerMove);
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
            autoPartnerMove
              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              : 'bg-white/[0.06] text-white/50 border border-white/[0.08]'
          }`}
        >
          {autoPartnerMove ? 'Actif' : 'Passe & Joue'}
        </button>
      </div>
    </div>
  );
};
