import { useState, useEffect } from 'react';

export type ItemType = 'お菓子' | '飲み物' | '外食' | '映画' | '勉強フリーデー' | '文房具' | '旅行';

export interface PurchaseRecord {
  id: string;
  itemName: ItemType;
  date: string;
  cost: number;
}

export interface UseRecord {
  id: string;
  itemName: ItemType;
  date: string;
}

export interface AppState {
  goalStudyMins: number;
  overLearningTickets: number;
  inventory: Record<ItemType, number>;
  purchaseHistory: PurchaseRecord[];
  useHistory: UseRecord[];
  startDate: string; // YYYY-MM-DD
  dailyTasks: Record<string, boolean[]>; // key: YYYY-MM-DD
  reportedDays: string[]; // Array of YYYY-MM-DD
  claimedRewards: Record<number, number[]>; // key: periodIndex
  debugDateOffset: number; // For debugging: days to add to current date
}

const defaultState: AppState = {
  goalStudyMins: 120,
  overLearningTickets: 0,
  inventory: {
    'お菓子': 0,
    '飲み物': 0,
    '外食': 0,
    '映画': 0,
    '勉強フリーデー': 0,
    '文房具': 0,
    '旅行': 0,
  },
  purchaseHistory: [],
  useHistory: [],
  startDate: '',
  dailyTasks: {},
  reportedDays: [],
  claimedRewards: {},
  debugDateOffset: 0,
};

export function getLocalTodayStr(offsetDays: number = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('studyApp_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure inventory has all keys
      parsed.inventory = { ...defaultState.inventory, ...parsed.inventory };
      parsed.purchaseHistory = parsed.purchaseHistory || [];
      parsed.useHistory = parsed.useHistory || [];
      parsed.reportedDays = parsed.reportedDays || [];
      parsed.debugDateOffset = parsed.debugDateOffset || 0;
      if (!parsed.startDate) {
        parsed.startDate = getLocalTodayStr(parsed.debugDateOffset);
      }
      return parsed;
    }
    return { ...defaultState, startDate: getLocalTodayStr(0) };
  });

  useEffect(() => {
    localStorage.setItem('studyApp_state', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const addTickets = (amount: number) => {
    setState((prev) => ({ ...prev, overLearningTickets: prev.overLearningTickets + amount }));
  };

  const buyItem = (itemName: ItemType, cost: number) => {
    setState((prev) => {
      if (prev.overLearningTickets < cost) return prev;
      
      const newPurchaseHistory = Array.isArray(prev.purchaseHistory) ? [...prev.purchaseHistory] : [];
      newPurchaseHistory.unshift({
        id: Date.now().toString() + Math.random(),
        itemName,
        date: getLocalTodayStr(prev.debugDateOffset),
        cost
      });

      return {
        ...prev,
        overLearningTickets: prev.overLearningTickets - cost,
        inventory: {
          ...prev.inventory,
          [itemName]: (prev.inventory[itemName] || 0) + 1,
        },
        purchaseHistory: newPurchaseHistory,
      };
    });
  };

  const useTicket = (itemName: ItemType) => {
    setState((prev) => {
      if (!prev.inventory[itemName] || prev.inventory[itemName] <= 0) return prev;
      
      const newUseHistory = Array.isArray(prev.useHistory) ? [...prev.useHistory] : [];
      newUseHistory.unshift({
        id: Date.now().toString() + Math.random(),
        itemName,
        date: getLocalTodayStr(prev.debugDateOffset)
      });

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemName]: prev.inventory[itemName] - 1,
        },
        useHistory: newUseHistory,
      };
    });
  };

  const synthesizeTravel = () => {
    setState((prev) => {
      if ((prev.inventory['勉強フリーデー'] || 0) < 14) return prev;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          '勉強フリーデー': prev.inventory['勉強フリーデー'] - 14,
          '旅行': (prev.inventory['旅行'] || 0) + 1,
        },
      };
    });
  };

  const toggleDailyTask = (dateStr: string, taskIndex: number) => {
    setState((prev) => {
      const tasks = prev.dailyTasks[dateStr] || [false, false, false, false];
      const newTasks = [...tasks];
      newTasks[taskIndex] = !newTasks[taskIndex];
      return {
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [dateStr]: newTasks,
        },
      };
    });
  };

  const reportDailyTasks = (dateStr: string) => {
    setState((prev) => {
      if (prev.reportedDays.includes(dateStr)) return prev;
      return {
        ...prev,
        reportedDays: [...prev.reportedDays, dateStr],
      };
    });
  };

  const claimReward = (periodIndex: number, milestone: number, rewardItem: ItemType) => {
    setState((prev) => {
      const periodClaims = prev.claimedRewards[periodIndex] || [];
      if (periodClaims.includes(milestone)) return prev;
      
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [rewardItem]: (prev.inventory[rewardItem] || 0) + 1,
        },
        claimedRewards: {
          ...prev.claimedRewards,
          [periodIndex]: [...periodClaims, milestone],
        },
      };
    });
  };

  const debugAdvanceDay = () => {
    setState((prev) => ({
      ...prev,
      debugDateOffset: (prev.debugDateOffset || 0) + 1,
    }));
  };

  return {
    state,
    updateState,
    addTickets,
    buyItem,
    useTicket,
    synthesizeTravel,
    toggleDailyTask,
    reportDailyTasks,
    claimReward,
    debugAdvanceDay,
  };
}
