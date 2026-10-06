import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Image as ImageIcon,
  Film,
  Video,
  Grid,
  LayoutGrid,
  List,
  Heart,
  Calendar,
  MapPin,
  Play,
  Pause,
  X,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
  Camera,
  Share2,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleSpace, GalleryMediaItem, GalleryMediaType } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';

interface GallerySectionProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

type GridLayoutMode = 'compact_grid' | 'masonry' | 'feed';
type MediaFilter = 'all' | 'photo' | 'video' | 'favorite';

const PRESET_MEDIA_OPTIONS: {
  title: string;
  type: GalleryMediaType;
  url: string;
  location: string;
  category: GalleryMediaItem['category'];
  durationSeconds?: number;
}[] = [
  {
    title: 'Notre appel vidéo du soir 📱',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    location: 'En visio (Burkina 🇧🇫 & France 🇫🇷)',
    category: 'Visio & Quotidien',
    durationSeconds: 15,
  },
  {
    title: 'Coucher de soleil sur Ouaga 🌅',
    type: 'photo',
    url: '/src/assets/images/loveplay_memory_sunset_1791120165978.jpg',
    location: 'Ouagadougou, Burkina Faso',
    category: 'Moments tendres',
  },
  {
    title: 'Balade d’automne à Paris 🗼',
    type: 'photo',
    url: '/src/assets/images/loveplay_couple_art_1791120151244.jpg',
    location: 'Paris, France',
    category: 'Retrouvailles',
  },
  {
    title: 'Un souffle d’air frais pour toi 🌿',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    location: 'Paris, France',
    category: 'Visio & Quotidien',
    durationSeconds: 15,
  },
];

export const GallerySection: React.FC<GallerySectionProps> = ({
  space,
  activeUserId,
}) => {
  const [items, setItems] = useState<GalleryMediaItem[]>(() =>
    StorageService.getGalleryMedia()
  );

  // Layout & Filter Controls
  const [gridMode, setGridMode] = useState<GridLayoutMode>('compact_grid');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals & Lightbox
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryMediaItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRealFullscreen, setIsRealFullscreen] = useState(false);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);

  // Cross-tab real-time sync
  useEffect(() => {
    const unsub = StorageService.subscribeSync((e) => {
      if (e.type === 'GALLERY_UPDATED') {
        setItems(StorageService.getGalleryMedia());
      }
    });
    return unsub;
  }, []);

  const photosCount = items.filter((i) => i.type === 'photo').length;
  const videosCount = items.filter((i) => i.type === 'video').length;
  const favoritesCount = items.filter((i) => i.isFavorite).length;

  const filteredItems = items.filter((item) => {
    if (mediaFilter === 'photo' && item.type !== 'photo') return false;
    if (mediaFilter === 'video' && item.type !== 'video') return false;
    if (mediaFilter === 'favorite' && !item.isFavorite) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playTap();
    const updated = StorageService.toggleFavoriteGalleryMedia(id);
    setItems(updated);
    if (activeLightboxItem && activeLightboxItem.id === id) {
      setActiveLightboxItem((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleDeleteMedia = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playTap();
    const updated = StorageService.deleteGalleryMedia(id);
    setItems(updated);
    if (activeLightboxItem && activeLightboxItem.id === id) {
      setActiveLightboxItem(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleOpenLightbox = (item: GalleryMediaItem) => {
    sound.playTap();
    setActiveLightboxItem(item);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNavigateLightbox = (direction: 'prev' | 'next') => {
    if (!activeLightboxItem) return;
    sound.playTap();
    setZoom(1);
    setPan({ x: 0, y: 0 });
    const curIdx = filteredItems.findIndex((i) => i.id === activeLightboxItem.id);
    if (curIdx === -1) return;
    if (direction === 'prev') {
      const nextIdx = (curIdx - 1 + filteredItems.length) % filteredItems.length;
      setActiveLightboxItem(filteredItems[nextIdx]);
    } else {
      const nextIdx = (curIdx + 1) % filteredItems.length;
      setActiveLightboxItem(filteredItems[nextIdx]);
    }
  };

  // Zoom and pan handlers for inspecting details
  const handleZoomIn = () => {
    sound.playTap();
    setZoom((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    sound.playTap();
    setZoom((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    sound.playTap();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleDoubleTapZoom = () => {
    sound.playTap();
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  const handleToggleFullscreen = () => {
    sound.playTap();
    if (!document.fullscreenElement) {
      lightboxContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsRealFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsRealFullscreen(false);
    }
  };

  const handleDownload = (item: GalleryMediaItem) => {
    sound.playTap();
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `${item.title.replace(/\s+/g, '_')}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    if (!activeLightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxItem(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key === 'ArrowLeft') {
        handleNavigateLightbox('prev');
      } else if (e.key === 'ArrowRight') {
        handleNavigateLightbox('next');
      } else if (e.key === '+' || e.key === '=') {
        sound.playTap();
        setZoom((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
      } else if (e.key === '-') {
        sound.playTap();
        setZoom((prev) => {
          const next = Math.max(1, +(prev - 0.5).toFixed(1));
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        sound.playTap();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxItem, filteredItems]);

  // Drag & pan support for zoomed photos
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#181135] via-[#140e2b] to-[#0f0a20] border border-white/[0.08] shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-rose-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <ImageIcon className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-widest text-rose-300 font-semibold">
                Album & Galerie Partagée
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-white font-semibold tracking-tight">
              Nos Photos & Vidéos
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-light mt-1 max-w-lg leading-relaxed">
              Chaque sourire, chaque regard volé en visio et chaque souvenir précieux partagé entre {space.partner1.city} et {space.partner2.city}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                sound.playTap();
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-rose-950/60 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un média</span>
            </button>
          </div>
        </div>

        {/* Media Counts Stats */}
        <div className="relative z-10 grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-white/[0.06] text-center">
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <div className="text-base sm:text-lg font-bold text-white tabular-nums">
              {items.length}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">
              Total Médias
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <div className="text-base sm:text-lg font-bold text-rose-300 tabular-nums">
              {photosCount}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Photos</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <div className="text-base sm:text-lg font-bold text-indigo-300 tabular-nums">
              {videosCount}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Vidéos</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <div className="text-base sm:text-lg font-bold text-amber-300 tabular-nums">
              {favoritesCount}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">
              Favoris 💖
            </div>
          </div>
        </div>
      </div>

      {/* Grid Option & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#140f28] border border-white/[0.08]">
        {/* Media Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as MediaFilter, label: `Tous (${items.length})` },
            { id: 'photo' as MediaFilter, label: `Photos (${photosCount})`, icon: ImageIcon },
            { id: 'video' as MediaFilter, label: `Vidéos (${videosCount})`, icon: Video },
            { id: 'favorite' as MediaFilter, label: `Favoris (${favoritesCount})`, icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mediaFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setMediaFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30 font-semibold'
                    : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid Display Mode Toggle Buttons (Grid Photo / Video Option) */}
        <div className="flex items-center justify-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06]">
          <span className="text-[11px] text-white/40 mr-1 hidden sm:inline">Affichage :</span>
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => {
                sound.playTap();
                setGridMode('compact_grid');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                gridMode === 'compact_grid'
                  ? 'bg-rose-500/30 text-rose-200 font-medium'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Grille compacte carrée (style Instagram)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline">Grille carrée</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setGridMode('masonry');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                gridMode === 'masonry'
                  ? 'bg-rose-500/30 text-rose-200 font-medium'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Grille dynamique (format naturel)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline">Mosaïque</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setGridMode('feed');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                gridMode === 'feed'
                  ? 'bg-rose-500/30 text-rose-200 font-medium'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Vue Flux / Grand format"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline">Flux</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Gallery Area */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#140f28]/60 border border-white/[0.08] space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center text-white/30">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg text-white font-medium">
            Aucun souvenir trouvé
          </h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Ajoutez votre première photo ou courte vidéo partagée pour commencer votre album de couple.
          </p>
          <button
            onClick={() => {
              sound.playTap();
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-rose-300 transition-all"
          >
            + Ajouter une photo ou vidéo
          </button>
        </div>
      ) : (
        <>
          {/* OPTION 1: COMPACT GRID (2 col mobile, 3-4 col desktop) */}
          {gridMode === 'compact_grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenLightbox(item)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/[0.08] cursor-pointer hover:border-rose-400/50 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Media Content */}
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      {/* Video Center Play Overlay */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-all">
                        <div className="w-10 h-10 rounded-full bg-white/80 group-hover:bg-rose-500 text-black group-hover:text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      {/* Video Duration Badge */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-medium text-white flex items-center gap-1">
                        <Video className="w-2.5 h-2.5 text-indigo-300" />
                        <span>0:{item.durationSeconds ? String(item.durationSeconds).padStart(2, '0') : '15'}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Hover Fullscreen Badge */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                        <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xl border border-white/20 transform scale-95 group-hover:scale-100 transition-transform">
                          <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                          <span>Plein écran</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient Overlay for info */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end text-left pointer-events-none">
                    <span className="text-xs font-medium text-white truncate drop-shadow-sm">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-white/60 truncate">
                      {item.location}
                    </span>
                  </div>

                  {/* Top Badges (Favorite & Type) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                        item.isFavorite
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-black/40 text-white/70 hover:text-white'
                      }`}
                      title="Mettre en favori"
                    >
                      <Heart
                        className={`w-3 h-3 ${item.isFavorite ? 'fill-white' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OPTION 2: MASONRY / DYNAMIC NATURAL GRID */}
          {gridMode === 'masonry' && (
            <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenLightbox(item)}
                  className="break-inside-avoid relative rounded-2xl overflow-hidden bg-[#150f29] border border-white/[0.08] cursor-pointer hover:border-rose-400/40 transition-all group shadow-lg"
                >
                  {item.type === 'video' ? (
                    <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] text-white font-mono flex items-center gap-1">
                        <Video className="w-2.5 h-2.5 text-indigo-300" />
                        <span>0:{item.durationSeconds || '15'}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full object-cover max-h-72 group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Hover Fullscreen Badge */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                        <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xl border border-white/20">
                          <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                          <span>Plein écran</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-white/40 shrink-0">
                        {item.date}
                      </span>
                    </div>
                    {item.caption && (
                      <p className="text-[11px] text-white/60 line-clamp-2 mb-2 font-light">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/[0.04]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-rose-400" />
                        <span>{item.location}</span>
                      </span>
                      <span>
                        Par {item.addedBy === 'partner1' ? space.partner1.name : space.partner2.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OPTION 3: FEED / DETAILED CARDS */}
          {gridMode === 'feed' && (
            <div className="max-w-xl mx-auto space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl overflow-hidden bg-[#150f2b] border border-white/[0.08] shadow-xl text-left"
                >
                  {/* Card Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                        {item.addedBy === 'partner1' ? space.partner1.name[0] : space.partner2.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-white/40 flex items-center gap-2">
                          <span>
                            Par {item.addedBy === 'partner1' ? space.partner1.name : space.partner2.name}
                          </span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenLightbox(item)}
                        className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1 text-xs"
                        title="Plein écran (modal)"
                      >
                        <Maximize2 className="w-4 h-4 text-rose-300" />
                        <span className="hidden sm:inline text-[11px] text-white/70">Plein écran</span>
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(item.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          item.isFavorite
                            ? 'text-rose-400'
                            : 'text-white/40 hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-400' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 rounded-full text-white/30 hover:text-rose-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Media Content */}
                  <div className="relative bg-black w-full overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => handleOpenLightbox(item)}>
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        controls
                        playsInline
                        className="w-full max-h-[420px] object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full max-h-[420px] object-contain cursor-pointer group-hover:scale-[1.01] transition-transform duration-200"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xl border border-white/20">
                            <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                            <span>Agrandir en plein écran</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Caption & Location footer */}
                  <div className="p-4 space-y-2">
                    {item.caption && (
                      <p className="text-xs text-white/80 font-light leading-relaxed">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/[0.04]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{item.location}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-rose-300">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          MODAL: AJOUTER UNE PHOTO OU VIDÉO
          ======================================================== */}
      {showAddModal && (
        <AddMediaModal
          space={space}
          activeUserId={activeUserId}
          onClose={() => setShowAddModal(false)}
          onAdd={(data) => {
            sound.playWin();
            confetti({ particleCount: 70, spread: 60 });
            StorageService.addGalleryMedia(data);
            setItems(StorageService.getGalleryMedia());
            setShowAddModal(false);
          }}
        />
      )}

      {/* ========================================================
          MODAL: LIGHTBOX FULLSCREEN (PHOTO / VIDEO)
          ======================================================== */}
      {activeLightboxItem && (() => {
        const curIdx = filteredItems.findIndex((i) => i.id === activeLightboxItem.id);
        return (
          <div
            ref={lightboxContainerRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                sound.playTap();
                setActiveLightboxItem(null);
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }
            }}
            className="fixed inset-0 z-50 bg-[#060410fa] backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none overflow-y-auto"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white z-20 gap-2 flex-wrap">
              {/* Left: Tag + Counter + Date */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                  {activeLightboxItem.type === 'video' ? (
                    <>
                      <Video className="w-3 h-3 text-indigo-300" />
                      <span>Vidéo Souvenir</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 text-rose-300" />
                      <span>Photo Souvenir</span>
                    </>
                  )}
                </span>
                {curIdx !== -1 && (
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-[11px] text-white/80 font-mono">
                    {curIdx + 1} / {filteredItems.length}
                  </span>
                )}
                <span className="text-xs text-white/50 hidden md:inline">
                  {activeLightboxItem.date}
                </span>
              </div>

              {/* Right: Controls (Zoom, Download, Fullscreen, Favorite, Close) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Photo Zoom Controls (Only for Photos) */}
                {activeLightboxItem.type === 'photo' && (
                  <div className="flex items-center bg-white/[0.08] backdrop-blur-md rounded-full p-0.5 border border-white/[0.12]">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 1}
                      className="p-1.5 rounded-full hover:bg-white/[0.15] text-white/75 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                      title="Dézoomer (-)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleResetZoom}
                      className="px-2 py-0.5 text-[11px] font-mono text-white/90 hover:text-rose-300 transition-colors"
                      title="Réinitialiser zoom (0)"
                    >
                      {Math.round(zoom * 100)}%
                    </button>

                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="p-1.5 rounded-full hover:bg-white/[0.15] text-white/75 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                      title="Zoomer (+)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    {zoom > 1 && (
                      <button
                        onClick={handleResetZoom}
                        className="p-1.5 rounded-full hover:bg-white/[0.15] text-rose-300 transition-all"
                        title="Réinitialiser zoom"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(activeLightboxItem)}
                  className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/80 hover:text-white border border-white/[0.1] transition-all"
                  title="Télécharger le souvenir"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Real Fullscreen Toggle */}
                <button
                  onClick={handleToggleFullscreen}
                  className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/80 hover:text-white border border-white/[0.1] transition-all hidden sm:flex items-center justify-center"
                  title="Plein écran navigateur"
                >
                  {isRealFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Favorite Button */}
                <button
                  onClick={() => handleToggleFavorite(activeLightboxItem.id)}
                  className={`p-2 rounded-full backdrop-blur-md transition-all border border-white/[0.1] ${
                    activeLightboxItem.isFavorite
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-white/[0.08] text-white/75 hover:text-white hover:bg-white/[0.15]'
                  }`}
                  title="Ajouter aux favoris"
                >
                  <Heart
                    className={`w-4 h-4 ${activeLightboxItem.isFavorite ? 'fill-white' : ''}`}
                  />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveLightboxItem(null);
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-2 rounded-full bg-white/[0.12] hover:bg-rose-500 hover:text-white text-white/90 transition-all border border-white/[0.15]"
                  title="Fermer le plein écran (Échap)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Stage & Navigation Arrows */}
            <div className="relative flex-1 flex items-center justify-center my-2 max-h-[66vh] sm:max-h-[70vh] w-full">
              {/* Prev Button */}
              <button
                onClick={() => handleNavigateLightbox('prev')}
                className="absolute left-1 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-xl"
                title="Souvenir précédent (←)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Media Render */}
              {activeLightboxItem.type === 'video' ? (
                <div className="w-full h-full max-w-4xl flex items-center justify-center p-2">
                  <video
                    src={activeLightboxItem.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[64vh] max-w-full rounded-2xl shadow-2xl bg-black border border-white/10"
                  />
                </div>
              ) : (
                <div
                  className="relative overflow-hidden w-full h-full flex items-center justify-center"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onDoubleClick={handleToggleDoubleTapZoom}
                >
                  <img
                    src={activeLightboxItem.url}
                    alt={activeLightboxItem.title}
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                      cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                    }}
                    className="max-h-[64vh] max-w-full object-contain rounded-2xl shadow-2xl pointer-events-auto border border-white/[0.08]"
                    draggable={false}
                  />
                  {zoom === 1 && (
                    <div className="absolute bottom-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/70 pointer-events-none opacity-90 transition-opacity flex items-center gap-1.5 border border-white/10">
                      <Sparkles className="w-3 h-3 text-rose-300" />
                      <span>Double-cliquez pour zoomer dans les détails</span>
                    </div>
                  )}
                  {zoom > 1 && (
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-rose-500/80 backdrop-blur-md text-[10px] font-medium text-white pointer-events-none flex items-center gap-1">
                      <span>Zoom {Math.round(zoom * 100)}%</span>
                      <span className="text-white/70">• Glissez pour vous déplacer</span>
                    </div>
                  )}
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={() => handleNavigateLightbox('next')}
                className="absolute right-1 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-xl"
                title="Souvenir suivant (→)"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Bottom Info & Thumbnails Strip */}
            <div className="w-full max-w-3xl mx-auto space-y-2 z-10">
              {/* Info Card */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#130e28]/95 backdrop-blur-md border border-white/[0.1] text-white text-left space-y-1 shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-rose-100 truncate">
                    {activeLightboxItem.title}
                  </h3>
                  <span className="text-[11px] text-rose-300 shrink-0 flex items-center gap-1 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.08]">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{activeLightboxItem.location}</span>
                  </span>
                </div>

                {activeLightboxItem.caption && (
                  <p className="text-xs text-white/80 font-light leading-relaxed line-clamp-2">
                    {activeLightboxItem.caption}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-white/50 pt-1 border-t border-white/[0.04]">
                  <span>
                    Partagé avec tendresse par{' '}
                    <strong className="text-rose-200">
                      {activeLightboxItem.addedBy === 'partner1' ? space.partner1.name : space.partner2.name}
                    </strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {activeLightboxItem.category}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip / Mini-Carrousel */}
              {filteredItems.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar max-w-xl mx-auto">
                  {filteredItems.map((item) => {
                    const isCurrent = item.id === activeLightboxItem.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          sound.playTap();
                          setActiveLightboxItem(item);
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                        className={`relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border transition-all duration-200 ${
                          isCurrent
                            ? 'border-rose-400 ring-2 ring-rose-400/60 scale-105 shadow-md shadow-rose-950'
                            : 'border-white/20 opacity-50 hover:opacity-90 hover:scale-100'
                        }`}
                        title={item.title}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-slate-900 relative">
                            <video src={item.url} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Play className="w-2.5 h-2.5 text-white fill-white" />
                            </div>
                          </div>
                        ) : (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Keyboard hints */}
              <div className="text-[10px] text-white/40 text-center hidden sm:flex items-center justify-center gap-3">
                <span>← / → Parcourir</span>
                <span>•</span>
                <span>+/- Zoom détails</span>
                <span>•</span>
                <span>Double-clic Agrandir</span>
                <span>•</span>
                <span>Échap Fermer</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// Sub-modal: Add Photo or Video
function AddMediaModal({
  space,
  activeUserId,
  onClose,
  onAdd,
}: {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
  onClose: () => void;
  onAdd: (data: Omit<GalleryMediaItem, 'id'>) => void;
}) {
  const [mediaType, setMediaType] = useState<GalleryMediaType>('photo');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(
    activeUserId === 'partner1' ? space.partner1.city : space.partner2.city
  );
  const [date, setDate] = useState(() =>
    new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())
  );
  const [category, setCategory] = useState<GalleryMediaItem['category']>('Visio & Quotidien');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(15);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'photo');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl) return;

    onAdd({
      type: mediaType,
      url: mediaUrl,
      title: title.trim(),
      caption: caption.trim() || undefined,
      location: location.trim() || 'À distance dans nos cœurs',
      date: date.trim(),
      addedBy: activeUserId,
      durationSeconds: mediaType === 'video' ? videoDuration : undefined,
      isFavorite: false,
      category,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070514e6] backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#160f2e] border border-white/[0.1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar text-left text-white">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-rose-400" />
            <span>Ajouter une Photo ou Vidéo</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setMediaType('photo');
            }}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mediaType === 'photo'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo Souvenir 📸</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setMediaType('video');
            }}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mediaType === 'video'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Vidéo Souvenir 🎥</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker or Preview */}
          <div>
            <label className="text-xs text-white/70 block mb-1 font-medium">
              Fichier {mediaType === 'video' ? 'Vidéo (MP4, WebM)' : 'Photo (JPG, PNG)'} *
            </label>

            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/60 max-h-56 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="max-h-52 w-full object-contain"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="max-h-52 w-full object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                  title="Changer de fichier"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-rose-400/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 mb-2">
                  {mediaType === 'video' ? (
                    <Video className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Camera className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div className="text-xs font-semibold text-white">
                  Sélectionner un fichier sur votre appareil
                </div>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Prend en charge photos et vidéos personnelles
                </p>
              </div>
            )}

            {/* Quick Presets Options */}
            {!mediaUrl && (
              <div className="mt-2.5">
                <span className="text-[11px] text-white/40 block mb-1">
                  Ou choisir parmi nos modèles romantiques :
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_MEDIA_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        setMediaType(opt.type);
                        setMediaUrl(opt.url);
                        setTitle(opt.title);
                        setLocation(opt.location);
                        setCategory(opt.category);
                        if (opt.durationSeconds) setVideoDuration(opt.durationSeconds);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-left text-[11px] text-white/80 hover:text-white border border-white/[0.06] truncate transition-colors"
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title & Caption */}
          <div>
            <label className="text-xs text-white/70 block mb-1">Titre du souvenir *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Notre fou rire en visio, Retrouvailles à l'aéroport..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Petite note ou mot doux (optionnel)
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ce que tu ressentais à cet instant..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
            />
          </div>

          {/* Location & Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/70 block mb-1">Lieu</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ex: Ouagadougou, Paris..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as GalleryMediaItem['category'])
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#140e29] border border-white/[0.1] text-xs text-white focus:outline-none"
              >
                <option value="Visio & Quotidien">Visio & Quotidien</option>
                <option value="Moments tendres">Moments tendres</option>
                <option value="Retrouvailles">Retrouvailles</option>
                <option value="Voyages">Voyages</option>
                <option value="Fous rires">Fous rires</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!mediaUrl || !title.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-rose-500/30"
            >
              Ajouter à notre galerie ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
