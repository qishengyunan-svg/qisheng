import { UserProfile, InteractionType, Match, Message } from '../types';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// --- Auth Service ---

interface AuthResponse {
  user: UserProfile;
  token: string;
}

interface RegisterResponse {
  userId: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '登录失败');
  }

  const data = await response.json();
  // Store token in localStorage for future requests
  localStorage.setItem('authToken', data.token);
  return data;
};

export const register = async (userData: {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: string;
}): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '注册失败');
  }

  return response.json();
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
};

// Helper function to get auth headers for authenticated requests
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// --- User Service ---

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/current`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to get current user');
  }
  const user = await response.json();
  // Ensure required arrays exist
  const baseUrl = API_BASE_URL.replace('/api', '');
  return {
    ...user,
    // Add full URL to avatar and photos
    avatar: user.avatar && !user.avatar.startsWith('http') ? `${baseUrl}${user.avatar}` : user.avatar,
    tags: Array.isArray(user.tags) ? user.tags : [],
    photos: Array.isArray(user.photos) ? user.photos.map((photo: string) => 
      photo && !photo.startsWith('http') ? `${baseUrl}${photo}` : photo
    ) : []
  };
};

export const updateCurrentUser = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  const user = await response.json();
  // Ensure required arrays exist
  const baseUrl = API_BASE_URL.replace('/api', '');
  return {
    ...user,
    // Add full URL to avatar and photos
    avatar: user.avatar && !user.avatar.startsWith('http') ? `${baseUrl}${user.avatar}` : user.avatar,
    tags: Array.isArray(user.tags) ? user.tags : [],
    photos: Array.isArray(user.photos) ? user.photos.map((photo: string) => 
      photo && !photo.startsWith('http') ? `${baseUrl}${photo}` : photo
    ) : []
  };
};

// --- Recommendation Service ---

export const getRecommendations = async (excludeIds: string[] = []): Promise<UserProfile[]> => {
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser.id;
  console.log('Getting recommendations for user:', currentUserId);
  const response = await fetch(`${API_BASE_URL}/users/recommendations?currentUserId=${currentUserId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to get recommendations');
  }
  const users = await response.json();
  console.log('Got recommendations:', users.length, 'users');
  const baseUrl = API_BASE_URL.replace('/api', '');
  return users.filter((u: UserProfile) => !excludeIds.includes(u.id)).map((u: UserProfile) => ({
      ...u,
      // Add full URL to avatar and photos
      avatar: u.avatar && !u.avatar.startsWith('http') ? `${baseUrl}${u.avatar}` : u.avatar,
      tags: Array.isArray(u.tags) ? u.tags : [],
      photos: Array.isArray(u.photos) ? u.photos.map((photo: string) => 
        photo && !photo.startsWith('http') ? `${baseUrl}${photo}` : photo
      ) : []
    }));
};

// --- Interaction Service ---

export const recordInteraction = async (
  fromUserId: string,
  toUserId: string,
  type: InteractionType,
  message?: string
): Promise<{ isMatch: boolean }> => {
  console.log('Recording interaction:', { fromUserId, toUserId, type, message });

  const response = await fetch(`${API_BASE_URL}/interactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      toUserId,
      type,
      message
    }),
  });

  console.log('Interaction API response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to record interaction');
  }

  const result = await response.json();
  console.log('Interaction result:', result);
  return result;
};

// Get matches from API
export const getMatches = async (): Promise<Match[]> => {
  const currentUser = await getCurrentUser();
  const response = await fetch(`${API_BASE_URL}/matches?currentUserId=${currentUser.id}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to get matches');
  }
  return await response.json();
};

// Accept a match request
export const acceptMatch = async (matchId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/matches/${matchId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: 'accepted' })
  });
  if (!response.ok) {
    throw new Error('Failed to accept match');
  }
};

// Reject a match request
export const rejectMatch = async (matchId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/matches/${matchId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: 'rejected' })
  });
  if (!response.ok) {
    throw new Error('Failed to reject match');
  }
};

// --- Chat Service --- //

// Get messages for a match
export const getMessages = async (matchId: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/matches/${matchId}/messages`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return await response.json();
};

// Send a message
export const sendMessage = async (matchId: string, content: string): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/matches/${matchId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return await response.json();
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to mark message as read');
  }
};

export const getUserActivity = async (): Promise<Array<{name: string, views: number}>> => {
  const response = await fetch(`${API_BASE_URL}/users/activity`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to get user activity');
  }
  return await response.json();
};
