
import React from 'react';
import { ViewState } from '../types';
import { Heart, MessageCircle, User, Compass } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'recommendations', label: '推荐', icon: Heart },
    { id: 'discover', label: '发现', icon: Compass },
    { id: 'messages', label: '消息', icon: MessageCircle },
    { id: 'profile', label: '我的', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 h-16 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = currentView === item.id || (item.id === 'profile' && currentView === 'edit-profile');
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors duration-200 ${
              isActive ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} fill={isActive && item.id === 'recommendations' ? "currentColor" : "none"} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
