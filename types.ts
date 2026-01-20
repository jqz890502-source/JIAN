
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
}

export interface Brand {
  name: string;
  type: string;
  description: string;
  cover: string;
  isCollected: boolean;
}

export type Category = '全部' | '奢品' | '运动' | '美妆' | '配饰' | '潮流';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
