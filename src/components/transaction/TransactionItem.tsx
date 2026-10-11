import React, { useState } from 'react';
import {
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react';
import type { Transaction } from '../../types/transaction';
import { formatIDR } from '../../utils/currency';
import { getCategoryMeta } from '../../constants/categories';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(transaction.amount.toString());
  const [editNote, setEditNote] = useState(transaction.note);

  const isExpense = transaction.type === 'EXPENSE';
  const meta = isExpense ? getCategoryMeta(transaction.category) : null;
  const CategoryIcon = meta?.icon;

  const handleSaveEdit = () => {
    const parsed = parseInt(editAmount.replace(/[^\d]/g, ''), 10);
    if (parsed > 0) {
      onUpdate(transaction.id, {
        amount: parsed,
        note: editNote.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditAmount(transaction.amount.toString());
    setEditNote(transaction.note);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Keterangan..."
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
          />
          <input
            type="text"
            inputMode="numeric"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Nominal"
            className="w-28 px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
          />
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={handleSaveEdit}
            className="p-1.5 rounded-lg bg-[#2D6A4F] text-white hover:bg-[#23563F]"
            title="Simpan"
            aria-label="Simpan perubahan"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1.5 rounded-lg bg-[#EDE9E1] dark:bg-[#2C2925] text-stone-600 dark:text-stone-300 hover:bg-[#E3DFD5] dark:hover:bg-[#38342F]"
            title="Batal"
            aria-label="Batal edit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#1C1A18] transition-all">
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
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-[#EDE9E1] dark:hover:bg-[#2C2925] transition-colors"
            title="Edit"
            aria-label="Edit transaksi"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Hapus"
            aria-label="Hapus transaksi"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
