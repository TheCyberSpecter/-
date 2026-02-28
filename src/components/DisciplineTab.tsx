import React, { useState, useMemo } from 'react';
import { useAppStore, getLocalTodayStr, ItemType } from '../store';
import { Target, CheckCircle, Gift, AlertCircle, Sparkle, Check, ChevronDown, ChevronUp, X } from 'lucide-react';

const Starfield = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
    }));
  }, []);

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

const DAILY_TASKS = [
  '2科目勉強する',
  '間違えた問題を解き直す',
  '決められた時間に寝て、起きる',
  '明日の予定を確認する'
];

const MILESTONES = [
  { required: 1, label: '好きなお菓子を買う', type: 'お菓子' },
  { required: 2, label: '勉強フリーデー or 報酬ルーレット', type: 'choice' },
  { required: 3, label: '映画', type: '映画' },
  { required: 4, label: '勉強フリーデー or 報酬ルーレット', type: 'choice' },
  { required: 5, label: '好きな飲み物を買う', type: '飲み物' },
  { required: 6, label: '勉強フリーデー or 報酬ルーレット', type: 'choice' },
  { required: 7, label: '外食', type: '外食' },
  { required: 8, label: '文房具', type: '文房具' },
];

const ROULETTE_ITEMS = [
  { name: 'お菓子', prob: 5, color: '#fca5a5', start: 0, end: 5 },
  { name: '飲み物', prob: 5, color: '#93c5fd', start: 5, end: 10 },
  { name: '外食', prob: 20, color: '#fcd34d', start: 10, end: 30 },
  { name: '映画', prob: 20, color: '#c4b5fd', start: 30, end: 50 },
  { name: '勉強フリーデー', prob: 30, color: '#6ee7b7', start: 50, end: 80 },
  { name: '文房具', prob: 20, color: '#cbd5e1', start: 80, end: 100 },
];

function spinRoulette(): ItemType {
  const r = Math.random() * 100;
  if (r < 5) return 'お菓子';
  if (r < 10) return '飲み物';
  if (r < 30) return '外食';
  if (r < 50) return '映画';
  if (r < 80) return '勉強フリーデー';
  return '文房具';
}

export function DisciplineTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { state, toggleDailyTask, reportDailyTasks, claimReward } = store;
  const todayStr = getLocalTodayStr(state.debugDateOffset);
  
  // Calculate period and week info
  const start = new Date(state.startDate);
  const today = new Date(todayStr);
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const periodIndex = Math.floor(diffDays / 84);
  const dayOfPeriod = diffDays % 84;
  const currentWeek = Math.floor(dayOfPeriod / 7);
  const dayOfWeek = dayOfPeriod % 7;
  
  const daysLeftInWeek = 6 - dayOfWeek;
  const daysLeftInPeriod = 83 - dayOfPeriod;

  // Calculate Chiryo (current week) and Kensan (current period)
  let currentChiryo = 0;
  let currentKensan = 0;
  const weekStatus = Array(7).fill(null).map(() => ({ isPast: false, isToday: false, isReported: false }));

  for (let w = 0; w <= currentWeek; w++) {
    let chiryoForWeek = 0;
    for (let d = 0; d < 7; d++) {
      const dayOffset = periodIndex * 84 + w * 7 + d;
      if (dayOffset > diffDays) break;
      
      const dDate = new Date(start.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dYear = dDate.getFullYear();
      const dMonth = String(dDate.getMonth() + 1).padStart(2, '0');
      const dDay = String(dDate.getDate()).padStart(2, '0');
      const dStr = `${dYear}-${dMonth}-${dDay}`;
      
      const isReported = state.reportedDays.includes(dStr);
      if (isReported) {
        chiryoForWeek++;
      }
      
      if (w === currentWeek) {
        weekStatus[d] = {
          isPast: dayOffset < diffDays,
          isToday: dayOffset === diffDays,
          isReported: isReported,
        };
      }
    }
    
    if (w === currentWeek) {
      currentChiryo = chiryoForWeek;
    }
    if (chiryoForWeek >= 5) {
      currentKensan++;
    }
  }
  
  // Fill future days in the current week
  for (let d = dayOfWeek + 1; d < 7; d++) {
    weekStatus[d] = {
      isPast: false,
      isToday: false,
      isReported: false,
    };
  }

  const todayTasks = state.dailyTasks[todayStr] || [false, false, false, false];
  const isTodayReported = state.reportedDays.includes(todayStr);
  const claimedForPeriod = state.claimedRewards[periodIndex] || [];

  const [pendingChoice, setPendingChoice] = useState<typeof MILESTONES[0] | null>(null);
  const [rouletteStep, setRouletteStep] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [rouletteResult, setRouletteResult] = useState<ItemType | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showProbabilities, setShowProbabilities] = useState(false);

  const handleClaim = (milestone: typeof MILESTONES[0]) => {
    if (milestone.type === 'choice') {
      setPendingChoice(milestone);
      setRouletteStep('idle');
      setShowProbabilities(false);
    } else {
      claimReward(periodIndex, milestone.required, milestone.type as ItemType);
    }
  };

  const handleChoice = (choice: 'free' | 'roulette') => {
    if (!pendingChoice) return;
    if (choice === 'free') {
      claimReward(periodIndex, pendingChoice.required, '勉強フリーデー');
      setPendingChoice(null);
    } else {
      const result = spinRoulette();
      const itemDef = ROULETTE_ITEMS.find(i => i.name === result)!;
      
      const minAngle = itemDef.start * 3.6 + 2;
      const maxAngle = itemDef.end * 3.6 - 2;
      const targetAngle = minAngle + Math.random() * (maxAngle - minAngle);
      
      const targetMod = 360 - targetAngle;
      const newRotation = (360 * 5) + targetMod;
      
      setRouletteResult(result);
      setWheelRotation(0);
      setRouletteStep('spinning');
      
      // Wait for component to mount before applying rotation to trigger CSS transition
      setTimeout(() => {
        setWheelRotation(newRotation);
      }, 50);
      
      setTimeout(() => {
        setRouletteStep('result');
      }, 4050);
    }
  };

  const claimRouletteResult = () => {
    if (!pendingChoice || !rouletteResult) return;
    claimReward(periodIndex, pendingChoice.required, rouletteResult);
    setPendingChoice(null);
    setRouletteStep('idle');
    setRouletteResult(null);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#0b0c1a] text-[#e8e0d5] p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {pendingChoice && (
          <div className="fixed inset-0 bg-[#0b0c1a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#131124] border border-[#c49f76]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
              {rouletteStep === 'idle' && (
                <>
                  <button 
                    onClick={() => setPendingChoice(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#e8e0d5]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-[#e8e0d5] mb-4 text-center">報酬の選択</h3>
                  <p className="text-sm text-gray-400 mb-6 text-center">どちらの報酬を受け取りますか？</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleChoice('free')}
                      className="w-full py-3 bg-[#0b0c1a] border border-[#c49f76]/30 text-[#e8e0d5] rounded-xl font-bold shadow-sm active:scale-95 transition-all hover:bg-[#c49f76]/10"
                    >
                      勉強フリーデー
                    </button>
                    <button 
                      onClick={() => handleChoice('roulette')}
                      className="w-full py-3 bg-gradient-to-r from-[#c49f76] to-[#b08d68] text-[#131124] rounded-xl font-bold shadow-[0_0_15px_rgba(196,159,118,0.3)] active:scale-95 transition-transform"
                    >
                      報酬ルーレットを回す
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => setShowProbabilities(!showProbabilities)}
                      className="flex items-center justify-center gap-1 w-full text-xs text-gray-400 hover:text-[#c49f76]"
                    >
                      ルーレットの確率を見る
                      {showProbabilities ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    {showProbabilities && (
                      <div className="mt-3 p-3 bg-[#0b0c1a] rounded-lg text-sm border border-[#c49f76]/20">
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                          {ROULETTE_ITEMS.map(item => (
                            <div key={item.name} className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                                <span className="text-gray-300 text-[10px] font-bold">{item.name}</span>
                              </span>
                              <span className="font-black text-[#c49f76] text-xs">{item.prob}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {(rouletteStep === 'spinning' || rouletteStep === 'result') && (
                <div className="text-center">
                  <h3 className="text-lg font-bold text-[#e8e0d5] mb-6">報酬ルーレット</h3>
                  
                  <div className="relative w-56 h-56 mx-auto mb-6">
                    {/* Arrow */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#e8e0d5] z-20 drop-shadow-md" />
                    
                    {/* Wheel */}
                    <div 
                      className="w-full h-full rounded-full border-4 border-[#131124] shadow-[0_0_30px_rgba(196,159,118,0.2)] overflow-hidden relative"
                      style={{ 
                        background: `conic-gradient(
                          #fca5a5 0% 5%,
                          #93c5fd 5% 10%,
                          #fcd34d 10% 30%,
                          #c4b5fd 30% 50%,
                          #6ee7b7 50% 80%,
                          #cbd5e1 80% 100%
                        )`,
                        transform: `rotate(${wheelRotation}deg)`,
                        transitionDuration: rouletteStep === 'spinning' ? '4s' : '0s',
                        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
                      }}
                    >
                      {ROULETTE_ITEMS.map(item => {
                        const midAngle = (item.start + item.end) / 2 * 3.6;
                        return (
                          <div
                            key={item.name}
                            className="absolute inset-0 flex items-start justify-center pt-3"
                            style={{ transform: `rotate(${midAngle}deg)` }}
                          >
                            <span 
                              className="text-[11px] font-black text-black/60 drop-shadow-sm" 
                              style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
                            >
                              {item.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Center dot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#131124] rounded-full shadow-md z-10 flex items-center justify-center border-2 border-[#c49f76]">
                      <div className="w-3 h-3 bg-[#c49f76] rounded-full" />
                    </div>
                  </div>

                  <div className="h-24 flex flex-col items-center justify-center w-full">
                    {rouletteStep === 'result' ? (
                      <div className="w-full animate-in fade-in zoom-in duration-300">
                        <div className="text-lg font-black text-[#c49f76] mb-4">「{rouletteResult}」を獲得！</div>
                        <button 
                          onClick={claimRouletteResult}
                          className="w-full py-3 bg-[#c49f76] text-[#131124] rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
                        >
                          受け取る
                        </button>
                      </div>
                    ) : (
                      <div className="text-[#c49f76] font-bold animate-pulse">
                        回転中...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="relative bg-gradient-to-br from-[#131124] via-[#1a1635] to-[#0f1123] rounded-2xl p-6 text-[#e8e0d5] shadow-lg overflow-hidden border border-[#c49f76]/30">
          {/* Stars */}
          <Starfield />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black flex items-center gap-2 text-[#e8e0d5]">
                <Target className="w-6 h-6 text-[#c49f76]" />
                鍛錬の道
              </h2>
              <div className="text-sm font-bold bg-[#c49f76]/20 text-[#c49f76] px-3 py-1 rounded-full border border-[#c49f76]/30">
                第 {periodIndex + 1} 期
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-[#0b0c1a]/60 backdrop-blur-sm rounded-xl p-3 border border-[#c49f76]/10">
                <div className="text-xs opacity-80 mb-1 text-[#c49f76]">今週の残り日数</div>
                <div className="text-2xl font-bold text-white">{daysLeftInWeek} 日</div>
              </div>
              <div className="bg-[#0b0c1a]/60 backdrop-blur-sm rounded-xl p-3 border border-[#c49f76]/10">
                <div className="text-xs opacity-80 mb-1 text-[#c49f76]">今期の残り日数</div>
                <div className="text-2xl font-bold text-white">{daysLeftInPeriod} 日</div>
              </div>
            </div>

            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-sm opacity-90 font-bold text-[#c49f76]">今週の知慮</div>
                <div className="text-2xl font-black text-white">{currentChiryo} <span className="text-sm font-normal opacity-80">/ 5 Pt</span></div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 font-bold text-[#c49f76]">現在の研鑽</div>
                <div className="text-2xl font-black text-white">{currentKensan} <span className="text-sm font-normal opacity-80">Pt</span></div>
              </div>
            </div>

            <div className="relative h-8 bg-[#0b0c1a]/80 rounded-full flex items-center shadow-inner mt-4 border border-[#c49f76]/20">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#c49f76]/40 to-[#c49f76]/80 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${((dayOfWeek + 0.5) / 7) * 100}%` }}
              />
              
              <div className="relative z-10 flex justify-around w-full px-0.5">
                {weekStatus.map((status, i) => (
                  <div key={i} className="flex items-center justify-center w-8 h-8">
                    {status.isToday ? (
                      <div className="relative flex items-center justify-center w-10 h-10 bg-[#c49f76] rounded-full shadow-[0_0_15px_rgba(196,159,118,0.5)] border-2 border-[#131124]">
                        {status.isReported ? (
                          <Check className="w-6 h-6 text-white" strokeWidth={4} />
                        ) : (
                          <Sparkle className="w-6 h-6 text-white" fill="currentColor" strokeWidth={0} />
                        )}
                      </div>
                    ) : status.isReported ? (
                       <Check className="w-6 h-6 text-[#c49f76]" strokeWidth={4} />
                    ) : status.isPast ? (
                       <div className="w-2 h-2 rounded-full bg-[#c49f76]/40" />
                    ) : (
                       <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#131124] rounded-2xl p-6 shadow-sm border border-[#c49f76]/20">
          <h3 className="font-bold text-[#e8e0d5] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#c49f76]" />
            本日のデイリー任務
          </h3>
          <div className="space-y-3">
            {DAILY_TASKS.map((task, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isTodayReported) {
                    toggleDailyTask(todayStr, idx);
                  }
                }}
                disabled={isTodayReported}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                  todayTasks[idx] ? 'bg-[#c49f76]/10 border-[#c49f76]/50 text-[#e8e0d5]' : 'bg-[#0b0c1a] border-[#c49f76]/10 text-gray-400'
                } ${isTodayReported ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                  todayTasks[idx] ? 'bg-[#c49f76] border-[#c49f76] text-[#131124]' : 'border-gray-600 bg-transparent'
                }`}>
                  {todayTasks[idx] && <CheckCircle className="w-4 h-4" />}
                </div>
                <span className="font-medium text-sm">{task}</span>
              </button>
            ))}
          </div>
          
          {isTodayReported ? (
            <div className="mt-4 p-3 bg-[#c49f76]/20 text-[#c49f76] border border-[#c49f76]/30 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              本日の報告完了！知慮を獲得しました
            </div>
          ) : todayTasks.every(t => t) ? (
            <button
              onClick={() => reportDailyTasks(todayStr)}
              className="mt-4 w-full p-3 bg-gradient-to-r from-[#c49f76] to-[#b08d68] hover:from-[#b08d68] hover:to-[#9c7b5a] active:scale-95 text-[#131124] rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,159,118,0.3)]"
            >
              <CheckCircle className="w-5 h-5" />
              報告して知慮を獲得する
            </button>
          ) : null}
        </div>

        <div className="bg-[#131124] rounded-2xl p-6 shadow-sm border border-[#c49f76]/20">
          <h3 className="font-bold text-[#e8e0d5] mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#c49f76]" />
            研鑽報酬
          </h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#c49f76]/30 before:to-transparent">
            {MILESTONES.map((m) => {
              const isReached = currentKensan >= m.required;
              const isClaimed = claimedForPeriod.includes(m.required);
              
              return (
                <div key={m.required} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#131124] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                    isClaimed ? 'bg-[#0b0c1a] text-gray-500 border-[#c49f76]/20' : isReached ? 'bg-[#c49f76] text-[#131124] shadow-[0_0_10px_rgba(196,159,118,0.5)]' : 'bg-[#0b0c1a] text-gray-500 border-[#c49f76]/20'
                  }`}>
                    <span className="font-bold text-sm">{m.required}</span>
                  </div>
                  
                  <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${
                    isClaimed ? 'bg-[#0b0c1a] border-[#c49f76]/10 opacity-60' : isReached ? 'bg-[#c49f76]/10 border-[#c49f76]/50' : 'bg-[#0b0c1a] border-[#c49f76]/10'
                  }`}>
                    <div className={`font-bold text-sm mb-2 ${isReached && !isClaimed ? 'text-[#e8e0d5]' : 'text-gray-400'}`}>{m.label}</div>
                    {isClaimed ? (
                      <div className="text-xs font-bold text-gray-500">受取済み</div>
                    ) : isReached ? (
                      <button onClick={() => handleClaim(m)} className="w-full py-2 bg-[#c49f76] text-[#131124] text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-transform">
                        受け取る
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> 未達成
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
