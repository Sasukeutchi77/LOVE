import React, { useState } from 'react';
import { Heart, Users, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { CoupleSpace } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { sound } from '../services/sound';

interface HeaderProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
  onSwitchUser: (id: 'partner1' | 'partner2') => void;
  onOpenSpaceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  space,
  activeUserId,
  onSwitchUser,
  onOpenSpaceModal,
}) => {
  const [isMuted, setIsMuted] = useState(() => sound.isMuted());
  const activePartner = activeUserId === 'partner1' ? space.partner1 : space.partner2;
  const otherPartner = activeUserId === 'partner1' ? space.partner2 : space.partner1;

  const handleToggleMute = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c0a15]/85 border-b border-white/[0.06] transition-colors">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-wide bg-gradient-to-r from-rose-200 via-rose-300 to-purple-300 bg-clip-text text-transparent select-none">
            LovePlay
          </span>
          <span className="inline-flex items-center text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          </span>
        </div>

        {/* Zone 2: Couple pair status info & PWA install */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          {/* Audio Mute Toggle Button */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors border border-white/[0.06]"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-white/70" />
            )}
          </button>

          <button
            onClick={onOpenSpaceModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-white/70 hover:text-white transition-all"
            title="Gérer notre espace à deux"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-rose-300/90">{space.code}</span>
            <span className="text-white/40">·</span>
            <span>{space.partner1.name} & {space.partner2.name}</span>
          </button>
        </div>

        {/* Zone 3: Active persona selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSwitchUser(activeUserId === 'partner1' ? 'partner2' : 'partner1')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-purple-500/10 hover:from-rose-500/20 hover:to-purple-500/20 border border-rose-400/20 text-xs font-medium text-rose-100 transition-all active:scale-95"
            title="Basculer entre les deux partenaires pour tester l’expérience à deux"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-rose-900/40">
              {activePartner.name.charAt(0)}
            </div>
            <span className="max-w-[70px] sm:max-w-[100px] truncate">
              {activePartner.name}
            </span>
            <Users className="w-3 h-3 text-rose-300/70" />
          </button>
        </div>
      </div>
    </header>
  );
};
