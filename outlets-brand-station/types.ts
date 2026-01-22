
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  originalPrice: number;
  price: number;
  image: string;
  description: string;
  tags: string[];
  rating: number;
  stockStatus: '热销' | '少量' | '售罄';
  weight: number; // 单位: kg
}

export interface Brand {
  name: string;
  type: string;
  description: string;
  cover: string;
  isCollected: boolean;
}

export type Category = '全部' | '奢品' | '运动' | '美妆' | '配饰' | '潮流';

export interface Participant {
  userId: string;
  userName: string;
  avatar: string;
  amount: number;
  weight: number;
}

export interface GroupActivity {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  image: string;
  type: 'OFFICIAL' | 'PERSONAL';
  leaderName?: string;
  targetAmount: number;
  currentAmount: number;
  currentWeight: number; // 当前总重量
  participantCount: number;
  participants: Participant[]; // 详细成员列表
  endTime: string;
  strategy: 'CANCEL_IF_FAIL' | 'STILL_FORM_GROUP';
  isCertified?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
