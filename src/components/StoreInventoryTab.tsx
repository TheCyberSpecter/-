import React, { useState } from 'react';
import { useAppStore, ItemType } from '../store';
import { ShoppingBag, Ticket, Plane } from 'lucide-react';

const STORE_ITEMS: { name: ItemType; cost: number; icon: string; bg: string; border: string }[] = [
  { name: 'お菓子', cost: 60, icon: '🍡', bg: 'from-orange-100 to-amber-200', border: 'border-amber-300' },
  { name: '飲み物', cost: 140, icon: '🧋', bg: 'from-blue-100 to-cyan-200', border: 'border-cyan-300' },
  { name: '外食', cost: 280, icon: '🍜', bg: 'from-red-100 to-rose-200', border: 'border-rose-300' },
  { name: '映画', cost: 600, icon: '🍿', bg: 'from-purple-100 to-fuchsia-200', border: 'border-fuchsia-300' },
  { name: '勉強フリーデー', cost: 900, icon: '🎮', bg: 'from-emerald-100 to-teal-200', border: 'border-teal-300' },
  { name: '文房具', cost: 1800, icon: '🖋️', bg: 'from-slate-100 to-gray-300', border: 'border-gray-400' },
];

export function StoreInventoryTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { state, buyItem, useTicket, synthesizeTravel } = store;
  const [activeTab, setActiveTab] = useState<'store' | 'inventory'>('store');

  return (
    <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'store' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('store')}
        >
          <ShoppingBag className="w-4 h-4" /> ストア
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Ticket className="w-4 h-4" /> 持ち物
        </button>
      </div>

      {activeTab === 'store' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center border border-indigo-100">
            <span className="font-bold text-indigo-900">所持 超過学習券</span>
            <span className="text-2xl font-black text-indigo-600">{state.overLearningTickets} <span className="text-sm">枚</span></span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STORE_ITEMS.map((item) => (
              <div key={item.name} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
                {/* Anime style icon container */}
                <div className={`w-16 h-16 mb-3 flex items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} border-2 ${item.border} shadow-inner relative transition-transform group-hover:scale-110`}>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-white/40 rounded-full blur-md"></div>
                  <span className="text-4xl relative z-10 drop-shadow-md" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}>{item.icon}</span>
                </div>
                
                <div className="font-bold text-gray-800 text-sm mb-1">{item.name}</div>
                <div className="text-indigo-600 font-black text-sm mb-3">{item.cost} 枚</div>
                <button
                  onClick={() => buyItem(item.name, item.cost)}
                  disabled={state.overLearningTickets < item.cost}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                    state.overLearningTickets >= item.cost
                      ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95 shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  購入する
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {state.inventory['勉強フリーデー'] >= 14 && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md flex justify-between items-center">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-1">
                  <Plane className="w-5 h-5" /> 旅行券の合成
                </h3>
                <p className="text-xs opacity-90">勉強フリーデー14枚で旅行券に合成できます</p>
              </div>
              <button 
                onClick={() => synthesizeTravel()}
                className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm active:scale-95"
              >
                合成する
              </button>
            </div>
          )}

          <div className="space-y-3">
            {(Object.entries(state.inventory) as [ItemType, number][]).map(([itemName, count]) => {
              if (count <= 0) return null;
              const itemDef = STORE_ITEMS.find(i => i.name === itemName);
              
              if (itemName === '旅行') {
                return (
                  <div key={itemName} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-purple-300 rounded-xl flex items-center justify-center text-white font-bold shadow-inner relative">
                        <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                        <span className="text-2xl relative z-10 drop-shadow-md">✈️</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">{itemName} 券</span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">所持: {count}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => useTicket(itemName as ItemType)}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-bold transition-colors shadow-md active:scale-95"
                    >
                      使用する
                    </button>
                  </div>
                );
              }

              return (
                <div key={itemName} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${itemDef?.bg || 'from-gray-100 to-gray-200'} border-2 ${itemDef?.border || 'border-gray-300'} rounded-xl flex items-center justify-center shadow-inner relative`}>
                      <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      <span className="text-2xl relative z-10 drop-shadow-md">{itemDef?.icon || '🎫'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">{itemName} 券</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">所持: {count}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => useTicket(itemName as ItemType)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold transition-colors active:scale-95"
                  >
                    使用する
                  </button>
                </div>
              );
            })}
            
            {Object.values(state.inventory).every(c => c === 0) && (
              <div className="text-center py-12 text-gray-400 font-medium">
                所持している券はありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
