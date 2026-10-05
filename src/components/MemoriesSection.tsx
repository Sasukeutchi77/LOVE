import React, { useState, useEffect } from 'react';
import {
  Plus,
  MapPin,
  Calendar,
  Heart,
  Sparkles,
  X,
  Trash2,
  Search,
  Maximize2,
  Play,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { MemoryItem, CoupleSpace } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';

interface MemoriesSectionProps {
  space: CoupleSpace;
}

const PRESET_PHOTOS = [
  { label: 'Coucher de soleil 🌅', url: '/src/assets/images/loveplay_memory_sunset_1791120152439.jpg' },
  { label: 'Ciel d’étoiles ✨', url: '/src/assets/images/loveplay_couple_art_1791120151244.jpg' },
];

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({ space }) => {
  const [memories, setMemories] = useState<MemoryItem[]>(() =>
    StorageService.getMemories()
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'MEMORIES_UPDATED') {
        setMemories(StorageService.getMemories());
      }
    });
    return unsubscribe;
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sound.playTap();
    const created = StorageService.addMemory({
      title: newTitle.trim(),
      date: newDate || new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date()),
      location: newLocation.trim() || 'Quelque part dans nos cœurs',
      note: newNote.trim(),
      imageUrl: newImagePreview || undefined,
      isFavorite: false,
    });

    setMemories((prev) => [created, ...prev]);
    setNewTitle('');
    setNewDate('');
    setNewLocation('');
    setNewNote('');
    setNewImagePreview(null);
    setShowAddModal(false);
  };

  const handleToggleFavorite = (id: string) => {
    sound.playTap();
    const updated = StorageService.toggleFavoriteMemory(id);
    setMemories(updated);
  };

  const handleDeleteMemory = (id: string) => {
    sound.playTap();
    const updated = StorageService.deleteMemory(id);
    setMemories(updated);
  };

  // Filter memories and sort favorites first
  const filteredMemories = memories
    .filter((mem) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        mem.title.toLowerCase().includes(q) ||
        mem.location.toLowerCase().includes(q) ||
        mem.note.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <span className="text-xs font-serif italic text-rose-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Notre album de souvenirs ({memories.length})</span>
          </span>
          <h2 className="text-sm font-semibold text-white/90 mt-0.5">
            Les moments qui rendent l’attente si douce
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {memories.length > 0 && (
            <button
              onClick={() => {
                sound.playTap();
                setSlideshowIndex(0);
              }}
              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-rose-200 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Lancer le diaporama de nos souvenirs"
            >
              <Play className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
              <span className="hidden sm:inline">Diaporama</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playTap();
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-950 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      {memories.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un souvenir, un lieu, une promesse..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
          />
        </div>
      )}

      {/* Memories Grid */}
      <div className="space-y-4">
        {filteredMemories.map((mem) => (
          <article
            key={mem.id}
            className={`overflow-hidden rounded-3xl bg-[#130f24] border transition-all ${
              mem.isFavorite
                ? 'border-rose-500/40 shadow-lg shadow-rose-950/20 ring-1 ring-rose-400/20'
                : 'border-white/[0.08] hover:border-rose-400/20'
            }`}
          >
            {mem.imageUrl && (
              <div
                onClick={() => setLightboxImage(mem.imageUrl!)}
                className="relative aspect-[16/9] w-full overflow-hidden bg-black/40 cursor-zoom-in group"
              >
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover object-center filter saturate-90 group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#130f24] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-rose-300/80">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rose-400" />
                  <span>{mem.date}</span>
                </span>

                <div className="flex items-center gap-2">
                  {mem.location && (
                    <span className="flex items-center gap-1 text-white/40">
                      <MapPin className="w-3 h-3 text-white/30" />
                      <span>{mem.location}</span>
                    </span>
                  )}

                  {/* Favorite button */}
                  <button
                    onClick={() => handleToggleFavorite(mem.id)}
                    className="p-1 rounded-full text-white/40 hover:text-rose-400 transition-colors"
                    title={mem.isFavorite ? 'Retirer des favoris' : 'Épingler en favori'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        mem.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1 rounded-full text-white/30 hover:text-rose-400 transition-colors"
                    title="Supprimer ce souvenir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-serif text-lg font-semibold text-rose-100">
                {mem.title}
              </h3>

              {mem.note && (
                <p className="text-xs text-white/70 font-light leading-relaxed whitespace-pre-wrap">
                  « {mem.note} »
                </p>
              )}
            </div>
          </article>
        ))}

        {filteredMemories.length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06] text-white/50 text-xs space-y-2">
            <Heart className="w-6 h-6 text-rose-400/50 mx-auto" />
            <p>Aucun souvenir correspondant trouvé.</p>
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen Preview */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.1] text-white hover:bg-white/[0.2]"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Agrandissement"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-xl font-semibold text-rose-100 mb-1">
              Graver un nouveau souvenir
            </h3>
            <p className="text-xs text-white/60 mb-5">
              Une photo, une date ou quelques mots doux à garder pour toujours.
            </p>

            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">Titre du moment</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Notre escapade au bord du lac"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Ex: 14 Juillet 2025"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ex: Annecy, France"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Votre mot d’amour</label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ce que tu as ressenti ce jour-là..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Photo (optionnelle)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-white/[0.08] file:text-rose-200 hover:file:bg-white/[0.15] cursor-pointer"
                />

                {/* Preset sample photos */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-white/40">Ou choisir :</span>
                  {PRESET_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewImagePreview(p.url)}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-[10px] text-rose-200 border border-white/[0.06] transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {newImagePreview && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-white/[0.1]">
                    <img
                      src={newImagePreview}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewImagePreview(null)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
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
                  Ajouter à l’album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Romantic Fullscreen Slideshow Modal */}
      {slideshowIndex !== null && memories[slideshowIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <button
            onClick={() => setSlideshowIndex(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.1] text-white hover:bg-white/[0.2] transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={() => {
              sound.playTap();
              setSlideshowIndex((prev) =>
                prev !== null ? (prev > 0 ? prev - 1 : memories.length - 1) : 0
              );
            }}
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white z-20 transition-all active:scale-90"
            aria-label="Souvenir précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => {
              sound.playTap();
              setSlideshowIndex((prev) =>
                prev !== null ? (prev < memories.length - 1 ? prev + 1 : 0) : 0
              );
            }}
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white z-20 transition-all active:scale-90"
            aria-label="Souvenir suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Memory Slide Card */}
          <div className="relative w-full max-w-xl text-center space-y-4 px-4 animate-in fade-in zoom-in-95 duration-300">
            {memories[slideshowIndex].imageUrl && (
              <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/[0.1] bg-black/50">
                <img
                  src={memories[slideshowIndex].imageUrl}
                  alt={memories[slideshowIndex].title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs text-rose-300 font-medium">
                {memories[slideshowIndex].date} {memories[slideshowIndex].location ? `· ${memories[slideshowIndex].location}` : ''}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                {memories[slideshowIndex].title}
              </h3>
              {memories[slideshowIndex].note && (
                <p className="text-sm text-white/70 max-w-md mx-auto italic font-light">
                  « {memories[slideshowIndex].note} »
                </p>
              )}
            </div>

            <div className="text-[11px] text-white/40 pt-2 font-mono">
              {slideshowIndex + 1} / {memories.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
