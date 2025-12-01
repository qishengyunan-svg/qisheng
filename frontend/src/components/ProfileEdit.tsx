
import React, { useState } from 'react';
import { UserProfile, ZODIAC_SIGNS } from '../types';
import { ChevronLeft, Save, Upload } from 'lucide-react';

interface ProfileEditProps {
  user: UserProfile;
  onSave: (u: Partial<UserProfile>) => void;
  onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      
      reader.onload = async (event) => {
            const avatarData = event.target?.result as string;
            
            try {
              // Upload to backend API
              const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
              const response = await fetch(`${apiBaseUrl}/api/users/avatar`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                  avatarData,
                  filename: file.name
                }),
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to upload avatar');
              }
              
              const data = await response.json();
              
              // Use the complete user data returned from backend if available
              if (data.user) {
                // Add API base URL to avatar and photos URLs if needed
                const updatedUser = {
                  ...data.user,
                  avatar: data.user.avatar && !data.user.avatar.startsWith('http') ? `${apiBaseUrl}${data.user.avatar}` : data.user.avatar,
                  photos: Array.isArray(data.user.photos) ? data.user.photos.map((photo: string) => 
                    photo && !photo.startsWith('http') ? `${apiBaseUrl}${photo}` : photo
                  ) : []
                };
                
                // Update form data with the complete updated user data
                setFormData(updatedUser);
              } else if (data.avatar) {
                // Fallback if only avatar URL is returned
                const fullAvatarUrl = data.avatar.startsWith('http') ? data.avatar : `${apiBaseUrl}${data.avatar}`;
                setFormData(prev => ({
                  ...prev,
                  avatar: fullAvatarUrl
                }));
              }
        } catch (error) {
          console.error('Avatar upload failed:', error);
          // 使用更友好的错误提示，显示具体错误信息
          alert(`头像上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
        alert('头像读取失败，请重试');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      // 使用更友好的错误提示，显示具体错误信息
      alert(`头像上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="h-full w-full bg-white md:bg-transparent overflow-y-auto no-scrollbar pb-24 md:pb-0 md:flex md:items-center md:justify-center">
      <div className="md:w-[600px] md:h-[80vh] md:bg-white md:rounded-3xl md:shadow-2xl md:overflow-hidden md:flex md:flex-col">
          
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <button onClick={onCancel} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">编辑资料</h1>
            <button onClick={handleSubmit} className="p-2 -mr-2 text-rose-500 font-medium hover:bg-rose-50 rounded-lg px-4">
              保存
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-4 group cursor-pointer">
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className={`w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-sm transition-opacity group-hover:opacity-90 ${isUploading ? 'opacity-50' : ''}`}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-full">
                    <div className="w-12 h-12 border-4 border-white border-t-4 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors disabled:opacity-70"
                  disabled={isUploading}
                >
                  <Upload size={16} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-gray-400">点击修改头像</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WEBP 格式，大小不超过 5MB</p>
            </div>

            {/* Form Fields */}
            <form className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
                  <input 
                    type="number" 
                    min="18" 
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">职业</label>
                  <input 
                    type="text" 
                    value={formData.profession}
                    onChange={(e) => handleChange('profession', e.target.value)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">星座</label>
                  <select 
                    value={formData.zodiac}
                    onChange={(e) => handleChange('zodiac', e.target.value)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none appearance-none cursor-pointer"
                  >
                    {ZODIAC_SIGNS.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm)</label>
                 <input 
                    type="number" 
                    value={formData.height || ''}
                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家乡</label>
                <input 
                  type="text" 
                  value={formData.hometown || ''}
                  onChange={(e) => handleChange('hometown', e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  placeholder="例如：北京"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">寻找什么</label>
                <input 
                  type="text" 
                  value={formData.lookingFor || ''}
                  onChange={(e) => handleChange('lookingFor', e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  placeholder="例如：一段认真的关系"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">自我介绍</label>
                </div>
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-200 outline-none resize-none transition-all"
                  placeholder="介绍一下自己..."
                />
                <p className="text-xs text-gray-400 mt-1">完善的自我介绍能提升 300% 的匹配率</p>
              </div>

              {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">我的标签</label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(formData.tags) ? formData.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-sm flex items-center gap-1 hover:border-rose-200 transition-colors cursor-default">
                      {tag}
                      <button type="button" onClick={() => {
                         const newTags = Array.isArray(formData.tags) ? formData.tags.filter((_, i) => i !== idx) : [];
                         handleChange('tags', newTags);
                      }} className="text-gray-400 hover:text-red-500">&times;</button>
                    </span>
                  )) : null}
                  <button 
                    type="button"
                    onClick={() => {
                      const tag = prompt("添加标签:");
                      if (tag) {
                        const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
                        handleChange('tags', [...currentTags, tag]);
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm border border-transparent hover:bg-gray-200 transition-colors"
                  >
                    + 添加
                  </button>
                </div>
            </div>
            </form>
          </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
