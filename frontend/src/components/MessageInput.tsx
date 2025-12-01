import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  recipientName: string;
  actionType: 'like' | 'super-like';
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onCancel, recipientName, actionType }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-end justify-center">
      <div className="bg-white w-full p-6 rounded-t-3xl shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {actionType === 'super-like' ? '超级喜欢' : '喜欢'} {recipientName}？
        </h3>
        <p className="text-gray-600 mb-4">写一条消息给对方吧，增加匹配成功率！</p>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="写下你的第一条消息..."
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            maxLength={100}
            autoFocus
          />
          <button
            onClick={handleSend}
            className="p-3 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-xl text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;