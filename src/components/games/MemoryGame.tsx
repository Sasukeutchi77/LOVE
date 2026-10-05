import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, Heart } from 'lucide-react';
import { CoupleSpace } from '../../types';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface MemoryGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

interface CardItem {
  id: number;
  symbol: string;
  name: string;
}

const SYMBOLS = [
  { symbol: '💍', name: 'Bague' },
  { symbol: '💌', name: 'Lettre d’amour' },
  { symbol: '🌹', name: 'Rose rouge' },
  { symbol: '✈️', name: 'Retrouvailles' },
  { symbol: '🍷', name: 'Trinquons' },
  { symbol: '🧸', name: 'Câlin tout doux' },
  { symbol: '🗝️', name: 'Clé du cœur' },
  { symbol: '💫', name: 'Étoile filante' },
];

const generateShuffledCards = (): CardItem[] => {
  const deck: CardItem[] = [];
  let id = 0;
  SYMBOLS.forEach((item) => {
    deck.push({ id: id++, ...item });
    deck.push({ id: id++, ...item });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export const MemoryGame: React.FC<MemoryGameProps> = ({
  space,
  activeUserId,
}) => {
  const [cards, setCards] = useState<CardItem[]>(() => generateShuffledCards());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedSymbols, setMatchedSymbols] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [autoPartnerMove, setAutoPartnerMove] = useState(true);
  const [isPartnerThinking, setIsPartnerThinking] = useState(false);

  const isGameOver = matchedSymbols.length === SYMBOLS.length;

  const handleCardClick = (card: CardItem) => {
    if (
      isPartnerThinking ||
      flippedIds.includes(card.id) ||
      matchedSymbols.includes(card.symbol) ||
      flippedIds.length >= 2
    ) {
      return;
    }

    sound.playTap();
    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = cards.find((c) => c.id === newFlipped[0])!;
      const secondCard = card;

      if (firstCard.symbol === secondCard.symbol) {
        // MATCH!
        setTimeout(() => {
          sound.playMatch();
          setMatchedSymbols((prev) => [...prev, firstCard.symbol]);
          setFlippedIds([]);
          setScores((prev) => {
            const nextScores = { ...prev };
            if (currentTurn === 'p1') nextScores.p1 += 1;
            else nextScores.p2 += 1;
            return nextScores;
          });

          // Check if this was the last match
          if (matchedSymbols.length + 1 === SYMBOLS.length) {
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
            // Partner keeps turn
            simulatePartnerTurn();
          }
        }, 500);
      } else {
        // MISMATCH -> pass turn after small delay
        setTimeout(() => {
          setFlippedIds([]);
          const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
          setCurrentTurn(nextTurn);

          if (autoPartnerMove && nextTurn !== (activeUserId === 'partner1' ? 'p1' : 'p2')) {
            simulatePartnerTurn();
          }
        }, 900);
      }
    }
  };

  const simulatePartnerTurn = () => {
    setIsPartnerThinking(true);
    setTimeout(() => {
      // Find unrevealed cards
      const available = cards.filter((c) => !matchedSymbols.includes(c.symbol));
      if (available.length < 2) {
        setIsPartnerThinking(false);
        return;
      }

      // Pick first card
      const c1 = available[Math.floor(Math.random() * available.length)];
      sound.playTap();
      setFlippedIds([c1.id]);

      setTimeout(() => {
        // Pick second card
        const remaining = available.filter((c) => c.id !== c1.id);
        const c2 = remaining[Math.floor(Math.random() * remaining.length)];
        sound.playTap();
        setFlippedIds([c1.id, c2.id]);

        if (c1.symbol === c2.symbol) {
          // Partner found a pair!
          setTimeout(() => {
            sound.playMatch();
            setMatchedSymbols((prev) => [...prev, c1.symbol]);
            setFlippedIds([]);
            setScores((prev) => ({
              ...prev,
              [currentTurn]: prev[currentTurn] + 1,
            }));
            setIsPartnerThinking(false);
          }, 600);
        } else {
          // Partner missed
          setTimeout(() => {
            setFlippedIds([]);
            setCurrentTurn(currentTurn === 'p1' ? 'p2' : 'p1');
            setIsPartnerThinking(false);
          }, 900);
        }
      }, 700);
    }, 800);
  };

  const handleResetGame = () => {
    sound.playTap();
    setCards(generateShuffledCards());
    setFlippedIds([]);
    setMatchedSymbols([]);
    setCurrentTurn('p1');
    setScores({ p1: 0, p2: 0 });
    setIsPartnerThinking(false);
  };

  const currentTurnName = currentTurn === 'p1' ? space.partner1.name : space.partner2.name;

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <span className="text-[11px] text-white/50 block">Memory de nos cœurs</span>
          {isGameOver ? (
            <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-rose-300 text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {scores.p1 > scores.p2
                  ? `${space.partner1.name} l’emporte avec amour ! 💖`
                  : scores.p2 > scores.p1
                  ? `${space.partner2.name} gagne la partie ! 💜`
                  : 'Égalité parfaite entre deux cœurs !'}
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
                  ? `${currentTurnName} cherche une paire...`
                  : `Au tour de ${currentTurnName}`}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleResetGame}
          className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white transition-all active:scale-95 border border-white/[0.08]"
          title="Recommencer la partie"
          aria-label="Recommencer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 4x4 Memory Grid */}
      <div className="max-w-[340px] mx-auto grid grid-cols-4 gap-2 p-3.5 rounded-3xl bg-gradient-to-b from-[#181132] to-[#120c24] border border-white/[0.1] shadow-2xl">
        {cards.map((card) => {
          const isFlipped = flippedIds.includes(card.id);
          const isMatched = matchedSymbols.includes(card.symbol);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={Boolean(isFlipped || isMatched || isPartnerThinking)}
              aria-label={isFlipped || isMatched ? card.name : 'Carte masquée'}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 select-none ${
                isMatched
                  ? 'bg-rose-500/20 border border-rose-400/30 opacity-70 scale-95'
                  : isFlipped
                  ? 'bg-gradient-to-br from-rose-500/30 to-purple-500/30 border-2 border-rose-400/70 shadow-lg scale-95 ring-2 ring-rose-300/30'
                  : 'bg-[#150f28] hover:bg-[#1d1538] border border-white/[0.06] active:scale-95'
              }`}
            >
              {isFlipped || isMatched ? (
                <span className="filter drop-shadow animate-in zoom-in-50 duration-200">
                  {card.symbol}
                </span>
              ) : (
                <Heart className="w-4 h-4 text-white/20 fill-white/10" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scores Counter */}
      <div className="grid grid-cols-2 gap-3 max-w-[340px] mx-auto text-center">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] text-rose-300 block truncate">
            {space.partner1.name} (Paires)
          </span>
          <span className="text-base font-bold text-rose-200 tabular-nums">
            {scores.p1}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-[10px] text-purple-300 block truncate">
            {space.partner2.name} (Paires)
          </span>
          <span className="text-base font-bold text-purple-200 tabular-nums">
            {scores.p2}
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="max-w-[340px] mx-auto flex items-center justify-between text-xs text-white/60">
        <span className="text-[11px]">Réponse simulée du partenaire :</span>
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
