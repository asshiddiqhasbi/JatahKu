import React from 'react';
import { Calendar, Wallet, TrendingDown, Shield } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatIDR } from '../../utils/currency';
import { formatShortDate } from '../../utils/dateUtils';

export const BurnRateMetrics: React.FC = () => {
  const { metrics, cycle } = useBudget();

  if (!cycle) return null;

  const isBufferUntouched = metrics.currentBalance >= metrics.emergencyBuffer;
  const cycleDaysRatio = Math.min(100, Math.round((metrics.daysPassed / metrics.totalDays) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Sisa Hari */}
      <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
          <span className="font-semibold flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Waktu Tersisa
          </span>
          <span className="font-mono text-stone-400 dark:text-stone-500">{cycleDaysRatio}%</span>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums">
              {metrics.daysRemaining}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">hari lagi</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 truncate">
            {formatShortDate(cycle.startDate)} s/d {formatShortDate(cycle.endDate)}
          </p>
        </div>

        <div className="w-full bg-[#EDE9E1] dark:bg-[#332F2B] h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-stone-400 dark:bg-stone-500 h-full transition-all duration-300"
            style={{ width: `${cycleDaysRatio}%` }}
          />
        </div>
      </div>

      {/* 2. Sisa Uang Belanja Bebas */}
      <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
          <span className="font-semibold flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <Wallet className="w-3.5 h-3.5 text-stone-400" />
            Uang Belanja Bebas
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F4F1EA] dark:bg-[#2D2A26] text-stone-600 dark:text-stone-300">
            Di luar cadangan
          </span>
        </div>

        <div>
          <span className="font-mono text-2xl font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums block">
            {formatIDR(metrics.effectiveCurrentBalance)}
          </span>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Dari total kas {formatIDR(metrics.currentBalance)}
          </p>
        </div>

        <div className="mt-3 text-[11px] text-stone-600 dark:text-stone-400">
          Target Awal: <strong className="font-mono text-stone-900 dark:text-[#F2EFE9]">{formatIDR(metrics.initialDailyBaseline)}</strong>/hari
        </div>
      </div>

      {/* 3. Laju Belanja Rata-rata */}
      <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
          <span className="font-semibold flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <TrendingDown className="w-3.5 h-3.5 text-stone-400" />
            Rata-rata Belanja
          </span>
        </div>

        <div>
          <span className="font-mono text-2xl font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums block">
            {formatIDR(metrics.averageDailyExpense)}
          </span>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Realisasi belanja per hari berjalan
          </p>
        </div>

        <div className="mt-3 text-[11px] text-stone-600 dark:text-stone-400">
          Total Terpakai: <strong className="font-mono text-stone-900 dark:text-[#F2EFE9]">{formatIDR(metrics.totalExpense)}</strong>
        </div>
      </div>

      {/* 4. Tabungan Cadangan */}
      <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
          <span className="font-semibold flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <Shield className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
            Tabungan Cadangan
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isBufferUntouched
                ? 'bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#1B4332] dark:text-[#76CEA2] border border-[#D5E6D8] dark:border-[#284232]'
                : 'bg-[#FDF2F2] dark:bg-[#2E1818] text-[#9E2A2B] dark:text-[#F27E7E] border border-[#FACDCD] dark:border-[#4A2424]'
            }`}
          >
            {isBufferUntouched ? 'Utuh' : 'Tersentuh'}
          </span>
        </div>

        <div>
          <span className="font-mono text-2xl font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums block">
            {formatIDR(metrics.emergencyBuffer)}
          </span>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {isBufferUntouched
              ? 'Dana darurat aman tidak terpakai'
              : 'Peringatan: Kamu mulai memakai cadangan'}
          </p>
        </div>

        <div className="mt-3 text-[11px] text-stone-600 dark:text-stone-400">
          Dana proteksi darurat akhir bulan
        </div>
      </div>
    </div>
  );
};
