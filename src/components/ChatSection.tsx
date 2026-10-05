import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Heart,
  Sparkles,
  Image as ImageIcon,
  X,
  Trash2,
  Filter,
  Mic,
  Square,
  Play,
  Pause,
  Smile,
  Volume2,
} from 'lucide-react';
import { ChatMessage, CoupleSpace } from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';

interface ChatSectionProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

const QUICK_PROMPTS = [
  'Tu me manques tellement 💕',
  'Gros câlin tout doux 🧸',
  'Je pense très fort à toi ✨',
  'Appelle-moi dès que tu peux 📞',
  'Hâte de te serrer dans mes bras 🥰',
];

const ROMANTIC_STICKERS = ['💖', '💋', '🧸', '🥰', '🌹', '✨', '💌', '🥺', '💍', '🕊️'];

export const ChatSection: React.FC<ChatSectionProps> = ({
  space,
  activeUserId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    StorageService.getMessages()
  );
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [onlyHeartsFilter, setOnlyHeartsFilter] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // Subscribe to storage updates & cross-tab sync
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'NEW_MESSAGE' || event.type === 'MESSAGES_UPDATED') {
        setMessages(StorageService.getMessages());
      }
    });
    return unsubscribe;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping, selectedImage]);

  // Voice note timer cleanup
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const handleStartRecording = () => {
    sound.playTap();
    setIsRecordingVoice(true);
    setRecordingSeconds(1);
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopAndSendVoice = () => {
    sound.playMessage();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = Math.max(2, recordingSeconds);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);

    const newMsg = StorageService.addMessage({
      senderId: activeUserId,
      text: `🎙️ Doux murmure (${duration}s)`,
      audioDuration: duration,
      hasHeart: false,
    });
    setMessages((prev) => [...prev, newMsg]);
    simulatePartnerChatReply();
  };

  const handleCancelVoice = () => {
    sound.playTap();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handlePlayVoice = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }
    sound.playVoiceNoteChime();
    setPlayingAudioId(msgId);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 3200);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && !selectedImage) return;

    sound.playTap();
    const newMsg = StorageService.addMessage({
      senderId: activeUserId,
      text: text || (selectedImage ? '📷 Photo partagée' : ''),
      hasHeart: false,
      imageUrl: selectedImage || undefined,
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Simulate sweet partner response after 2.5s if partner is idle
    simulatePartnerChatReply();
  };

  const simulatePartnerChatReply = () => {
    setIsPartnerTyping(true);
    const partnerId = activeUserId === 'partner1' ? 'partner2' : 'partner1';

    const sweetReplies = [
      'Moi aussi mon amour, tu illumines ma journée 🥰',
      'Je garde ton message précieusement contre mon cœur ✨',
      'Plus que quelques jours mon cœur, tiens bon ! 💕',
      'Je t’embrasse fort, hâte de notre appel ce soir 🌙',
      'Tu es la plus belle chose qui me soit arrivée 💖',
    ];

    setTimeout(() => {
      const randomReply = sweetReplies[Math.floor(Math.random() * sweetReplies.length)];
      const partnerMsg = StorageService.addMessage({
        senderId: partnerId,
        text: randomReply,
        hasHeart: true,
      });
      sound.playMessage();
      setMessages((prev) => [...prev, partnerMsg]);
      setIsPartnerTyping(false);
    }, 2400);
  };

  const handleToggleHeart = (msgId: string) => {
    sound.playTap();
    const updated = StorageService.toggleHeartMessage(msgId);
    setMessages(updated);
  };

  const handleDeleteMessage = (msgId: string) => {
    sound.playTap();
    const updated = StorageService.deleteMessage(msgId);
    setMessages(updated);
  };

  const activePartner = activeUserId === 'partner1' ? space.partner1 : space.partner2;
  const otherPartner = activeUserId === 'partner1' ? space.partner2 : space.partner1;

  const displayedMessages = onlyHeartsFilter
    ? messages.filter((m) => m.hasHeart)
    : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[750px] rounded-3xl bg-[#120e24] border border-white/[0.08] shadow-2xl overflow-hidden pb-safe">
      {/* Intimate Chat Header */}
      <div className="p-4 bg-[#16112d] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-rose-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {otherPartner.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#16112d]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>{otherPartner.name}</span>
              <span className="text-[10px] text-rose-300 font-light italic">
                (à {space.distanceKm.toLocaleString('fr-FR')} km)
              </span>
            </div>
            <div className="text-[10px] text-white/50">
              {isPartnerTyping ? (
                <span className="text-rose-300 italic animate-pulse">
                  {otherPartner.name} est en train d’écrire...
                </span>
              ) : (
                `« ${otherPartner.status} »`
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playTap();
              setOnlyHeartsFilter(!onlyHeartsFilter);
            }}
            className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
              onlyHeartsFilter
                ? 'bg-rose-500/25 border-rose-400/50 text-rose-200'
                : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white'
            }`}
            title={onlyHeartsFilter ? 'Afficher tous les messages' : 'Filtrer par coups de cœur'}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyHeartsFilter ? 'fill-rose-400 text-rose-400' : ''}`} />
          </button>

          <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] text-white/50 border border-white/[0.06] hidden sm:inline">
            Espace chiffré
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        <div className="text-center my-2">
          <span className="text-[10px] text-white/40 px-3 py-1 rounded-full bg-white/[0.03]">
            {onlyHeartsFilter ? 'Messages marqués d’un cœur 💕' : 'Vos messages restent secrets entre vous deux'}
          </span>
        </div>

        {displayedMessages.map((msg) => {
          const isMe = msg.senderId === activeUserId;
          const timeFormatted = new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(msg.timestamp));

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed transition-all ${
                  isMe
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-br-xs shadow-md shadow-rose-950/40'
                    : 'bg-[#1e173b] border border-white/[0.08] text-white/90 rounded-bl-xs'
                }`}
              >
                {/* Photo attachment if present */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-48 border border-white/[0.1]">
                    <img
                      src={msg.imageUrl}
                      alt="Photo partagée"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Voice Note player if present */}
                {msg.audioDuration ? (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      onClick={() => handlePlayVoice(msg.id)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95 shadow-sm"
                      title={playingAudioId === msg.id ? 'Arrêter' : 'Écouter'}
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-3.5 h-3.5 fill-white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      )}
                    </button>

                    {/* Waveform bars */}
                    <div className="flex items-center gap-0.5 h-6">
                      {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 60, 35].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-0.5 rounded-full transition-all ${
                            isMe ? 'bg-white' : 'bg-rose-300'
                          } ${playingAudioId === msg.id ? 'animate-pulse' : 'opacity-70'}`}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-white/70">
                      0:0{msg.audioDuration}
                    </span>
                  </div>
                ) : (
                  msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                )}

                {/* Bottom message info */}
                <div
                  className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] ${
                    isMe ? 'text-rose-100/70' : 'text-white/40'
                  }`}
                >
                  <span>{timeFormatted}</span>
                  {isMe && <span>· Lu avec amour</span>}
                </div>

                {/* Heart Reaction Badge */}
                {msg.hasHeart && (
                  <button
                    onClick={() => handleToggleHeart(msg.id)}
                    className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-[#130f24] border border-rose-500/40 shadow-sm flex items-center gap-0.5 text-[10px] text-rose-300"
                    title="Cœur d’amour"
                  >
                    <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                  </button>
                )}
              </div>

              {/* Message Actions (Delete & Heart) on hover */}
              <div className="flex items-center gap-2 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!msg.hasHeart && (
                  <button
                    onClick={() => handleToggleHeart(msg.id)}
                    className="text-[10px] text-white/40 hover:text-rose-300 flex items-center gap-0.5"
                  >
                    <Heart className="w-2.5 h-2.5" />
                    <span>Aimer</span>
                  </button>
                )}

                {isMe && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="text-[10px] text-white/30 hover:text-rose-400 flex items-center gap-0.5"
                    title="Supprimer mon message"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Effacer</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isPartnerTyping && (
          <div className="flex items-center gap-1.5 text-xs text-white/40 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce delay-200" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview before sending */}
      {selectedImage && (
        <div className="p-2.5 bg-[#16112d] border-t border-white/[0.06] flex items-center gap-2">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-rose-400">
            <img src={selectedImage} alt="Aperçu" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[11px] text-rose-300">Photo prête à être envoyée ✨</span>
        </div>
      )}

      {/* Romantic Stickers Drawer */}
      {showStickers && (
        <div className="px-3 py-2 bg-[#171230] border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
            Stickers :
          </span>
          {ROMANTIC_STICKERS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                sound.playTap();
                handleSendMessage(emoji);
                setShowStickers(false);
              }}
              className="p-1.5 rounded-xl hover:bg-white/[0.08] text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Quick Prompts Carousel */}
      <div className="px-3 py-2 bg-[#16112d]/70 border-t border-white/[0.04] overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.06] hover:border-rose-400/30 text-[11px] text-white/70 hover:text-rose-200 transition-all select-none"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar or Active Voice Recording Bar */}
      {isRecordingVoice ? (
        <div className="p-3 bg-[#191233] border-t border-rose-500/30 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs text-rose-200 font-medium">
              Enregistrement du doux mot... (0:0{recordingSeconds})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelVoice}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white text-xs"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleStopAndSendVoice}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-medium flex items-center gap-1 shadow-md shadow-rose-950"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#16112d] border-t border-white/[0.06] flex items-center gap-2"
        >
          {/* Photo attachment trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="chat-image-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-rose-300 border border-white/[0.08] transition-colors"
            title="Envoyer une photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Stickers drawer trigger */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setShowStickers(!showStickers);
            }}
            className={`p-2.5 rounded-2xl border transition-colors ${
              showStickers
                ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-rose-300 border border-white/[0.08]'
            }`}
            title="Envoyer un sticker d’amour"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Voice recording button */}
          <button
            type="button"
            onClick={handleStartRecording}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/[0.08] transition-colors"
            title="Enregistrer un message vocal"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Écris à ${otherPartner.name}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-rose-950"
            aria-label="Envoyer le message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
