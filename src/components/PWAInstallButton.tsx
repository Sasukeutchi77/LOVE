import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../services/sound';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          sound.playTap();
          install();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-[11px] font-medium text-rose-200 shadow-sm transition-all active:scale-95"
        title="Installer LovePlay sur votre téléphone"
      >
        <Download className="w-3.5 h-3.5 text-rose-300" />
        <span className="hidden sm:inline">Installer l’app</span>
        <span className="sm:hidden">Installer</span>
      </button>
    );
  }

  // iOS Safari flow or generic helper
  return (
    <>
      <button
        onClick={() => {
          sound.playTap();
          setShowIOSGuide(true);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-medium text-white/70 hover:text-white transition-all active:scale-95"
        title="Ajouter à l'écran d'accueil iPhone/Android"
      >
        <Smartphone className="w-3.5 h-3.5 text-rose-300" />
        <span className="hidden sm:inline">Installer l’app</span>
        <span className="sm:hidden">App mobile</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#130f24] border border-white/[0.1] p-6 text-white shadow-2xl space-y-4">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Smartphone className="w-5 h-5 text-rose-400" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-rose-100">
                Installer LovePlay sur iPhone & Android
              </h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Profitez d’une expérience fluide en plein écran, sans la barre du navigateur.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs text-white/80">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300 shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <span className="font-medium text-white">Sur Safari (iPhone) :</span>
                  <p className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1">
                    Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3 h-3 text-rose-300 inline" /> au bas de l’écran.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300 shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <span className="font-medium text-white">Sur l'écran d'accueil :</span>
                  <p className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1">
                    Faites défiler et choisissez <strong>Sur l’écran d’accueil</strong> <PlusSquare className="w-3 h-3 text-rose-300 inline" />.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-xs font-semibold text-white shadow-md shadow-rose-950"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};
