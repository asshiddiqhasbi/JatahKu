import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, Info, Settings, Plus, RotateCcw, Award } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatIDR } from '../../utils/currency';
import { isDatePast } from '../../utils/dateUtils';

interface RunwayHeroProps {
  onOpenQuickEntry: () => void;
  onOpenCycleConfig: () => void;
  onOpenPeriodSummary?: () => void;
}

export const RunwayHero: React.FC<RunwayHeroProps> = ({
  onOpenQuickEntry,
  onOpenCycleConfig,
  onOpenPeriodSummary,
}) => {
  const { cycle, cycles, metrics, isViewingArchived, switchCycle } = useBudget();

  if (!cycle) return null;

  const isCycleExpired = isDatePast(cycle.endDate) || !!cycle.isCompleted;

  const isOverspentToday = metrics.remainingDailyQuotaToday < 0;
  const spentRatio =
    metrics.safeDailyAllowance > 0
      ? Math.min(100, Math.round((metrics.spentToday / metrics.safeDailyAllowance) * 100))
      : 100;

  const StatusIcon = () => {
    switch (metrics.evaluation.status) {
      case 'SAFE':
        return <CheckCircle className="w-4 h-4 text-[#2D6A4F] dark:text-[#42B07E]" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-[#C05621] dark:text-[#E2A04A]" />;
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-[#C53030] dark:text-[#F27E7E]" />;
    }
  };

  const statusBg =
    metrics.evaluation.status === 'SAFE'
      ? 'bg-[#EEF5F0] dark:bg-[#1A2E22] text-[#1B4332] dark:text-[#76CEA2] border-[#D5E6D8] dark:border-[#284232]'
      : metrics.evaluation.status === 'WARNING'
      ? 'bg-[#FEF7EA] dark:bg-[#2E2413] text-[#8C530A] dark:text-[#E2A04A] border-[#FCE6BE] dark:border-[#473618]'
      : 'bg-[#FDF2F2] dark:bg-[#2E1818] text-[#9E2A2B] dark:text-[#F27E7E] border-[#FACDCD] dark:border-[#4A2424]';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E7E3DA] dark:border-[#38342F] bg-white dark:bg-[#23211E] p-5 sm:p-7 shadow-[0_2px_12px_-2px_rgba(41,37,36,0.04)] transition-colors">
      {/* Alert 1: Mode Arsip (Viewing past period) */}
      {isViewingArchived && (
        <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Mode Arsip: Kamu sedang melihat catatan periode lampau (hanya baca).</span>
          </div>
          <button
            type="button"
            onClick={() => cycles.length > 0 && switchCycle(cycles[0].id)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Kembali ke Periode Aktif</span>
          </button>
        </div>
      )}

      {/* Alert 2: Periode Telah Selesai (Active cycle expired or finished) */}
      {isCycleExpired && !isViewingArchived && (
        <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <div>
            <p className="font-bold">Periode Ini Telah Selesai</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Jadwal periode telah berakhir. Selesaikan catatan untuk melihat evaluasi akhir dan mulai periode baru.
            </p>
          </div>
          {onOpenPeriodSummary && (
            <button
              type="button"
              onClick={onOpenPeriodSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2D6A4F] hover:bg-[#23563F] text-white shadow-2xs transition-colors shrink-0"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Lihat Rapor Akhir</span>
            </button>
          )}
        </div>
      )}

      {/* Top row: Status Badge & Cycle Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBg}`}
        >
          <StatusIcon />
          <span>{metrics.evaluation.label}</span>
          <span className="text-stone-300 dark:text-stone-600">•</span>
          <span className="font-mono text-[11px] font-normal">
            Ketahanan: {metrics.burnRatePercentage}%
          </span>
        </div>

        <button
          onClick={onOpenCycleConfig}
          className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-[#F6F3EC] dark:hover:bg-[#2C2925] transition-colors"
          title="Ubah uang saku atau tanggal"
        >
          <span>Hari ke-{metrics.daysPassed} dari {metrics.totalDays}</span>
          <span className="text-stone-300 dark:text-stone-600">|</span>
          <span className="text-stone-700 dark:text-stone-300 font-semibold">
            {isCycleExpired ? 'Periode Selesai' : `${metrics.daysRemaining} hari tersisa`}
          </span>
          <Settings className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
        </button>
      </div>

      {/* Main Focus: Safe Daily Allowance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 flex items-center gap-1.5">
            Jatah Belanja Aman Hari Ini
            <span
              className="text-stone-400 dark:text-stone-500 cursor-help"
              title="Batas maksimal uang yang aman kamu belanjakan hari ini agar uang bulanan tetap cukup."
            >
              <Info className="w-3.5 h-3.5 inline" />
            </span>
          </p>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-[#F2EFE9] tabular-nums">
              {formatIDR(metrics.safeDailyAllowance)}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">/ hari</span>
          </div>

          <p className="text-xs text-stone-600 dark:text-[#A8A29A] mt-2 max-w-lg leading-relaxed">
            {metrics.evaluation.description}
          </p>
        </div>

        {/* Right side: Today's Consumption Card */}
        <div className="lg:col-span-5 bg-[#F8F6F1] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Belanja Hari Ini</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums">
                {formatIDR(metrics.spentToday)}
              </span>
              <button
                onClick={onOpenQuickEntry}
                disabled={isViewingArchived}
                className="p-1 rounded-lg bg-white dark:bg-[#282622] border border-[#E7E3DA] dark:border-[#38342F] text-stone-700 dark:text-stone-300 hover:text-[#2D6A4F] dark:hover:text-[#42B07E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                title={isViewingArchived ? 'Tidak bisa mencatat pada mode arsip' : 'Catat belanja hari ini'}
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-[#E6E1D7] dark:bg-[#332F2B] overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                isOverspentToday ? 'bg-rose-500' : 'bg-[#2D6A4F] dark:bg-[#389E6E]'
              }`}
              style={{ width: `${spentRatio}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-600 dark:text-stone-400">
              Sisa Kuota Hari Ini:{' '}
              <strong
                className={`font-mono font-bold tabular-nums ${
                  isOverspentToday ? 'text-rose-600 dark:text-rose-400' : 'text-[#2D6A4F] dark:text-[#42B07E]'
                }`}
              >
                {formatIDR(metrics.remainingDailyQuotaToday)}
              </strong>
            </span>
            <span className="font-mono text-stone-400 dark:text-stone-500">{spentRatio}%</span>
          </div>

          {isOverspentToday && (
            <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-[#2E1818] p-2 rounded-lg border border-rose-200/80 dark:border-[#4A2424] leading-tight">
              Belanja hari ini melebihi jatah harian. Jatah untuk sisa hari ke depan sudah otomatis disesuaikan agar uangmu tetap cukup.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Sub-stats Bar */}
      <div className="mt-6 pt-5 border-t border-[#EDE9E1] dark:border-[#332F2B] grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Sisa Uang Kas
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-[#F2EFE9] tabular-nums">
            {formatIDR(metrics.currentBalance)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Tabungan Cadangan
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-stone-700 dark:text-stone-300 tabular-nums">
            {formatIDR(metrics.emergencyBuffer)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Total Terpakai
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            -{formatIDR(metrics.totalExpense)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Pemasukan Tambahan
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#2D6A4F] dark:text-[#42B07E] tabular-nums">
            +{formatIDR(metrics.totalIncome)}
          </span>
        </div>
      </div>
    </div>
  );
};
