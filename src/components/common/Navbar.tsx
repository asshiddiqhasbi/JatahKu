import React from 'react';
import { Plus, Download, Calendar, Wallet, Sun, Moon } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { useTheme } from '../../context/ThemeContext';
import { formatShortDate } from '../../utils/dateUtils';

interface NavbarProps {
  onOpenQuickEntry: () => void;
  onOpenCycleConfig: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickEntry,
  onOpenCycleConfig,
  onOpenExport,
}) => {
  const { cycle, metrics } = useBudget();
  const { isDark, toggleTheme } = useTheme();

  if (!cycle) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E7E3DA] dark:border-[#332F2B] bg-[#FAF8F5]/90 dark:bg-[#191816]/90 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-stone-900 dark:text-[#F2EFE9] block leading-tight">
                JatahKu
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium hidden sm:block">
                Pengatur Uang Saku Harian
              </span>
            </div>
          </div>

          {/* Cycle Range Indicator (tablet/desktop) */}
          <button
            onClick={onOpenCycleConfig}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 bg-[#F4F1EA] dark:bg-[#23211E] hover:bg-[#ECE8DD] dark:hover:bg-[#2C2925] border border-[#E7E3DA] dark:border-[#332F2B] rounded-xl transition-colors ml-2"
            title="Klik untuk ubah uang saku atau tanggal"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>
              {formatShortDate(cycle.startDate)} s/d {formatShortDate(cycle.endDate)}
            </span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span className="text-[#2D6A4F] dark:text-[#42B07E] font-bold">{metrics.daysRemaining} hari tersisa</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-[#23211E] hover:bg-[#F4F1EA] dark:hover:bg-[#2C2925] border border-[#E7E3DA] dark:border-[#332F2B] transition-colors shadow-2xs"
            title={isDark ? 'Ganti ke Mode Terang Hangat' : 'Ganti ke Mode Gelap Hangat'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Quick cycle button on mobile */}
          <button
            onClick={onOpenCycleConfig}
            className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4F1EA] dark:hover:bg-[#23211E] border border-[#E7E3DA] dark:border-[#332F2B]"
            title="Pengaturan Anggaran"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Export Center */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-[#23211E] hover:bg-[#F6F3EC] dark:hover:bg-[#2C2925] border border-[#E7E3DA] dark:border-[#332F2B] rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span className="hidden sm:inline">Laporan Resmi</span>
            <span className="sm:hidden">Laporan</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickEntry}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#23563F] active:scale-98 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
