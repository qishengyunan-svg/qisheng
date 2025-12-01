import React from 'react';
import { Match } from '../types';
import { Star, Heart, X, Check } from 'lucide-react';

interface MatchesListProps {
  matches: Match[];
  onAcceptMatch: (matchId: string) => void;
  onRejectMatch: (matchId: string) => void;
  onSelectMatch?: (match: Match) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, onAcceptMatch, onRejectMatch, onSelectMatch }) => {
  // Filter matches by status
  const pendingMatches = matches.filter(match => match.status === 'pending');
  const acceptedMatches = matches.filter(match => match.status === 'accepted');

  return (
    <div className="h-full bg-white p-4 pb-20 overflow-y-auto no-scrollbar">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">消息 & 匹配</h1>
      
      {/* Pending Match Requests */}
      {pendingMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-3">新的喜欢</h2>
          <div className="space-y-4">
            {pendingMatches.map(match => (
              <div key={match.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="flex p-4">
                  <img 
                    src={match.partner.avatar} 
                    alt={match.partner.name} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{match.partner.name}</h3>
                      {match.interactionType === 'SUPER_LIKE' && (
                        <Star fill="#3b82f6" color="#3b82f6" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {match.interactionType === 'SUPER_LIKE' ? '超级喜欢了你' : '喜欢你'}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <p className="text-sm text-gray-700 italic">
                        "{match.interactionMessage || match.lastMessage || '开始聊天吧！'}"
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onRejectMatch(match.id)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium"
                      >
                        <X size={18} />
                        拒绝
                      </button>
                      <button
                        onClick={() => onAcceptMatch(match.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-md"
                      >
                        <Heart size={18} fill="white" />
                        接受并聊天
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Matches Row */}
      {acceptedMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-3">匹配成功</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {acceptedMatches.map(match => (
              <div 
                key={match.id} 
                className="flex flex-col items-center space-y-1 min-w-[4.5rem] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSelectMatch?.(match)}
              >
                <div className="relative">
                  <img 
                    src={match.partner.avatar} 
                    alt={match.partner.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 p-0.5" 
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{match.partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages List */}
      {acceptedMatches.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">消息列表</h2>
          <div className="space-y-4">
            {acceptedMatches.map(match => (
              <div 
                key={match.id} 
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                onClick={() => onSelectMatch?.(match)}
              >
                 <img 
                   src={match.partner.avatar} 
                   alt={match.partner.name} 
                   className="w-14 h-14 rounded-full object-cover" 
                 />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-gray-900 truncate">{match.partner.name}</h3>
                      <span className="text-xs text-gray-400">刚刚</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{match.lastMessage || "开始聊天吧！"}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 && (
        <div className="text-center py-10 opacity-50">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">💤</span>
          </div>
          <p className="text-gray-500">信箱空空的...</p>
        </div>
      )}
    </div>
  );
};

export default MatchesList;