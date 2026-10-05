import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Download,
  Sparkles,
  Heart,
  Eraser,
  Undo2,
  MessageCircleHeart,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { CoupleSpace } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface LoveCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const PALETTE = [
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Rose doux', color: '#fda4af' },
  { name: 'Violet', color: '#c084fc' },
  { name: 'Or', color: '#fbbf24' },
  { name: 'Blanc', color: '#ffffff' },
];

const STAMPS = ['💖', '💋', '✨', '🧸', '💌', '🌹'];

export const LoveCanvasModal: React.FC<LoveCanvasModalProps> = ({
  isOpen,
  onClose,
  space,
  activeUserId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0].color);
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playMessage();
    const dataUrl = canvas.toDataURL('image/png');
    StorageService.addMessage({
      senderId: activeUserId,
      text: '🎨 Doux dessin fait sur notre Ardoise',
      imageUrl: dataUrl,
      hasHeart: true,
    });
    showToast('Envoyé dans notre conversation ! 💕');
  };

  const handleSaveToMemories = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playWin();
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fda4af', '#f472b6', '#ec4899', '#c084fc'],
      });
    } catch {
      // Ignore
    }
    const dataUrl = canvas.toDataURL('image/png');
    StorageService.addMemory({
      title: 'Notre dessin complice',
      date: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date()),
      location: 'Sur l’Ardoise de Câlins',
      note: `Créé avec tendresse par ${activeUserId === 'partner1' ? space.partner1.name : space.partner2.name}`,
      imageUrl: dataUrl,
      isFavorite: true,
    });
    showToast('Enregistré dans nos Souvenirs ! ✨');
  };

  // Load saved canvas and subscribe to cross-tab updates
  useEffect(() => {
    if (!isOpen) return;

    const loadCanvasData = (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };

    const saved = localStorage.getItem('loveplay_canvas_v1');
    if (saved) {
      setTimeout(() => loadCanvasData(saved), 50);
    }

    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'CANVAS_UPDATED') {
        loadCanvasData(event.payload as string);
      }
    });

    return unsubscribe;
  }, [isOpen]);

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistoryStack((prev) => [...prev.slice(-10), dataUrl]);
    try {
      localStorage.setItem('loveplay_canvas_v1', dataUrl);
      StorageService.broadcast('CANVAS_UPDATED', dataUrl);
    } catch {
      // Ignore
    }
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (selectedStamp) {
      sound.playTap();
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      saveCanvas();
      setSelectedStamp(null);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#140f26' : selectedColor;
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvas();
  };

  const handleUndo = () => {
    if (historyStack.length <= 1) {
      handleClear();
      return;
    }
    sound.playTap();
    const newStack = historyStack.slice(0, historyStack.length - 1);
    const previous = newStack[newStack.length - 1];
    setHistoryStack(newStack);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previous;
    localStorage.setItem('loveplay_canvas_v1', previous);
    StorageService.broadcast('CANVAS_UPDATED', previous);
  };

  const handleClear = () => {
    sound.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistoryStack([]);
    saveCanvas();
  };

  const handleDownload = () => {
    sound.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `dessin-amour-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-5 text-white shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-rose-100">
                L’Ardoise de Câlins
              </h2>
              <span className="text-[11px] text-white/50 block">
                Dessinez et laissez un mot manuscrit à deux
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08]"
              title="Télécharger l’image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Element */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#140f26] shadow-inner touch-none">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full aspect-square cursor-crosshair block"
          />
        </div>

        {/* Color Palette, Brush Size & Tools */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {PALETTE.map((p) => (
              <button
                key={p.color}
                onClick={() => {
                  sound.playTap();
                  setSelectedColor(p.color);
                  setIsEraser(false);
                  setSelectedStamp(null);
                }}
                style={{ backgroundColor: p.color }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  !isEraser && !selectedStamp && selectedColor === p.color
                    ? 'scale-120 ring-2 ring-white shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={p.name}
              />
            ))}

            <button
              onClick={() => {
                sound.playTap();
                setIsEraser(true);
                setSelectedStamp(null);
              }}
              className={`p-1.5 rounded-full border transition-all ${
                isEraser
                  ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                  : 'bg-white/[0.05] border-white/[0.1] text-white/50 hover:text-white'
              }`}
              title="Gomme"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action buttons (Undo & Clear) */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              title="Annuler le dernier trait"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-white/70 hover:text-white transition-all active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Effacer</span>
            </button>
          </div>
        </div>

        {/* Stamps & Brush Size Row */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/40 mr-1">Trait :</span>
            {[2, 5, 10].map((size) => (
              <button
                key={size}
                onClick={() => {
                  sound.playTap();
                  setBrushSize(size);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  brushSize === size
                    ? 'bg-rose-500/30 text-rose-200 font-bold border border-rose-400/40'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <span
                  className="rounded-full bg-white block"
                  style={{ width: size, height: size }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {STAMPS.map((stamp) => (
              <button
                key={stamp}
                onClick={() => {
                  sound.playTap();
                  setSelectedStamp(stamp);
                  setIsEraser(false);
                }}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-base transition-transform ${
                  selectedStamp === stamp
                    ? 'bg-rose-500/30 scale-115 ring-2 ring-rose-400'
                    : 'hover:bg-white/[0.05]'
                }`}
              >
                {stamp}
              </button>
            ))}
          </div>
        </div>

        {/* Action Row: Send to Chat / Save to Memories */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSendToChat}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-400/30 text-rose-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <MessageCircleHeart className="w-3.5 h-3.5 text-rose-400" />
            <span>Envoyer au chat</span>
          </button>

          <button
            onClick={handleSaveToMemories}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-400/30 text-purple-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Album souvenirs</span>
          </button>
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="text-center text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
