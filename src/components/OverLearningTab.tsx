import React, { useState } from 'react';
import { useAppStore } from '../store';
import { WheelPicker } from './WheelPicker';
import { Settings, Clock, CheckCircle } from 'lucide-react';

export function OverLearningTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { state, updateState, addTickets } = store;
  const [inputMethod, setInputMethod] = useState<'timer' | 'direct'>('timer');
  const [inputHours, setInputHours] = useState(0);
  const [inputMins, setInputMins] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [goalHours, setGoalHours] = useState(Math.floor(state.goalStudyMins / 60));
  const [goalMins, setGoalMins] = useState(state.goalStudyMins % 60);

  const handleSaveGoal = () => {
    updateState({ goalStudyMins: goalHours * 60 + goalMins });
    setShowSettings(false);
  };

  const calculateStudyTime = () => {
    if (inputMethod === 'timer') {
      return state.goalStudyMins + (inputHours * 60 + inputMins);
    } else {
      return inputHours * 60 + inputMins;
    }
  };

  const handleSubmit = () => {
    const studyMins = calculateStudyTime();
    const diffMins = studyMins - state.goalStudyMins;
    
    if (diffMins > 0) {
      const earned = Math.floor((diffMins / 60) * 10);
      addTickets(earned);
    }
    
    setInputHours(0);
    setInputMins(0);
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            目標勉強時間
          </h2>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-400 hover:text-indigo-500 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {showSettings ? (
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-center gap-4">
              <WheelPicker value={goalHours} onChange={setGoalHours} max={24} label="時間" />
              <WheelPicker value={goalMins} onChange={setGoalMins} max={59} label="分" />
            </div>
            <button onClick={handleSaveGoal} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">
              保存
            </button>
          </div>
        ) : (
          <div className="text-3xl font-black text-center text-indigo-600">
            {Math.floor(state.goalStudyMins / 60)}<span className="text-lg text-gray-500 font-medium mx-1">時間</span>
            {state.goalStudyMins % 60}<span className="text-lg text-gray-500 font-medium mx-1">分</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">本日の勉強時間を記録</h2>
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${inputMethod === 'timer' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setInputMethod('timer')}
          >
            タイマー残り時間
          </button>
          <button
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${inputMethod === 'direct' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setInputMethod('direct')}
          >
            直接入力
          </button>
        </div>

        {inputMethod === 'timer' && (
          <p className="text-xs text-gray-500 mb-4 bg-indigo-50 p-3 rounded-lg">
            タイマーに「活動時間 - 目標勉強時間」をセットし、勉強していない間だけ進めてください。<br/>
            <span className="font-bold text-indigo-700">勉強時間 = 残り時間 + 目標勉強時間</span>
          </p>
        )}

        <div className="flex justify-center gap-4 mb-6">
          <WheelPicker value={inputHours} onChange={setInputHours} max={24} label="時間" />
          <WheelPicker value={inputMins} onChange={setInputMins} max={59} label="分" />
        </div>

        <button onClick={handleSubmit} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 flex justify-center items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          記録して券を獲得
        </button>
      </div>

      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-sm font-bold opacity-90 mb-1">所持している超過学習券</h2>
        <div className="text-4xl font-black flex items-baseline gap-2">
          {state.overLearningTickets} <span className="text-lg font-medium opacity-90">枚</span>
        </div>
      </div>
    </div>
  );
}
