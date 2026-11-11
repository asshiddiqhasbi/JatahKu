import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { formatIDR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/dateUtils';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName: string;
  itemCategory?: string;
  itemAmount?: number;
  itemDate?: string;
  isExpense?: boolean;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Hapus Transaksi?',
  itemName,
  itemCategory,
  itemAmount,
  itemDate,
  isExpense = true,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Tindakan ini tidak dapat dibatalkan"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Warning Badge / Icon */}
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
            <Trash2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-rose-900 dark:text-rose-200">
              Yakin ingin menghapus item ini?
            </p>
            <p className="text-rose-700 dark:text-rose-400 mt-0.5 leading-relaxed">
              {isExpense
                ? 'Nominal pengeluaran ini akan otomatis dikembalikan ke sisa saldo kas.'
                : 'Pemasukan ini akan dihapus dari perhitungan total uang saku.'}
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-900 dark:text-[#F2EFE9] truncate pr-2">
              {itemName || itemCategory || 'Transaksi'}
            </span>
            {itemAmount !== undefined && (
              <span
                className={`font-mono font-bold tabular-nums shrink-0 ${
                  isExpense
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-[#2D6A4F] dark:text-[#42B07E]'
                }`}
              >
                {isExpense ? '-' : '+'}
                {formatIDR(itemAmount)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span>{itemCategory || (isExpense ? 'Pengeluaran' : 'Pemasukan')}</span>
            {itemDate && <span>{formatDisplayDate(itemDate)}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all active:scale-98 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Menghapus...' : 'Hapus Transaksi'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
