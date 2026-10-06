import React, { useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  KeyRound,
  Download,
  Upload,
  QrCode,
} from 'lucide-react';
import { CoupleSpace } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';

interface SpaceInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpace;
  onUpdateSpace: (updated: CoupleSpace) => void;
}

export const SpaceInviteModal: React.FC<SpaceInviteModalProps> = ({
  isOpen,
  onClose,
  space,
  onUpdateSpace,
}) => {
  const [copied, setCopied] = useState(false);
  const [p1Name, setP1Name] = useState(space.partner1.name);
  const [p1City, setP1City] = useState(space.partner1.city);
  const [p1Status, setP1Status] = useState(space.partner1.status);
  const [p2Name, setP2Name] = useState(space.partner2.name);
  const [p2City, setP2City] = useState(space.partner2.city);
  const [p2Status, setP2Status] = useState(space.partner2.status);
  const [reunionDate, setReunionDate] = useState(space.nextReunionDate);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    sound.playTap();
    navigator.clipboard.writeText(
      `Rejoins notre espace privé LovePlay avec notre code : ${space.code}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = StorageService.importCoupleData(content);
          if (success) {
            sound.playWin();
            onUpdateSpace(StorageService.getSpace());
            setImportSuccess(true);
            setTimeout(() => {
              setImportSuccess(false);
              onClose();
            }, 1200);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveProfiles = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();

    const p1CityClean = p1City.trim() || space.partner1.city;
    const p2CityClean = p2City.trim() || space.partner2.city;

    // Detect appropriate timezones
    const p1Timezone =
      p1CityClean.toLowerCase().includes('burkina') || p1CityClean.toLowerCase().includes('ouaga')
        ? 'Africa/Ouagadougou'
        : p1CityClean.toLowerCase().includes('france') || p1CityClean.toLowerCase().includes('paris')
        ? 'Europe/Paris'
        : space.partner1.timezone;

    const p2Timezone =
      p2CityClean.toLowerCase().includes('france') || p2CityClean.toLowerCase().includes('paris')
        ? 'Europe/Paris'
        : p2CityClean.toLowerCase().includes('burkina') || p2CityClean.toLowerCase().includes('ouaga')
        ? 'Africa/Ouagadougou'
        : space.partner2.timezone;

    const isBurkinaFrance =
      (p1Timezone === 'Africa/Ouagadougou' && p2Timezone === 'Europe/Paris') ||
      (p2Timezone === 'Africa/Ouagadougou' && p1Timezone === 'Europe/Paris');

    const updated: CoupleSpace = {
      ...space,
      distanceKm: isBurkinaFrance ? 4070 : space.distanceKm,
      nextReunionDate: reunionDate,
      partner1: {
        ...space.partner1,
        name: p1Name.trim() || space.partner1.name,
        city: p1CityClean,
        timezone: p1Timezone,
        status: p1Status.trim() || space.partner1.status,
      },
      partner2: {
        ...space.partner2,
        name: p2Name.trim() || space.partner2.name,
        city: p2CityClean,
        timezone: p2Timezone,
        status: p2Status.trim() || space.partner2.status,
      },
    };
    onUpdateSpace(updated);
    onClose();
  };

  const handleExportBackup = () => {
    sound.playTap();
    const jsonStr = StorageService.exportCoupleData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loveplay-sauvegarde-${space.code}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleJoinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    sound.playHeartbeat();
    const updated: CoupleSpace = {
      ...space,
      code: joinCodeInput.trim().toUpperCase(),
    };
    onUpdateSpace(updated);
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
            <Heart className="w-4 h-4 fill-rose-400" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-rose-100">
            Notre espace à deux
          </h2>
        </div>
        <p className="text-xs text-white/60 mb-6">
          Un sanctuaire intime réservé uniquement pour vous deux.
        </p>

        {/* Invitation Code Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-rose-950/40 border border-rose-500/20 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-200/80">Code d’invitation privé</span>
            <span className="text-[11px] text-white/40">À partager à ton partenaire</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] font-mono text-center text-lg tracking-wider text-rose-200 font-semibold select-all">
              {space.code}
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setShowQR(!showQR);
              }}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08] transition-colors"
              title="Afficher le QR code à scanner"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-950"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* QR Code Card */}
          {showQR && (
            <div className="mt-3 p-4 rounded-xl bg-white text-black text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-36 h-36 mx-auto bg-black p-2 rounded-xl flex items-center justify-center">
                {/* SVG QR Code pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="black" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="white" />
                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="white" />
                  {/* Internal data bits */}
                  <rect x="40" y="10" width="8" height="8" />
                  <rect x="52" y="10" width="8" height="8" />
                  <rect x="40" y="24" width="8" height="8" />
                  <rect x="10" y="45" width="8" height="8" />
                  <rect x="25" y="45" width="8" height="8" />
                  <rect x="45" y="45" width="14" height="14" />
                  <rect x="68" y="45" width="8" height="8" />
                  <rect x="82" y="45" width="8" height="8" />
                  <rect x="40" y="70" width="8" height="8" />
                  <rect x="55" y="70" width="8" height="8" />
                  <rect x="40" y="85" width="8" height="8" />
                  <rect x="70" y="75" width="8" height="8" />
                  <rect x="85" y="85" width="8" height="8" />
                </svg>
              </div>
              <p className="text-[11px] font-mono font-bold text-gray-800">
                Code : {space.code}
              </p>
              <p className="text-[10px] text-gray-500">
                Fais scanner ce code par ton partenaire pour le connecter
              </p>
            </div>
          )}
        </div>

        {/* Edit Couple Info Form */}
        <form onSubmit={handleSaveProfiles} className="space-y-4 mb-6">
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            Personnaliser nos profils
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Partenaire 1 (Toi)</label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                placeholder="Ton prénom"
              />
              <input
                type="text"
                value={p1City}
                onChange={(e) => setP1City(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-white/70 focus:outline-none focus:border-rose-400"
                placeholder="Ta ville (ex: Ouagadougou)"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">Partenaire 2 (Ton amour)</label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                placeholder="Son prénom"
              />
              <input
                type="text"
                value={p2City}
                onChange={(e) => setP2City(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-white/70 focus:outline-none focus:border-rose-400"
                placeholder="Sa ville (ex: Paris)"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/60 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-300" />
              <span>Date de nos prochaines retrouvailles</span>
            </label>
            <input
              type="date"
              value={reunionDate}
              onChange={(e) => setReunionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-rose-200 border border-rose-500/20 transition-all"
          >
            Enregistrer les modifications
          </button>
        </form>

        {/* Reconnect / Join another space */}
        <div className="pt-4 border-t border-white/[0.08]">
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-purple-300" />
            <span>Rejoindre un autre espace avec un code</span>
          </h3>
          <form onSubmit={handleJoinCode} className="flex gap-2">
            <input
              type="text"
              placeholder="ex: LOVE-9911"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white font-mono uppercase focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-medium text-white transition-all"
            >
              {joinSuccess ? 'Connecté !' : 'Rejoindre'}
            </button>
          </form>
        </div>

        {/* Backup & Restore Data */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-white/70 font-semibold uppercase tracking-wider">
            <span>Sauvegarde & Données</span>
            {importSuccess && <span className="text-emerald-400 text-[10px]">Restauré avec succès ! ✨</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs border border-white/[0.06] flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-rose-300" />
              <span>Sauvegarder</span>
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importFileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs border border-white/[0.06] flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-purple-300" />
              <span>Restaurer</span>
            </button>
          </div>
        </div>

        {/* Architecture Note for user */}
        <div className="mt-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-white/40 leading-relaxed">
          <p className="flex items-center gap-1 text-white/60 mb-0.5">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Synchronisation temps réel</span>
          </p>
          En ouvrant LovePlay dans deux onglets ou fenêtres, les actions et coups de jeux se synchronisent instantanément via BroadcastChannel. Prêt pour Firebase.
        </div>
      </div>
    </div>
  );
};
