import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, Undo2 } from 'lucide-react';
import { Connect4State, CoupleSpace } from '../../types';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface Connect4GameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const ROWS = 6;
const COLS = 7;

export const Connect4Game: React.FC<Connect4GameProps> = ({
  space,
  activeUserId,
}) => {
  const [gameState, setGameState] = useState<Connect4State>(() =>
    StorageService.getConnect4()
  );
  const [autoPartnerMove, setAutoPartnerMove] = useState(true);
  const [isPartnerThinking, setIsPartnerThinking] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [history, setHistory] = useState<Connect4State[]>([]);

  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'CONNECT4_UPDATED') {
        setGameState(event.payload as Connect4State);
      }
    });
    return unsubscribe;
  }, []);

  const checkConnect4Winner = (grid: Array<Array<'p1' | 'p2' | null>>) => {
    // 1. Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = grid[r][c];
        if (p && p === grid[r][c + 1] && p === grid[r][c + 2] && p === grid[r][c + 3]) {
          return {
            winner: p,
            cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] as Array<[number, number]>,
          };
        }
      }
    }

    // 2. Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = grid[r][c];
        if (p && p === grid[r + 1][c] && p === grid[r + 2][c] && p === grid[r + 3][c]) {
          return {
            winner: p,
            cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] as Array<[number, number]>,
          };
        }
      }
    }

    // 3. Diagonal Down-Right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = grid[r][c];
        if (p && p === grid[r + 1][c + 1] && p === grid[r + 2][c + 2] && p === grid[r + 3][c + 3]) {
          return {
            winner: p,
            cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] as Array<[number, number]>,
          };
        }
      }
    }

    // 4. Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = grid[r][c];
        if (p && p === grid[r - 1][c + 1] && p === grid[r - 2][c + 2] && p === grid[r - 3][c + 3]) {
          return {
            winner: p,
            cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] as Array<[number, number]>,
          };
        }
      }
    }

    // Check draw
    const isFull = grid[0].every((cell) => cell !== null);
    if (isFull) {
      return { winner: 'draw' as const, cells: null };
    }

    return null;
  };

  const dropToken = (col: number) => {
    if (gameState.winner || isPartnerThinking) return;

    // Check if column is full
    if (gameState.grid[0][col] !== null) return;

    sound.playTap();

    // Find the lowest empty row in this column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (gameState.grid[r][col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    sound.playChipDrop();
    setHistory((prev) => [...prev, gameState]);

    const newGrid = gameState.grid.map((row) => [...row]);
    const currentMark = gameState.currentTurn;
    newGrid[targetRow][col] = currentMark;

    const winResult = checkConnect4Winner(newGrid);
    const nextTurn = currentMark === 'p1' ? 'p2' : 'p1';
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
      }
    }

    const updatedState: Connect4State = {
      grid: newGrid,
      currentTurn: winResult ? gameState.currentTurn : nextTurn,
      winner: winResult ? winResult.winner : null,
      winningCells: winResult ? winResult.cells : null,
      scores: newScores,
    };

    setGameState(updatedState);
    StorageService.saveConnect4(updatedState);

    // Auto partner move if enabled
    if (autoPartnerMove && !winResult && nextTurn !== (activeUserId === 'partner1' ? 'p1' : 'p2')) {
      simulatePartnerResponse(newGrid, nextTurn, newScores);
    }
  };

  const simulatePartnerResponse = (
    currentGrid: Array<Array<'p1' | 'p2' | null>>,
    partnerMark: 'p1' | 'p2',
    currentScores: { p1: number; p2: number }
  ) => {
    setIsPartnerThinking(true);
    setTimeout(() => {
      // Find columns that are not full
      const availableCols = [];
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[0][c] === null) availableCols.push(c);
      }

      if (availableCols.length === 0) {
        setIsPartnerThinking(false);
        return;
      }

      // Pick column (favoring middle 2, 3, 4)
      let chosenCol = availableCols[Math.floor(Math.random() * availableCols.length)];
      if (availableCols.includes(3) && Math.random() > 0.4) {
        chosenCol = 3;
      }

      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (currentGrid[r][chosenCol] === null) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) {
        setIsPartnerThinking(false);
        return;
      }

      sound.playTap();
      const updatedGrid = currentGrid.map((row) => [...row]);
      updatedGrid[targetRow][chosenCol] = partnerMark;

      const winResult = checkConnect4Winner(updatedGrid);
      const nextTurnAfter = partnerMark === 'p1' ? 'p2' : 'p1';
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
        }
      }

      const finalState: Connect4State = {
        grid: updatedGrid,
        currentTurn: winResult ? partnerMark : nextTurnAfter,
        winner: winResult ? winResult.winner : null,
        winningCells: winResult ? winResult.cells : null,
        scores: nextScores,
      };

      setGameState(finalState);
      StorageService.saveConnect4(finalState);
      setIsPartnerThinking(false);
    }, 1000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#a855f7'],
      });
    } catch {
      // Ignore
    }
  };

  const handleResetGame = () => {
    sound.playTap();
    const emptyGrid = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));

    const resetState: Connect4State = {
      grid: emptyGrid,
      currentTurn: 'p1',
      winner: null,
      winningCells: null,
      scores: gameState.scores,
    };
    setHistory([]);
    setGameState(resetState);
    StorageService.saveConnect4(resetState);
  };

  const handleUndo = () => {
    if (history.length === 0 || isPartnerThinking) return;
    sound.playTap();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setGameState(previous);
    StorageService.saveConnect4(previous);
  };

  const getWinnerName = () => {
    if (gameState.winner === 'p1') return space.partner1.name;
    if (gameState.winner === 'p2') return space.partner2.name;
    return 'Match nul';
  };

  const currentTurnName =
    gameState.currentTurn === 'p1' ? space.partner1.name : space.partner2.name;

  return (
    <div className="space-y-4">
      {/* Header with Turn Status */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <span className="text-[11px] text-white/50 block">Puissance 4 amoureux</span>
          {gameState.winner ? (
            <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-rose-300 text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {gameState.winner === 'draw'
                  ? 'Égalité parfaite !'
                  : `4 d’affilée pour ${getWinnerName()} ! 💖`}
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
                  ? `${currentTurnName} prépare son coup...`
                  : `Au tour de ${currentTurnName} (${
                      gameState.currentTurn === 'p1' ? 'Rose' : 'Violet'
                    })`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isPartnerThinking}
            className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white transition-all active:scale-95 border border-white/[0.08] disabled:opacity-30 disabled:pointer-events-none"
            title="Annuler le dernier coup"
            aria-label="Annuler le coup"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetGame}
            className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white transition-all active:scale-95 border border-white/[0.08]"
            title="Recommencer la partie"
            aria-label="Recommencer la partie"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="max-w-[340px] mx-auto p-3.5 rounded-3xl bg-gradient-to-b from-[#1b1236] to-[#110b24] border border-white/[0.1] shadow-2xl">
        {/* Column Drop Buttons Header */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              onClick={() => dropToken(c)}
              onMouseEnter={() => setHoveredCol(c)}
              onMouseLeave={() => setHoveredCol(null)}
              disabled={Boolean(
                gameState.grid[0][c] !== null ||
                gameState.winner ||
                isPartnerThinking
              )}
              className="h-6 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-white/40 hover:text-rose-300 flex items-center justify-center text-[10px] transition-colors disabled:opacity-20"
              aria-label={`Déposer colonne ${c + 1}`}
            >
              ↓
            </button>
          ))}
        </div>

        {/* 6x7 Grid */}
        <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#0c0818] rounded-2xl border border-white/[0.05]">
          {gameState.grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isWinningCell = gameState.winningCells?.some(
                ([wr, wc]) => wr === rIdx && wc === cIdx
              );

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => dropToken(cIdx)}
                  disabled={Boolean(gameState.winner || isPartnerThinking)}
                  className={`aspect-square rounded-full flex items-center justify-center transition-all ${
                    cell === 'p1'
                      ? isWinningCell
                        ? 'bg-rose-500 shadow-lg shadow-rose-400 scale-95 ring-2 ring-rose-200 animate-bounce'
                        : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-md shadow-rose-950'
                      : cell === 'p2'
                      ? isWinningCell
                        ? 'bg-purple-500 shadow-lg shadow-purple-400 scale-95 ring-2 ring-purple-200 animate-bounce'
                        : 'bg-gradient-to-br from-purple-400 to-indigo-600 shadow-md shadow-purple-950'
                      : 'bg-[#150f28] hover:bg-[#1f163b] border border-white/[0.04]'
                  }`}
                  aria-label={`Case ligne ${rIdx + 1}, colonne ${cIdx + 1}`}
                >
                  {isWinningCell && (
                    <Sparkles className="w-3 h-3 text-white fill-white" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Scores Counter */}
      <div className="grid grid-cols-2 gap-3 max-w-[340px] mx-auto text-center">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] text-rose-300 block truncate">
            {space.partner1.name} (Rose)
          </span>
          <span className="text-base font-bold text-rose-200 tabular-nums">
            {gameState.scores.p1}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-[10px] text-purple-300 block truncate">
            {space.partner2.name} (Violet)
          </span>
          <span className="text-base font-bold text-purple-200 tabular-nums">
            {gameState.scores.p2}
          </span>
        </div>
      </div>

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
          {autoPartnerMove ? 'Actif (1s)' : 'Passe & Joue'}
        </button>
      </div>
    </div>
  );
};
