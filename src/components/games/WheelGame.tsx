import React, { useState, useRef } from 'react';
import { Sparkles, Trophy, Check, BookOpen, RotateCcw } from 'lucide-react';
import { CoupleSpace, PromiseItem } from '../../types';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface WheelGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const WHEEL_SEGMENTS = [
  { label: 'Massage de 30 min', icon: '💆' },
  { label: 'Petit-déjeuner au lit', icon: '🥐' },
  { label: 'Film sans négociation', icon: '🎬' },
  { label: 'Baiser de cinéma (2 min)', icon: '💋' },
  { label: 'Ton restaurant favori', icon: '🍷' },
  { label: 'Câlins non-stop toute la nuit', icon: '🧸' },
  { label: 'Lettre d’amour manuscrite', icon: '💌' },
  { label: 'Carte blanche (1 journée)', icon: '✨' },
];

const COLORS = [
  '#f43f5e',
  '#ec4899',
  '#d946ef',
  '#c026d3',
  '#8b5cf6',
  '#7c3aed',
  '#6366f1',
  '#e11d48',
];

export const WheelGame: React.FC<WheelGameProps> = ({
  space,
  activeUserId,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPromise, setWonPromise] = useState<string | null>(null);
  const [savedPromises, setSavedPromises] = useState<PromiseItem[]>(() => {
    try {
      const saved = localStorage.getItem('loveplay_promises_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'p1',
        title: 'Baiser de cinéma (2 min) 💋',
        wonBy: 'partner1',
        date: 'Hier',
        redeemed: false,
      },
    ];
  });

  const lastTickAngleRef = useRef(0);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPromise(null);
    sound.playTap();

    const extraSpins = 5 + Math.floor(Math.random() * 4); // 5 to 8 full rotations
    const randomAngle = Math.floor(Math.random() * 360);
    const targetRotation = rotation + extraSpins * 360 + randomAngle;

    const startRotation = rotation;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;

      // Play tick on passing segments
      const segmentSize = 360 / WHEEL_SEGMENTS.length;
      if (Math.abs(currentRotation - lastTickAngleRef.current) >= segmentSize) {
        sound.playSpinTick();
        lastTickAngleRef.current = currentRotation;
      }

      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Determine winning segment
        const normalizedAngle = (360 - (currentRotation % 360)) % 360;
        const winningIndex = Math.floor(normalizedAngle / segmentSize) % WHEEL_SEGMENTS.length;
        const segment = WHEEL_SEGMENTS[winningIndex];
        const promiseText = `${segment.label} ${segment.icon}`;
        setWonPromise(promiseText);

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

        // Save into promises book
        const newPromise: PromiseItem = {
          id: 'prom_' + Date.now(),
          title: promiseText,
          wonBy: activeUserId,
          date: 'Aujourd’hui',
          redeemed: false,
        };

        setSavedPromises((prev) => {
          const updated = [newPromise, ...prev];
          try {
            localStorage.setItem('loveplay_promises_v1', JSON.stringify(updated));
          } catch {
            // Ignore
          }
          return updated;
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const handleToggleRedeemed = (id: string) => {
    sound.playTap();
    setSavedPromises((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, redeemed: !p.redeemed } : p
      );
      try {
        localStorage.setItem('loveplay_promises_v1', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const activePartner = activeUserId === 'partner1' ? space.partner1 : space.partner2;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#140f26] border border-white/[0.08] flex items-center justify-between">
        <div>
          <span className="text-xs font-serif italic text-rose-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Roue des Promesses & Câlins</span>
          </span>
          <h2 className="text-sm font-semibold text-white/90 mt-0.5">
            Faites tourner la roue pour vos retrouvailles !
          </h2>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-rose-950 active:scale-95 disabled:opacity-50 transition-all"
        >
          {isSpinning ? 'Ça tourne...' : 'Tourner !'}
        </button>
      </div>

      {/* The Wheel Container */}
      <div className="relative max-w-[320px] mx-auto aspect-square flex items-center justify-center">
        {/* Top Pointer */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-400 filter drop-shadow-md" />

        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 shadow-2xl shadow-rose-950/40 pointer-events-none" />

        {/* Wheel SVG */}
        <div
          className="w-full h-full rounded-full overflow-hidden shadow-2xl transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full select-none">
            {WHEEL_SEGMENTS.map((seg, i) => {
              const count = WHEEL_SEGMENTS.length;
              const angle = 360 / count;
              const startAngle = i * angle;
              const endAngle = (i + 1) * angle;

              // Convert polar to cartesian (radius 50)
              const r = 50;
              const cx = 50;
              const cy = 50;
              const radStart = ((startAngle - 90) * Math.PI) / 180;
              const radEnd = ((endAngle - 90) * Math.PI) / 180;
              const x1 = cx + r * Math.cos(radStart);
              const y1 = cy + r * Math.sin(radStart);
              const x2 = cx + r * Math.cos(radEnd);
              const y2 = cy + r * Math.sin(radEnd);

              const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

              const textRad = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180;
              const tx = cx + 32 * Math.cos(textRad);
              const ty = cy + 32 * Math.sin(textRad);

              return (
                <g key={i}>
                  <path
                    d={pathData}
                    fill={COLORS[i % COLORS.length]}
                    stroke="#140f26"
                    strokeWidth="0.8"
                    opacity="0.88"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="6"
                    className="select-none pointer-events-none fill-white"
                  >
                    {seg.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Hub Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="absolute z-10 w-16 h-16 rounded-full bg-[#120e24] border-2 border-rose-400 text-rose-200 font-serif font-bold text-xs flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all select-none hover:bg-rose-500/20"
        >
          <span>Lancer</span>
          <span className="text-[10px]">💖</span>
        </button>
      </div>

      {/* Won Promise Announcement */}
      {wonPromise && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/25 via-purple-500/20 to-rose-500/25 border border-rose-400/50 text-center space-y-1 animate-in zoom-in-95 duration-300 shadow-xl shadow-rose-950/40">
          <div className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
            Promesse gagnée par {activePartner.name} !
          </div>
          <div className="font-serif text-xl text-white font-medium">
            « {wonPromise} »
          </div>
          <div className="text-[11px] text-white/60">
            Ajoutée à votre carnet de retrouvailles ✨
          </div>
        </div>
      )}

      {/* Carnet de Promesses (Promises Log) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Notre carnet de promesses</span>
          </h3>
          <span className="text-[11px] text-white/40">
            À honorer dès qu’on se retrouve
          </span>
        </div>

        <div className="space-y-2">
          {savedPromises.map((p) => {
            const winner = p.wonBy === 'partner1' ? space.partner1.name : space.partner2.name;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  p.redeemed
                    ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
                    : 'bg-[#140f26] border-white/[0.06] hover:border-rose-400/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-medium text-white truncate ${
                      p.redeemed ? 'line-through text-white/40' : ''
                    }`}
                  >
                    {p.title}
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">
                    Gagné par {winner} · {p.date}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleRedeemed(p.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 transition-all ${
                    p.redeemed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{p.redeemed ? 'Honoré ! 💖' : 'À faire'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
