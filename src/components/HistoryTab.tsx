import React, { useState } from 'react';
import { useAppStore } from '../store';
import { History, ShoppingCart, CheckSquare } from 'lucide-react';

export function HistoryTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { state } = store;
  const [activeTab, setActiveTab] = useState<'purchase' | 'use'>('purchase');

  return (
    <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'purchase' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('purchase')}
        >
          <ShoppingCart className="w-4 h-4" /> 購入履歴
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'use' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('use')}
        >
          <CheckSquare className="w-4 h-4" /> 使用履歴
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'purchase' && (
          <div className="divide-y divide-gray-100">
            {state.purchaseHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">購入履歴はありません</div>
            ) : (
              state.purchaseHistory.map((record) => (
                <div key={record.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800">{record.itemName}</div>
                    <div className="text-xs text-gray-500">{record.date}</div>
                  </div>
                  <div className="text-sm font-bold text-indigo-600">
                    -{record.cost} 枚
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'use' && (
          <div className="divide-y divide-gray-100">
            {state.useHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">使用履歴はありません</div>
            ) : (
              state.useHistory.map((record) => (
                <div key={record.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800">{record.itemName} 券</div>
                    <div className="text-xs text-gray-500">{record.date}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    使用済み
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
