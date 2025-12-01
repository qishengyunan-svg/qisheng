import React, { useState, useEffect, useRef } from 'react';
import { Match, Message } from '../types';
import { getMessages, sendMessage, markMessageAsRead } from '../services/db';
import { ChevronLeft, Send } from 'lucide-react';

interface ChatRoomProps {
  match: Match;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ match, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getMessages(match.id);
        setMessages(fetchedMessages);
        // Mark all messages as read
        for (const msg of fetchedMessages) {
          if (!msg.isRead) {
            markMessageAsRead(msg.id).catch(err => console.error('Failed to mark message as read:', err));
          }
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [match.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    try {
      const newMessage = await sendMessage(match.id, inputText.trim());
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请重试');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-rose-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <img 
            src={match.partner.avatar} 
            alt={match.partner.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-gray-900">{match.partner.name}</h2>
            <p className="text-xs text-gray-500">在线</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <p className="text-gray-500">开始聊天吧！</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.senderId === match.partner.id ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[75%] ${message.senderId === match.partner.id ? 'bg-white' : 'bg-rose-500 text-white'}`}>
                <div className="p-3 rounded-lg shadow-sm">
                  {message.content}
                </div>
                <div className={`text-xs mt-1 ${message.senderId === match.partner.id ? 'text-gray-400' : 'text-rose-200'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-xl text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={inputText.trim() === ''}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;