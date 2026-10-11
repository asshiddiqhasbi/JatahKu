import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import type { DayGroupedTransactions } from '../../types/transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import { TransactionItem } from './TransactionItem';
import { formatDisplayDate } from '../../utils/dateUtils';
import { formatIDR } from '../../utils/currency';

interface TransactionLedgerProps {
  onOpenQuickEntry: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ onOpenQuickEntry }) => {
  const { transactions, cycle, deleteTransaction, updateTransaction } = useBudget();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!cycle) return null;

  const incomeCount = useMemo(() => {
    return transactions.filter((tx) => tx.cycleId === cycle.id && tx.type === 'INCOME').length;
  }, [transactions, cycle.id]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.cycleId !== cycle.id) return false;

      if (selectedCategory === 'INCOME') {
        if (tx.type !== 'INCOME') return false;
      } else if (selectedCategory !== 'ALL') {
        if (tx.type !== 'EXPENSE' || tx.category !== selectedCategory) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = tx.note.toLowerCase().includes(q);
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchSource = (tx.source || '').toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchNote && !matchCategory && !matchSource && !matchAmount) return false;
      }

      return true;
    });
  }, [transactions, cycle.id, selectedCategory, searchQuery]);

  const groupedTransactions: DayGroupedTransactions[] = useMemo(() => {
    const groups: Record<string, DayGroupedTransactions> = {};

    for (const tx of filteredTransactions) {
      if (!groups[tx.date]) {
        groups[tx.date] = {
          date: tx.date,
          displayDate: formatDisplayDate(tx.date),
          totalExpense: 0,
          totalIncome: 0,
          items: [],
        };
      }
      groups[tx.date].items.push(tx);
      if (tx.type === 'EXPENSE') {
        groups[tx.date].totalExpense += tx.amount;
      } else {
        groups[tx.date].totalIncome += tx.amount;
      }
    }

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  return (
    <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-2xl shadow-2xs overflow-hidden transition-colors">
      {/* Header with Title and Search */}
      <div className="p-4 sm:p-6 border-b border-[#EDE9E1] dark:border-[#332F2B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-[#F2EFE9] tracking-tight">
            Riwayat Catatan Transaksi
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Daftar pengeluaran dan pemasukan harian selama periode uang saku berjalan
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-colors"
          />
        </div>
      </div>

      {/* Category & Type Filter Chips */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#EDE9E1] dark:border-[#332F2B] bg-[#FAF8F5]/60 dark:bg-[#1C1A18]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-stone-900 dark:bg-[#F2EFE9] text-white dark:text-stone-900 shadow-2xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#EDE9E1] dark:hover:bg-[#2C2925]'
          }`}
        >
          Semua ({filteredTransactions.length})
        </button>
        {incomeCount > 0 && (
          <button
            onClick={() => setSelectedCategory('INCOME')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'INCOME'
                ? 'bg-[#2D6A4F] text-white shadow-2xs'
                : 'text-[#2D6A4F] dark:text-[#42B07E] bg-[#E8F5E9]/60 dark:bg-[#1A2E22]/60 hover:bg-[#E8F5E9] dark:hover:bg-[#1A2E22]'
            }`}
          >
            Pemasukan ({incomeCount})
          </button>
        )}
        {TRANSACTION_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 dark:bg-[#F2EFE9] text-white dark:text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#EDE9E1] dark:hover:bg-[#2C2925]'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{cat.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="p-3 sm:p-6">
        {groupedTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Tidak ada transaksi yang cocok dengan pencarian.'
                : 'Belum ada catatan transaksi pada periode ini.'}
            </p>
            <button
              onClick={onOpenQuickEntry}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Catat Transaksi Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map((group) => (
              <div key={group.date} className="space-y-1">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-2 py-1 text-xs border-b border-[#EDE9E1] dark:border-[#332F2B] font-medium">
                  <span className="font-bold text-stone-700 dark:text-stone-300">{group.displayDate}</span>
                  <div className="flex items-center gap-2">
                    {group.totalIncome > 0 && (
                      <span className="text-[#2D6A4F] dark:text-[#42B07E] font-mono font-bold tabular-nums">
                        +{formatIDR(group.totalIncome)}
                      </span>
                    )}
                    <span className="text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                      Total: <strong className="text-stone-800 dark:text-[#F2EFE9]">{formatIDR(group.totalExpense)}</strong>
                    </span>
                  </div>
                </div>

                {/* Transaction Rows */}
                <div className="divide-y divide-[#EDE9E1] dark:divide-[#2E2A26]">
                  {group.items.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onDelete={deleteTransaction}
                      onUpdate={updateTransaction}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
