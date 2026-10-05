import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Sparkles, UserCheck, Flame } from 'lucide-react';
import { CoupleSpace } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface TouchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

export const TouchSyncModal: React.FC<TouchSyncModalProps> = ({
  isOpen,
  onClose,
  space,
  activeUserId,
}) => {
  const [isMyTouchActive, setIsMyTouchActive] = useState(false);
  const [isPartnerTouchActive, setIsPartnerTouchActive] = useState(false);
  const [touchDuration, setTouchDuration] = useState(0);
  const [autoPartnerTouch, setAutoPartnerTouch] = useState(true);

  const heartbeatIntervalRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const partnerSimTimerRef = useRef<number | null>(null);

  const me = activeUserId === 'partner1' ? space.partner1 : space.partner2;
  const myLove = activeUserId === 'partner1' ? space.partner2 : space.partner1;

  // Cross-tab sync
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'TOUCH_ACTIVE') {
        const payload = event.payload as { senderId: string };
        if (payload.senderId !== activeUserId) {
          setIsPartnerTouchActive(true);
        }
      } else if (event.type === 'TOUCH_RELEASED') {
        const payload = event.payload as { senderId: string };
        if (payload.senderId !== activeUserId) {
          setIsPartnerTouchActive(false);
        }
      }
    });
    return unsubscribe;
  }, [activeUserId]);

  const bothTouching = isMyTouchActive && isPartnerTouchActive;

  // When both touch: continuous heart pulse & vibration
  useEffect(() => {
    if (bothTouching) {
      sound.playHeartbeat();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 80, 100]);
      }

      heartbeatIntervalRef.current = window.setInterval(() => {
        sound.playHeartbeat();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 80, 100]);
        }
      }, 1200);

      durationTimerRef.current = window.setInterval(() => {
        setTouchDuration((prev) => prev + 1);
      }, 1000);

      // Trigger soft confetti once connection established
      try {
        confetti({
          particleCount: 20,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#fda4af', '#f472b6', '#c084fc'],
        });
      } catch {
        // Ignore
      }
    } else {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (touchDuration > 1) {
        StorageService.saveLongestTouchRecord(touchDuration);
      }
      setTouchDuration(0);
    }

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [bothTouching]);

  const handleStartTouch = () => {
    setIsMyTouchActive(true);
    sound.playTap();
    StorageService.broadcast('TOUCH_ACTIVE', { senderId: activeUserId });

    if (autoPartnerTouch && !isPartnerTouchActive) {
      partnerSimTimerRef.current = window.setTimeout(() => {
        setIsPartnerTouchActive(true);
      }, 1100);
    }
  };

  const handleEndTouch = () => {
    setIsMyTouchActive(false);
    StorageService.broadcast('TOUCH_RELEASED', { senderId: activeUserId });
    if (partnerSimTimerRef.current) clearTimeout(partnerSimTimerRef.current);

    if (autoPartnerTouch) {
      setTimeout(() => {
        setIsPartnerTouchActive(false);
      }, 400);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#181135] to-[#0c0818] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl text-center space-y-6 select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-xs font-serif italic text-rose-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Présence tactile à distance</span>
          </span>
          <h2 className="font-serif text-2xl font-semibold text-rose-100">
            Toucher le même écran
          </h2>
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
            Posez et maintenez votre doigt ensemble. Vos auras se rejoindront instantanément.
          </p>
        </div>

        {/* The Touch Target Zone */}
        <div className="py-6 flex flex-col items-center justify-center relative">
          {/* Animated halo waves when active */}
          {bothTouching && (
            <>
              <div className="absolute w-64 h-64 rounded-full bg-rose-500/20 blur-2xl animate-ping" />
              <div className="absolute w-80 h-80 rounded-full bg-purple-500/15 blur-3xl animate-pulse" />
            </>
          )}

          {/* Main Touch Orb */}
          <div
            onMouseDown={handleStartTouch}
            onMouseUp={handleEndTouch}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStartTouch();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleEndTouch();
            }}
            className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
              bothTouching
                ? 'scale-110 bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 shadow-rose-500/50 ring-8 ring-rose-400/40 animate-pulse'
                : isMyTouchActive
                ? 'scale-105 bg-rose-600/50 border-2 border-rose-400 shadow-rose-950/60 ring-4 ring-rose-500/30'
                : 'bg-[#191136] hover:bg-[#201646] border border-white/[0.1] active:scale-95'
            }`}
          >
            <Heart
              className={`w-14 h-14 transition-transform duration-300 ${
                bothTouching
                  ? 'fill-white text-white scale-125 animate-bounce'
                  : isMyTouchActive
                  ? 'fill-rose-300 text-rose-200 scale-110'
                  : 'text-white/30 fill-white/10'
              }`}
            />
            <span
              className={`text-xs font-medium tracking-tight mt-2 ${
                bothTouching ? 'text-white font-bold' : isMyTouchActive ? 'text-rose-200' : 'text-white/60'
              }`}
            >
              {bothTouching
                ? `En contact (${touchDuration}s)`
                : isMyTouchActive
                ? 'En attente de son doigt...'
                : 'Maintiens ton doigt ici'}
            </span>
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isMyTouchActive ? 'bg-rose-400' : 'bg-white/20'
              }`}
            />
            <span className="text-white/70">{me.name} (Toi)</span>
          </div>

          <span className="text-white/30">·</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPartnerTouchActive ? 'bg-purple-400' : 'bg-white/20'
              }`}
            />
            <span className="text-white/70">{myLove.name}</span>
          </div>
        </div>

        {Boolean(space.longestTouchRecordSeconds && space.longestTouchRecordSeconds > 0) && (
          <div className="text-[11px] text-rose-300/80 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Record d’union : {space.longestTouchRecordSeconds} secondes ensemble</span>
          </div>
        )}

        {/* Simulation toggle */}
        <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
          <span>Réponse simulée de l’amour :</span>
          <button
            onClick={() => {
              sound.playTap();
              setAutoPartnerTouch(!autoPartnerTouch);
            }}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              autoPartnerTouch
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
            }`}
          >
            {autoPartnerTouch ? 'Active (1s)' : 'Désactivée'}
          </button>
        </div>
      </div>
    </div>
  );
};
