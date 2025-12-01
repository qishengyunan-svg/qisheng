import { UserProfile } from '../types';

export const MOCK_CURRENT_USER: UserProfile = {
  id: 'current_user_001',
  email: 'alex@example.com',
  name: 'Alex',
  age: 28,
  avatar: 'https://picsum.photos/id/1012/300/300',
  gender: 'male',
  profession: 'UI 设计师',
  height: 180,
  zodiac: '天秤座',
  hometown: '上海',
  bio: '喜欢摄影和旅行，寻找灵魂伴侣。',
  lookingFor: '稳定的恋爱关系',
  tags: ['摄影', '咖啡', '猫奴'],
  photos: ['https://picsum.photos/id/1012/600/800']
};

export const INITIAL_RECOMMENDATIONS: UserProfile[] = [
  {
    id: 'u_001',
    email: 'ruoxi@example.com',
    name: '林若溪',
    age: 24,
    avatar: 'https://picsum.photos/id/338/300/300',
    gender: 'female',
    profession: '插画师',
    height: 165,
    zodiac: '双鱼座',
    hometown: '杭州',
    bio: '平时喜欢宅在家里画画，偶尔去美术馆。希望找个懂艺术的男生。',
    lookingFor: '结婚对象',
    tags: ['绘画', '二次元', '美食'],
    photos: ['https://picsum.photos/id/338/600/800', 'https://picsum.photos/id/342/600/800']
  },
  {
    id: 'u_002',
    email: 'yuhang@example.com',
    name: '陈宇航',
    age: 29,
    avatar: 'https://picsum.photos/id/91/300/300',
    gender: 'male',
    profession: '金融分析师',
    height: 183,
    zodiac: '摩羯座',
    hometown: '北京',
    bio: '工作狂，但也懂得享受生活。喜欢健身和滑雪。',
    lookingFor: '短期约会',
    tags: ['健身', '投资', '滑雪'],
    photos: ['https://picsum.photos/id/91/600/800']
  },
  {
    id: 'u_003',
    email: 'sarah@example.com',
    name: 'Sarah',
    age: 26,
    avatar: 'https://picsum.photos/id/64/300/300',
    gender: 'female',
    profession: '市场营销',
    height: 170,
    zodiac: '狮子座',
    hometown: '成都',
    bio: '性格开朗，喜欢尝试新鲜事物。周末通常在探店或者Hiking。',
    lookingFor: '朋友关系',
    tags: ['探店', '徒步', '音乐节'],
    photos: ['https://picsum.photos/id/64/600/800']
  },
  {
    id: 'u_004',
    email: 'kevin@example.com',
    name: 'Kevin',
    age: 27,
    avatar: 'https://picsum.photos/id/177/300/300',
    gender: 'male',
    profession: '程序员',
    height: 175,
    zodiac: '水瓶座',
    hometown: '深圳',
    bio: '代码是工作，生活是诗。喜欢科幻电影和精酿啤酒。',
    lookingFor: '稳定的恋爱关系',
    tags: ['编程', '科幻', '啤酒'],
    photos: ['https://picsum.photos/id/177/600/800']
  }
];