import React, { useState } from 'react';
import {
  Grid3X3,
  CircleDot,
  HelpCircle,
  Flame,
  LayoutGrid,
  Scale,
  Compass,
  Disc,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Shuffle,
  Search,
} from 'lucide-react';
import { GameId, CoupleSpace } from '../types';
import { TicTacToeGame } from './games/TicTacToeGame';
import { Connect4Game } from './games/Connect4Game';
import { LoveQuizGame } from './games/LoveQuizGame';
import { TruthOrDareGame } from './games/TruthOrDareGame';
import { MemoryGame } from './games/MemoryGame';
import { WouldYouRatherGame } from './games/WouldYouRatherGame';
import { BattleshipGame } from './games/BattleshipGame';
import { WheelGame } from './games/WheelGame';
import { OchoGame } from './games/OchoGame';
import { sound } from '../services/sound';

interface GamesSectionProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

interface GameDefinition {
  id: GameId;
  title: string;
  category: 'Classiques' | 'Confidences' | 'Complicité' | 'Destin';
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const ALL_GAMES: GameDefinition[] = [
  {
    id: 'tictactoe',
    title: 'Morpion d’amour',
    category: 'Classiques',
    desc: 'Alignez 3 cœurs roses ou violets sur la grille.',
    icon: Grid3X3,
    tag: 'Rapide & Câlin',
  },
  {
    id: 'connect4',
    title: 'Puissance 4 amoureux',
    category: 'Classiques',
    desc: 'Faites tomber 4 jetons d’amour d’affilée.',
    icon: CircleDot,
    tag: 'Stratégie douce',
  },
  {
    id: 'memory',
    title: 'Memory de nos Cœurs',
    category: 'Classiques',
    desc: 'Retrouvez les paires de nos symboles romantiques.',
    icon: LayoutGrid,
    tag: '16 cartes',
  },
  {
    id: 'quiz',
    title: 'Quiz amoureux',
    category: 'Confidences',
    desc: 'Réponses secrètes révélées ensemble.',
    icon: HelpCircle,
    tag: 'Intimité',
  },
  {
    id: 'truthordare',
    title: 'Action ou Vérité',
    category: 'Confidences',
    desc: 'Défis caméra, vocaux doux ou vérités piquantes.',
    icon: Flame,
    tag: 'Piquant & Rires',
  },
  {
    id: 'wouldyourather',
    title: 'Tu Préfères... Amoureux',
    category: 'Complicité',
    desc: 'Dilemmes de couple et vote de compatibilité.',
    icon: Scale,
    tag: 'Même longueur d’onde',
  },
  {
    id: 'battleship',
    title: 'Îles Secrètes',
    category: 'Destin',
    desc: 'Explorez la carte pour trouver les 3 trésors cachés.',
    icon: Compass,
    tag: 'Exploration à deux',
  },
  {
    id: 'wheel',
    title: 'Roue des Promesses',
    category: 'Destin',
    desc: 'Tournez la roue des câlins pour vos retrouvailles.',
    icon: Disc,
    tag: 'Carnet de promesses',
  },
  {
    id: 'ocho',
    title: 'Ocho Amoureux',
    category: 'Classiques',
    desc: 'Le jeu de cartes culte (8 Américain) : changez la couleur, criez Ocho et gagnez un gage !',
    icon: Flame,
    tag: 'Culte & Addictif',
  },
];

export const GamesSection: React.FC<GamesSectionProps> = ({
  space,
  activeUserId,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const handleSelectGame = (id: GameId) => {
    sound.playTap();
    setSelectedGameId(id);
  };

  const handleBackToCatalogue = () => {
    sound.playTap();
    setSelectedGameId(null);
  };

  const handleRandomGame = () => {
    sound.playTap();
    const randomGame = ALL_GAMES[Math.floor(Math.random() * ALL_GAMES.length)];
    setSelectedGameId(randomGame.id);
  };

  const currentGame = ALL_GAMES.find((g) => g.id === selectedGameId);

  const filteredGames = ALL_GAMES.filter((g) => {
    if (activeCategoryFilter === 'all') return true;
    return g.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* If a game is selected, show Game View */}
      {selectedGameId && currentGame ? (
        <div className="space-y-4">
          {/* Game Top Navigation */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#140f26] border border-white/[0.08]">
            <button
              onClick={handleBackToCatalogue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white/80 hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tous les jeux (9)</span>
            </button>

            {/* Quick Switch Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/40 hidden sm:inline">Changer :</span>
              <select
                value={selectedGameId}
                onChange={(e) => handleSelectGame(e.target.value as GameId)}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-rose-200 focus:outline-none"
              >
                {ALL_GAMES.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#140f26] text-white">
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Render Active Game */}
          {selectedGameId === 'tictactoe' && (
            <TicTacToeGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'connect4' && (
            <Connect4Game space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'quiz' && (
            <LoveQuizGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'truthordare' && (
            <TruthOrDareGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'memory' && (
            <MemoryGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'wouldyourather' && (
            <WouldYouRatherGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'battleship' && (
            <BattleshipGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'wheel' && (
            <WheelGame space={space} activeUserId={activeUserId} />
          )}
          {selectedGameId === 'ocho' && (
            <OchoGame space={space} activeUserId={activeUserId} />
          )}
        </div>
      ) : (
        /* Catalogue View: 9 Romantic Games */
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181135] to-[#120e24] border border-white/[0.08] shadow-xl space-y-2">
            <span className="text-xs font-serif italic text-rose-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Salon de jeux privé</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-rose-100 font-semibold leading-tight">
              9 jeux complices pour se retrouver à deux
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              Choisissez une activité pour rire, vous défier aux cartes avec Ocho ou vous murmurer vos secrets les plus tendres.
            </p>

            {/* Category Filter Pills & Random Game Button */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
                {[
                  { id: 'all', label: 'Tous (9)' },
                  { id: 'Classiques', label: 'Classiques' },
                  { id: 'Confidences', label: 'Confidences' },
                  { id: 'Complicité', label: 'Complicité' },
                  { id: 'Destin', label: 'Promesses' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playTap();
                      setActiveCategoryFilter(cat.id);
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      activeCategoryFilter === cat.id
                        ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 shadow-sm'
                        : 'bg-white/[0.04] text-white/50 hover:text-white/80 border border-white/[0.04]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRandomGame}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 text-rose-200 border border-rose-400/30 text-[11px] font-medium flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm"
                title="Lancer un jeu au hasard"
              >
                <Shuffle className="w-3 h-3 text-rose-400" />
                <span>Au hasard</span>
              </button>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredGames.map((game) => {
              const Icon = game.icon;

              return (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game.id)}
                  className="p-4 rounded-3xl bg-[#140f26] hover:bg-[#1b1433] border border-white/[0.08] hover:border-rose-400/30 text-left transition-all group flex items-start justify-between gap-3 shadow-lg shadow-black/20 active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center text-rose-300 group-hover:scale-105 group-hover:text-rose-200 transition-all shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white group-hover:text-rose-200 transition-colors">
                          {game.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                        {game.desc}
                      </p>
                      <div className="text-[10px] text-rose-300/80 pt-1 font-medium">
                        {game.tag}
                      </div>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/[0.04] group-hover:bg-rose-500/20 flex items-center justify-center text-white/30 group-hover:text-rose-300 transition-colors shrink-0 mt-2">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
