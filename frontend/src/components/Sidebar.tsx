
import React from 'react';
import { UserProfile, Match, ViewState } from '../types';
import { Settings, LogOut, MessageCircle, Heart } from 'lucide-react';

interface SidebarProps {
  currentUser: UserProfile | null;
  matches: Match[];
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, matches, currentView, onNavigate, onLogout }) => {

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full">
      {/* User Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onNavigate('profile')}
        >
          <img 
            src={currentUser?.avatar || 'https://picsum.photos/300/300?random=default'} 
            alt="My Avatar" 
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <span className="font-bold text-gray-800 text-sm">{currentUser?.name}</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onNavigate('profile')}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Settings size={20} />
            </button>
            {onLogout && (
                <button 
                    onClick={() => {
                        if (window.confirm('确定要退出登录吗？')) {
                            onLogout();
                        }
                    }}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                    title="退出登录"
                >
                    <LogOut size={20} />
                </button>
            )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-2 gap-2 border-b border-gray-100">
         <button 
            onClick={() => onNavigate('recommendations')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'recommendations' ? 'bg-rose-100 text-rose-600' : 'hover:bg-gray-50 text-gray-600'}`}
         >
            <Heart size={16} /> 发现
         </button>
         <button
             onClick={() => onNavigate('messages')}
             className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'messages' ? 'bg-rose-100 text-rose-600' : 'hover:bg-gray-50 text-gray-600'}`}
         >
            <MessageCircle size={16} />
            消息
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
         </button>
      </div>

      {/* Matches List Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        <div className="mb-6">
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3 px-1">新配对 ({matches.length})</h3>
            <div className="grid grid-cols-4 gap-2">
                {matches.map(match => {
                    return (
                        <div 
                            key={match.id} 
                            className="flex flex-col items-center cursor-pointer group" 
                            onClick={() => onNavigate('messages')}
                        >
                             <div className="relative">
                                <img 
                                    src={match.partner.avatar} 
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:border-rose-400 transition-colors" 
                                    alt={match.partner.name} 
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                             </div>
                             <span className="text-[10px] mt-1 text-gray-600 truncate w-full text-center">{match.partner.name}</span>
                        </div>
                    )
                })}
                {matches.length === 0 && <p className="col-span-4 text-xs text-gray-400 text-center py-4">暂无配对</p>}
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">最近消息</h3>
            <div className="space-y-1">
                 {matches.map(match => {
                    return (
                        <div 
                            key={match.id} 
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" 
                            onClick={() => onNavigate('messages')}
                        >
                            <img 
                                src={match.partner.avatar} 
                                className="w-10 h-10 rounded-full object-cover" 
                                alt={match.partner.name} 
                            />
                            <div className="overflow-hidden">
                                <h4 className="text-sm font-semibold text-gray-800">{match.partner.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{match.lastMessage || "打个招呼吧 👋"}</p>
                            </div>
                        </div>
                    )
                 })}
                 {matches.length === 0 && (
                    <div className="text-center py-8">
                        <span className="text-2xl block mb-2">📭</span>
                        <p className="text-xs text-gray-400">还没有消息哦</p>
                    </div>
                 )}
            </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-300">© 2024 SoulMatch Web</p>
      </div>
    </div>
  );
};

export default Sidebar;
