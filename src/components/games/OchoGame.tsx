import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Heart,
  Flame,
  ArrowRight,
  Shield,
  Shuffle,
  Users,
  Bot,
  Gift,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleSpace, OchoCard, OchoCardColor, OchoCardValue } from '../../types';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';

interface OchoGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const COLORS: { key: OchoCardColor; label: string; bg: string; border: string; text: string; glow: string }[] = [
  {
    key: 'red',
    label: 'Rouge Rubis',
    bg: 'from-rose-600 to-rose-700',
    border: 'border-rose-400',
    text: 'text-rose-200',
    glow: 'shadow-rose-500/30',
  },
  {
    key: 'blue',
    label: 'Bleu Ciel',
    bg: 'from-sky-600 to-blue-700',
    border: 'border-sky-400',
    text: 'text-sky-200',
    glow: 'shadow-sky-500/30',
  },
  {
    key: 'green',
    label: 'Vert Espoir',
    bg: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-400',
    text: 'text-emerald-200',
    glow: 'shadow-emerald-500/30',
  },
  {
    key: 'purple',
    label: 'Pourpre Nuit',
    bg: 'from-purple-600 to-indigo-800',
    border: 'border-purple-400',
    text: 'text-purple-200',
    glow: 'shadow-purple-500/30',
  },
];

const ROMANTIC_PLEDGES = [
  '15 minutes de massage divin dès nos retrouvailles 💆',
  'Une note vocale chantant notre chanson préférée 🎤',
  'Le choix du menu ou du film lors de notre prochain date en visio 🎬',
  'Un petit déjeuner royal servi au lit le premier matin réunis 🥐',
  'Écrire une lettre d’amour manuscrite de 20 lignes 💌',
  'Un vœu romantique secret accordé sans hésiter ✨',
];

function generateDeck(): OchoCard[] {
  const cards: OchoCard[] = [];
  const baseColors: ('red' | 'blue' | 'green' | 'purple')[] = ['red', 'blue', 'green', 'purple'];

  baseColors.forEach((color) => {
    // 0 once
    cards.push({ id: `${color}_0`, color, value: '0' });
    // 1-9 twice
    for (let i = 1; i <= 9; i++) {
      const v = String(i) as OchoCardValue;
      cards.push({ id: `${color}_${v}_a`, color, value: v });
      cards.push({ id: `${color}_${v}_b`, color, value: v });
    }
    // Action cards: +2, skip, reverse
    cards.push({ id: `${color}_plus2_a`, color, value: '+2' });
    cards.push({ id: `${color}_plus2_b`, color, value: '+2' });
    cards.push({ id: `${color}_skip_a`, color, value: 'skip' });
    cards.push({ id: `${color}_reverse_a`, color, value: 'reverse' });
  });

  // Wild 8s (Ocho cards)
  for (let i = 1; i <= 4; i++) {
    cards.push({ id: `wild_8_${i}`, color: 'wild', value: '8' });
  }

  // Wild +4 cards
  for (let i = 1; i <= 2; i++) {
    cards.push({ id: `wild_plus4_${i}`, color: 'wild', value: '+4' });
  }

  return shuffle(cards);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const OchoGame: React.FC<OchoGameProps> = ({ space, activeUserId }) => {
  // Game state
  const [deck, setDeck] = useState<OchoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<OchoCard[]>([]);
  const [playerHand, setPlayerHand] = useState<OchoCard[]>([]);
  const [partnerHand, setPartnerHand] = useState<OchoCard[]>([]);
  const [currentColor, setCurrentColor] = useState<OchoCardColor>('red');
  const [currentTurn, setCurrentTurn] = useState<'partner1' | 'partner2'>(activeUserId);
  const [winner, setWinner] = useState<'partner1' | 'partner2' | null>(null);

  // Play settings & stats
  const [gameMode, setGameMode] = useState<'bot' | 'pass_and_play'>('bot');
  const [scores, setScores] = useState<{ partner1: number; partner2: number }>(() =>
    StorageService.getOchoScores()
  );
  const [logNote, setLogNote] = useState<string>('Que la partie commence !');
  const [saidOchoP1, setSaidOchoP1] = useState(false);
  const [saidOchoP2, setSaidOchoP2] = useState(false);

  // Wild Color Picker Modal
  const [colorPickerCard, setColorPickerCard] = useState<OchoCard | null>(null);
  const [selectedPledge, setSelectedPledge] = useState<string | null>(null);

  const isMeP1 = activeUserId === 'partner1';
  const partnerName = isMeP1 ? space.partner2.name : space.partner1.name;
  const myName = isMeP1 ? space.partner1.name : space.partner2.name;

  const isMyTurn = currentTurn === activeUserId;

  // Initialize a fresh game
  const initNewGame = () => {
    sound.playTap();
    const freshDeck = generateDeck();

    const p1Hand = freshDeck.splice(0, 7);
    const p2Hand = freshDeck.splice(0, 7);

    // Initial discard card (find first non-wild)
    let firstCard = freshDeck.pop()!;
    while (firstCard.color === 'wild') {
      freshDeck.unshift(firstCard);
      firstCard = freshDeck.pop()!;
    }

    setDeck(freshDeck);
    setPlayerHand(p1Hand);
    setPartnerHand(p2Hand);
    setDiscardPile([firstCard]);
    setCurrentColor(firstCard.color);
    setCurrentTurn('partner1');
    setWinner(null);
    setSaidOchoP1(false);
    setSaidOchoP2(false);
    setSelectedPledge(null);
    setLogNote(`Partie lancée ! Carte de départ : ${getCardLabel(firstCard)}`);
  };

  useEffect(() => {
    initNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topCard = discardPile[discardPile.length - 1];

  // Helper to check if a card is legally playable
  const canPlayCard = (card: OchoCard): boolean => {
    if (!topCard) return false;
    // Wild cards (8 and +4) can be played on anything
    if (card.color === 'wild' || card.value === '8' || card.value === '+4') {
      return true;
    }
    // Match color
    if (card.color === currentColor) {
      return true;
    }
    // Match value/symbol
    if (card.value === topCard.value) {
      return true;
    }
    return false;
  };

  // Human player clicks a card
  const handlePlayCard = (card: OchoCard, player: 'partner1' | 'partner2') => {
    if (winner) return;
    if (currentTurn !== player) return;
    if (!canPlayCard(card)) {
      sound.playHeartbeat();
      return;
    }

    // If it's a wild card (8 or +4), prompt for color selection
    if (card.color === 'wild' || card.value === '8' || card.value === '+4') {
      setColorPickerCard(card);
      return;
    }

    executePlayCard(card, player, card.color);
  };

  // Complete playing the card with chosen color
  const executePlayCard = (
    card: OchoCard,
    player: 'partner1' | 'partner2',
    chosenColor: OchoCardColor
  ) => {
    sound.playCard();

    const isP1 = player === 'partner1';
    const currentHand = isP1 ? playerHand : partnerHand;
    const opponentHand = isP1 ? partnerHand : playerHand;
    const opponentId: 'partner1' | 'partner2' = isP1 ? 'partner2' : 'partner1';

    // Remove from hand
    const nextHand = currentHand.filter((c) => c.id !== card.id);
    const nextDiscard = [...discardPile, card];

    // Check Ocho call rule: if 1 card left and didn't say Ocho, give penalty +2
    const saidOcho = isP1 ? saidOchoP1 : saidOchoP2;
    let finalHand = nextHand;
    let penaltyApplied = false;

    if (nextHand.length === 1 && !saidOcho) {
      // Penalty: Draw 2
      const drawn = drawCardsFromDeck(2);
      finalHand = [...nextHand, ...drawn.cards];
      setDeck(drawn.remainingDeck);
      penaltyApplied = true;
    }

    if (isP1) {
      setPlayerHand(finalHand);
      setSaidOchoP1(false);
    } else {
      setPartnerHand(finalHand);
      setSaidOchoP2(false);
    }

    setDiscardPile(nextDiscard);
    setCurrentColor(chosenColor);

    // Check Victory
    if (finalHand.length === 0) {
      setWinner(player);
      sound.playWin();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      const newScores = {
        ...scores,
        [player]: (scores[player] || 0) + 1,
      };
      setScores(newScores);
      StorageService.saveOchoScores(newScores);
      setLogNote(`🏆 ${player === 'partner1' ? space.partner1.name : space.partner2.name} a vidé son jeu et remporte la partie !`);
      return;
    }

    // Handle special action cards
    let nextTurn: 'partner1' | 'partner2' = opponentId;
    let note = `${player === 'partner1' ? space.partner1.name : space.partner2.name} a posé un ${getCardLabel(card)}`;

    if (penaltyApplied) {
      note += ` (Oubli de crier "Ocho !" : +2 cartes de pénalité 😜)`;
    }

    if (card.value === '+2') {
      const drawn = drawCardsFromDeck(2);
      const updatedOpponentHand = [...opponentHand, ...drawn.cards];
      if (isP1) setPartnerHand(updatedOpponentHand);
      else setPlayerHand(updatedOpponentHand);
      setDeck(drawn.remainingDeck);
      note += ` ➔ +2 cartes pour l'adversaire et tour passé !`;
      nextTurn = player; // stays with current player
    } else if (card.value === '+4') {
      const drawn = drawCardsFromDeck(4);
      const updatedOpponentHand = [...opponentHand, ...drawn.cards];
      if (isP1) setPartnerHand(updatedOpponentHand);
      else setPlayerHand(updatedOpponentHand);
      setDeck(drawn.remainingDeck);
      note += ` ➔ Super Ocho +4 ! L'adversaire pioche 4 cartes et passe son tour ! Couleur : ${getColorLabel(chosenColor)}`;
      nextTurn = player;
    } else if (card.value === 'skip') {
      note += ` ➔ Carte Saut de tour : l'adversaire passe son tour !`;
      nextTurn = player;
    } else if (card.value === 'reverse') {
      note += ` ➔ Carte Inversion : tu rejoues !`;
      nextTurn = player;
    } else if (card.value === '8') {
      note += ` ➔ Ocho ! Nouvelle couleur : ${getColorLabel(chosenColor)}`;
    }

    setLogNote(note);
    setCurrentTurn(nextTurn);
  };

  // Draw cards helper
  const drawCardsFromDeck = (
    count: number
  ): { cards: OchoCard[]; remainingDeck: OchoCard[] } => {
    let currentDeck = [...deck];
    const drawn: OchoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        // Reshuffle discard pile except top card
        if (discardPile.length > 1) {
          const cardsToRecycle = discardPile.slice(0, discardPile.length - 1);
          currentDeck = shuffle(cardsToRecycle);
          setDiscardPile([topCard]);
        }
      }
      if (currentDeck.length > 0) {
        drawn.push(currentDeck.pop()!);
      }
    }
    return { cards: drawn, remainingDeck: currentDeck };
  };

  // Draw card action by active player
  const handleDrawCard = (player: 'partner1' | 'partner2') => {
    if (winner || currentTurn !== player) return;
    sound.playCard();

    const drawn = drawCardsFromDeck(1);
    if (drawn.cards.length === 0) {
      setLogNote("Il n'y a plus de cartes à piocher !");
      return;
    }

    const card = drawn.cards[0];
    const isP1 = player === 'partner1';
    const nextHand = isP1 ? [...playerHand, card] : [...partnerHand, card];

    if (isP1) setPlayerHand(nextHand);
    else setPartnerHand(nextHand);

    setDeck(drawn.remainingDeck);

    // Can the drawn card be played immediately?
    if (canPlayCard(card)) {
      setLogNote(
        `${player === 'partner1' ? space.partner1.name : space.partner2.name} a pioché un ${getCardLabel(card)} jouable !`
      );
    } else {
      setLogNote(
        `${player === 'partner1' ? space.partner1.name : space.partner2.name} pioche une carte et passe la main.`
      );
      setCurrentTurn(player === 'partner1' ? 'partner2' : 'partner1');
    }
  };

  // Bot Turn handling (when in Bot mode and it's partner2's turn)
  useEffect(() => {
    if (gameMode !== 'bot' || winner || currentTurn !== 'partner2') return;

    const timer = setTimeout(() => {
      // Find playable cards
      const playable = partnerHand.filter((c) => canPlayCard(c));

      // Shout Ocho if about to have 1 card
      if (partnerHand.length === 2) {
        setSaidOchoP2(true);
      }

      if (playable.length > 0) {
        // Pick best card (prioritize action cards or match color)
        const chosen =
          playable.find((c) => c.value === '+4' || c.value === '+2' || c.value === '8') ||
          playable[Math.floor(Math.random() * playable.length)];

        if (chosen.color === 'wild' || chosen.value === '8' || chosen.value === '+4') {
          // Bot picks color of which it has the most cards
          const colorCounts: Record<string, number> = { red: 0, blue: 0, green: 0, purple: 0 };
          partnerHand.forEach((c) => {
            if (c.color !== 'wild') colorCounts[c.color]++;
          });
          const bestColor = (Object.keys(colorCounts) as OchoCardColor[]).reduce((a, b) =>
            colorCounts[a] > colorCounts[b] ? a : b
          );
          executePlayCard(chosen, 'partner2', bestColor);
        } else {
          executePlayCard(chosen, 'partner2', chosen.color);
        }
      } else {
        // Bot must draw
        handleDrawCard('partner2');
      }
    }, 1200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, gameMode, winner, partnerHand, currentColor, topCard]);

  // Say "OCHO !" button clicked
  const handleShoutOcho = (player: 'partner1' | 'partner2') => {
    sound.playTap();
    sound.playHeartbeat();
    if (player === 'partner1') {
      setSaidOchoP1(true);
    } else {
      setSaidOchoP2(true);
    }
    setLogNote(`🔥 ${player === 'partner1' ? space.partner1.name : space.partner2.name} a crié "OCHO !" Il ne lui reste plus qu'une carte !`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1b1235] via-[#221544] to-[#170f2d] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-semibold text-rose-100">
                Ocho Amoureux
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Le 8 Américain
              </span>
            </div>
            <p className="text-xs text-white/60">
              Débarrassez-vous de vos cartes, retournez la situation avec un 8 et gagnez un gage romantique !
            </p>
          </div>
        </div>

        {/* Score & Mode switch */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/60">{space.partner1.name}:</span>
            <span className="font-bold text-rose-300">{scores.partner1}</span>
            <span className="text-white/30">|</span>
            <span className="text-white/60">{space.partner2.name}:</span>
            <span className="font-bold text-indigo-300">{scores.partner2}</span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setGameMode(gameMode === 'bot' ? 'pass_and_play' : 'bot');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/70 hover:text-white transition-all border border-white/[0.08]"
            title="Changer de mode"
          >
            {gameMode === 'bot' ? (
              <>
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Mode Solo/IA</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">2 Joueurs (Passe)</span>
              </>
            )}
          </button>

          <button
            onClick={initNewGame}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08] transition-all"
            title="Recommencer la partie"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="relative rounded-3xl bg-[#110c22] border border-white/[0.08] p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-between min-h-[460px]">
        {/* Opponent Zone (Partner 2 or Bot) */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-md px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/90">
                {space.partner2.name}
              </span>
              {gameMode === 'bot' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium">
                  IA complice
                </span>
              )}
              {currentTurn === 'partner2' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 animate-pulse font-medium border border-indigo-500/30">
                  En train de jouer...
                </span>
              )}
            </div>
            <span className="text-xs text-white/50 font-medium">
              {partnerHand.length} carte{partnerHand.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Opponent Cards (facedown in bot mode, or cards if pass_and_play and partner2 turn) */}
          <div className="flex items-center justify-center -space-x-4 overflow-x-auto py-2 px-4 max-w-full">
            {partnerHand.map((card, idx) => {
              const showFace = gameMode === 'pass_and_play' && currentTurn === 'partner2';
              return (
                <div
                  key={card.id || idx}
                  onClick={() => {
                    if (showFace) handlePlayCard(card, 'partner2');
                  }}
                  className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl transition-all duration-200 select-none shadow-md ${
                    showFace
                      ? getCardStyle(card, canPlayCard(card) && currentTurn === 'partner2')
                      : 'bg-gradient-to-br from-indigo-900 to-purple-950 border border-white/20 flex items-center justify-center text-white/40'
                  }`}
                >
                  {showFace ? (
                    <CardInner card={card} />
                  ) : (
                    <Heart className="w-4 h-4 text-rose-400/40 fill-rose-400/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Table: Discard Pile & Draw Deck */}
        <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {/* Draw Deck */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => handleDrawCard(currentTurn)}
              disabled={Boolean(winner) || (gameMode === 'bot' && currentTurn === 'partner2')}
              className="relative group w-20 h-28 sm:w-24 sm:h-32 rounded-2xl bg-gradient-to-br from-rose-950 via-purple-950 to-indigo-950 border-2 border-rose-500/40 flex flex-col items-center justify-center shadow-xl shadow-rose-950/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              <div className="absolute inset-1 rounded-xl border border-white/10 flex items-center justify-center flex-col">
                <span className="text-xl sm:text-2xl font-black text-rose-300 group-hover:scale-110 transition-transform">
                  8
                </span>
                <span className="text-[10px] text-white/60 tracking-wider font-semibold uppercase mt-0.5">
                  Pioche
                </span>
                <span className="text-[10px] text-rose-400/70 mt-1">
                  ({deck.length})
                </span>
              </div>
            </button>
            <span className="text-[11px] text-white/40">
              {currentTurn === activeUserId ? 'Piocher si bloqué(e)' : 'En attente...'}
            </span>
          </div>

          {/* Active Discard Pile */}
          <div className="flex flex-col items-center gap-1.5">
            {topCard ? (
              <div
                className={`w-20 h-28 sm:w-24 sm:h-32 rounded-2xl shadow-2xl flex flex-col items-center justify-between p-2 sm:p-2.5 transition-all animate-in zoom-in-95 duration-200 ${getCardStyle(
                  topCard,
                  false
                )}`}
              >
                <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-black">
                  <span>{getCardSymbol(topCard.value)}</span>
                  <span className="text-[9px] uppercase tracking-wider font-medium opacity-75">
                    {topCard.value === '8' ? 'OCHO' : topCard.value}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {getCardSymbol(topCard.value)}
                </div>
                <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-black rotate-180">
                  <span>{getCardSymbol(topCard.value)}</span>
                  <span className="text-[9px] uppercase tracking-wider font-medium opacity-75">
                    {topCard.value}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-2xl border border-white/10" />
            )}

            {/* Active Color Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs">
              <span className="text-[11px] text-white/60">Couleur active :</span>
              <span className="flex items-center gap-1 font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${getColorDot(currentColor)}`} />
                <span className={getColorTextColor(currentColor)}>
                  {getColorLabel(currentColor)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Status / Game Log Toast */}
        <div className="w-full max-w-md py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-xs text-white/70 mb-2 min-h-[30px] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{logNote}</span>
        </div>

        {/* Player Zone (Partner 1 / User) */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-md px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-200">
                {space.partner1.name} (Toi)
              </span>
              {currentTurn === 'partner1' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 animate-pulse font-medium border border-rose-500/30">
                  À ton tour de jouer !
                </span>
              )}
            </div>

            {/* Shout Ocho Button */}
            <button
              onClick={() => handleShoutOcho('partner1')}
              disabled={saidOchoP1 || playerHand.length > 2}
              className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1 ${
                playerHand.length <= 2 && !saidOchoP1
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/40 animate-bounce'
                  : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Ocho !</span>
            </button>
          </div>

          {/* Player Hand Cards */}
          <div className="flex items-center justify-center -space-x-3 sm:-space-x-4 overflow-x-auto py-3 px-4 max-w-full">
            {playerHand.map((card) => {
              const playable = canPlayCard(card) && currentTurn === 'partner1' && !winner;
              return (
                <button
                  key={card.id}
                  onClick={() => handlePlayCard(card, 'partner1')}
                  disabled={!playable}
                  className={`w-14 h-20 sm:w-16 sm:h-24 rounded-2xl transition-all duration-200 select-none shadow-lg transform ${
                    playable
                      ? 'hover:-translate-y-3 cursor-pointer ring-2 ring-white/60 hover:ring-rose-400'
                      : 'opacity-50 cursor-not-allowed'
                  } ${getCardStyle(card, playable)}`}
                >
                  <CardInner card={card} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Victory Overlay Modal */}
        {winner && (
          <div className="absolute inset-0 bg-[#0c081ad9] backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-3 animate-bounce">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">
              Victoire de {winner === 'partner1' ? space.partner1.name : space.partner2.name} !
            </h3>
            <p className="text-xs sm:text-sm text-rose-200/80 max-w-xs mb-5 font-light">
              Toutes les cartes ont été posées ! Le ou la gagnante a droit à son gage romantique.
            </p>

            {/* Pledge selector / reward */}
            <div className="w-full max-w-sm p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-left mb-5">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-2">
                <Gift className="w-3.5 h-3.5" />
                <span>Choisis la promesse du vainqueur :</span>
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {ROMANTIC_PLEDGES.map((pledge, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sound.playTap();
                      setSelectedPledge(pledge);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedPledge === pledge
                        ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50'
                        : 'bg-white/[0.03] text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    {pledge}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={initNewGame}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
              >
                Rejouer une manche
              </button>
            </div>
          </div>
        )}

        {/* Wild 8 / +4 Color Picker Modal */}
        {colorPickerCard && (
          <div className="absolute inset-0 bg-[#0c081ae6] backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-[#181135] border border-white/[0.1] shadow-2xl max-w-xs w-full text-center space-y-4">
              <span className="text-xs font-serif italic text-rose-300">
                Ocho magique !
              </span>
              <h4 className="text-base font-semibold text-white">
                Choisis la nouvelle couleur
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      const card = colorPickerCard;
                      setColorPickerCard(null);
                      executePlayCard(card, currentTurn, c.key);
                    }}
                    className={`p-3.5 rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} text-white font-bold text-xs shadow-lg ${c.glow} hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-1.5`}
                  >
                    <span className="text-lg">♦</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Explainer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-white/50 space-y-1.5">
        <div className="flex items-center gap-1.5 text-white/70 font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Règles rapides du Ocho Amoureux :</span>
        </div>
        <p>
          • Jouez une carte de la <strong>même couleur</strong> ou du <strong>même chiffre</strong> que la pile.
        </p>
        <p>
          • La carte <strong>8 (Ocho)</strong> est un joker : jouable n’importe quand, elle permet de choisir la couleur.
        </p>
        <p>
          • Cartes spéciales : <strong>+2</strong> (l'autre pioche 2 et passe), <strong>Saut</strong> (passe son tour), <strong>Inversion</strong> (rejoue), et le <strong>Super +4</strong> !
        </p>
        <p>
          • N'oubliez pas d'appuyer sur <strong>"Ocho !"</strong> quand il ne vous reste qu'une seule carte avant de jouer, sinon vous recevrez 2 cartes de pénalité !
        </p>
      </div>
    </div>
  );
};

// Sub-components & Style Helpers
function CardInner({ card }: { card: OchoCard }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-1 sm:p-1.5">
      <div className="w-full flex items-center justify-between text-[10px] sm:text-xs font-black">
        <span>{getCardSymbol(card.value)}</span>
        <span className="text-[8px] uppercase tracking-wider font-semibold opacity-75">
          {card.value === '8' ? 'OCHO' : ''}
        </span>
      </div>
      <div className="text-base sm:text-lg font-black tracking-tight">
        {getCardSymbol(card.value)}
      </div>
      <div className="w-full flex items-center justify-between text-[10px] sm:text-xs font-black rotate-180">
        <span>{getCardSymbol(card.value)}</span>
      </div>
    </div>
  );
}

function getCardStyle(card: OchoCard, playable: boolean): string {
  if (card.color === 'wild') {
    return 'bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 border border-amber-300 text-white shadow-rose-500/20';
  }
  switch (card.color) {
    case 'red':
      return 'bg-gradient-to-br from-rose-600 to-red-700 border border-rose-400/80 text-white';
    case 'blue':
      return 'bg-gradient-to-br from-sky-600 to-blue-700 border border-sky-400/80 text-white';
    case 'green':
      return 'bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/80 text-white';
    case 'purple':
      return 'bg-gradient-to-br from-purple-600 to-indigo-800 border border-purple-400/80 text-white';
    default:
      return 'bg-gray-800 border-gray-600 text-white';
  }
}

function getCardSymbol(val: OchoCardValue): string {
  switch (val) {
    case '+2':
      return '+2';
    case '+4':
      return '+4';
    case 'skip':
      return '🚫';
    case 'reverse':
      return '⇄';
    case '8':
      return '8★';
    default:
      return val;
  }
}

function getCardLabel(card: OchoCard): string {
  if (card.value === '8') return 'Ocho (8 Joker)';
  if (card.value === '+4') return 'Super Ocho (+4)';
  if (card.value === '+2') return `+2 (${getColorLabel(card.color)})`;
  if (card.value === 'skip') return `Saut de tour (${getColorLabel(card.color)})`;
  if (card.value === 'reverse') return `Inversion (${getColorLabel(card.color)})`;
  return `${card.value} ${getColorLabel(card.color)}`;
}

function getColorLabel(c: OchoCardColor): string {
  switch (c) {
    case 'red':
      return 'Rouge';
    case 'blue':
      return 'Bleu';
    case 'green':
      return 'Vert';
    case 'purple':
      return 'Pourpre';
    case 'wild':
      return 'Multicolore';
  }
}

function getColorDot(c: OchoCardColor): string {
  switch (c) {
    case 'red':
      return 'bg-rose-500 shadow-rose-500/50 shadow-sm';
    case 'blue':
      return 'bg-sky-500 shadow-sky-500/50 shadow-sm';
    case 'green':
      return 'bg-emerald-500 shadow-emerald-500/50 shadow-sm';
    case 'purple':
      return 'bg-purple-500 shadow-purple-500/50 shadow-sm';
    default:
      return 'bg-white';
  }
}

function getColorTextColor(c: OchoCardColor): string {
  switch (c) {
    case 'red':
      return 'text-rose-400';
    case 'blue':
      return 'text-sky-400';
    case 'green':
      return 'text-emerald-400';
    case 'purple':
      return 'text-purple-400';
    default:
      return 'text-white';
  }
}
