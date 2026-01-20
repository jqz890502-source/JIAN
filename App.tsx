
import React, { useState, useMemo } from 'react';
import { Product, Category, Brand } from './types';
import { MOCK_PRODUCTS } from './data/mockProducts';
import { MOCK_BRANDS } from './data/mockBrands';
import ProductCard from './components/ProductCard';
import { getAIRecommendations, getProductInsight } from './services/geminiService';

const MopLogo = () => (
  <div className="flex flex-col items-center group cursor-pointer">
    <div className="grid grid-cols-2 gap-0.5">
      <div className="w-5 h-5 bg-black flex items-center justify-center rounded-[1px]">
        <span className="text-white text-[11px] font-black">M</span>
      </div>
      <div className="w-5 h-5 bg-[#FFDD00] rounded-[1px]"></div>
      <div className="w-5 h-5 bg-black flex items-center justify-center rounded-[1px]">
        <div className="w-2.5 h-2.5 border-[1.5px] border-white rounded-full"></div>
      </div>
      <div className="w-5 h-5 bg-[#FFDD00] flex items-center justify-center rounded-[1px]">
        <span className="text-black text-[11px] font-black">P</span>
      </div>
    </div>
  </div>
);

type TabType = '热门商品' | '最新上架' | '销量排行';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [activeTab, setActiveTab] = useState<TabType>('热门商品');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [collectedBrands, setCollectedBrands] = useState<Set<string>>(new Set(MOCK_BRANDS.filter(b => b.isCollected).map(b => b.name)));
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ recommendedIds: string[], explanation: string } | null>(null);
  const [productInsight, setProductInsight] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');

  const categories: Category[] = ['全部', '奢品', '运动', '美妆', '配饰', '潮流'];

  const filteredProducts = useMemo(() => {
    let list = [...MOCK_PRODUCTS];
    if (activeCategory !== '全部') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (activeTab === '销量排行') return list.sort((a, b) => (b.stockStatus === '热销' ? 1 : -1));
    if (activeTab === '最新上架') return list.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return list;
  }, [activeCategory, activeTab]);

  const toggleCollectBrand = (brandName: string) => {
    const newSet = new Set(collectedBrands);
    if (newSet.has(brandName)) newSet.delete(brandName);
    else newSet.add(brandName);
    setCollectedBrands(newSet);
  };

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setAiLoading(true);
    const result = await getAIRecommendations(inputVal, MOCK_PRODUCTS);
    setAiResponse(result);
    setAiLoading(false);
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    setProductInsight(null);
    const insight = await getProductInsight(product);
    setProductInsight(insight);
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-slate-900 overflow-x-hidden">
      {/* 极简页头 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MopLogo />
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 italic uppercase">Outlets</h1>
              <span className="text-[9px] bg-[#FFDD00] text-black px-1 font-black tracking-tighter uppercase inline-block mt-0.5">MOP Brand Station</span>
            </div>
          </div>
          <div className="flex gap-4 text-slate-700">
            <div className="relative">
              <i className="far fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <i className="fas fa-ellipsis-v text-xl opacity-20"></i>
          </div>
        </div>

        <form onSubmit={handleAISearch} className="relative">
          <input
            type="text"
            className="w-full pl-5 pr-16 py-2.5 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:bg-slate-200 transition-all text-slate-900 placeholder:text-slate-400"
            placeholder="搜品牌、搜好物..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 bg-black text-[#FFDD00] font-black text-[10px] rounded-full active:scale-95 transition-transform">
            AI 搜
          </button>
        </form>
      </header>

      {/* 活动 Banner - 优化圆角为 2xl */}
      <div className="px-4 pt-4 mb-6">
        <div className="relative h-44 rounded-2xl overflow-hidden group shadow-sm active:scale-[0.99] transition-transform">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/10 to-transparent p-6 flex flex-col justify-end items-start">
            <div className="bg-[#FFDD00] text-black text-[10px] font-black px-2 py-0.5 mb-2 rounded-[2px] uppercase">Flash Sale</div>
            <h3 className="text-white text-2xl font-black mb-1 italic leading-tight">春夏巡礼 · 1折起</h3>
            <p className="text-white/70 text-[10px] font-medium tracking-widest uppercase italic">Member Exclusive Deals</p>
          </div>
        </div>
      </div>

      {/* 推荐品牌横滑区 */}
      <div className="bg-white py-2 mb-6">
        <div className="px-5 mb-5 flex justify-between items-end">
          <div className="flex flex-col">
            <h4 className="text-xl font-black text-slate-900 italic tracking-tighter leading-none uppercase">Recommended</h4>
            <span className="text-[9px] font-black text-slate-300 uppercase mt-1">品牌精选推荐</span>
          </div>
          <button onClick={() => setShowAllBrands(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 active:bg-[#FFDD00] active:text-black transition-all">
            <span>全部品牌</span>
            <i className="fas fa-arrow-right text-[8px]"></i>
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar px-5 py-2">
          {MOCK_BRANDS.map((brand) => (
            <button key={brand.name} onClick={() => setSelectedBrand(brand)} className="flex flex-col items-center gap-2.5 min-w-[70px] active:scale-95 transition-transform">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full border-2 border-slate-100 bg-white flex items-center justify-center p-3 shadow-sm transition-transform">
                   <span className="text-[10px] font-black text-slate-800 text-center leading-tight uppercase">{brand.name}</span>
                </div>
                {collectedBrands.has(brand.name) && (
                  <div className="absolute -top-0 -right-0 w-5 h-5 bg-[#FFDD00] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <i className="fas fa-heart text-[8px] text-black"></i>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{brand.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 热门/最新/销量 切换 */}
      <div className="px-4 mb-4 sticky top-[138px] z-30 py-1">
        <div className="flex bg-slate-100/90 backdrop-blur-md p-1 rounded-full border border-white shadow-sm">
          {(['热门商品', '最新上架', '销量排行'] as TabType[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10px] font-black transition-all rounded-full ${
                activeTab === tab ? 'bg-black text-[#FFDD00] shadow-md' : 'text-slate-500'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 品类选择 - 横排滚动 */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 flex-nowrap py-1">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-6 py-2 rounded-full text-[10px] font-black transition-all border whitespace-nowrap shrink-0 uppercase tracking-wider ${
                activeCategory === cat 
                  ? 'bg-[#FFDD00] text-black border-[#FFDD00] shadow-sm scale-105' 
                  : 'bg-white text-slate-400 border-slate-200 active:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4">
        <div className="grid grid-cols-2 gap-3.5 pb-12">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} variant={idx % 9 === 0 ? 'large' : 'standard'} onClick={handleProductClick} />
          ))}
        </div>
      </main>

      {/* 全部品牌页面 */}
      {showAllBrands && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-right duration-300">
           <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">All Brands</h2>
              <button onClick={() => setShowAllBrands(false)} className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform">
                 <i className="fas fa-times text-xl"></i>
              </button>
           </div>
           <div className="flex-1 overflow-y-auto px-5 py-8 no-scrollbar">
              {['奢品', '运动', '美妆', '潮流'].map(type => (
                <div key={type} className="mb-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-[#FFDD00]"></div>
                      <h3 className="text-lg font-black tracking-widest uppercase italic">{type}</h3>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      {MOCK_BRANDS.filter(b => b.type === type).map(brand => (
                        <button key={brand.name} onClick={() => { setSelectedBrand(brand); setShowAllBrands(false); }} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
                           <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-3 border border-slate-100 shadow-sm">
                              <span className="text-[10px] font-black text-center text-slate-800 leading-tight uppercase">{brand.name}</span>
                           </div>
                           <span className="text-[8px] font-black text-slate-300 tracking-[1px] uppercase">Official</span>
                        </button>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* 品牌详情页 */}
      {selectedBrand && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-500">
          <div className="relative h-[30vh]">
             <img src={`${selectedBrand.cover}&w=1200&q=90`} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40"></div>
             <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center">
                <button onClick={() => setSelectedBrand(null)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                   <i className="fas fa-times"></i>
                </button>
                <button 
                  onClick={() => toggleCollectBrand(selectedBrand.name)}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 font-black text-[10px] transition-all shadow-xl active:scale-95 ${
                    collectedBrands.has(selectedBrand.name) ? 'bg-[#FFDD00] text-black' : 'bg-black text-[#FFDD00]'
                  }`}
                >
                  <i className={collectedBrands.has(selectedBrand.name) ? "fas fa-heart" : "far fa-heart"}></i>
                  <span>{collectedBrands.has(selectedBrand.name) ? "已关注" : "关注品牌"}</span>
                </button>
             </div>
             <div className="absolute bottom-6 left-8">
                <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-xl uppercase">{selectedBrand.name}</h2>
             </div>
          </div>
          <div className="flex-1 -mt-4 bg-white rounded-t-2xl p-8 overflow-y-auto no-scrollbar shadow-inner">
             <div className="bg-[#FFDD00] p-6 mb-8 rounded-[4px] relative border-l-8 border-black shadow-lg">
                <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[8px] font-black tracking-widest uppercase italic">The Story</div>
                <p className="text-[13px] text-black font-black leading-relaxed italic uppercase">“{selectedBrand.description}”</p>
             </div>
             <div className="flex items-center justify-between mb-5 border-b-2 border-[#FFDD00] pb-2">
                <h4 className="text-xs font-black text-slate-900 tracking-[4px] uppercase italic">Collections</h4>
                <span className="text-[10px] font-black text-slate-400">({MOCK_PRODUCTS.filter(p => p.brand === selectedBrand.name).length})</span>
             </div>
             <div className="grid grid-cols-2 gap-4 pb-12">
                {MOCK_PRODUCTS.filter(p => p.brand === selectedBrand.name).map(product => (
                  <ProductCard key={product.id} product={product} variant="standard" onClick={handleProductClick} />
                ))}
             </div>
          </div>
        </div>
      )}

      {/* 商品详情弹窗 - 优化圆角为 2xl */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
          <div className="relative h-[45vh]">
            <img src={`${selectedProduct.image}&w=1000&q=80`} className="w-full h-full object-cover" />
            <div className="absolute top-0 left-0 p-5">
              <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white p-8 overflow-y-auto no-scrollbar border-t border-slate-100">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <span className="text-[10px] font-black text-black bg-[#FFDD00] px-2 py-0.5 rounded-[2px] tracking-widest uppercase inline-block mb-2">{selectedProduct.brand}</span>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight italic uppercase">{selectedProduct.name}</h2>
               </div>
               <div className="text-right">
                  <span className="text-3xl font-black text-black italic">¥{selectedProduct.price}</span>
                  <div className="text-[10px] text-slate-300 line-through font-black italic">¥{selectedProduct.originalPrice}</div>
               </div>
            </div>
            {/* AI 洞察框优化为 rounded-xl */}
            <div className="bg-slate-50 p-5 rounded-xl mb-8 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFDD00]/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                 <div className="w-2 h-2 bg-[#FFDD00] rounded-full animate-pulse"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Expert Insight</p>
              </div>
              <p className="text-[13px] font-black text-slate-700 leading-relaxed italic relative z-10">“{productInsight || "正在通过 AI 分析该单品潮流指数..."}”</p>
            </div>
            <p className="text-[11px] text-slate-500 font-bold leading-loose mb-10 uppercase tracking-tight">{selectedProduct.description}</p>
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pb-10 flex gap-3">
               <button className="flex-1 h-12 bg-white border-2 border-black text-black font-black text-[11px] rounded-full active:scale-95 transition-all uppercase tracking-tighter">加入购物袋</button>
               <button className="flex-1 h-12 bg-black text-[#FFDD00] font-black text-[11px] rounded-full active:scale-95 transition-all shadow-2xl uppercase tracking-tighter">立即结算</button>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-6 py-2 flex justify-between items-center z-40 border-t border-slate-50 shadow-[0_-2px_15px_rgba(0,0,0,0.03)]">
        <button className="text-slate-900 flex flex-col items-center gap-0.5 min-w-[48px] active:scale-90 transition-transform">
          <i className="fas fa-home text-base"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">精选</span>
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-0.5 min-w-[48px] active:scale-90 transition-transform">
          <i className="far fa-heart text-base"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">收藏</span>
        </button>
        <div className="relative -mt-6">
          <button className="w-12 h-12 bg-black rounded-full border-[4px] border-white flex items-center justify-center text-[#FFDD00] shadow-2xl active:scale-90 transition-transform">
            <i className="fas fa-shopping-bag text-lg"></i>
          </button>
        </div>
        <button className="text-slate-400 flex flex-col items-center gap-0.5 min-w-[48px] active:scale-90 transition-transform">
          <i className="fas fa-th-large text-base"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">分类</span>
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-0.5 min-w-[48px] active:scale-90 transition-transform">
          <i className="far fa-user text-base"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">我的</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
