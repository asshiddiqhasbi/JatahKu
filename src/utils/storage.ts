import type { BudgetCycle } from '../types/cycle';
import type { Transaction } from '../types/transaction';
import { getTodayDateString } from './dateUtils';
import { DEFAULT_EMERGENCY_BUFFER } from '../constants/presets';

const STORAGE_KEYS = {
  ACTIVE_CYCLE: 'jatahku_active_cycle_v2',
  ALL_CYCLES: 'jatahku_all_cycles_v2',
  TRANSACTIONS: 'jatahku_transactions_v2',
  HAS_ONBOARDED: 'jatahku_has_onboarded_v2',
};

export function getStoredActiveCycle(): BudgetCycle | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CYCLE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load active cycle from localStorage', e);
    return null;
  }
}

export function saveActiveCycle(cycle: BudgetCycle | null): void {
  try {
    if (cycle) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CYCLE, JSON.stringify(cycle));
      localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CYCLE);
      localStorage.removeItem(STORAGE_KEYS.HAS_ONBOARDED);
    }
  } catch (e) {
    console.error('Failed to save active cycle', e);
  }
}

export function getStoredAllCycles(): BudgetCycle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_CYCLES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load all cycles from localStorage', e);
    return [];
  }
}

export function saveAllCycles(cycles: BudgetCycle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_CYCLES, JSON.stringify(cycles));
  } catch (e) {
    console.error('Failed to save all cycles', e);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions from localStorage', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CYCLE);
    localStorage.removeItem(STORAGE_KEYS.ALL_CYCLES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.HAS_ONBOARDED);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
}

/**
 * Helper to generate a fresh cycle template based on user input
 */
export function createNewCycle(
  userName: string,
  initialBalance: number,
  emergencyBuffer: number,
  startDate: string,
  endDate: string
): BudgetCycle {
  return {
    id: `cycle-${Date.now()}`,
    userName: userName.trim() || 'Mahasiswa / Anak Kos',
    startDate,
    endDate,
    initialBalance,
    emergencyBuffer,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Demo sample data only generated when user explicitly clicks "Coba Data Contoh"
 */
export function createSampleCycle(): BudgetCycle {
  const today = new Date();
  const startYear = today.getFullYear();
  const startMonth = String(today.getMonth() + 1).padStart(2, '0');
  const startDay = String(today.getDate()).padStart(2, '0');
  const startDate = `${startYear}-${startMonth}-${startDay}`;

  const endDateObj = new Date(today);
  endDateObj.setDate(endDateObj.getDate() + 29);
  const endYear = endDateObj.getFullYear();
  const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
  const endDay = String(endDateObj.getDate()).padStart(2, '0');
  const endDate = `${endYear}-${endMonth}-${endDay}`;

  return {
    id: `cycle-${Date.now()}`,
    userName: 'Contoh Mahasiswa',
    startDate,
    endDate,
    initialBalance: 1500000,
    emergencyBuffer: DEFAULT_EMERGENCY_BUFFER,
    createdAt: new Date().toISOString(),
  };
}

export function createSampleTransactions(cycleId: string): Transaction[] {
  const today = getTodayDateString();
  const now = new Date();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const tStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;

  return [
    {
      id: `tx-${Date.now()}-1`,
      cycleId,
      date: tStr,
      time: '12:30',
      type: 'EXPENSE',
      category: 'Makanan',
      amount: 22000,
      note: 'Makan siang nasi ayam bakar + es teh',
      createdAt: new Date(twoDaysAgo).toISOString(),
    },
    {
      id: `tx-${Date.now()}-2`,
      cycleId,
      date: tStr,
      time: '18:45',
      type: 'EXPENSE',
      category: 'Kebutuhan Kos',
      amount: 35000,
      note: 'Deterjen & sabun mandi isi ulang',
      createdAt: new Date(twoDaysAgo).toISOString(),
    },
    {
      id: `tx-${Date.now()}-3`,
      cycleId,
      date: yStr,
      time: '09:15',
      type: 'EXPENSE',
      category: 'Kuliah',
      amount: 15000,
      note: 'Print tugas & fotokopi materi kuliah',
      createdAt: new Date(yesterday).toISOString(),
    },
    {
      id: `tx-${Date.now()}-4`,
      cycleId,
      date: yStr,
      time: '16:00',
      type: 'EXPENSE',
      category: 'Transportasi',
      amount: 20000,
      note: 'Isi bensin motor',
      createdAt: new Date(yesterday).toISOString(),
    },
    {
      id: `tx-${Date.now()}-5`,
      cycleId,
      date: today,
      time: '12:15',
      type: 'EXPENSE',
      category: 'Makanan',
      amount: 18000,
      note: 'Makan siang warteg',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function exportDataAsJSON(cycle: BudgetCycle, transactions: Transaction[]): void {
  const data = {
    app: 'JatahKu',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    cycle,
    transactions,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JatahKu_Cadangan_${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
