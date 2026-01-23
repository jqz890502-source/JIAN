
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, GroupActivity, Participant, QuizQuestion } from './types';
import { MOCK_PRODUCTS } from './data/mockProducts';
import ProductCard from './components/ProductCard';

const categories: Category[] = ['全部', '奢品', '运动', '美妆', '配饰', '潮流'];

const MOCK_QUIZ: QuizQuestion[] = [
  { id: 1, question: "个人拼团的成团策略中，'邮费均摊'意味着什么？", options: ["全团免费邮寄", "未达免运条件时，按商品重量比例均摊邮费", "团长支付所有邮费", "平台补贴邮费"], answer: 1 },
  { id: 2, question: "团长发起拼团前需要完成什么？", options: ["支付一万元押金", "完成答题卡认证", "获得平台CEO授权", "邀请50个好友"], answer: 1 },
  { id: 3, question: "拼团失败后，资金如何处理？", options: ["转入团长余额", "归平台所有", "原路退款至用户支付账户", "发放等额优惠券"], answer: 2 }
];

const MOCK_USER_ORDERS: Product[] = [
  { ...MOCK_PRODUCTS[0], id: 'ord_1' },
  { ...MOCK_PRODUCTS[1], id: 'ord_2' },
  { ...MOCK_PRODUCTS[4], id: 'ord_3' }
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
    leaderName: '阿强',
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
  const [subView, setSubView] = useState<'NONE' | 'GROUP_DETAIL' | 'ORDER_SELECT' | 'QUIZ' | 'INITIATE_GROUP'>('NONE');
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeGroup, setActiveGroup] = useState<GroupActivity | null>(null);
  const [showRulePopup, setShowRulePopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLeaderCertified, setIsLeaderCertified] = useState(false);
  
  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const filteredProducts = useMemo(() => {
    let list = [...MOCK_PRODUCTS];
    if (activeCategory !== '全部') list = list.filter(p => p.category === activeCategory);
    return list;
  }, [activeCategory]);

  const openJoinFlow = (group: GroupActivity) => {
    setActiveGroup(group);
    setSubView('ORDER_SELECT');
  };

  const handleQuizSubmit = (optionIndex: number) => {
    const newAnswers = [...quizAnswers, optionIndex];
    if (quizIndex < MOCK_QUIZ.length - 1) {
      setQuizAnswers(newAnswers);
      setQuizIndex(quizIndex + 1);
    } else {
      const correctCount = newAnswers.filter((ans, idx) => ans === MOCK_QUIZ[idx].answer).length;
      if (correctCount === MOCK_QUIZ.length) {
        setIsLeaderCertified(true);
        alert("恭喜！您已通过团长答题认证。");
        setSubView('NONE');
      } else {
        alert("很遗憾，部分题目回答错误，请重新学习后再试。");
        setQuizIndex(0);
        setQuizAnswers([]);
        setSubView('NONE');
      }
    }
  };

  const RulePopup = () => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 relative">
         <button onClick={() => setShowRulePopup(false)} className="absolute top-4 right-4 text-slate-300"><i className="fas fa-times"></i></button>
         <h3 className="text-lg font-black italic uppercase mb-6 border-b-2 border-black pb-2">拼团核心规则</h3>
         <div className="space-y-4">
            <div>
               <p className="text-[11px] font-black mb-1 uppercase tracking-tight">1. 优购模式 (B2C)</p>
               <p className="text-[10px] text-slate-400 font-bold leading-relaxed">平台托管资金，含手续费与入库拍摄费，确保购物安全。</p>
            </div>
            <div>
               <p className="text-[11px] font-black mb-1 uppercase tracking-tight">2. 团长答题认证</p>
               <p className="text-[10px] text-slate-400 font-bold leading-relaxed">发起个人拼团前，必须通过业务知识考核，确认为合格团长。</p>
            </div>
            <div>
               <p className="text-[11px] font-black mb-1 uppercase tracking-tight">3. 邮费均摊策略</p>
               <p className="text-[10px] text-slate-400 font-bold leading-relaxed">若选“不满条件依然成团”，未免运产生的邮费按包裹重量比例自动计算并由全团均摊。</p>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900 overflow-x-hidden">
      {showRulePopup && <RulePopup />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentView === 'HOME' && <MopLogo />}
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 italic uppercase">
                {currentView === 'HOME' ? '奥特莱斯' : '拼团中心'}
              </h1>
              <span className="text-[9px] bg-[#FFDD00] text-black px-1 font-black tracking-tighter uppercase inline-block mt-0.5 italic">
                {currentView === 'HOME' ? 'MOP 品牌驿站' : '平台级拼团体系'}
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
            <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent p-6 flex flex-col justify-end">
                <div className="bg-[#FFDD00] text-black text-[10px] font-black px-2 py-0.5 mb-2 rounded-[2px] w-fit uppercase italic tracking-widest">FLASH SALE</div>
                <h3 className="text-white text-2xl font-black italic uppercase leading-tight">会员尊享 · 闪购低至1折</h3>
              </div>
            </div>
          </div>
          
          {/* Horizontal Categories */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 mb-6 scroll-smooth">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`flex-none px-6 py-2 rounded-full text-[10px] font-black border uppercase transition-all ${activeCategory === cat ? 'bg-black text-[#FFDD00] border-black scale-105' : 'bg-white text-slate-400 border-slate-100'}`}
              >
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
                 <h2 className="text-xl font-black italic uppercase">活跃拼单</h2>
                 <button onClick={() => setShowRulePopup(true)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <i className="far fa-question-circle"></i> 规则详情
                 </button>
              </div>

              {/* Leader Entry */}
              {!isLeaderCertified ? (
                <div className="bg-black rounded-xl p-5 mb-6 text-white flex justify-between items-center shadow-lg">
                   <div className="flex-1">
                      <p className="text-[#FFDD00] text-[10px] font-black uppercase italic mb-1">BE A LEADER</p>
                      <h4 className="text-sm font-black italic uppercase">成为拼团团长</h4>
                      <p className="text-[9px] text-slate-400 mt-1">发起个人拼团，最高可免单</p>
                   </div>
                   <button onClick={() => setSubView('QUIZ')} className="px-6 py-2 bg-[#FFDD00] text-black font-black uppercase italic text-[10px] rounded-full">申请答题</button>
                </div>
              ) : (
                <div className="bg-[#FFDD00] rounded-xl p-5 mb-6 text-black flex justify-between items-center shadow-lg">
                  <div className="flex-1">
                    <p className="text-black text-[10px] font-black uppercase italic mb-1">CERTIFIED LEADER</p>
                    <h4 className="text-sm font-black italic uppercase">您已获得团长资格</h4>
                    <p className="text-[9px] text-black/60 mt-1">您可以随时发起个人拼团</p>
                  </div>
                  <button onClick={() => {setCurrentView('HOME'); alert("请在商品详情页发起拼团");}} className="px-6 py-2 bg-black text-[#FFDD00] font-black uppercase italic text-[10px] rounded-full">发起新团</button>
                </div>
              )}

              {MOCK_GROUPS.map(group => (
                <div key={group.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-4 shadow-sm p-4 hover:border-[#FFDD00] transition-colors">
                   <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative">
                        <img src={group.image} className="w-full h-full object-cover" />
                        <div className={`absolute top-0 left-0 text-[7px] font-black px-1.5 py-0.5 uppercase italic ${group.type === 'OFFICIAL' ? 'bg-black text-[#FFDD00]' : 'bg-[#FFDD00] text-black'}`}>
                          {group.type === 'OFFICIAL' ? '官方' : '个人'}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                         <div>
                            <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase italic mb-1 inline-block tracking-tight">{group.brand}</span>
                            <h3 className="text-[13px] font-black text-slate-800 italic uppercase line-clamp-1">{group.productName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {group.leaderName && <span className="text-[9px] font-black text-black">团长: {group.leaderName}</span>}
                              <span className="text-[9px] text-slate-400 font-bold uppercase">重量: {group.currentWeight.toFixed(1)}kg</span>
                            </div>
                         </div>
                         <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black italic text-black">¥{group.currentAmount} / {group.targetAmount}</span>
                              <span className="text-[8px] font-black uppercase text-slate-400">{group.strategy === 'STILL_FORM_GROUP' ? '邮费均摊' : '不满取消'}</span>
                            </div>
                            <button onClick={() => openJoinFlow(group)} className="px-5 py-1.5 bg-black text-[#FFDD00] rounded-full text-[10px] font-black uppercase italic active:scale-95">参与拼单</button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Leader Quiz View */}
      {subView === 'QUIZ' && (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <button onClick={() => setSubView('NONE')} className="w-8 h-8 flex items-center justify-center"><i className="fas fa-times"></i></button>
            <h3 className="text-sm font-black italic uppercase">团长资格答题认证</h3>
            <div className="w-8"></div>
          </div>
          <div className="flex-1 p-8">
            <div className="mb-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-[#FFDD00] bg-black px-2 italic">Question {quizIndex + 1}/3</span>
                <span className="text-[9px] font-black uppercase text-slate-400">正确率要求: 100%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-black transition-all" style={{width: `${((quizIndex + 1) / 3) * 100}%`}}></div></div>
            </div>

            <h2 className="text-lg font-black italic uppercase leading-snug mb-8">{MOCK_QUIZ[quizIndex].question}</h2>
            
            <div className="space-y-4">
              {MOCK_QUIZ[quizIndex].options.map((option, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleQuizSubmit(idx)}
                  className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl text-xs font-black uppercase italic hover:border-black active:bg-slate-50 transition-all flex items-center gap-4"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">{String.fromCharCode(65 + idx)}</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Select Flow */}
      {subView === 'ORDER_SELECT' && activeGroup && (
        <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <button onClick={() => setSubView('NONE')} className="w-8 h-8 flex items-center justify-center"><i className="fas fa-times"></i></button>
              <h3 className="text-sm font-black italic uppercase">优购模式 - 选择订单参与</h3>
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">名下同品待拼单</p>
              <div className="space-y-3">
                 {MOCK_USER_ORDERS.filter(o => o.name === activeGroup.productName).map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`flex justify-between items-center p-4 border-2 rounded-xl transition-all ${selectedOrderId === order.id ? 'border-black bg-slate-50' : 'border-slate-100'}`}
                    >
                       <div>
                          <p className="text-[11px] font-black uppercase">订单: {order.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 tracking-tight">实付: ¥{order.price} | 包裹重: {order.weight}kg</p>
                       </div>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOrderId === order.id ? 'bg-black border-black' : 'border-slate-200'}`}>
                          {selectedOrderId === order.id && <i className="fas fa-check text-[8px] text-[#FFDD00]"></i>}
                       </div>
                    </div>
                 ))}
                 {MOCK_USER_ORDERS.filter(o => o.name === activeGroup.productName).length === 0 && (
                   <div className="text-center py-12">
                      <i className="fas fa-box-open text-slate-100 text-5xl mb-4"></i>
                      <p className="text-[11px] font-black text-slate-300 uppercase">无待拼订单，请先购买商品</p>
                      <button onClick={() => { setCurrentView('HOME'); setSubView('NONE'); }} className="mt-4 text-[10px] font-black text-black underline uppercase italic">去品牌站下单</button>
                   </div>
                 )}
              </div>
           </div>
           {selectedOrderId && (
             <div className="p-6 bg-white border-t border-slate-100">
                <button onClick={() => setSubView('GROUP_DETAIL')} className="w-full h-14 bg-black text-[#FFDD00] font-black uppercase italic text-xs rounded-xl shadow-xl">确认选择并核对明细</button>
             </div>
           )}
        </div>
      )}

      {/* Group Detail */}
      {subView === 'GROUP_DETAIL' && activeGroup && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <button onClick={() => setSubView('ORDER_SELECT')} className="w-8 h-8 flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
              <h3 className="text-sm font-black italic uppercase">拼单明细与策略</h3>
              <div className="w-8"></div>
           </div>
           <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-black rounded-2xl p-6 text-white mb-8 shadow-xl">
                 <div className="flex justify-between items-end mb-6">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">全团实时进度</p>
                       <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-black italic text-[#FFDD00]">¥{activeGroup.currentAmount}</span>
                          <span className="text-lg font-black italic text-slate-300">{activeGroup.currentWeight.toFixed(1)}kg</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">参与人数</p>
                       <span className="text-lg font-black italic uppercase">{activeGroup.participantCount}人</span>
                    </div>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#FFDD00]" style={{width: '77%'}}></div></div>
                 <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 italic">
                    <span>策略: {activeGroup.strategy === 'STILL_FORM_GROUP' ? '邮费均摊成团' : '达标成团'}</span>
                    <span className="text-[#FFDD00]">MOP 平台托管中</span>
                 </div>
              </div>

              <h4 className="text-[11px] font-black uppercase italic mb-4 pb-2 border-b-2 border-slate-100">包裹清单与预估邮费</h4>
              <div className="space-y-3">
                 {activeGroup.participants.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <img src={p.avatar} className="w-9 h-9 rounded-full border border-white shadow-sm" />
                          <div>
                             <p className="text-[10px] font-black italic uppercase">{p.userName}</p>
                             <p className="text-[8px] font-bold text-slate-400">包裹重: {p.weight}kg</p>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end">
                          <span className="text-[9px] font-black text-black">预估邮费占比: {((p.weight/activeGroup.currentWeight)*100).toFixed(1)}%</span>
                          {activeGroup.strategy === 'STILL_FORM_GROUP' && <span className="text-[7px] text-slate-400 font-bold uppercase">不满策略: 自动扣费</span>}
                       </div>
                    </div>
                 ))}
                 {selectedOrderId && (
                   <div className="flex justify-between items-center bg-white border-2 border-black p-4 rounded-xl animate-in zoom-in">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-[#FFDD00] text-[10px] font-black">我</div>
                         <div>
                            <p className="text-[10px] font-black italic uppercase">待加入订单</p>
                            <p className="text-[8px] font-bold text-slate-400">包裹重: 1.2kg</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black block bg-black text-[#FFDD00] px-3 py-1 rounded-full uppercase italic">预审通过</span>
                      </div>
                   </div>
                 )}
              </div>
           </div>
           <div className="p-6 bg-white border-t border-slate-100">
              <button className="w-full h-14 bg-black text-[#FFDD00] font-black uppercase italic text-xs rounded-xl shadow-xl active:scale-95 transition-all">立即提交订单加入此团</button>
           </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-6 py-2 flex justify-between items-center z-40 border-t border-slate-50">
        <button onClick={() => { setCurrentView('HOME'); setSubView('NONE'); }} className={`flex flex-col items-center gap-1 min-w-[48px] ${currentView === 'HOME' ? 'text-black' : 'text-slate-300'}`}>
          <i className="fas fa-shopping-bag text-base"></i>
          <span className="text-[8px] font-black uppercase">品牌驿站</span>
        </button>
        <button onClick={() => { setCurrentView('GROUP_HUB'); setSubView('NONE'); }} className={`flex flex-col items-center gap-1 min-w-[48px] ${currentView === 'GROUP_HUB' ? 'text-black' : 'text-slate-300'}`}>
          <i className="fas fa-layer-group text-base"></i>
          <span className="text-[8px] font-black uppercase">拼团中心</span>
        </button>
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center -mt-6 border-4 border-white shadow-xl active:scale-90 transition-transform">
           <i className="fas fa-shopping-cart text-[#FFDD00] text-lg"></i>
        </div>
        <button className="flex flex-col items-center gap-1 min-w-[48px] text-slate-300">
          <i className="fas fa-history text-base"></i>
          <span className="text-[8px] font-black uppercase">拼单历史</span>
        </button>
        <button className="flex flex-col items-center gap-1 min-w-[48px] text-slate-300">
          <i className="fas fa-user-circle text-base"></i>
          <span className="text-[8px] font-black uppercase">我的认证</span>
        </button>
      </nav>

      {/* Product Detail Overlay */}
      {selectedProduct && subView === 'NONE' && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="relative h-[45vh]">
            <img src={selectedProduct.image} className="w-full h-full object-cover" />
            <button onClick={() => setSelectedProduct(null)} className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"><i className="fas fa-times"></i></button>
            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded text-[10px] font-black italic uppercase">
              包裹预估: {selectedProduct.weight}kg
            </div>
          </div>
          <div className="flex-1 bg-white p-8">
            <span className="bg-[#FFDD00] text-black text-[9px] px-2 font-black uppercase italic mb-2 inline-block tracking-widest">{selectedProduct.brand}</span>
            <h2 className="text-2xl font-black italic uppercase leading-tight mb-4">{selectedProduct.name}</h2>
            <div className="flex items-end gap-2 mb-8">
               <span className="text-3xl font-black italic">¥{selectedProduct.price}</span>
               <span className="text-sm text-slate-300 line-through font-black italic">¥{selectedProduct.originalPrice}</span>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
               <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 bg-[#FFDD00] rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase italic">拼团说明 (同品拼邮)</span></div>
               <p className="text-[11px] font-black italic text-slate-600 leading-relaxed uppercase">此商品支持拼邮。下单后可在拼团中心发起新团或参与已有团，利用大宗物流降低国际邮费。</p>
            </div>

            <div className="flex gap-4">
               <button className="flex-1 h-14 bg-black text-[#FFDD00] font-black uppercase italic text-xs rounded-xl shadow-xl active:scale-95 transition-all">立即购买 (优购模式)</button>
               {/* New Group Buy Option */}
               <button 
                 onClick={() => {
                   if(isLeaderCertified) {
                      alert("正在为您开启拼团流程...");
                   } else {
                      setCurrentView('GROUP_HUB');
                      setSelectedProduct(null);
                      alert("发起个人拼团需要先完成团长认证");
                   }
                 }}
                 className="flex-1 h-14 border-2 border-black text-black font-black uppercase italic text-xs rounded-xl hover:bg-black hover:text-[#FFDD00] transition-all"
               >
                 发起拼团 (赚取返券)
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
