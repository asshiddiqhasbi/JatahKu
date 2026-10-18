import React, { useState } from 'react';
import { Wallet, Shield, ArrowRight, Calendar, Sun, Moon, Cloud } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { useTheme } from '../../context/ThemeContext';
import { parseRawNumber, formatIDR } from '../../utils/currency';
import { getInclusiveDays, getTodayDateString, addDaysToDate } from '../../utils/dateUtils';
import { DEFAULT_EMERGENCY_BUFFER } from '../../constants/presets';

interface WelcomeSetupProps {
  onOpenAuth?: () => void;
}

export const WelcomeSetup: React.FC<WelcomeSetupProps> = ({ onOpenAuth }) => {
  const { setupNewCycle, loadSampleData } = useBudget();
  const { isDark, toggleTheme } = useTheme();

  const [userName, setUserName] = useState('');
  const [initialBalanceStr, setInitialBalanceStr] = useState('1500000');
  const [emergencyBufferStr, setEmergencyBufferStr] = useState(DEFAULT_EMERGENCY_BUFFER.toString());

  const today = getTodayDateString();
  const defaultEndDate = (() => {
    const end = new Date();
    end.setDate(end.getDate() + 29);
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  })();

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const initialBalance = parseRawNumber(initialBalanceStr);
  const emergencyBuffer = parseRawNumber(emergencyBufferStr);
  const totalDays = getInclusiveDays(startDate, endDate);
  const effectiveInitial = Math.max(0, initialBalance - emergencyBuffer);
  const dailyAllowance = totalDays > 0 ? Math.round(effectiveInitial / totalDays) : 0;

  const handleSetDuration = (days: number) => {
    if (!startDate) return;
    const computedEnd = addDaysToDate(startDate, days);
    setEndDate(computedEnd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialBalance <= 0 || !startDate || !endDate) return;

    setupNewCycle({
      id: `cycle-${Date.now()}`,
      userName: userName.trim() || 'Mahasiswa',
      startDate,
      endDate,
      initialBalance,
      emergencyBuffer,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#191816] flex flex-col justify-center items-center p-4 sm:p-6 text-stone-850 dark:text-[#F2EFE9] transition-colors">
      <div className="max-w-lg w-full bg-[#FFFFFF] dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-2xl shadow-[0_4px_24px_-4px_rgba(41,37,36,0.06)] p-6 sm:p-8 relative">
        {/* Theme Toggle in top-right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-slate-100 dark:bg-[#2B2824] border border-[#E7E3DA] dark:border-[#38342F] transition-colors"
            title={isDark ? 'Ganti ke Mode Terang Hangat' : 'Ganti ke Mode Gelap Hangat'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>

        {/* App Header */}
        <div className="flex items-center gap-3.5 mb-6 pr-12">
          <div className="w-11 h-11 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-[#F2EFE9] tracking-tight">JatahKu</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Kalkulator Jatah Harian & Uang Saku Mahasiswa</p>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-6 p-4 rounded-xl bg-[#F6F3EC] dark:bg-[#1C1A18] border border-[#ECE7DC] dark:border-[#332F2B]">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-[#F2EFE9] mb-1">
            Atur uang sakumu untuk periode ini
          </h2>
          <p className="text-xs text-stone-600 dark:text-[#A8A29A] leading-relaxed">
            Aplikasi ini akan menghitung berapa jatah belanja maksimalmu setiap hari agar uang kiriman cukup sampai tanggal akhir bulan tanpa panik.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Panggilan <span className="text-stone-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Nama panggilan"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Total Uang Saku / Anggaran Bulan Ini
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={initialBalanceStr ? parseInt(initialBalanceStr, 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setInitialBalanceStr(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-base font-mono font-bold text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] tabular-nums transition-all"
                required
              />
            </div>
          </div>

          {/* Date Range Inputs */}
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
                    // Automatically maintain selected duration if valid
                    if (totalDays >= 28 && totalDays <= 31) {
                      setEndDate(addDaysToDate(newStart, totalDays));
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs font-mono text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
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
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs font-mono text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
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

          {/* Emergency Buffer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
                Tabungan Cadangan Darurat
              </label>
              <span className="text-[11px] text-stone-400 font-normal">Disisihkan dari jatah</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-semibold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={emergencyBufferStr ? parseInt(emergencyBufferStr, 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setEmergencyBufferStr(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="150.000"
                className="w-full pl-11 pr-4 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-sm font-mono font-semibold text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] tabular-nums"
              />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Uang ini disimpan untuk kebutuhan mendadak dan tidak akan dibagi ke jatah belanja harian.
            </p>
          </div>

          {/* Calculation Live Preview */}
          <div className="p-4 rounded-xl bg-[#EEF5F0] dark:bg-[#18261E] border border-[#D5E6D8] dark:border-[#284232] flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-semibold text-[#255740] dark:text-[#88CDB0] uppercase tracking-wider">
                Estimasi Jatah Amanmu
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-2xl font-bold text-[#1B4332] dark:text-[#76CEA2] tabular-nums">
                  {formatIDR(dailyAllowance)}
                </span>
                <span className="text-xs text-[#2D6A4F] dark:text-[#88CDB0] font-medium">/ hari</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-stone-800 dark:text-[#F2EFE9]">{totalDays} Hari</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Durasi siklus</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={initialBalance <= 0}
              className="w-full py-3 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] active:scale-[0.99] text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Mulai Hitung Jatah Harian</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Demo Data Option */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={loadSampleData}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors underline underline-offset-4"
            >
              Atau coba isi dengan data contoh simulasi
            </button>
          </div>

          {/* Cloud Sync Option for returning users */}
          {onOpenAuth && (
            <div className="text-center pt-2 border-t border-[#ECE7DC] dark:border-[#332F2B] mt-4">
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-xs font-semibold text-[#2D6A4F] dark:text-[#42B07E] hover:underline flex items-center justify-center gap-1.5 mx-auto pt-1"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sudah punya akun? Masuk untuk sinkronkan data</span>
              </button>
            </div>
          )}
        </form>
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500 mt-6 text-center">
        Data 100% tersimpan aman di browser pribadi Anda • Tidak ada server luar
      </p>
    </div>
  );
};
