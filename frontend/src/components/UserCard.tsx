
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Briefcase, MapPin, Ruler, Star, Heart } from 'lucide-react';
import MessageInput from './MessageInput';

interface UserCardProps {
  user: UserProfile;
  active: boolean;
  onAction: (direction: 'left' | 'right' | 'super', message?: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, active, onAction }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [actionType, setActionType] = useState<'right' | 'super'>('right');

  // Keyboard navigation for desktop
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onAction('left');
      } else if (e.key === 'ArrowRight') {
        setActionType('right');
        setShowMessageInput(true);
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
          // Toggle detail view on space or up arrow
          setShowDetail(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onAction]);

  if (!user) return null; // Safety check

  const handleLikeAction = (type: 'right' | 'super') => {
    setActionType(type);
    setShowMessageInput(true);
  };

  const handleSendMessage = (message: string) => {
    onAction(actionType, message);
    setShowMessageInput(false);
  };

  const handleCancelMessage = () => {
    setShowMessageInput(false);
  };

  return (
    <div 
      className={`absolute inset-0 md:inset-auto md:w-[375px] md:h-[650px] bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out select-none
      ${active ? 'z-20 scale-100 opacity-100' : 'z-10 scale-95 opacity-0 pointer-events-none'}`}
      style={{
        transformOrigin: 'bottom center',
        // Center vertically/horizontally in the parent container for desktop via props or CSS class in parent, 
        // but absolute positioning here requires manual centering if parent isn't flex. 
        // We rely on parent flex centering for the "active" card conceptually, but this is a stack.
        // For simplicity in stack, we center via margins if static, or left/top if absolute.
      }}
    >
      {/* Scrollable Content Container */}
      <div className="h-full overflow-y-auto no-scrollbar pb-24 bg-gray-50">
        
        {/* Main Photo Area */}
        <div 
          className="relative h-[65%] w-full bg-gradient-to-br from-rose-50 to-pink-50 cursor-pointer group"
          onClick={() => setShowDetail(!showDetail)}
        >
          <img 
            src={user.photos?.[0] || user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 text-white">
            <h2 className="text-3xl font-bold flex items-end gap-2">
              {user.name} <span className="text-xl font-normal opacity-90">{user.age}</span>
            </h2>
            <div className="flex items-center gap-2 mt-2 text-sm opacity-90">
               <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Star size={12} /> {user.zodiac}
               </span>
               <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <MapPin size={12} /> {user.hometown}
               </span>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="p-6 space-y-6">
          
          {/* Bio */}
          <section>
            <h3 className="text-gray-900 font-semibold mb-2">关于我</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {user.bio}
            </p>
          </section>

          {/* Basic Info Tags */}
          <section>
            <h3 className="text-gray-900 font-semibold mb-3">基本资料</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm">
                <Briefcase size={14} /> {user.profession}
              </div>
              {user.height && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm">
                  <Ruler size={14} /> {user.height}cm
                </div>
              )}

            </div>
          </section>

           {/* Interest Tags */}
           <section>
            <h3 className="text-gray-900 font-semibold mb-3">兴趣爱好</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(user.tags) ? user.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-medium border border-rose-100">
                  #{tag}
                </span>
              )) : null}
            </div>
          </section>

           {/* Looking For */}
           <section>
            <h3 className="text-gray-900 font-semibold mb-2">交友目的</h3>
            <p className="text-gray-500 text-sm italic">
              "{user.lookingFor}"
            </p>
          </section>
        </div>
      </div>

      {/* Message Input Overlay */}
      {showMessageInput && (
        <MessageInput
          onSend={handleSendMessage}
          onCancel={handleCancelMessage}
          recipientName={user.name}
          actionType={actionType === 'super' ? 'super-like' : 'like'}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 z-30 pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onAction('left'); }}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all border border-gray-100"
          title="不喜欢 (Left Arrow)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleLikeAction('super'); }}
          className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-blue-400 hover:text-blue-500 hover:scale-110 transition-all border border-gray-100"
           title="超级喜欢 (空格键)"
        >
          <Star fill="currentColor" size={20} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleLikeAction('right'); }}
          className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-full shadow-xl shadow-rose-200 flex items-center justify-center text-white hover:scale-110 transition-all"
          title="喜欢 (Right Arrow)"
        >
           <Heart fill="currentColor" size={28} />
        </button>
      </div>
    </div>
  );
};

export default UserCard;
