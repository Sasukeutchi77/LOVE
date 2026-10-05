import React from 'react';
import { Home, Gamepad2, Compass, MessageCircleHeart, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Accueil',
      icon: Home,
    },
    {
      id: 'games' as TabType,
      label: 'Jeux',
      icon: Gamepad2,
    },
    {
      id: 'serious' as TabType,
      label: 'Avenir',
      icon: Compass,
    },
    {
      id: 'chat' as TabType,
      label: 'Messages',
      icon: MessageCircleHeart,
      badge: unreadCount,
    },
    {
      id: 'memories' as TabType,
      label: 'Souvenirs',
      icon: Sparkles,
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e0a1a]/92 backdrop-blur-xl border-t border-white/[0.08] pb-safe"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-all duration-200 select-none ${
                isActive
                  ? 'text-rose-400 font-semibold'
                  : 'text-white/45 hover:text-white/70 font-normal'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-rose-300' : 'text-white/50'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
