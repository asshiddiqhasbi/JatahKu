import React from 'react';
import {
  Trash2,
  Edit2,
  ArrowUpRight,
} from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { formatIDR } from '../../utils/currency';
import { getCategoryMeta } from '../../constants/categories';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onDelete,
  onEdit,
}) => {
  const isExpense = transaction.type === 'EXPENSE';
  const meta = isExpense ? getCategoryMeta(transaction.category) : null;
  const CategoryIcon = meta?.icon;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Yakin ingin menghapus transaksi "${transaction.note || transaction.category}" senilai ${formatIDR(transaction.amount)}?`
    );
    if (confirmed) {
      onDelete(transaction.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(transaction);
  };

  return (
    <div
      onClick={() => onEdit(transaction)}
      className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#1C1A18] active:bg-[#F2EFE9] dark:active:bg-[#25221F] cursor-pointer transition-all"
    >
      {/* Left: Icon, note, category badge / source */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isExpense && meta
              ? meta.iconBg
              : 'bg-[#E8F5E9] dark:bg-[#1A2E22]'
          }`}
        >
          {isExpense && CategoryIcon && meta ? (
            <CategoryIcon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-[#2D6A4F] dark:text-[#42B07E]" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-stone-850 dark:text-[#F2EFE9] truncate leading-tight">
              {transaction.note || (isExpense ? meta?.label : transaction.source || 'Pemasukan')}
            </p>
            {isExpense && meta && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none shrink-0 ${meta.badgeClass}`}
              >
                {meta.shortLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-none flex items-center gap-1.5">
            {isExpense && meta ? (
              <>
                <span className="hidden sm:inline">{meta.label}</span>
                {transaction.qty && transaction.qty > 1 && (
                  <span className="font-mono text-stone-500 dark:text-stone-400">
                    <span className="hidden sm:inline">• </span>
                    {transaction.qty} pcs
                    {transaction.unitPrice ? ` @ ${formatIDR(transaction.unitPrice)}` : ''}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[#2D6A4F] dark:text-[#42B07E] font-medium">
                {transaction.source || 'Pemasukan Tambahan'}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right: Nominal & Action controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span
          className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
            isExpense ? 'text-stone-800 dark:text-[#F2EFE9]' : 'text-[#2D6A4F] dark:text-[#42B07E]'
          }`}
        >
          {isExpense ? `-${formatIDR(transaction.amount)}` : `+${formatIDR(transaction.amount)}`}
        </span>

        {/* Action buttons: subtly visible on mobile touch screens, reveal on hover on desktop */}
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEditClick}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-[#EDE9E1] dark:hover:bg-[#2C2925] transition-colors"
            title="Edit transaksi"
            aria-label="Edit transaksi"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Hapus transaksi"
            aria-label="Hapus transaksi"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
