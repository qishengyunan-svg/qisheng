
import React, { useState, useEffect } from 'react';
import { UserProfile, ViewState, InteractionType, Match } from './types';
import { getCurrentUser, getRecommendations, updateCurrentUser, getMatches, login, register, logout, getUserActivity, acceptMatch, rejectMatch } from './services/db';
import { recordInteraction } from './services/interactionService';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

// Components
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import UserCard from './components/UserCard';
import ProfileEdit from './components/ProfileEdit';
import MatchesList from './components/MatchesList';
import ChatRoom from './components/ChatRoom';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'; // For stats
import { Settings, Zap, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('recommendations');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showCompleteProfileTip, setShowCompleteProfileTip] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activityData, setActivityData] = useState<Array<{name: string, views: number}>>([
    { name: 'Mon', views: 0 },
    { name: 'Tue', views: 0 },
    { name: 'Wed', views: 0 },
    { name: 'Thu', views: 0 },
    { name: 'Fri', views: 0 },
    { name: 'Sat', views: 0 },
    { name: 'Sun', views: 0 }
  ]);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);



  // Check authentication status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Get user activity data when currentUser changes
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      fetchUserActivity();
    }
  }, [currentUser, isAuthenticated]);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Try to get current user to verify token is valid
        const user = await getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Load initial data if authenticated
        await loadInitialData();
      }
    } catch (e) {
      console.error('Authentication check failed:', e);
      // Clear invalid token
      localStorage.removeItem('authToken');
      // Keep using mock data if authentication fails
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    try {
      const data = await getUserActivity();
      setActivityData(data);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      // Keep using the default data if fetch fails
    }
  };

  const loadInitialData = async () => {
    try {
      const localRecs = await getRecommendations();
      setQueue(localRecs); // Use fetched recommendations
      
      setMatches(await getMatches());
    } catch (e) {
      console.error('Failed to load initial data:', e);
      // Keep using mock data if fetch fails
    }
  };

  // Authentication handlers
  const handleLogin = async (user: any, token: string) => {
    setAuthLoading(true);
    try {
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthMode('login');
      
      // Load initial data after login
      await loadInitialData();
    } catch (err) {
      console.error('Login failed:', err);
      throw err; // Let LoginForm handle the error
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setAuthLoading(true);
    try {
      await register(userData);
      // After successful registration, switch to login mode
      setAuthMode('login');
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err);
      throw err; // Let RegisterForm handle the error
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setQueue([]);
    setMatches([]);
    setView('recommendations');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const freshRecs = await getRecommendations();
      setQueue(freshRecs);
    } catch (e) {
      console.error('Failed to refresh recommendations:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleInteraction = async (direction: 'left' | 'right' | 'super', message?: string) => {
    if (!currentUser || queue.length === 0) return;

    const targetUser = queue[0];
    const type = direction === 'right' ? InteractionType.LIKE :
                 direction === 'super' ? InteractionType.SUPER_LIKE :
                 InteractionType.DISLIKE;

    try {
      // Record in DB with optional message
      const result = await recordInteraction(currentUser.id, targetUser.id, type, message);

      // Update local state
      if (result.isMatch) {
         setMatches(await getMatches());
         alert('匹配成功！');
      }

      // Remove from queue (UI visual update)
      setQueue(prev => prev.slice(1));

      // Refill queue check could go here
    } catch (error) {
      console.error('Interaction failed:', error);
      // Show more detailed error message
      alert(`操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await updateCurrentUser(updates);
      setCurrentUser(updated);
      setView('recommendations'); 
    } catch (error) {
      console.error('Update profile failed:', error);
      alert('更新资料失败，请重试');
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await acceptMatch(matchId);
      // Refresh matches list
      const updatedMatches = await getMatches();
      setMatches(updatedMatches);
      // Find the accepted match and open chat window automatically
      const acceptedMatch = updatedMatches.find(match => match.id === matchId);
      if (acceptedMatch) {
        setSelectedMatch(acceptedMatch);
      }
    } catch (error) {
      console.error('Failed to accept match:', error);
      alert('接受匹配失败，请重试');
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      await rejectMatch(matchId);
      // Refresh matches list
      setMatches(await getMatches());
    } catch (error) {
      console.error('Failed to reject match:', error);
      alert('拒绝匹配失败，请重试');
    }
  };

  // --- Views ---

  const renderRecommendations = () => (
    <div className="relative w-full h-full flex flex-col pt-4 md:pt-0">
      
      {/* Top Banner */}
      {showCompleteProfileTip && (
        <div className="mx-4 mb-4 md:absolute md:top-4 md:right-4 md:w-80 md:z-50 p-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-white flex justify-between items-center shadow-lg animate-fade-in-down">
          <div>
            <p className="font-bold text-sm">提升匹配率 🚀</p>
            <p className="text-xs opacity-90">只需 3 分钟完善您的详细资料</p>
          </div>
          <button 
            onClick={() => setView('edit-profile')}
            className="px-3 py-1 bg-white text-fuchsia-600 rounded-lg text-xs font-bold"
          >
            去完善
          </button>
          <button onClick={() => setShowCompleteProfileTip(false)} className="ml-2 opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Card Stack Container */}
      <div className="flex-1 relative w-full h-full flex flex-col justify-center items-center">
        <div className="relative w-full h-full md:w-[375px] md:h-[650px]">
          {queue.length > 0 ? (
            queue.map((user, index) => (
              <UserCard 
                key={user.id} 
                user={user} 
                active={index === 0} 
                onAction={handleInteraction}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-white md:bg-transparent rounded-3xl">
              <div className="mb-4 text-gray-300">
                 {refreshing ? <RefreshCw className="animate-spin" size={48}/> : <Zap size={48} />}
              </div>
              <p>{refreshing ? '正在寻找有缘人...' : '暂时没有更多推荐了'}</p>
              
              {!refreshing && (
                <button 
                  onClick={handleRefresh} 
                  className="mt-6 px-6 py-2 bg-white border border-rose-200 text-rose-500 rounded-full shadow-sm hover:bg-rose-50 font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} /> 刷新列表
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop Instructions Hint */}
        <div className="hidden md:block absolute bottom-8 text-gray-400 text-sm font-medium opacity-60">
           使用键盘 <span className="border border-gray-300 rounded px-1">←</span> <span className="border border-gray-300 rounded px-1">→</span> 进行操作
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    if (!currentUser) return null;

    return (
      <div className="h-full bg-gray-50 overflow-y-auto no-scrollbar pb-20 md:pb-0">
        <div className="md:w-[600px] md:bg-white md:rounded-3xl md:shadow-xl md:overflow-hidden mx-auto">
          <div className="relative h-[200px] md:h-[300px] bg-gray-200">
            <img src={currentUser.photos && currentUser.photos.length > 0 ? currentUser.photos[0] : currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
             <button 
                  onClick={() => setView('recommendations')}
                  className="absolute top-4 left-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm hover:bg-black/50 transition-colors z-10"
                >
                  ← 返回发现
             </button>
          </div>
          
          <div className="relative px-6 -mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <img src={currentUser.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-16 bg-white" />
                <h2 className="text-2xl font-bold mt-3 text-gray-900">
                  {currentUser.name}
                  <span className="ml-2 text-lg font-normal text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                    {currentUser.age}岁
                  </span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">{currentUser.profession}</p>
                
                <div className="grid grid-cols-3 gap-8 mt-6 w-full text-center border-t border-gray-100 pt-4">
                  <div>
                      <div className="text-lg font-bold text-gray-800">{matches.length}</div>
                      <div className="text-xs text-gray-400 uppercase">匹配</div>
                  </div>
                  <div>
                      <div className="text-lg font-bold text-gray-800">128</div>
                      <div className="text-xs text-gray-400 uppercase">喜欢</div>
                  </div>
                  <div>
                      <div className="text-lg font-bold text-gray-800">1.2k</div>
                      <div className="text-xs text-gray-400 uppercase">浏览</div>
                  </div>
                </div>

                <button 
                  onClick={() => setView('edit-profile')}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold shadow-lg shadow-rose-200 transform active:scale-95 transition-transform hover:shadow-xl"
                >
                  编辑资料
                </button>
            </div>
          </div>

          <div className="mx-6 mt-6 bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              档案活跃度
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, fill: '#f43f5e'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mx-6 mb-8 bg-black rounded-2xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-transparent opacity-20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-40 transition-opacity"></div>
            <h3 className="text-lg font-bold text-yellow-400 mb-1">SoulMatch Gold</h3>
            <p className="text-sm text-gray-300 mb-4">解锁高级功能，提升匹配体验！</p>
            
            {/* Member Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-xs text-gray-300">查看谁喜欢了你</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-xs text-gray-300">无限右滑，不受限制</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-xs text-gray-300">优先展示你的个人资料</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">4</div>
                <p className="text-xs text-gray-300">高级筛选功能</p>
              </div>
            </div>
            
            {/* Pricing */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-gray-900 rounded-xl p-4 text-center">
                <div className="text-sm font-bold">月度会员</div>
                <div className="text-2xl font-bold text-yellow-400 mt-1">¥29.9</div>
                <div className="text-xs text-gray-400 mt-1">/月</div>
              </div>
              <div className="flex-1 bg-yellow-500 rounded-xl p-4 text-center">
                <div className="text-sm font-bold">年度会员</div>
                <div className="text-2xl font-bold text-black mt-1">¥299</div>
                <div className="text-xs text-gray-800 mt-1">/年</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-yellow-500 text-black text-sm font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                立即开通
              </button>
              <button className="w-full bg-transparent border border-white text-white text-sm font-bold py-3 rounded-xl hover:bg-white/10 transition-colors">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(view) {
      case 'recommendations': return renderRecommendations();
      case 'discover': return <div className="p-10 text-center text-gray-400 flex items-center justify-center h-full">发现页正在建设中...<br/>这里将显示附近的人和热门话题</div>;
      case 'messages': 
        return (
          <>
             <div className="md:hidden h-full">
               {selectedMatch ? (
                 <ChatRoom match={selectedMatch} onBack={() => setSelectedMatch(null)} />
               ) : (
                 <MatchesList 
                   matches={matches} 
                   onAcceptMatch={handleAcceptMatch} 
                   onRejectMatch={handleRejectMatch} 
                   onSelectMatch={setSelectedMatch}
                 />
               )}
             </div>
             <div className="hidden md:flex h-full">
               <div className="w-80 border-r border-gray-100 bg-white">
                 <MatchesList 
                   matches={matches} 
                   onAcceptMatch={handleAcceptMatch} 
                   onRejectMatch={handleRejectMatch} 
                   onSelectMatch={setSelectedMatch}
                 />
               </div>
               <div className="flex-1 bg-gray-50">
                 {selectedMatch ? (
                   <ChatRoom match={selectedMatch} onBack={() => setSelectedMatch(null)} />
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400">
                     请在左侧选择对话
                   </div>
                 )}
               </div>
             </div>
          </>
        );
      case 'profile': return renderProfile();
      case 'edit-profile': return currentUser ? <ProfileEdit user={currentUser} onSave={handleUpdateProfile} onCancel={() => setView('profile')} /> : null;
      default: return renderRecommendations();
    }
  };



  // Show loading screen during initial load
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-rose-500">Loading...</div>;

  // Show authentication forms if not logged in
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full overflow-hidden">
        {authMode === 'login' ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <div className="h-screen w-full bg-gray-50 md:bg-gray-100 flex">
      <aside className="hidden md:flex w-96 flex-col bg-white border-r border-gray-200 shadow-sm z-20">
        <Sidebar
          currentUser={currentUser}
          matches={matches}
          currentView={view}
          onNavigate={(v) => setView(v)}
          onLogout={handleLogout}
        />
      </aside>

      <main className="flex-1 relative flex flex-col h-full">
        <div className="flex-1 relative w-full md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
        <BottomNav currentView={view} setView={setView} />
      </main>
    </div>
  );
};

export default App;
