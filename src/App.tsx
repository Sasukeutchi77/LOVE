import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeSection } from './components/HomeSection';
import { GamesSection } from './components/GamesSection';
import { ChatSection } from './components/ChatSection';
import { MemoriesSection } from './components/MemoriesSection';
import { SpaceInviteModal } from './components/SpaceInviteModal';
import { TouchSyncModal } from './components/TouchSyncModal';
import { LoveCanvasModal } from './components/LoveCanvasModal';
import { DateNightModal } from './components/DateNightModal';
import { TimezoneSyncModal } from './components/TimezoneSyncModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { SeriousSection } from './components/SeriousSection';
import { GallerySection } from './components/GallerySection';
import { CoupleSpace, TabType } from './types';
import { StorageService } from './services/storage';
import { sound } from './services/sound';
import { Heart } from 'lucide-react';

export default function App() {
  const [space, setSpace] = useState<CoupleSpace>(() => StorageService.getSpace());
  const [activeUserId, setActiveUserId] = useState<'partner1' | 'partner2'>(() =>
    StorageService.getActiveUserId()
  );
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isTouchSyncOpen, setIsTouchSyncOpen] = useState(false);
  const [isLoveCanvasOpen, setIsLoveCanvasOpen] = useState(false);
  const [isDateNightOpen, setIsDateNightOpen] = useState(false);
  const [isTimezoneSyncOpen, setIsTimezoneSyncOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);

  const [heartbeatToast, setHeartbeatToast] = useState<{
    senderName: string;
    visible: boolean;
  }>({ senderName: '', visible: false });

  // Cross-tab synchronization
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'SPACE_UPDATED') {
        setSpace(event.payload as CoupleSpace);
      } else if (event.type === 'HEARTBEAT_SENT') {
        const payload = event.payload as { from: 'partner1' | 'partner2' };
        if (payload.from !== activeUserId) {
          const sender =
            payload.from === 'partner1' ? space.partner1.name : space.partner2.name;
          sound.playHeartbeat();
          setHeartbeatToast({ senderName: sender, visible: true });
          setTimeout(() => {
            setHeartbeatToast((prev) => ({ ...prev, visible: false }));
          }, 3500);
        }
      }
    });
    return unsubscribe;
  }, [activeUserId, space.partner1.name, space.partner2.name]);

  const handleSwitchUser = (id: 'partner1' | 'partner2') => {
    sound.playTap();
    setActiveUserId(id);
    StorageService.setActiveUserId(id);
  };

  const handleUpdateSpace = (updated: CoupleSpace) => {
    setSpace(updated);
    StorageService.saveSpace(updated);
  };

  const handleSendHeartbeat = () => {
    StorageService.broadcast('HEARTBEAT_SENT', { from: activeUserId });
  };

  const handleAddPlannedDate = (title: string, note: string) => {
    StorageService.addMemory({
      title,
      date: 'Prochain rendez-vous',
      location: 'À distance (visio & cœur)',
      note,
    });
  };

  return (
    <div className="min-h-screen bg-[#0c0a15] text-[#f8f6f4] flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Header */}
      <Header
        space={space}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onOpenSpaceModal={() => setIsSpaceModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-5 pb-6">
        {/* Heartbeat notification toast */}
        {heartbeatToast.visible && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-rose-500/90 text-white font-medium text-xs shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Heart className="w-4 h-4 fill-white text-white animate-ping" />
            <span>{heartbeatToast.senderName} t’envoie un battement de cœur 💖</span>
          </div>
        )}

        {activeTab === 'home' && (
          <HomeSection
            space={space}
            activeUserId={activeUserId}
            onNavigate={(tab) => {
              sound.playTap();
              setActiveTab(tab);
            }}
            onOpenSpaceModal={() => setIsSpaceModalOpen(true)}
            onSendHeartbeat={handleSendHeartbeat}
            onOpenTouchSync={() => setIsTouchSyncOpen(true)}
            onOpenLoveCanvas={() => setIsLoveCanvasOpen(true)}
            onOpenDateNight={() => setIsDateNightOpen(true)}
            onOpenTimezoneSync={() => setIsTimezoneSyncOpen(true)}
            onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
          />
        )}

        {activeTab === 'games' && (
          <GamesSection space={space} activeUserId={activeUserId} />
        )}

        {activeTab === 'gallery' && (
          <GallerySection space={space} activeUserId={activeUserId} />
        )}

        {activeTab === 'serious' && (
          <SeriousSection
            space={space}
            activeUserId={activeUserId}
            onOpenChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatSection space={space} activeUserId={activeUserId} />
        )}

        {activeTab === 'memories' && <MemoriesSection space={space} />}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          sound.playTap();
          setActiveTab(tab);
        }}
      />

      {/* Modals */}
      <SpaceInviteModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        space={space}
        onUpdateSpace={handleUpdateSpace}
      />

      <TouchSyncModal
        isOpen={isTouchSyncOpen}
        onClose={() => setIsTouchSyncOpen(false)}
        space={space}
        activeUserId={activeUserId}
      />

      <LoveCanvasModal
        isOpen={isLoveCanvasOpen}
        onClose={() => setIsLoveCanvasOpen(false)}
        space={space}
        activeUserId={activeUserId}
      />

      <DateNightModal
        isOpen={isDateNightOpen}
        onClose={() => setIsDateNightOpen(false)}
        space={space}
        onAddPlannedDate={handleAddPlannedDate}
      />

      <TimezoneSyncModal
        isOpen={isTimezoneSyncOpen}
        onClose={() => setIsTimezoneSyncOpen(false)}
        space={space}
      />

      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        space={space}
        activeUserId={activeUserId}
        onNavigateToChat={() => setActiveTab('chat')}
      />
    </div>
  );
}
