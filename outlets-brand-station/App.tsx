
import React, { useState, useMemo } from 'react';
import { Product, Category, Brand, GroupActivity, Participant } from './types';
import { MOCK_PRODUCTS } from './data/mockProducts';
import ProductCard from './components/ProductCard';

const categories: Category[] = ['全部', '奢品', '运动', '美妆', '配饰', '潮流'];

// 模拟用户的“订单中心”数据 (已完成购买但未拼邮的商品)
const MOCK_USER_ORDERS: Product[] = [
  { ...MOCK_PRODUCTS[0], id: 'ord_1' }, // 链条包
  { ...MOCK_PRODUCTS[1], id: 'ord_2' }, // 跑鞋
  { ...MOCK_PRODUCTS[4], id: 'ord_3' }  // 墨镜
];

const MOCK_GROUPS: GroupActivity[] = [
  {
    id: 'g1',
    productId: '1',
    productName: '经典菱格纹链条包',
    brand: '香奈精选',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    type: 'OFFICIAL',
    targetAmount: 50000,
    currentAmount: 38500,
    currentWeight: 6.2,
    participantCount: 5,
    endTime: '2025-02-20T23:59:59',
    strategy: 'CANCEL_IF_FAIL',
    participants: [
      { userId: 'u1', userName: 'Alice_CC', avatar: 'https://i.pravatar.cc/150?u=1', amount: 6880, weight: 1.2 },
      { userId: 'u2', userName: '时尚达人Q', avatar: 'https://i.pravatar.cc/150?u=2', amount: 6880, weight: 1.2 },
      { userId: 'u3', userName: '小王', avatar: 'https://i.pravatar.cc/150?u=3', amount: 6880, weight: 1.2 }
    ]
  },
  {
    id: 'g2',
    productId: '2',
    productName: '全掌气垫缓震跑鞋',
    brand: '耐克',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    type: 'PERSONAL',
    leaderName: '潮流主理人·阿强',
    targetAmount: 5000,
    currentAmount: 4200,
    currentWeight: 5.6,
    participantCount: 8,
    endTime: '2025-02-18T18:00:00',
    strategy: 'STILL_FORM_GROUP',
    isCertified: true,
    participants: [
      { userId: 'u10', userName: '阿强(团长)', avatar: 'https://i.pravatar.cc/150?u=10', amount: 599, weight: 0.8 },
      { userId: 'u11', userName: '跑步爱好者', avatar: 'https://i.pravatar.cc/150?u=11', amount: 599, weight: 0.8 }
    ]
  }
];

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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'HOME' | 'GROUP_HUB' | 'PROFILE'>('HOME');
  const [subView, setSubView] = useState<'NONE' | 'GROUP_DETAIL' | 'ORDER_SELECT'>('NONE');
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeGroup, setActiveGroup] = useState<GroupActivity | null>(null);
  const [showRulePopup, setShowRulePopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let list = [...MOCK_PRODUCTS];
    if (activeCategory !== '全部') list = list.filter(p => p.category === activeCategory);
    return list;
  }, [activeCategory]);

  const openJoinFlow = (group: GroupActivity) => {
    setActiveGroup(group);
    setSubView('ORDER_SELECT'); // 流程：拼团中心 -> 选订单 -> 详情
  };

  const RulePopup = () => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 relative">
         <button onClick={() => setShowRulePopup(false)} className="absolute top-4 right-4 text-slate-300"><i className="fas fa-times"></i></button>
         <h3 className="text-lg font-black italic uppercase mb-6 border-b-2 border-black pb-2">拼团核心规则</h3>
         <div className="space-y-4">
            <div>
               <p className="text-[11px] font-black mb-1 uppercase">1. 同品凑单</p>
               <p className="text-[10px] text-slate-400 font-bold leading-relaxed">本拼团仅支持同款商品凑单，旨在通过大宗物流降低国际运费成本。</p>
            </div>
            <div>
               <p className="text-[11px] font-black mb-1 uppercase">2. 订单前置</p>
               <p className="text-[10px] text-slate-400 font-bold leading-relaxed">必须先在“奥特莱斯”完成支付后，方可进入拼团中心选择对应订单参与拼单。</p>
            </div>
            <div>
               <p className="text-[11px] font-black mb-1 uppercase">3. 邮费规则</p>
               <p className="text-[10px] text-slate-400 font-bold leading-relaxed">若未达免邮门槛，系统将根据各团员包裹重量比例均摊物流费用。</p>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900 overflow-x-hidden">
      {showRulePopup && <RulePopup />}

      {/* Header - 拼团中心不显示Logo */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentView === 'HOME' && <MopLogo />}
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 italic uppercase">
                {currentView === 'HOME' ? '奥特莱斯' : '拼团中心'}
              </h1>
              <span className="text-[9px] bg-[#FFDD00] text-black px-1 font-black tracking-tighter uppercase inline-block mt-0.5 italic">
                {currentView === 'HOME' ? 'MOP 品牌驿站' : '平台同品拼邮系统'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-slate-700">
             <i className="far fa-bell text-xl"></i>
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><i className="fas fa-user text-sm"></i></div>
          </div>
        </div>
      </header>

      {currentView === 'HOME' && (
        <div className="animate-in fade-in duration-500">
          <div className="px-4 pt-4 mb-6">
            <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent p-6 flex flex-col justify-end">
                <div className="bg-[#FFDD00] text-black text-[10px] font-black px-2 py-0.5 mb-2 rounded-[2px] w-fit uppercase italic">闪购进行中</div>
                <h3 className="text-white text-2xl font-black italic uppercase leading-tight">春夏巡礼 · 低至1折</h3>
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mb-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black border uppercase ${activeCategory === cat ? 'bg-[#FFDD00] text-black border-[#FFDD00]' : 'bg-white text-slate-400 border-slate-200'}`}>
                {cat}
              </button>
            ))}
          </div>
          <main className="px-4 grid grid-cols-2 gap-3.5">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} variant={idx % 9 === 0 ? 'large' : 'standard'} onClick={setSelectedProduct} />
            ))}
          </main>
        </div>
      )}

      {currentView === 'GROUP_HUB' && (
        <div className="px-4 animate-in fade-in duration-300">
           <div className="my-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-black italic uppercase">推荐拼单</h2>
                 <button onClick={() => setShowRulePopup(true)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <i className="far fa-question-circle"></i> 规则说明
                 </button>
              </div>
              {MOCK_GROUPS.map(group => (
                <div key={group.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-4 shadow-sm p-4">
                   <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0"><img src={group.image} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                         <div>
                            <span className="text-[8px] font-black bg-black text-[#FFDD00] px-1.5 py-0.5 rounded uppercase italic mb-1 inline-block">{group.brand}</span>
                            <h3 className="text-[13px] font-black text-slate-800 italic uppercase line-clamp-1">{group.productName}</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">当前总重: {group.currentWeight.toFixed(1)}kg</p>
                         </div>
                         <div className="flex justify-between items-end">
                            <span className="text-[14px] font-black italic">¥{group.currentAmount} / {group.targetAmount}</span>
                            <button onClick={() => openJoinFlow(group)} className="px-5 py-1.5 bg-black text-[#FFDD00] rounded-full text-[10px] font-black uppercase italic">参与</button>
                         </div>
                      </div>
                   </div>
                   <div className="h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFDD00]" style={{width: `${(group.currentAmount/group.targetAmount)*100}%`}}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ---------------- 订单中心/选择页 (二级页面) ---------------- */}
      {subView === 'ORDER_SELECT' && activeGroup && (
        <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <button onClick={() => setSubView('NONE')} className="w-8 h-8 flex items-center justify-center"><i className="fas fa-times"></i></button>
              <h3 className="text-sm font-black italic uppercase">订单中心 - 选择订单</h3>
              <div className="w-8"></div>
           </div>
           <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">目标商品</p>
                 <div className="flex gap-3 items-center p-3 bg-slate-50 rounded-xl">
                    <img src={activeGroup.image} className="w-12 h-12 rounded-lg object-cover" />
                    <p className="text-[12px] font-black italic uppercase">{activeGroup.productName}</p>
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">名下待拼订单 (同款)</p>
              <div className="space-y-3">
                 {MOCK_USER_ORDERS.filter(o => o.name === activeGroup.productName).map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`flex justify-between items-center p-4 border-2 rounded-xl transition-all ${selectedOrderId === order.id ? 'border-black bg-slate-50' : 'border-slate-100'}`}
                    >
                       <div>
                          <p className="text-[11px] font-black uppercase">订单号: {order.id}</p>
                          <p className="text-[10px] font-bold text-slate-400">实付: ¥{order.price} | 重量: {order.weight}kg</p>
                       </div>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOrderId === order.id ? 'bg-black border-black' : 'border-slate-200'}`}>
                          {selectedOrderId === order.id && <i className="fas fa-check text-[8px] text-[#FFDD00]"></i>}
                       </div>
                    </div>
                 ))}
                 {MOCK_USER_ORDERS.filter(o => o.name === activeGroup.productName).length === 0 && (
                   <div className="text-center py-12">
                      <i className="fas fa-shopping-cart text-slate-100 text-5xl mb-4"></i>
                      <p className="text-[11px] font-black text-slate-300 uppercase">未找到该款商品的已下单记录</p>
                      <button onClick={() => { setCurrentView('HOME'); setSubView('NONE'); }} className="mt-4 text-[10px] font-black text-black underline uppercase italic">去奥特莱斯选购</button>
                   </div>
                 )}
              </div>
           </div>
           {selectedOrderId && (
             <div className="p-6 bg-white border-t border-slate-100">
                <button onClick={() => setSubView('GROUP_DETAIL')} className="w-full h-14 bg-black text-[#FFDD00] font-black uppercase italic text-xs rounded-xl shadow-xl">确认选择并查看详情</button>
             </div>
           )}
        </div>
      )}

      {/* ---------------- 拼团详情 (二级页面) ---------------- */}
      {subView === 'GROUP_DETAIL' && activeGroup && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <button onClick={() => setSubView('NONE')} className="w-8 h-8 flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
              <h3 className="text-sm font-black italic uppercase">拼单明细</h3>
              <div className="w-8"></div>
           </div>
           <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-black rounded-2xl p-6 text-white mb-8">
                 <div className="flex justify-between items-end mb-6">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1">全团实时总计</p>
                       <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-black italic text-[#FFDD00]">¥{activeGroup.currentAmount}</span>
                          <span className="text-lg font-black italic text-slate-300">{activeGroup.currentWeight.toFixed(1)}kg</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1">参与人数</p>
                       <span className="text-lg font-black italic uppercase">{activeGroup.participantCount} / 20</span>
                    </div>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#FFDD00]" style={{width: '77%'}}></div></div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center italic">资金已由 MOP 平台第三方托管</p>
              </div>

              <h4 className="text-[11px] font-black uppercase italic mb-4 pb-2 border-b-2 border-slate-100">团员及包裹清单 (同款商品)</h4>
              <div className="space-y-4">
                 {activeGroup.participants.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <img src={p.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                          <div>
                             <p className="text-[11px] font-black italic uppercase">{p.userName}</p>
                             <p className="text-[9px] font-bold text-slate-400">已付金额: ¥{p.amount}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-[10px] font-black block bg-[#FFDD00] px-2 rounded-full uppercase italic">重量: {p.weight}kg</span>
                       </div>
                    </div>
                 ))}
                 {/* 当前用户加入后的模拟位 */}
                 {selectedOrderId && (
                   <div className="flex justify-between items-center bg-white border-2 border-black p-4 rounded-xl animate-in zoom-in">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#FFDD00] text-[10px] font-black">我</div>
                         <div>
                            <p className="text-[11px] font-black italic uppercase">待提交订单</p>
                            <p className="text-[9px] font-bold text-slate-400">订单号: {selectedOrderId}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black block bg-black text-[#FFDD00] px-2 rounded-full uppercase italic">预估: 1.2kg</span>
                      </div>
                   </div>
                 )}
              </div>
           </div>
           <div className="p-6 bg-white border-t border-slate-100">
              <button className="w-full h-14 bg-black text-[#FFDD00] font-black uppercase italic text-xs rounded-xl shadow-xl active:scale-95 transition-transform">立即提交订单加入拼团</button>
           </div>
        </div>
      )}

      {/* 底部导航 - 中心改为购物车 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-6 py-2 flex justify-between items-center z-40 border-t border-slate-50">
        <button onClick={() => { setCurrentView('HOME'); setSubView('NONE'); }} className={`flex flex-col items-center gap-1 min-w-[48px] ${currentView === 'HOME' ? 'text-black' : 'text-slate-300'}`}>
          <i className="fas fa-shopping-bag text-base"></i>
          <span className="text-[8px] font-black uppercase">奥特莱斯</span>
        </button>
        <button onClick={() => { setCurrentView('GROUP_HUB'); setSubView('NONE'); }} className={`flex flex-col items-center gap-1 min-w-[48px] ${currentView === 'GROUP_HUB' ? 'text-black' : 'text-slate-300'}`}>
          <i className="fas fa-layer-group text-base"></i>
          <span className="text-[8px] font-black uppercase">拼团中心</span>
        </button>
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center -mt-6 border-4 border-white shadow-xl active:scale-90 transition-transform">
           <i className="fas fa-shopping-cart text-[#FFDD00] text-lg"></i>
        </div>
        <button className="flex flex-col items-center gap-1 min-w-[48px] text-slate-300">
          <i className="fas fa-compass text-base"></i>
          <span className="text-[8px] font-black uppercase">探索发现</span>
        </button>
        <button className="flex flex-col items-center gap-1 min-w-[48px] text-slate-300">
          <i className="fas fa-user-circle text-base"></i>
          <span className="text-[8px] font-black uppercase">个人中心</span>
        </button>
      </nav>

      {/* 商品详情 (奥特莱斯视角) */}
      {selectedProduct && subView === 'NONE' && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="relative h-[45vh]"><img src={selectedProduct.image} className="w-full h-full object-cover" /><button onClick={() => setSelectedProduct(null)} className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"><i className="fas fa-times"></i></button></div>
          <div className="flex-1 bg-white p-8">
            <span className="bg-[#FFDD00] text-black text-[9px] px-2 font-black uppercase italic mb-2 inline-block tracking-widest">{selectedProduct.brand}</span>
            <h2 className="text-2xl font-black italic uppercase leading-tight mb-4">{selectedProduct.name}</h2>
            <div className="flex items-end gap-2 mb-8">
               <span className="text-3xl font-black italic">¥{selectedProduct.price}</span>
               <span className="text-sm text-slate-300 line-through font-black italic">¥{selectedProduct.originalPrice}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
               <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 bg-[#FFDD00] rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase italic">物流规格</span></div>
               <p className="text-[12px] font-black italic text-slate-600">重量约为 {selectedProduct.weight}kg。购买后可进入拼团中心发起或参与该款商品的物流拼单。</p>
            </div>
            <div className="flex gap-4">
               <button className="flex-1 h-14 bg-black text-[#FFDD00] font-black uppercase italic text-xs rounded-xl shadow-xl">立即购买订单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
