import React, { useState, useMemo } from 'react';
import {
  Award,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';
import type { BudgetCycle, RunwayMetrics } from '../../types/cycle';
import type { CategorySummary } from '../../types/report';
import { formatIDR } from '../../utils/currency';
import { formatShortDate, isDatePast } from '../../utils/dateUtils';
import { calculateRunway, calculateCategorySummaries } from '../../utils/runwayCalculator';

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
  const {
    cycle: currentCycle,
    metrics: currentMetrics,
    categorySummaries: currentCategories,
    transactions,
    completeCurrentCycle,
  } = useBudget();

  const cycle = targetCycle || currentCycle;

  // Accurately compute runway metrics if viewing an archived cycle without precomputed metrics
  const metrics = useMemo(() => {
    if (targetMetrics) return targetMetrics;
    if (targetCycle && targetCycle.id !== currentCycle?.id) {
      return calculateRunway(targetCycle, transactions);
    }
    return currentMetrics;
  }, [targetCycle, targetMetrics, currentCycle, currentMetrics, transactions]);

  // Accurately compute category summaries if viewing an archived cycle
  const categories = useMemo(() => {
    if (targetCategories) return targetCategories;
    if (targetCycle && targetCycle.id !== currentCycle?.id) {
      return calculateCategorySummaries(transactions, targetCycle.id);
    }
    return currentCategories;
  }, [targetCycle, targetCategories, currentCycle, currentCategories, transactions]);

  const [carryOverChecked, setCarryOverChecked] = useState(true);

  if (!cycle) return null;

  const isCompletedOrExpired = Boolean(cycle.isCompleted || isDatePast(cycle.endDate));
  const netSavings = Math.max(0, metrics.currentBalance);

  const handleStartNew = () => {
    onClose();
    if (onStartNewCycle) {
      onStartNewCycle(carryOverChecked ? netSavings : 0);
    }
  };

  const handleFinishEarly = async () => {
    const confirmed = window.confirm(
      'Selesaikan periode ini sekarang? Tanggal akhir akan disesuaikan ke hari ini dan kamu bisa langsung melihat rapor akhir periode.'
    );
    if (confirmed) {
      await completeCurrentCycle();
    }
  };

  // Status evaluasi tenang & faktual (anti-slop)
  let statusVariant: 'success' | 'warning' | 'danger' = 'success';
  let statusTitle = '';
  let statusDescription = '';

  const totalFund = metrics.initialBalance + metrics.totalIncome;

  if (!isCompletedOrExpired) {
    if (metrics.currentBalance <= 0) {
      statusVariant = 'danger';
      statusTitle = 'Jatah Belanja Telah Melampaui Batas';
      statusDescription = `Total belanja saat ini (${formatIDR(metrics.totalExpense)}) telah menghabiskan seluruh alokasi dana saku. Tahan pengeluaran tambahan hingga periode berikutnya.`;
    } else if (
      metrics.currentBalance < totalFund * 0.1 ||
      metrics.safeDailyAllowance < metrics.initialDailyBaseline * 0.7 ||
      metrics.averageDailyExpense > metrics.initialDailyBaseline * 1.15
    ) {
      statusVariant = 'warning';
      statusTitle = 'Saldo Kas Berjalan Menipis';
      statusDescription = `Sisa saldo kas tersisa ${formatIDR(metrics.currentBalance)} (${metrics.daysRemaining} hari tersisa). Jaga pengeluaran harian agar saku cukup sampai penutupan periode.`;
    } else {
      statusVariant = 'success';
      statusTitle = 'Pengeluaran Berjalan Terkendali';
      statusDescription = `Sisa saldo kas ${formatIDR(metrics.currentBalance)} siap menopang ${metrics.daysRemaining} hari ke depan dengan rekomendasi belanja harian ${formatIDR(metrics.safeDailyAllowance)}/hari.`;
    }
  } else {
    if (metrics.currentBalance > metrics.emergencyBuffer) {
      statusVariant = 'success';
      statusTitle = 'Periode Selesai dengan Sisa Saldo Kas';
      statusDescription = `Kamu menyelesaikan periode dengan sisa saldo kas ${formatIDR(metrics.currentBalance)}. Kebutuhan belanja tercukupi dan sisa kas siap dialokasikan ke periode baru.`;
    } else if (metrics.currentBalance >= 0) {
      statusVariant = 'warning';
      statusTitle = 'Periode Ditutup Sesuai Rencana';
      statusDescription = `Alokasi belanja terpakai optimal hingga akhir periode dengan sisa saldo akhir ${formatIDR(metrics.currentBalance)}.`;
    } else {
      statusVariant = 'danger';
      statusTitle = 'Periode Ditutup Melampaui Alokasi';
      statusDescription = `Total belanja periode ini melebihi alokasi awal sebesar ${formatIDR(Math.abs(metrics.currentBalance))}. Jadikan evaluasi untuk alokasi periode berikutnya.`;
    }
  }

  const expensePercentage = totalFund > 0 ? Math.round((metrics.totalExpense / totalFund) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCompletedOrExpired ? 'Rapor Akhir Periode' : 'Rapor Sementara (Evaluasi Berjalan)'}
      subtitle={
        isCompletedOrExpired
          ? `Rekap hasil keuangan ${formatShortDate(cycle.startDate)} sampai ${formatShortDate(cycle.endDate)}`
          : `Progres pengeluaran dari ${formatShortDate(cycle.startDate)} sampai hari ini (${metrics.daysPassed} hari berjalan)`
      }
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Banner Evaluasi Utama: Faktual & Bebas Slop */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            statusVariant === 'success'
              ? 'bg-[#EEF5F0] dark:bg-[#1A2E22] border-[#D5E6D8] dark:border-[#284232] text-[#1B4332] dark:text-[#76CEA2]'
              : statusVariant === 'warning'
              ? 'bg-[#FEF7EA] dark:bg-[#2E2413] border-[#FCE6BE] dark:border-[#473618] text-[#8C530A] dark:text-[#E2A04A]'
              : 'bg-[#FDF2F2] dark:bg-[#2E1818] border-[#FACDCD] dark:border-[#4A2424] text-[#9E2A2B] dark:text-[#F27E7E]'
          }`}
        >
          <div className="p-2 rounded-xl bg-white/70 dark:bg-black/20 shrink-0">
            {statusVariant === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] dark:text-[#42B07E]" />
            ) : statusVariant === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-[#8C530A] dark:text-[#E2A04A]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#9E2A2B] dark:text-[#F27E7E]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">{statusTitle}</h3>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{statusDescription}</p>
          </div>
        </div>

        {/* 4 Kartu Metrik Rekap (2x2 Grid Luas: Angka Utuh, Tidak Ada Truncate Angka) */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Total Anggaran */}
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Total Anggaran
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-stone-900 dark:text-[#F2EFE9] block tabular-nums mt-0.5">
                {formatIDR(totalFund)}
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EDE9E1] dark:border-[#2C2925] text-xs text-stone-500 dark:text-stone-400">
              {metrics.totalIncome > 0 ? (
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span>Saku: {formatIDR(metrics.initialBalance)}</span>
                  <span className="text-[#2D6A4F] dark:text-[#42B07E] font-medium font-mono">
                    +{formatIDR(metrics.totalIncome)}
                  </span>
                </div>
              ) : (
                <span>Alokasi awal uang saku</span>
              )}
            </div>
          </div>

          {/* 2. Total Belanja */}
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Total Belanja
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 block tabular-nums mt-0.5">
                {formatIDR(metrics.totalExpense)}
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EDE9E1] dark:border-[#2C2925] text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between gap-1 flex-wrap">
              <span>{isCompletedOrExpired ? `Total ${metrics.daysPassed} hari` : `${metrics.daysPassed} hari berjalan`}</span>
              <span className="font-mono font-medium text-stone-600 dark:text-stone-400">
                {expensePercentage}% dana
              </span>
            </div>
          </div>

          {/* 3. Sisa Saldo Kas */}
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Sisa Saldo Kas
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-[#2D6A4F] dark:text-[#42B07E] block tabular-nums mt-0.5">
                {formatIDR(metrics.currentBalance)}
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EDE9E1] dark:border-[#2C2925] text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between gap-1 flex-wrap">
              <span>{!isCompletedOrExpired ? `${metrics.daysRemaining} hari tersisa` : 'Saldo akhir'}</span>
              <span className="font-medium text-stone-600 dark:text-stone-400">
                {!isCompletedOrExpired
                  ? (metrics.currentBalance > 0 ? 'Tersisa' : 'Habis')
                  : (metrics.currentBalance > 0 ? 'Surplus' : 'Defisit')}
              </span>
            </div>
          </div>

          {/* 4. Rata-rata Belanja Harian */}
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                Rata-rata Belanja Harian
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-stone-900 dark:text-[#F2EFE9] block tabular-nums mt-0.5">
                {formatIDR(metrics.averageDailyExpense)}
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EDE9E1] dark:border-[#2C2925] text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between gap-1 flex-wrap">
              <span>Target: {formatIDR(metrics.initialDailyBaseline)}/hari</span>
              <span
                className={`font-medium ${
                  metrics.averageDailyExpense > metrics.initialDailyBaseline
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-[#2D6A4F] dark:text-[#42B07E]'
                }`}
              >
                {metrics.averageDailyExpense > metrics.initialDailyBaseline ? 'Di atas target' : 'Sesuai target'}
              </span>
            </div>
          </div>
        </div>

        {/* Distribusi Pengeluaran Kategori */}
        {categories.length > 0 && (
          <div className="p-4 bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
                Distribusi Kategori Belanja
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Porsi pengeluaran</span>
            </div>

            <div className="space-y-2.5">
              {categories.slice(0, 4).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate pr-2">
                      {cat.category} ({cat.count} transaksi)
                    </span>
                    <span className="font-mono font-semibold text-stone-700 dark:text-stone-300 shrink-0">
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

        {/* Aksi Bawah: Sesuai Status Periode */}
        {isCompletedOrExpired ? (
          <div className="p-4 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-stone-900 dark:text-[#F2EFE9] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
              Langkah Selanjutnya: Buka Periode Baru
            </h4>

            {netSavings > 0 ? (
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
            ) : (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Periode ini telah selesai. Kamu bisa langsung membuka periode baru dengan uang saku baru.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Tutup
              </button>
              {onStartNewCycle && (
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white shadow-2xs transition-all active:scale-98"
                >
                  <span>Mulai Periode Baru</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-[#EDE9E1] dark:border-[#332F2B]">
            <button
              type="button"
              onClick={handleFinishEarly}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl transition-colors"
              title="Selesaikan periode berjalan sekarang dan tutup buku"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Selesaikan Periode Sekarang</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 transition-colors"
            >
              Tutup Evaluasi
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
