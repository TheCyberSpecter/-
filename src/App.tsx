import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from './store';
import { OverLearningTab } from './components/OverLearningTab';
import { DisciplineTab } from './components/DisciplineTab';
import { StoreInventoryTab } from './components/StoreInventoryTab';
import { HistoryTab } from './components/HistoryTab';
import { Clock, Target, Store, History, Bug } from 'lucide-react';

const SplashStarfield = ({ count = 50 }: { count?: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
    }));
  }, [count]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      {stars.map((star, i) => (
        <circle
          key={i}
          cx={`${star.x}%`}
          cy={`${star.y}%`}
          r={star.size}
          fill="#ffffff"
          opacity={star.opacity}
        />
      ))}
    </svg>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => setStage(3), 3500);
    const t4 = setTimeout(() => onComplete(), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-white overflow-hidden transition-opacity duration-1000 ${stage === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* SVG Clip Path Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="swoosh-clip" clipPathUnits="objectBoundingBox">
            <path d="M 1 -0.05 Q 0.5 -0.02 0 0.6666 Q 0.5 0.02 1 0.05 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Trail Container */}
      <div 
        className="absolute top-0 bottom-0 right-0 overflow-hidden"
        style={{
          width: stage >= 1 ? '100%' : '0%',
          transition: 'width 1.5s linear'
        }}
      >
        <div className="absolute top-0 bottom-0 right-0 w-[100vw] bg-[#0b0c1a]" style={{ clipPath: 'url(#swoosh-clip)' }}>
          <SplashStarfield count={150} />
        </div>
      </div>

      {/* Moving Star Wrapper (Y-axis) */}
      <div
        className="absolute w-full h-full pointer-events-none"
        style={{
          top: stage >= 1 ? '66.66%' : '0%',
          transition: 'top 1.5s cubic-bezier(0.333, 0, 0.666, 0.333)'
        }}
      >
        {/* Moving Star Inner (X-axis) */}
        <div
          className="absolute w-32 h-32 md:w-48 md:h-48"
          style={{
            left: stage >= 1 ? '0%' : '100%',
            top: '0%',
            transform: `translate(-50%, -50%) scale(${stage >= 1 ? 0.1 : 1})`,
            transition: 'left 1.5s linear, transform 1.5s linear'
          }}
        >
          <div 
            className="w-full h-full bg-[#0b0c1a] overflow-hidden relative" 
            style={{ clipPath: 'polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)' }}
          >
            <SplashStarfield count={30} />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
         <h1 
           className="text-3xl md:text-5xl tracking-[0.4em] text-[#0b0c1a] font-black ml-[0.4em]"
           style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
         >
           新星の軌跡
         </h1>
      </div>
    </div>
  );
};

export default function App() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<'overlearn' | 'discipline' | 'store' | 'history'>('overlearn');
  const [showSplash, setShowSplash] = useState(true);

  const getNavColor = (tabName: string) => {
    if (activeTab === tabName) {
      return activeTab === 'discipline' ? 'text-[#c49f76]' : 'text-indigo-600';
    }
    return activeTab === 'discipline' ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600';
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className={`min-h-screen font-sans transition-colors duration-500 ease-in-out ${activeTab === 'discipline' ? 'bg-[#0b0c1a] text-[#e8e0d5]' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header */}
      <header className={`border-b sticky top-0 z-50 transition-colors duration-500 ease-in-out ${activeTab === 'discipline' ? 'bg-[#0b0c1a] border-[#c49f76]/20' : 'bg-white border-gray-200'}`}>
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="w-8"></div>
          <h1 className={`text-xl font-black text-center tracking-tight transition-colors duration-500 ease-in-out ${activeTab === 'discipline' ? 'text-[#e8e0d5]' : 'text-gray-800'}`}>
            {activeTab === 'overlearn' && '超過学習'}
            {activeTab === 'discipline' && '鍛錬の道'}
            {activeTab === 'store' && 'ストア＆持ち物'}
            {activeTab === 'history' && '履歴'}
          </h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-120px)]">
        {activeTab === 'overlearn' && <OverLearningTab store={store} />}
        {activeTab === 'discipline' && <DisciplineTab store={store} />}
        {activeTab === 'store' && <StoreInventoryTab store={store} />}
        {activeTab === 'history' && <HistoryTab store={store} />}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t pb-safe z-50 transition-colors duration-500 ease-in-out ${activeTab === 'discipline' ? 'bg-[#0b0c1a] border-[#c49f76]/20' : 'bg-white border-gray-200'}`}>
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('overlearn')}
            className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors duration-500 ease-in-out ${getNavColor('overlearn')}`}
          >
            <Clock className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">超過学習</span>
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors duration-500 ease-in-out ${getNavColor('discipline')}`}
          >
            <Target className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">鍛錬の道</span>
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors duration-500 ease-in-out ${getNavColor('store')}`}
          >
            <Store className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">ストア</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors duration-500 ease-in-out ${getNavColor('history')}`}
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">履歴</span>
          </button>
        </div>
      </nav>
    </div>
    </>
  );
}
