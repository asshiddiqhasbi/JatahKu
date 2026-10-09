import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';
import { parseRawNumber, formatIDR } from '../../utils/currency';
import { getInclusiveDays, addDaysToDate } from '../../utils/dateUtils';

interface CycleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CycleConfigModal: React.FC<CycleConfigModalProps> = ({ isOpen, onClose }) => {
  const { cycle, updateCycle, resetAllData } = useBudget();

  const [userName, setUserName] = useState(cycle?.userName || '');
  const [initialBalanceStr, setInitialBalanceStr] = useState((cycle?.initialBalance || 0).toString());
  const [emergencyBufferStr, setEmergencyBufferStr] = useState(
    (cycle?.emergencyBuffer || 0).toString()
  );
  const [startDate, setStartDate] = useState(cycle?.startDate || '');
  const [endDate, setEndDate] = useState(cycle?.endDate || '');

  useEffect(() => {
    if (isOpen && cycle) {
      setUserName(cycle.userName || '');
      setInitialBalanceStr(cycle.initialBalance.toString());
      setEmergencyBufferStr((cycle.emergencyBuffer || 0).toString());
      setStartDate(cycle.startDate);
      setEndDate(cycle.endDate);
    }
  }, [isOpen, cycle]);

  if (!cycle) return null;

  const initialBalance = parseRawNumber(initialBalanceStr);
  const emergencyBuffer = parseRawNumber(emergencyBufferStr);
  const totalDays = getInclusiveDays(startDate, endDate);
  const effectiveInitial = Math.max(0, initialBalance - emergencyBuffer);
  const initialDailyQuota = totalDays > 0 ? Math.round(effectiveInitial / totalDays) : 0;

  const handleSetDuration = (days: number) => {
    if (!startDate) return;
    const computedEnd = addDaysToDate(startDate, days);
    setEndDate(computedEnd);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialBalance <= 0 || !startDate || !endDate) return;

    updateCycle({
      userName: userName.trim() || 'Mahasiswa',
      initialBalance,
      emergencyBuffer,
      startDate,
      endDate,
    });

    onClose();
  };

  const handleResetData = () => {
    if (confirm('Yakin ingin mereset dan menghapus semua data? Anda akan kembali ke layar pengaturan awal.')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Uang Saku & Siklus"
      subtitle="Sesuaikan total uang saku, tabungan cadangan, atau ganti tanggal periode"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* User Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Nama Panggilan / Mahasiswa
          </label>
          <input
            type="text"
            placeholder="Contoh: Hasbi"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
          />
        </div>

        {/* Saldo Awal Siklus */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Total Uang Saku Periode Ini
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 dark:text-stone-500 font-bold text-sm">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={initialBalanceStr ? parseInt(initialBalanceStr, 10).toLocaleString('id-ID') : ''}
              onChange={(e) => setInitialBalanceStr(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="1.500.000"
              className="w-full pl-11 pr-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-sm font-mono font-bold text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
              required
            />
          </div>
        </div>

        {/* Tabungan Cadangan Darurat */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
              Tabungan Cadangan Darurat
            </label>
            <span className="text-[11px] text-stone-400 font-normal">Disisihkan dari jatah</span>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-bold text-sm">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={emergencyBufferStr ? parseInt(emergencyBufferStr, 10).toLocaleString('id-ID') : ''}
              onChange={(e) => setEmergencyBufferStr(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="150.000"
              className="w-full pl-11 pr-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-sm font-mono font-semibold text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
            />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Uang cadangan tidak akan dihitung sebagai uang belanja harian.
          </p>
        </div>

        {/* Rentang Tanggal Inputs */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartDate(newStart);
                  if (totalDays >= 28 && totalDays <= 31) {
                    setEndDate(addDaysToDate(newStart, totalDays));
                  }
                }}
                className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs font-mono text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs font-mono text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
                required
              />
            </div>
          </div>

          {/* Quick Duration Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mr-0.5">
              Pilih Durasi:
            </span>
            {[28, 29, 30, 31].map((days) => {
              const isSelected = totalDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleSetDuration(days)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] dark:bg-[#389E6E] dark:border-[#389E6E] shadow-2xs font-bold'
                      : 'bg-[#FAF8F5] dark:bg-[#1C1A18] border-[#E7E3DA] dark:border-[#38342F] text-stone-700 dark:text-stone-300 hover:bg-[#EDE9E1] dark:hover:bg-[#2C2925]'
                  }`}
                  title={`Set tanggal akhir otomatis ${days} hari dari tanggal mulai`}
                >
                  +{days} Hari
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Calculation Box */}
        <div className="p-3.5 bg-[#F6F3EC] dark:bg-[#1C1A18] border border-[#ECE7DC] dark:border-[#38342F] rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Durasi Periode:</span>
            <span className="font-bold text-stone-800 dark:text-[#F2EFE9]">{totalDays} Hari</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Uang Belanja Bersih:</span>
            <span className="font-bold font-mono text-stone-800 dark:text-[#F2EFE9]">{formatIDR(effectiveInitial)}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-400 pt-1 border-t border-[#E0DBD0] dark:border-[#332F2B]">
            <span>Jatah Awal Harian:</span>
            <span className="font-bold font-mono text-[#2D6A4F] dark:text-[#42B07E]">{formatIDR(initialDailyQuota)} / hari</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
            title="Hapus semua data dan mulai ulang"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Semua Data</span>
          </button>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white shadow-xs transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
