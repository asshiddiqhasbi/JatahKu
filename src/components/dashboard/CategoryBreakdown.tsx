import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatIDR } from '../../utils/currency';
import { getCategoryMeta } from '../../constants/categories';

export const CategoryBreakdown: React.FC = () => {
  const { categorySummaries, metrics } = useBudget();

  if (metrics.totalExpense === 0) {
    return (
      <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-6 text-center shadow-2xs transition-colors">
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          Belum ada catatan pengeluaran. Catat belanja pertamamu untuk melihat grafik pembagian kategori.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-5 sm:p-6 shadow-2xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Distribusi Pengeluaran
        </h3>
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
          Total Terpakai: <span className="font-mono text-stone-900 dark:text-[#F2EFE9]">{formatIDR(metrics.totalExpense)}</span>
        </span>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="w-full h-3 rounded-full bg-[#EDE9E1] dark:bg-[#332F2B] flex overflow-hidden mb-4">
        {categorySummaries.map((cat) => {
          if (cat.percentage === 0) return null;
          const meta = getCategoryMeta(cat.category);
          return (
            <div
              key={cat.category}
              className={`${meta.barColor} transition-all duration-300`}
              style={{ width: `${cat.percentage}%` }}
              title={`${meta.label}: ${cat.percentage}% (${formatIDR(cat.total)})`}
            />
          );
        })}
      </div>

      {/* Breakdown List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {categorySummaries.map((cat) => {
          const meta = getCategoryMeta(cat.category);
          return (
            <div
              key={cat.category}
              className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${meta.barColor}`}
                />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate" title={meta.label}>
                  {meta.shortLabel}
                </span>
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums block">
                  {formatIDR(cat.total)}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {cat.percentage}% • {cat.count}x
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
