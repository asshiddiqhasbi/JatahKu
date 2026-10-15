import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { BudgetCycle, RunwayMetrics } from '../types/cycle';
import type { Transaction } from '../types/transaction';
import type { CategorySummary } from '../types/report';
import { supabase } from '../lib/supabase';
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
  user: User | null;
  isDemo: boolean;
  isSyncing: boolean;
  isInitializing: boolean;
  cycle: BudgetCycle | null;
  isOnboarded: boolean;
  transactions: Transaction[];
  metrics: RunwayMetrics;
  categorySummaries: CategorySummary[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>) => Promise<void>;
  addTransactions: (txList: Array<Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  bulkMoveTransactionsDate: (oldDate: string, newDate: string) => Promise<void>;
  bulkDeleteTransactionsByDate: (date: string) => Promise<void>;
  updateCycle: (updates: Partial<BudgetCycle>) => Promise<void>;
  setupNewCycle: (newCycle: BudgetCycle) => Promise<void>;
  backupData: () => void;
  restoreData: (cycle: BudgetCycle, transactions: Transaction[]) => Promise<void> | void;
  loadSampleData: () => void;
  resetAllData: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCloudData: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Jika belum ada data lokal, muat data simulasi contoh untuk mode demo
  const [cycle, setCycle] = useState<BudgetCycle | null>(() => {
    const stored = getStoredActiveCycle();
    if (stored) return stored;
    return createSampleCycle();
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = getStoredTransactions();
    if (stored && stored.length > 0) return stored;
    const initialCycle = getStoredActiveCycle() || createSampleCycle();
    return createSampleTransactions(initialCycle.id);
  });

  const isDemo = user === null;

  // Local storage persistence: hanya disimpan jika user sudah login (sebagai offline cache)
  useEffect(() => {
    if (user) {
      saveActiveCycle(cycle);
    }
  }, [cycle, user]);

  useEffect(() => {
    if (user) {
      saveTransactions(transactions);
    }
  }, [transactions, user]);

  // Pantau sesi login Supabase saat aplikasi dibuka
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await syncFromCloud(currentUser);
      }
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await syncFromCloud(currentUser);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto-sync saat tab aktif kembali (fokus layar / berpindah aplikasi)
  useEffect(() => {
    if (!user) return;

    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud(user);
      }
    };

    window.addEventListener('focus', handleSyncOnVisible);
    document.addEventListener('visibilitychange', handleSyncOnVisible);

    return () => {
      window.removeEventListener('focus', handleSyncOnVisible);
      document.removeEventListener('visibilitychange', handleSyncOnVisible);
    };
  }, [user]);

  // Realtime multi-device sync via Supabase WebSockets
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          syncFromCloud(user);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cycles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          syncFromCloud(user);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fungsi sinkronisasi dengan Supabase
  const syncFromCloud = async (currentUser: User) => {
    setIsSyncing(true);
    try {
      // 1. Ambil siklus anggaran terbaru milik pengguna
      const { data: cloudCycles, error: cycleErr } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (cycleErr) throw cycleErr;

      if (cloudCycles && cloudCycles.length > 0) {
        const activeCycleRow = cloudCycles[0];
        const activeCloudCycle: BudgetCycle = {
          id: activeCycleRow.id,
          userName:
            activeCycleRow.user_name ||
            (currentUser.user_metadata?.full_name as string) ||
            '',
          initialBalance: Number(activeCycleRow.initial_balance),
          startDate: activeCycleRow.start_date,
          endDate: activeCycleRow.end_date,
          emergencyBuffer: Number(activeCycleRow.emergency_buffer || 0),
          notes: activeCycleRow.notes || undefined,
          createdAt: activeCycleRow.created_at || new Date().toISOString(),
        };

        // 2. Ambil transaksi HANYA untuk siklus yang sedang aktif
        const { data: cloudTx, error: txErr } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('cycle_id', activeCycleRow.id)
          .order('date', { ascending: false });

        if (txErr) throw txErr;

        const activeCloudTx: Transaction[] = (cloudTx || []).map((t) => ({
          id: t.id,
          cycleId: t.cycle_id,
          date: t.date,
          type: t.type as 'EXPENSE' | 'INCOME',
          category: t.category,
          amount: Number(t.amount),
          qty: t.qty ? Number(t.qty) : 1,
          unitPrice: t.unit_price ? Number(t.unit_price) : undefined,
          source: t.source || undefined,
          note: t.note,
          createdAt: t.created_at,
        }));

        setCycle(activeCloudCycle);
        setTransactions(activeCloudTx);
      } else {
        // Jika di cloud belum ada data tapi di lokal sudah ada data, migrasikan ke cloud
        const localCycle = getStoredActiveCycle();
        const localTx = getStoredTransactions();

        if (localCycle) {
          await supabase.from('cycles').insert({
            id: localCycle.id,
            user_id: currentUser.id,
            user_name:
              localCycle.userName ||
              (currentUser.user_metadata?.full_name as string) ||
              null,
            initial_balance: localCycle.initialBalance,
            start_date: localCycle.startDate,
            end_date: localCycle.endDate,
            emergency_buffer: localCycle.emergencyBuffer || 0,
            notes: localCycle.notes || null,
          });

          if (localTx.length > 0) {
            const rowsToInsert = localTx.map((tx) => ({
              id: tx.id,
              user_id: currentUser.id,
              cycle_id: localCycle.id,
              date: tx.date,
              type: tx.type,
              category: tx.category,
              amount: tx.amount,
              qty: tx.qty || 1,
              unit_price: tx.unitPrice || null,
              source: tx.source || null,
              note: tx.note,
              created_at: tx.createdAt || new Date().toISOString(),
            }));
            await supabase.from('transactions').insert(rowsToInsert);
          }
        }
      }
    } catch (err) {
      console.error('Gagal sinkronisasi data cloud:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const isOnboarded = cycle !== null;

  const metrics = useMemo(() => {
    if (!cycle) return emptyMetrics;
    return calculateRunway(cycle, transactions);
  }, [cycle, transactions]);

  const categorySummaries = useMemo(() => {
    if (!cycle) return [];
    return calculateCategorySummaries(transactions, cycle.id);
  }, [cycle, transactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>) => {
    if (!cycle) return;
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      cycleId: cycle.id,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (user) {
      try {
        await supabase.from('transactions').insert({
          id: newTx.id,
          user_id: user.id,
          cycle_id: cycle.id,
          date: newTx.date,
          type: newTx.type,
          category: newTx.category,
          amount: newTx.amount,
          qty: newTx.qty || 1,
          unit_price: newTx.unitPrice || null,
          source: newTx.source || null,
          note: newTx.note,
          created_at: newTx.createdAt,
        });
      } catch (e) {
        console.error('Gagal simpan transaksi ke Supabase:', e);
      }
    }
  };

  const addTransactions = async (txList: Array<Omit<Transaction, 'id' | 'createdAt' | 'cycleId'>>) => {
    if (!cycle || txList.length === 0) return;
    const nowIso = new Date().toISOString();
    const newItems: Transaction[] = txList.map((data, index) => ({
      ...data,
      id: `tx-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      cycleId: cycle.id,
      createdAt: nowIso,
    }));
    setTransactions((prev) => [...newItems, ...prev]);

    if (user) {
      try {
        const rows = newItems.map((tx) => ({
          id: tx.id,
          user_id: user.id,
          cycle_id: cycle.id,
          date: tx.date,
          type: tx.type,
          category: tx.category,
          amount: tx.amount,
          qty: tx.qty || 1,
          unit_price: tx.unitPrice || null,
          source: tx.source || null,
          note: tx.note,
          created_at: tx.createdAt,
        }));
        await supabase.from('transactions').insert(rows);
      } catch (e) {
        console.error('Gagal simpan transaksi massal ke Supabase:', e);
      }
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );

    if (user) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.note !== undefined) payload.note = updates.note;
        if (updates.amount !== undefined) payload.amount = updates.amount;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.date !== undefined) payload.date = updates.date;
        if (updates.qty !== undefined) payload.qty = updates.qty;
        if (updates.unitPrice !== undefined) payload.unit_price = updates.unitPrice;
        if (updates.source !== undefined) payload.source = updates.source;
        if (updates.type !== undefined) payload.type = updates.type;

        await supabase.from('transactions').update(payload).eq('id', id).eq('user_id', user.id);
      } catch (e) {
        console.error('Gagal memperbarui transaksi di Supabase:', e);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));

    if (user) {
      try {
        await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
      } catch (e) {
        console.error('Gagal menghapus transaksi di Supabase:', e);
      }
    }
  };

  const bulkMoveTransactionsDate = async (oldDate: string, newDate: string) => {
    if (!cycle || !oldDate || !newDate || oldDate === newDate) return;

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.cycleId === cycle.id && tx.date === oldDate ? { ...tx, date: newDate } : tx
      )
    );

    if (user) {
      try {
        await supabase
          .from('transactions')
          .update({ date: newDate })
          .eq('user_id', user.id)
          .eq('cycle_id', cycle.id)
          .eq('date', oldDate);
      } catch (e) {
        console.error('Gagal memindahkan tanggal transaksi massal di Supabase:', e);
      }
    }
  };

  const bulkDeleteTransactionsByDate = async (date: string) => {
    if (!cycle || !date) return;

    setTransactions((prev) =>
      prev.filter((tx) => !(tx.cycleId === cycle.id && tx.date === date))
    );

    if (user) {
      try {
        await supabase
          .from('transactions')
          .delete()
          .eq('user_id', user.id)
          .eq('cycle_id', cycle.id)
          .eq('date', date);
      } catch (e) {
        console.error('Gagal menghapus transaksi massal per tanggal di Supabase:', e);
      }
    }
  };

  const updateCycle = async (updates: Partial<BudgetCycle>) => {
    if (!cycle) return;
    const updated = { ...cycle, ...updates };
    setCycle(updated);

    if (user) {
      try {
        await supabase
          .from('cycles')
          .update({
            user_name: updated.userName || null,
            initial_balance: updated.initialBalance,
            start_date: updated.startDate,
            end_date: updated.endDate,
            emergency_buffer: updated.emergencyBuffer || 0,
            notes: updated.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updated.id)
          .eq('user_id', user.id);
      } catch (e) {
        console.error('Gagal memperbarui siklus di Supabase:', e);
      }
    }
  };

  const setupNewCycle = async (newCycle: BudgetCycle) => {
    setCycle(newCycle);
    setTransactions([]);

    if (user) {
      try {
        await supabase.from('cycles').insert({
          id: newCycle.id,
          user_id: user.id,
          user_name: newCycle.userName || null,
          initial_balance: newCycle.initialBalance,
          start_date: newCycle.startDate,
          end_date: newCycle.endDate,
          emergency_buffer: newCycle.emergencyBuffer || 0,
          notes: newCycle.notes || null,
        });
      } catch (e) {
        console.error('Gagal simpan siklus baru ke Supabase:', e);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearAllStoredData();
    // Kembalikan ke mode demo simulasi
    const sample = createSampleCycle();
    setCycle(sample);
    setTransactions(createSampleTransactions(sample.id));
  };

  const refreshCloudData = async () => {
    if (user) {
      await syncFromCloud(user);
    }
  };

  const backupData = () => {
    if (!cycle) return;
    exportDataAsJSON(cycle, transactions);
  };

  const restoreData = async (newCycle: BudgetCycle, newTransactions: Transaction[]) => {
    setCycle(newCycle);
    setTransactions(newTransactions);

    // Jika sedang login, simpan langsung hasil restore ke database Supabase
    if (user) {
      try {
        await supabase.from('cycles').upsert({
          id: newCycle.id,
          user_id: user.id,
          user_name: newCycle.userName || null,
          initial_balance: newCycle.initialBalance,
          start_date: newCycle.startDate,
          end_date: newCycle.endDate,
          emergency_buffer: newCycle.emergencyBuffer || 0,
          notes: newCycle.notes || null,
        });

        if (newTransactions.length > 0) {
          const rows = newTransactions.map((tx) => ({
            id: tx.id,
            user_id: user.id,
            cycle_id: newCycle.id,
            date: tx.date,
            type: tx.type,
            category: tx.category,
            amount: tx.amount,
            qty: tx.qty || 1,
            unit_price: tx.unitPrice || null,
            source: tx.source || null,
            note: tx.note,
            created_at: tx.createdAt || new Date().toISOString(),
          }));
          await supabase.from('transactions').upsert(rows);
        }
      } catch (e) {
        console.error('Gagal mengunggah data restore ke Supabase:', e);
      }
    }
  };

  const loadSampleData = () => {
    const sampleCycle = createSampleCycle();
    const sampleTx = createSampleTransactions(sampleCycle.id);
    setCycle(sampleCycle);
    setTransactions(sampleTx);
  };

  const resetAllData = async () => {
    if (user && cycle) {
      try {
        await supabase.from('cycles').delete().eq('id', cycle.id).eq('user_id', user.id);
      } catch (e) {
        console.error('Gagal menghapus siklus di Supabase:', e);
      }
    }
    clearAllStoredData();
    // Kembalikan ke mode demo simulasi jika belum login
    if (!user) {
      const sample = createSampleCycle();
      setCycle(sample);
      setTransactions(createSampleTransactions(sample.id));
    } else {
      setCycle(null);
      setTransactions([]);
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        user,
        isDemo,
        isSyncing,
        isInitializing,
        cycle,
        isOnboarded,
        transactions,
        metrics,
        categorySummaries,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        bulkMoveTransactionsDate,
        bulkDeleteTransactionsByDate,
        updateCycle,
        setupNewCycle,
        backupData,
        restoreData,
        loadSampleData,
        resetAllData,
        signOut,
        refreshCloudData,
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