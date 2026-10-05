import React, { useState } from 'react';
import { Sparkles, Flame, Heart, Shuffle, Plus, CheckCircle2, RotateCw } from 'lucide-react';
import { CoupleSpace, TruthOrDareItem } from '../../types';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface TruthOrDareGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const DEFAULT_ITEMS: TruthOrDareItem[] = [
  // Vérités
  {
    id: 't1',
    type: 'truth',
    intensity: 'Doux',
    text: 'Quel est le premier détail physique chez moi qui t’a fait craquer lors de notre rencontre ?',
  },
  {
    id: 't2',
    type: 'truth',
    intensity: 'Complice',
    text: 'Quel est le rêve le plus fou ou secret que tu as déjà fait à mon sujet ?',
  },
  {
    id: 't3',
    type: 'truth',
    intensity: 'Piquant',
    text: 'Quel endroit précis de mon corps aimes-tu le plus embrasser doucement ?',
  },
  {
    id: 't4',
    type: 'truth',
    intensity: 'À distance',
    text: 'À quel moment précis de ta journée la distance te pèse-t-elle le plus fort ?',
  },
  {
    id: 't5',
    type: 'truth',
    intensity: 'Doux',
    text: 'Quelle est la phrase ou le mot tendre que je te dis et qui te réchauffe le plus le cœur ?',
  },
  {
    id: 't6',
    type: 'truth',
    intensity: 'Piquant',
    text: 'Quelle tenue me va le mieux selon toi, celle qui te fait le plus d’effet ?',
  },

  // Actions / Gages
  {
    id: 'd1',
    type: 'dare',
    intensity: 'À distance',
    text: 'Envoie-moi tout de suite un message vocal de 20 secondes en me chuchotant ce que tu aimerais me faire si j’étais près de toi.',
  },
  {
    id: 'd2',
    type: 'dare',
    intensity: 'Doux',
    text: 'Prends une photo spontanée de ton regard là maintenant, sans filtre, et envoie-la moi dans notre messagerie.',
  },
  {
    id: 'd3',
    type: 'dare',
    intensity: 'Complice',
    text: 'Ferme les yeux pendant 30 secondes et décris-moi à voix haute la tenue que tu porteras lors de nos prochaines retrouvailles.',
  },
  {
    id: 'd4',
    type: 'dare',
    intensity: 'Piquant',
    text: 'Mets notre chanson d’amour et fais une petite danse lente et sensuelle face caméra juste pour moi.',
  },
  {
    id: 'd5',
    type: 'dare',
    intensity: 'À distance',
    text: 'Raconte-moi pendant 1 minute chrono ce que nous ferons le premier soir où l’on dormira enfin ensemble.',
  },
  {
    id: 'd6',
    type: 'dare',
    intensity: 'Doux',
    text: 'Écris sur un bout de papier trois adjectifs qui me décrivent, prends-le en photo et garde-le sous ton oreiller ce soir.',
  },
];

export const TruthOrDareGame: React.FC<TruthOrDareGameProps> = ({
  space,
  activeUserId,
}) => {
  const [items, setItems] = useState<TruthOrDareItem[]>(() => {
    try {
      const saved = localStorage.getItem('loveplay_truthordare_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_ITEMS;
  });

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Doux' | 'Complice' | 'Piquant' | 'À distance'>('all');
  const [selectedType, setSelectedType] = useState<'truth' | 'dare' | 'random'>('random');
  const [currentItem, setCurrentItem] = useState<TruthOrDareItem | null>(() => DEFAULT_ITEMS[0]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<'truth' | 'dare'>('truth');
  const [newIntensity, setNewIntensity] = useState<TruthOrDareItem['intensity']>('Doux');

  const me = activeUserId === 'partner1' ? space.partner1 : space.partner2;
  const myLove = activeUserId === 'partner1' ? space.partner2 : space.partner1;

  const pickNewCard = (forcedType?: 'truth' | 'dare') => {
    sound.playTap();
    setIsFlipping(true);

    const typeToPick = forcedType || (selectedType === 'random' ? (Math.random() > 0.5 ? 'truth' : 'dare') : selectedType);

    const filtered = items.filter((it) => {
      const matchType = it.type === typeToPick;
      const matchIntensity = selectedFilter === 'all' || it.intensity === selectedFilter;
      return matchType && matchIntensity;
    });

    const pool = filtered.length > 0 ? filtered : items;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      setCurrentItem(randomPick);
      setIsFlipping(false);
    }, 220);
  };

  const handleCompleteDare = () => {
    sound.playWin();
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
    setCompletedCount((prev) => prev + 1);
    pickNewCard();
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    sound.playTap();
    const created: TruthOrDareItem = {
      id: 'custom_tod_' + Date.now(),
      type: newType,
      intensity: newIntensity,
      text: newText.trim(),
    };

    const updated = [created, ...items];
    setItems(updated);
    try {
      localStorage.setItem('loveplay_truthordare_v1', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setCurrentItem(created);
    setNewText('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Intensity Filters */}
      <div className="p-4 rounded-2xl bg-[#140f26] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-serif italic text-rose-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Action ou Vérité Amoureux</span>
            </span>
            <div className="text-xs text-white/60 mt-0.5">
              Tour à tour, défiez-vous ou confiez vos secrets les plus doux.
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/40 block">Défis réussis</span>
            <span className="text-sm font-bold text-rose-300 font-mono">
              {completedCount} ✨
            </span>
          </div>
        </div>

        {/* Intensity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {(['all', 'Doux', 'Complice', 'Piquant', 'À distance'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                sound.playTap();
                setSelectedFilter(filter);
              }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedFilter === filter
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40 shadow-sm'
                  : 'bg-white/[0.04] text-white/50 hover:text-white/80 border border-white/[0.04]'
              }`}
            >
              {filter === 'all' ? 'Tous les niveaux' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Choice Buttons: Vérité vs Action vs Hasard */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            setSelectedType('truth');
            pickNewCard('truth');
          }}
          className={`py-2.5 px-3 rounded-2xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            selectedType === 'truth'
              ? 'bg-gradient-to-r from-purple-500/30 to-rose-500/30 border border-purple-400/50 text-purple-200 shadow-md'
              : 'bg-[#150f29] border border-white/[0.06] text-white/60 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-purple-400" />
          <span>Vérité</span>
        </button>

        <button
          onClick={() => {
            setSelectedType('dare');
            pickNewCard('dare');
          }}
          className={`py-2.5 px-3 rounded-2xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            selectedType === 'dare'
              ? 'bg-gradient-to-r from-rose-500/30 to-amber-500/30 border border-rose-400/50 text-rose-200 shadow-md'
              : 'bg-[#150f29] border border-white/[0.06] text-white/60 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Action</span>
        </button>

        <button
          onClick={() => {
            setSelectedType('random');
            pickNewCard();
          }}
          className={`py-2.5 px-3 rounded-2xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            selectedType === 'random'
              ? 'bg-white/[0.12] border border-white/20 text-white shadow-md'
              : 'bg-[#150f29] border border-white/[0.06] text-white/60 hover:text-white'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5 text-white/60" />
          <span>Hasard</span>
        </button>
      </div>

      {/* Main Card with Romantic Design */}
      <div
        className={`p-6 rounded-3xl bg-gradient-to-b from-[#181135] to-[#110c24] border border-white/[0.1] shadow-2xl text-center space-y-6 transition-all duration-200 ${
          isFlipping ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
              currentItem?.type === 'truth'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
            }`}
          >
            {currentItem?.type === 'truth' ? 'Vérité Amoureuse' : 'Défi / Action d’Amour'}
          </span>
          <span className="text-[11px] text-white/40">·</span>
          <span className="text-[11px] text-white/60">{currentItem?.intensity}</span>
        </div>

        <p className="font-serif text-xl sm:text-2xl text-rose-100 font-medium leading-relaxed max-w-md mx-auto min-h-[70px] flex items-center justify-center">
          « {currentItem?.text} »
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => pickNewCard()}
            className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Piocher une autre</span>
          </button>

          <button
            onClick={handleCompleteDare}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all active:scale-98"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Défi relevé avec amour !</span>
          </button>
        </div>
      </div>

      {/* Footer Add Custom */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-rose-300/80 hover:text-rose-200 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter notre propre gage ou secret</span>
        </button>

        <span className="text-[11px] text-white/40">
          Pour {space.partner1.name} & {space.partner2.name}
        </span>
      </div>

      {/* Add Custom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="font-serif text-xl font-semibold text-rose-100 mb-2">
              Nouveau gage ou vérité
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Ajoute un défi doux ou piquant à réserver pour ton amour.
            </p>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'truth' | 'dare')}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="truth" className="bg-[#130f24]">Vérité</option>
                    <option value="dare" className="bg-[#130f24]">Action / Défi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Intensité</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value as TruthOrDareItem['intensity'])}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="Doux" className="bg-[#130f24]">Doux</option>
                    <option value="Complice" className="bg-[#130f24]">Complice</option>
                    <option value="Piquant" className="bg-[#130f24]">Piquant</option>
                    <option value="À distance" className="bg-[#130f24]">À distance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Texte du défi</label>
                <textarea
                  rows={3}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Ex: Chante le refrain de notre chanson en imitant un accent rigolo..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
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
