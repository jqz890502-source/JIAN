
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  variant?: 'standard' | 'large' | 'compact';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, variant = 'standard' }) => {
  const isLarge = variant === 'large';
  
  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-all duration-300 border border-slate-100 group flex flex-col h-full ${isLarge ? 'col-span-2' : ''}`}
      onClick={() => onClick(product)}
    >
      <div className={`relative ${isLarge ? 'aspect-[18/9]' : 'aspect-[1/1]'} overflow-hidden bg-slate-100`}>
        <img 
          src={`${product.image}&auto=format&fit=crop&w=${isLarge ? 800 : 500}&q=80`} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.tags.map(tag => (
            <span key={tag} className="bg-black text-[#FFDD00] text-[7px] font-black px-1.5 py-0.5 rounded-[1px] tracking-widest uppercase italic shadow-md">
              {tag}
            </span>
          ))}
        </div>
        
        {/* 折扣标识 */}
        <div className="absolute top-2 right-2 bg-[#FFDD00] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
        </div>

        {product.stockStatus === '少量' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-[#FFDD00] text-center text-[7px] py-1 font-black uppercase tracking-widest">
            Last Few Remaining
          </div>
        )}
      </div>
      
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[8px] font-black text-black bg-[#FFDD00] px-1 tracking-tighter uppercase inline-block mb-1 shadow-sm">{product.brand}</span>
          <h3 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-snug mb-2 italic uppercase">{product.name}</h3>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-300 line-through font-black leading-none mb-0.5 italic">¥{product.originalPrice}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] font-black text-black italic">¥</span>
              <span className="text-base font-black text-black italic leading-none">{product.price}</span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-black text-[#FFDD00] flex items-center justify-center transition-all active:scale-75 shadow-xl">
            <i className="fas fa-plus text-[9px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
