import React, { useState, useEffect } from 'react';
import { CalendarDays, ArrowRight, Trash2, Calendar } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { DayGroupedTransactions } from '../../types/transaction';
import { formatIDR } from '../../utils/currency';
import { getTodayDateString, getYesterdayDateString } from '../../utils/dateUtils';

interface DateGroupActionsModalProps {
  group: DayGroupedTransactions | null;
  isOpen: boolean;
  onClose: () => void;
  onMoveDate: (oldDate: string, newDate: string) => Promise<void>;
  onDeleteGroup: (date: string) => Promise<void>;
}

export const DateGroupActionsModal: React.FC<DateGroupActionsModalProps> = ({
  group,
  isOpen,
  onClose,
  onMoveDate,
  onDeleteGroup,
}) => {
  const [newDate, setNewDate] = useState<string>(getTodayDateString());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (group && isOpen) {
      // Default to yesterday if current group is today, otherwise today
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();
      setNewDate(group.date === today ? yesterday : today);
      setLoading(false);
    }
  }, [group, isOpen]);

  if (!group) return null;

  const isSameDate = newDate === group.date;

  const handleMove = async () => {
    if (isSameDate || !newDate) return;
    setLoading(true);
    await onMoveDate(group.date, newDate);
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus ${group.items.length} transaksi pada tanggal "${group.displayDate}" senilai total ${formatIDR(group.totalExpense)}?`
    );
    if (confirmed) {
      setLoading(true);
      await onDeleteGroup(group.date);
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Transaksi Harian"
      subtitle={`Kelola seluruh transaksi pada ${group.displayDate}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Ringkasan Hari Ini */}
        <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] dark:bg-[#1A2E22] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#2D6A4F] dark:text-[#42B07E]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-[#F2EFE9]">
                {group.displayDate}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {group.items.length} barang belanjaan
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm font-mono font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums">
              {formatIDR(group.totalExpense)}
            </p>
            {group.totalIncome > 0 && (
              <p className="text-[11px] font-mono font-semibold text-[#2D6A4F] dark:text-[#42B07E] tabular-nums">
                +{formatIDR(group.totalIncome)}
              </p>
            )}
          </div>
        </div>

        {/* Section 1: Pindahkan Tanggal Sekaligus */}
        <div className="p-3.5 bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-850 dark:text-[#F2EFE9] flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
              <span>Pindahkan Semua ke Tanggal Baru</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setNewDate(getTodayDateString())}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                  newDate === getTodayDateString()
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setNewDate(getYesterdayDateString())}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                  newDate === getYesterdayDateString()
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Kemarin
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
            />
            <button
              type="button"
              disabled={isSameDate || !newDate || loading}
              onClick={handleMove}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs whitespace-nowrap"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Pindahkan {group.items.length} Transaksi</span>
            </button>
          </div>
          {isSameDate && (
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Pilih tanggal yang berbeda dari tanggal saat ini.
            </p>
          )}
        </div>

        {/* Section 2: Hapus 1 Hari Penuh */}
        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Hapus Semua Transaksi di Hari Ini
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
              Hapus sekaligus {group.items.length} barang belanjaan pada tanggal ini.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-700 dark:text-rose-300 bg-white dark:bg-[#2A1D1D] hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-300 dark:border-rose-800 transition-colors shrink-0 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus 1 Hari Penuh</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
