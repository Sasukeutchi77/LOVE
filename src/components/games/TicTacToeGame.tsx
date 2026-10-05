import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, UserCheck, Bot } from 'lucide-react';
import { TicTacToeState, CoupleSpace } from '../../types';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface TicTacToeGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  space,
  activeUserId,
}) => {
  const [gameState, setGameState] = useState<TicTacToeState>(() =>
    StorageService.getTicTacToe()
  );
  const [autoPartnerMove, setAutoPartnerMove] = useState(true);
  const [isPartnerThinking, setIsPartnerThinking] = useState(false);
  const [tokenTheme, setTokenTheme] = useState<'hearts' | 'roses' | 'kiss'>('hearts');
  const [streak, setStreak] = useState(0);

  const tokens = {
    hearts: { p1: '💖', p2: '💜' },
    roses: { p1: '🌹', p2: '⭐' },
    kiss: { p1: '💋', p2: '🧸' },
  }[tokenTheme];

  // Sync state with storage / cross-tab broadcast
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'TICTACTOE_UPDATED') {
        setGameState(event.payload as TicTacToeState);
      }
    });
    return unsubscribe;
  }, []);

  const checkWinner = (board: Array<'p1' | 'p2' | null>) => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: combo };
      }
    }
    if (board.every((cell) => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (gameState.board[index] || gameState.winner || isPartnerThinking) return;

    sound.playTap();
    const newBoard = [...gameState.board];
    const playerMark = gameState.currentTurn;
    newBoard[index] = playerMark;

    const winResult = checkWinner(newBoard);
    let nextTurn: 'p1' | 'p2' = playerMark === 'p1' ? 'p2' : 'p1';
    let newScores = { ...gameState.scores };

    if (winResult) {
      if (winResult.winner === 'p1') {
        newScores.p1 += 1;
        sound.playWin();
        triggerConfetti();
      } else if (winResult.winner === 'p2') {
        newScores.p2 += 1;
        sound.playWin();
        triggerConfetti();
      } else {
        newScores.draws += 1;
      }
    }

    const updatedState: TicTacToeState = {
      board: newBoard,
      currentTurn: winResult ? gameState.currentTurn : nextTurn,
      winner: winResult ? winResult.winner : null,
      winningLine: winResult ? winResult.line : null,
      scores: newScores,
    };

    setGameState(updatedState);
    StorageService.saveTicTacToe(updatedState);

    // If auto partner response is turned on and game isn't finished
    if (autoPartnerMove && !winResult && nextTurn !== (activeUserId === 'partner1' ? 'p1' : 'p2')) {
      simulatePartnerResponse(newBoard, nextTurn, newScores);
    }
  };

  const simulatePartnerResponse = (
    currentBoard: Array<'p1' | 'p2' | null>,
    partnerTurn: 'p1' | 'p2',
    currentScores: { p1: number; p2: number; draws: number }
  ) => {
    setIsPartnerThinking(true);
    setTimeout(() => {
      // Find empty cells
      const emptyIndices = currentBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (emptyIndices.length === 0) {
        setIsPartnerThinking(false);
        return;
      }

      // Pick center or strategic/random cell
      let chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      if (emptyIndices.includes(4) && Math.random() > 0.4) {
        chosenIndex = 4;
      }

      sound.playTap();
      const updatedBoard = [...currentBoard];
      updatedBoard[chosenIndex] = partnerTurn;

      const winResult = checkWinner(updatedBoard);
      const nextTurnAfter = partnerTurn === 'p1' ? 'p2' : 'p1';
      let nextScores = { ...currentScores };

      if (winResult) {
        if (winResult.winner === 'p1') {
          nextScores.p1 += 1;
          sound.playWin();
          triggerConfetti();
        } else if (winResult.winner === 'p2') {
          nextScores.p2 += 1;
          sound.playWin();
          triggerConfetti();
        } else {
          nextScores.draws += 1;
        }
      }

      const finalState: TicTacToeState = {
        board: updatedBoard,
        currentTurn: winResult ? partnerTurn : nextTurnAfter,
        winner: winResult ? winResult.winner : null,
        winningLine: winResult ? winResult.line : null,
        scores: nextScores,
      };

      setGameState(finalState);
      StorageService.saveTicTacToe(finalState);
      setIsPartnerThinking(false);
    }, 900);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#a855f7', '#fb7185'],
      });
    } catch {
      // Ignore
    }
  };

  const handleResetGame = () => {
    sound.playTap();
    const resetState: TicTacToeState = {
      board: Array(9).fill(null),
      currentTurn: 'p1',
      winner: null,
      winningLine: null,
      scores: gameState.scores,
    };
    setGameState(resetState);
    StorageService.saveTicTacToe(resetState);
  };

  const getWinnerName = () => {
    if (gameState.winner === 'p1') return space.partner1.name;
    if (gameState.winner === 'p2') return space.partner2.name;
    return 'Égalité parfaite !';
  };

  const currentTurnName =
    gameState.currentTurn === 'p1' ? space.partner1.name : space.partner2.name;

  return (
    <div className="space-y-5">
      {/* Game Header & Turn Status */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <span className="text-[11px] text-white/50 block">Morpion d’amour</span>
          {gameState.winner ? (
            <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-rose-300 text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {gameState.winner === 'draw'
                  ? 'Match nul, deux cœurs synchrones !'
                  : `Bravo ${getWinnerName()} ! 💖`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-white/90">
              <span
                className={`w-2 h-2 rounded-full ${
                  gameState.currentTurn === 'p1' ? 'bg-rose-400' : 'bg-purple-400'
                } animate-pulse`}
              />
              <span>
                {isPartnerThinking
                  ? `${currentTurnName} réfléchit tendrement...`
                  : `Au tour de ${currentTurnName} (${
                      gameState.currentTurn === 'p1' ? '💖' : '💜'
                    })`}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleResetGame}
          className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white transition-all active:scale-95 border border-white/[0.08]"
          title="Recommencer la partie"
          aria-label="Recommencer la partie"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3x3 Board */}
      <div className="max-w-[320px] mx-auto aspect-square p-3 rounded-3xl bg-gradient-to-b from-[#181132] to-[#120c24] border border-white/[0.1] shadow-2xl grid grid-cols-3 gap-2.5">
        {gameState.board.map((cell, idx) => {
          const isWinningCell = gameState.winningLine?.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={Boolean(cell || gameState.winner || isPartnerThinking)}
              aria-label={`Case ${idx + 1}`}
              className={`aspect-square rounded-2xl flex items-center justify-center text-3xl font-bold transition-all select-none ${
                cell
                  ? isWinningCell
                    ? 'bg-rose-500/25 border-2 border-rose-400 scale-95 shadow-lg shadow-rose-950/60'
                    : 'bg-white/[0.04] border border-white/[0.06]'
                  : 'bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.07] active:scale-95'
              }`}
            >
              {cell === 'p1' && (
                <span className="text-2xl filter drop-shadow animate-in fade-in zoom-in duration-150">
                  {tokens.p1}
                </span>
              )}
              {cell === 'p2' && (
                <span className="text-2xl filter drop-shadow animate-in fade-in zoom-in duration-150">
                  {tokens.p2}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scores Counter */}
      <div className="grid grid-cols-3 gap-2 max-w-[320px] mx-auto text-center">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] text-rose-300 block truncate">
            {space.partner1.name} ({tokens.p1})
          </span>
          <span className="text-base font-bold text-rose-200 tabular-nums">
            {gameState.scores.p1}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[10px] text-white/40 block">Nuls</span>
          <span className="text-base font-bold text-white/80 tabular-nums">
            {gameState.scores.draws}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-[10px] text-purple-300 block truncate">
            {space.partner2.name} ({tokens.p2})
          </span>
          <span className="text-base font-bold text-purple-200 tabular-nums">
            {gameState.scores.p2}
          </span>
        </div>
      </div>

      {/* Token Selector & Mode Switcher */}
      <div className="max-w-[320px] mx-auto pt-1 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="text-[11px]">Symboles amoureux :</span>
          <div className="flex gap-1">
            {[
              { id: 'hearts', label: '💖 💜' },
              { id: 'roses', label: '🌹 ⭐' },
              { id: 'kiss', label: '💋 🧸' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  sound.playTap();
                  setTokenTheme(theme.id as 'hearts' | 'roses' | 'kiss');
                }}
                className={`px-2 py-0.5 rounded-lg text-xs transition-all ${
                  tokenTheme === theme.id
                    ? 'bg-rose-500/25 border border-rose-400 text-white shadow-sm'
                    : 'bg-white/[0.04] text-white/50 hover:text-white'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/60 pt-1 border-t border-white/[0.04]">
          <span className="text-[11px]">Mode solo / réponse simulée :</span>
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
            {autoPartnerMove ? 'Actif (1s)' : 'Passe & Joue'}
          </button>
        </div>
      </div>
    </div>
  );
};
