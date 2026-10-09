import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { BudgetCycle, RunwayMetrics } from '../types/cycle';
import type { Transaction } from '../types/transaction';
import type { CategorySummary } from '../types/report';
import {
  getStoredActiveCycle,
  saveActiveCycle,
  getStoredTransactions,
  saveTransactions,
  clearAllStoredData,
  createSampleCycle,
  createSampleTransactions,
  exportDataAsJSON,
} from '../utils/storage';
import { calculateRunway, calculateCategorySummaries } from '../utils/runwayCalculator';

interface BudgetContextType {
  cycle: BudgetCycle | null;
  isOnboarded: boolean;
  transactions: Transaction[];
  metrics: RunwayMetrics;
  categorySummaries: CategorySummary[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>) => void;
  addTransactions: (txList: Array<Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateCycle: (updates: Partial<BudgetCycle>) => void;
  setupNewCycle: (newCycle: BudgetCycle) => void;
  backupData: () => void;
  restoreData: (cycle: BudgetCycle, transactions: Transaction[]) => void;
  loadSampleData: () => void;
  resetAllData: () => void;
}

const emptyMetrics: RunwayMetrics = {
  totalDays: 30,
  daysPassed: 1,
  daysRemaining: 30,
  initialBalance: 0,
  emergencyBuffer: 0,
  effectiveInitialBalance: 0,
  totalExpense: 0,
  totalIncome: 0,
  currentBalance: 0,
  effectiveCurrentBalance: 0,
  initialDailyBaseline: 0,
  safeDailyAllowance: 0,
  spentToday: 0,
  remainingDailyQuotaToday: 0,
  burnRatePercentage: 100,
  averageDailyExpense: 0,
  evaluation: {
    status: 'SAFE',
    label: 'Siap Digunakan',
    description: 'Silakan atur uang saku awalmu untuk mulai menghitung jatah harian.',
    colorClass: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
  },
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cycle, setCycle] = useState<BudgetCycle | null>(() => {
    return getStoredActiveCycle();
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return getStoredTransactions();
  });

  useEffect(() => {
    saveActiveCycle(cycle);
  }, [cycle]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const isOnboarded = cycle !== null;

  const metrics = useMemo(() => {
    if (!cycle) return emptyMetrics;
    return calculateRunway(cycle, transactions);
  }, [cycle, transactions]);

  const categorySummaries = useMemo(() => {
    if (!cycle) return [];
    return calculateCategorySummaries(transactions, cycle.id);
  }, [cycle, transactions]);

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>) => {
    if (!cycle) return;
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      cycleId: cycle.id,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const addTransactions = (txList: Array<Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>>) => {
    if (!cycle || txList.length === 0) return;
    const nowIso = new Date().toISOString();
    const newItems: Transaction[] = txList.map((data, index) => ({
      ...data,
      id: `tx-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      cycleId: cycle.id,
      createdAt: nowIso,
    }));
    setTransactions((prev) => [...newItems, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const updateCycle = (updates: Partial<BudgetCycle>) => {
    if (!cycle) return;
    setCycle({ ...cycle, ...updates });
  };

  const setupNewCycle = (newCycle: BudgetCycle) => {
    setCycle(newCycle);
    setTransactions([]); // Clean start: 0 expenses!
  };

  const backupData = () => {
    if (!cycle) return;
    exportDataAsJSON(cycle, transactions);
  };

  const restoreData = (newCycle: BudgetCycle, newTransactions: Transaction[]) => {
    setCycle(newCycle);
    setTransactions(newTransactions);
  };

  const loadSampleData = () => {
    const sampleCycle = createSampleCycle();
    const sampleTx = createSampleTransactions(sampleCycle.id);
    setCycle(sampleCycle);
    setTransactions(sampleTx);
  };

  const resetAllData = () => {
    clearAllStoredData();
    setCycle(null);
    setTransactions([]);
  };

  return (
    <BudgetContext.Provider
      value={{
        cycle,
        isOnboarded,
        transactions,
        metrics,
        categorySummaries,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        updateCycle,
        setupNewCycle,
        backupData,
        restoreData,
        loadSampleData,
        resetAllData,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
