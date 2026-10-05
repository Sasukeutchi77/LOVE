import React, { useState } from 'react';
import { Sparkles, Utensils, Film, MapPin, Music, BookOpen, Shuffle, Calendar, Check, X, Heart } from 'lucide-react';
import { CoupleSpace } from '../types';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface DateNightModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpace;
  onAddPlannedDate: (title: string, note: string) => void;
}

interface DateIdea {
  id: string;
  title: string;
  category: string;
  icon: string;
  duration: string;
  preparation: string;
  description: string;
  romanticTip: string;
}

const DATE_IDEAS: DateIdea[] = [
  {
    id: 'd1',
    title: 'Chef Étoilé à Distance',
    category: 'Gourmandise',
    icon: '🍝',
    duration: '1h30',
    preparation: 'Acheter les mêmes ingrédients : pâtes fraîches, sauce truffe ou basilic, parmesan.',
    description: 'Enfilez vos tabliers, posez votre téléphone sur le plan de travail et cuisinez la même recette pas à pas en trinquant en visio.',
    romanticTip: 'Goûtez votre plat exactement à la même seconde et comparez votre dressage !',
  },
  {
    id: 'd2',
    title: 'Ciné sous la Même Lune',
    category: 'Cocooning',
    icon: '🎬',
    duration: '2h',
    preparation: 'Plaid douillet, même paquet de pop-corn ou chocolat chaud.',
    description: 'Choisissez un film ou une série que vous rêviez de voir. Lancez la lecture exactement au décompte "3, 2, 1... Play !".',
    romanticTip: 'Gardez un appel vocal ou vidéo silencieux pour entendre les rires et réactions de l’autre.',
  },
  {
    id: 'd3',
    title: 'Visite Nocturne Guidée',
    category: 'Aventure',
    icon: '🌙',
    duration: '45 min',
    preparation: 'Écouteurs, manteau chaud et batterie chargée.',
    description: 'Emmenez l’autre en balade nocturne dans les rues de votre ville, caméra retournée vers les réverbères et vos coins préférés.',
    romanticTip: 'Arrêtez-vous devant un banc et imaginez-vous assis dessus ensemble.',
  },
  {
    id: 'd4',
    title: 'Lecture pour Doux Sommeil',
    category: 'Tendresse',
    icon: '📖',
    duration: '30 min',
    preparation: 'Chambre tamisée, livre de poèmes ou histoire captivante.',
    description: 'L’un lit un chapitre à voix basse et apaisante pendant que l’autre ferme les yeux et se laisse bercer jusqu’au sommeil.',
    romanticTip: 'Glissez son prénom au détour d’une phrase du livre.',
  },
  {
    id: 'd5',
    title: 'Dégustation Mystère Surprise',
    category: 'Surprise',
    icon: '🥐',
    duration: '1h',
    preparation: 'Commander une livraison secrète de pâtisserie ou dessert chez l’autre sans rien lui dire.',
    description: 'À l’arrivée du livreur, ouvrez la boîte ensemble face caméra et dégustez la douceur choisie avec amour.',
    romanticTip: 'Choisissez le gâteau qui symbolise votre premier rendez-vous.',
  },
  {
    id: 'd6',
    title: 'Concert Privé sous les Étoiles',
    category: 'Musique',
    icon: '🎧',
    duration: '1h',
    preparation: 'Créer une playlist de 10 morceaux qui racontent votre histoire.',
    description: 'Allongez-vous dans le noir chacun dans votre lit, lancez la playlist simultanément et fermez les yeux en vous tenant virtuellement la main.',
    romanticTip: 'Laissez-vous un message vocal sur le morceau le plus marquant.',
  },
];

export const DateNightModal: React.FC<DateNightModalProps> = ({
  isOpen,
  onClose,
  space,
  onAddPlannedDate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [plannedSuccess, setPlannedSuccess] = useState(false);

  const currentIdea = DATE_IDEAS[currentIndex];

  const handlePickRandom = () => {
    sound.playTap();
    let nextIdx = Math.floor(Math.random() * DATE_IDEAS.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % DATE_IDEAS.length;
    }
    setCurrentIndex(nextIdx);
    setPlannedSuccess(false);
  };

  const handlePlanDate = () => {
    sound.playWin();
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fda4af', '#f472b6', '#c084fc'],
      });
    } catch {
      // Ignore
    }

    onAddPlannedDate(
      `Date : ${currentIdea.title}`,
      `Rendez-vous à distance prévu : ${currentIdea.description}`
    );

    setPlannedSuccess(true);
    setTimeout(() => {
      setPlannedSuccess(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-rose-100">
                Idées de Rendez-vous à Distance
              </h2>
              <span className="text-[11px] text-white/50 block">
                Rompre la routine avec une soirée magique
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Idea Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181135] to-[#140e29] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{currentIdea.icon}</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-medium border border-rose-400/30">
                {currentIdea.category}
              </span>
              <span className="text-[10px] text-white/40">~ {currentIdea.duration}</span>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold text-white">
              {currentIdea.title}
            </h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              {currentIdea.description}
            </p>
          </div>

          {/* Preparation & Tip */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-0.5">
                À préparer
              </span>
              <p className="text-[11px] text-white/80">{currentIdea.preparation}</p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] uppercase font-bold text-rose-300/80 block mb-0.5">
                Astuce romantique ✨
              </span>
              <p className="text-[11px] text-rose-200/90 italic">
                « {currentIdea.romanticTip} »
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePickRandom}
            className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Autre idée au hasard</span>
          </button>

          <button
            onClick={handlePlanDate}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all active:scale-95"
          >
            {plannedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Ajouté aux projets !</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>Planifier ce date</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
