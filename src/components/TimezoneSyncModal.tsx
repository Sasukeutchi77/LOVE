import React, { useState, useEffect } from 'react';
import { X, Clock, Sun, Moon, Briefcase, Heart, Sparkles } from 'lucide-react';
import { CoupleSpace } from '../types';
import { sound } from '../services/sound';

interface TimezoneSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpace;
}

export const TimezoneSyncModal: React.FC<TimezoneSyncModalProps> = ({
  isOpen,
  onClose,
  space,
}) => {
  // Current hour in partner 1's timezone
  const getP1CurrentHour = () => {
    try {
      const now = new Date();
      const p1Hour = parseInt(
        new Intl.DateTimeFormat('fr-FR', {
          timeZone: space.partner1.timezone,
          hour: 'numeric',
          hourCycle: 'h23',
        }).format(now),
        10
      );
      return isNaN(p1Hour) ? 14 : p1Hour;
    } catch {
      return 14;
    }
  };

  // Time difference in hours
  const getTimeDiffHours = () => {
    try {
      const now = new Date();
      const p1 = parseInt(
        new Intl.DateTimeFormat('fr-FR', {
          timeZone: space.partner1.timezone,
          hour: 'numeric',
          hourCycle: 'h23',
        }).format(now),
        10
      );
      const p2 = parseInt(
        new Intl.DateTimeFormat('fr-FR', {
          timeZone: space.partner2.timezone,
          hour: 'numeric',
          hourCycle: 'h23',
        }).format(now),
        10
      );
      return p1 - p2;
    } catch {
      return 6; // Paris vs Montreal ~6h
    }
  };

  const [selectedP1Hour, setSelectedP1Hour] = useState<number>(getP1CurrentHour);
  const timeDiff = getTimeDiffHours();

  // Reset to live hour when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedP1Hour(getP1CurrentHour());
    }
  }, [isOpen]);

  const selectedP2Hour = (selectedP1Hour - timeDiff + 24) % 24;

  const getActivityType = (hour: number): { label: string; icon: React.ReactNode; color: string } => {
    if (hour >= 0 && hour < 7) {
      return { label: 'Dort profondément 🌙', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />, color: 'text-indigo-300' };
    }
    if (hour >= 7 && hour < 9) {
      return { label: 'Réveil & café ☕', icon: <Sun className="w-3.5 h-3.5 text-amber-400" />, color: 'text-amber-300' };
    }
    if (hour >= 9 && hour < 18) {
      return { label: 'Journée active / travail 💼', icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />, color: 'text-blue-300' };
    }
    if (hour >= 18 && hour <= 23) {
      return { label: 'Soirée détente & amour 💖', icon: <Heart className="w-3.5 h-3.5 text-rose-400" />, color: 'text-rose-300' };
    }
    return { label: 'Libre', icon: <Clock className="w-3.5 h-3.5 text-white/50" />, color: 'text-white/70' };
  };

  const p1Activity = getActivityType(selectedP1Hour);
  const p2Activity = getActivityType(selectedP2Hour);

  // Is this an ideal common rendezvous window? (Neither is sleeping)
  const isP1Awake = selectedP1Hour >= 8 && selectedP1Hour <= 23;
  const isP2Awake = selectedP2Hour >= 8 && selectedP2Hour <= 23;
  const isIdealWindow = isP1Awake && isP2Awake;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-rose-100">
                Synchroniseur de Fuseaux
              </h2>
              <span className="text-[11px] text-white/50 block">
                Trouvez l’instant parfait pour vous appeler
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

        {/* Time Comparison Dual Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Partner 1 */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-center">
            <span className="text-[11px] text-rose-300 font-medium block truncate">
              {space.partner1.name} ({space.partner1.city})
            </span>
            <div className="font-serif text-3xl font-bold text-white tabular-nums">
              {selectedP1Hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-white/70 pt-1">
              {p1Activity.icon}
              <span className={p1Activity.color}>{p1Activity.label}</span>
            </div>
          </div>

          {/* Partner 2 */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1 text-center">
            <span className="text-[11px] text-purple-300 font-medium block truncate">
              {space.partner2.name} ({space.partner2.city})
            </span>
            <div className="font-serif text-3xl font-bold text-white tabular-nums">
              {selectedP2Hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-white/70 pt-1">
              {p2Activity.icon}
              <span className={p2Activity.color}>{p2Activity.label}</span>
            </div>
          </div>
        </div>

        {/* Interactive 24-hour Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Faites glisser pour explorer la journée :</span>
            <span className="font-mono text-rose-300 font-semibold">{selectedP1Hour}h00</span>
          </div>

          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={selectedP1Hour}
            onChange={(e) => {
              sound.playTap();
              setSelectedP1Hour(parseInt(e.target.value, 10));
            }}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-white/[0.1] rounded-lg"
          />

          <div className="flex justify-between text-[9px] text-white/30 font-mono pt-1">
            <span>00h</span>
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>
        </div>

        {/* Ideal Window Verdict */}
        <div
          className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
            isIdealWindow
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
              : 'bg-white/[0.03] border-white/[0.06] text-white/60'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isIdealWindow ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.05] text-white/40'
            }`}
          >
            {isIdealWindow ? <Heart className="w-5 h-5 fill-emerald-400" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-semibold">
              {isIdealWindow
                ? 'Créneau parfait pour vous retrouver ! ✨'
                : 'L’un de vous dort ou travaille à cette heure.'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {isIdealWindow
                ? `Vous êtes tous les deux réveillés et disponibles.`
                : `Décalage de ${timeDiff} heures entre vous.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
