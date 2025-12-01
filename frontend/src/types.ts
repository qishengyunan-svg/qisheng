export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  avatar: string; // URL
  gender: 'male' | 'female' | 'other';
  profession: string;
  height?: number; // cm
  zodiac?: string;
  hometown?: string;
  bio: string;
  lookingFor: string;
  tags: string[];
  photos: string[]; // Additional photos
  createdAt?: string;
  updatedAt?: string;
}

export enum InteractionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  SUPER_LIKE = 'SUPER_LIKE'
}

export interface Interaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: InteractionType;
  timestamp: number;
}

export interface Match {
  id: string;
  users: [string, string];
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  lastMessage?: string;
  interactionType?: 'LIKE' | 'SUPER_LIKE' | 'DISLIKE';
  interactionMessage?: string;
  partner: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export type ViewState = 'recommendations' | 'discover' | 'messages' | 'profile' | 'edit-profile';

export const ZODIAC_SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", 
  "狮子座", "处女座", "天秤座", "天蝎座", 
  "射手座", "摩羯座", "水瓶座", "双鱼座"
];