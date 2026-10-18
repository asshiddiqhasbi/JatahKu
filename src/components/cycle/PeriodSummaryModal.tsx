import React, { useState } from 'react';
import { Award, ArrowRight, ShieldCheck, AlertTriangle, PieChart, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';
import type { BudgetCycle, RunwayMetrics } from '../../types/cycle';
import type { CategorySummary } from '../../types/report';
import { formatIDR } from '../../utils/currency';
import { formatShortDate } from '../../utils/dateUtils';

interface PeriodSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewCycle?: (carryOverAmount?: number) => void;
  targetCycle?: BudgetCycle | null;
  targetMetrics?: RunwayMetrics | null;
  targetCategories?: CategorySummary[];
}

export const PeriodSummaryModal: React.FC<PeriodSummaryModalProps> = ({
  isOpen,
  onClose,
  onStartNewCycle,
  targetCycle,
  targetMetrics,
  targetCategories,
}) => {
  const { cycle: currentCycle, metrics: currentMetrics, categorySummaries: currentCategories } = useBudget();

  const cycle = targetCycle || currentCycle;
  const metrics = targetMetrics || currentMetrics;
  const categories = targetCategories || currentCategories;

  const [carryOverChecked, setCarryOverChecked] = useState(true);

  if (!cycle) return null;

  const isSavingsSurplus = metrics.currentBalance > metrics.emergencyBuffer;
  const isEmergencyUntouched = metrics.currentBalance >= metrics.emergencyBuffer;
  const netSavings = Math.max(0, metrics.currentBalance);

  const handleStartNew = () => {
    onClose();
    if (onStartNewCycle) {
      onStartNewCycle(carryOverChecked ? netSavings : 0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rapor Akhir Periode"
      subtitle={`Rekap hasil keuangan ${formatShortDate(cycle.startDate)} sampai ${formatShortDate(cycle.endDate)}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Banner Evaluasi Utama */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isSavingsSurplus
              ? 'bg-[#EEF5F0] dark:bg-[#1A2E22] border-[#D5E6D8] dark:border-[#284232] text-[#1B4332] dark:text-[#76CEA2]'
              : isEmergencyUntouched
              ? 'bg-[#FEF7EA] dark:bg-[#2E2413] border-[#FCE6BE] dark:border-[#473618] text-[#8C530A] dark:text-[#E2A04A]'
              : 'bg-[#FDF2F2] dark:bg-[#2E1818] border-[#FACDCD] dark:border-[#4A2424] text-[#9E2A2B] dark:text-[#F27E7E]'
          }`}
        >
          <div className="p-2 rounded-xl bg-white/70 dark:bg-black/20 shrink-0">
            {isSavingsSurplus ? (
              <Sparkles className="w-5 h-5 text-[#2D6A4F] dark:text-[#42B07E]" />
            ) : isEmergencyUntouched ? (
              <ShieldCheck className="w-5 h-5 text-[#8C530A] dark:text-[#E2A04A]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#9E2A2B] dark:text-[#F27E7E]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {isSavingsSurplus
                ? 'Luar biasa! Kamu berhasil berhemat periode ini'
                : isEmergencyUntouched
                ? 'Periode selesai: Tabungan daruratmu tetap terjaga'
                : 'Uang operasional habis terpakai'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
              {isSavingsSurplus
                ? `Kamu berhasil menyisakan total ${formatIDR(metrics.currentBalance)} dari uang saku awal. Tabungan cadangan daruratmu utuh plus bonus sisa belanja.`
                : isEmergencyUntouched
                ? `Pengeluaranmu pas di batas target. Tabungan cadangan darurat ${formatIDR(metrics.emergencyBuffer)} tetap berhasil diamankan.`
                : 'Pengeluaran sedikit melebihi jatah belanja awal dan menyentuh tabungan darurat. Jadikan evaluasi untuk periode selanjutnya.'}
            </p>
          </div>
        </div>

        {/* 4 Kartu Metrik Rekap */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Uang Masuk Awal */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block mb-0.5">
              Total Uang Saku
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums">
              {formatIDR(metrics.initialBalance + metrics.totalIncome)}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
              {metrics.totalIncome > 0 ? `+${formatIDR(metrics.totalIncome)} pemasukan` : 'Uang saku awal'}
            </span>
          </div>

          {/* Total Belanja */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block mb-0.5">
              Total Pengeluaran
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {formatIDR(metrics.totalExpense)}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
              Dalam {metrics.daysPassed} hari aktif
            </span>
          </div>

          {/* Sisa Saldo Akhir */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block mb-0.5">
              Sisa Saldo Kas
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-[#2D6A4F] dark:text-[#42B07E] tabular-nums">
              {formatIDR(metrics.currentBalance)}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
              {isEmergencyUntouched ? 'Tabungan aman' : 'Perlu hemat'}
            </span>
          </div>

          {/* Rata-rata Belanja Harian */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block mb-0.5">
              Rata-rata / Hari
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums">
              {formatIDR(metrics.averageDailyExpense)}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
              Rencana: {formatIDR(metrics.initialDailyBaseline)}/hari
            </span>
          </div>
        </div>

        {/* Distribusi Pengeluaran Kategori */}
        {categories.length > 0 && (
          <div className="p-4 bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
                Kategori Belanja Paling Dominan
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Porsi dari total</span>
            </div>

            <div className="space-y-2">
              {categories.slice(0, 4).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {cat.category} ({cat.count} barang)
                    </span>
                    <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
                      {formatIDR(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#FAF8F5] dark:bg-[#1C1A18] rounded-full overflow-hidden border border-[#E7E3DA] dark:border-[#38342F]">
                    <div
                      className="h-full bg-[#2D6A4F] dark:bg-[#42B07E] rounded-full transition-all"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opsi Mulai Siklus Baru */}
        {onStartNewCycle && (
          <div className="p-4 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-stone-900 dark:text-[#F2EFE9] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
              Langkah Selanjutnya: Buka Periode Baru
            </h4>

            {netSavings > 0 && (
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={carryOverChecked}
                  onChange={(e) => setCarryOverChecked(e.target.checked)}
                  className="mt-0.5 rounded border-[#E7E3DA] text-[#2D6A4F] focus:ring-[#2D6A4F]"
                />
                <span>
                  Bawa sisa uang <strong className="font-mono text-[#2D6A4F] dark:text-[#42B07E]">{formatIDR(netSavings)}</strong> sebagai pemasukan saldo awal di periode baru nanti.
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Tutup Saja
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white shadow-2xs transition-all active:scale-98"
              >
                <span>Mulai Periode Baru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {!onStartNewCycle && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 transition-colors"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
