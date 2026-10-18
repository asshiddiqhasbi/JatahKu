import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Settings,
  Archive,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';
import type { BudgetCycle } from '../../types/cycle';
import { formatIDR } from '../../utils/currency';
import { formatShortDate, getInclusiveDays } from '../../utils/dateUtils';

interface CycleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPeriodSummary: (cycle?: BudgetCycle) => void;
  onOpenNewCycleSetup: () => void;
  onOpenCycleConfig: () => void;
}

export const CycleHistoryModal: React.FC<CycleHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenPeriodSummary,
  onOpenNewCycleSetup,
  onOpenCycleConfig,
}) => {
  const { cycle: activeCycle, cycles, switchCycle, completeCurrentCycle } = useBudget();

  if (!isOpen) return null;

  const handleFinishEarly = async () => {
    const confirmed = window.confirm(
      'Selesaikan periode ini sekarang? Tanggal akhir akan disesuaikan ke hari ini dan kamu bisa langsung melihat rapor akhir periode.'
    );
    if (confirmed) {
      await completeCurrentCycle();
      onClose();
      onOpenPeriodSummary();
    }
  };

  const handleSelectCycle = async (targetId: string) => {
    await switchCycle(targetId);
    onClose();
  };

  // The latest cycle in the list is the current/latest cycle
  const latestCycle = cycles.length > 0 ? cycles[0] : activeCycle;
  const pastCycles = cycles.filter((c) => c.id !== latestCycle?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola & Riwayat Periode"
      subtitle="Pantau performa keuanganmu dari periode ke periode"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Periode Utama / Aktif Saat Ini */}
        {latestCycle && (
          <div className="p-4 bg-white dark:bg-[#23211E] border-2 border-[#2D6A4F]/40 dark:border-[#42B07E]/40 rounded-2xl shadow-2xs space-y-3">
            {/* Top row: Status Badge & Settings Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5E9] dark:bg-[#1A2E22] text-[#2D6A4F] dark:text-[#76CEA2] border border-[#C8E6C9] dark:border-[#2A4736]">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#42B07E] animate-pulse" />
                  <span>Periode Aktif</span>
                </span>
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
                  {getInclusiveDays(latestCycle.startDate, latestCycle.endDate)} hari
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCycleConfig();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-[#F4F1EA] dark:bg-[#2C2925] hover:bg-[#EDE9E1] dark:hover:bg-[#38342F] rounded-lg transition-colors border border-[#E7E3DA] dark:border-[#38342F]"
                title="Ubah uang saku atau tanggal periode"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Atur</span>
              </button>
            </div>

            {/* Middle row: Full width date and allowance info */}
            <div className="py-0.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2D6A4F] dark:text-[#42B07E] shrink-0" />
                <p className="text-sm sm:text-base font-bold text-stone-900 dark:text-[#F2EFE9] whitespace-nowrap tracking-tight">
                  {formatShortDate(latestCycle.startDate)} - {formatShortDate(latestCycle.endDate)}
                </p>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 pl-6">
                Uang saku awal: <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">{formatIDR(latestCycle.initialBalance)}</span>
              </p>
            </div>

            {/* Bottom row: Spacious action buttons */}
            <div className="pt-2 border-t border-[#EDE9E1] dark:border-[#332F2B]">
              {activeCycle?.id !== latestCycle.id ? (
                <button
                  type="button"
                  onClick={() => handleSelectCycle(latestCycle.id)}
                  className="w-full py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] text-white hover:bg-[#23563F] transition-all shadow-2xs whitespace-nowrap text-center"
                >
                  Buka Periode Ini
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPeriodSummary(latestCycle);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-[#2C2925] hover:bg-stone-200 dark:hover:bg-[#38342F] transition-colors whitespace-nowrap"
                  >
                    <span>Rapor Sementara</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/40 hover:bg-amber-200/80 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800 transition-colors shadow-2xs whitespace-nowrap"
                    title="Selesaikan periode ini lebih awal dan tutup buku"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>Selesaikan & Tutup Buku</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daftar Periode Lampau (Arsip) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Riwayat Periode Sebelumnya ({pastCycles.length})</span>
            </h3>
          </div>

          {pastCycles.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-[#E7E3DA] dark:border-[#38342F] bg-[#FAF8F5] dark:bg-[#1C1A18] text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Belum ada riwayat periode sebelumnya. Setiap kali kamu menyelesaikan periode, arsipnya akan tersimpan rapi di sini.
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
              {pastCycles.map((past) => {
                const isSelected = activeCycle?.id === past.id;
                const days = getInclusiveDays(past.startDate, past.endDate);

                return (
                  <div
                    key={past.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#F2F8F4] dark:bg-[#1A2E22] border-[#2D6A4F] dark:border-[#42B07E]'
                        : 'bg-white dark:bg-[#23211E] border-[#E7E3DA] dark:border-[#38342F] hover:border-stone-400 dark:hover:border-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-stone-900 dark:text-[#F2EFE9] whitespace-nowrap">
                          {formatShortDate(past.startDate)} - {formatShortDate(past.endDate)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 font-mono whitespace-nowrap">
                          {days} hari
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#2D6A4F] dark:text-[#42B07E] whitespace-nowrap">
                            (Sedang Dilihat)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                        Uang saku: {formatIDR(past.initialBalance)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPeriodSummary(past);
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-[#F4F1EA] dark:bg-[#2C2925] rounded-lg transition-colors whitespace-nowrap"
                      >
                        Rapor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectCycle(past.id)}
                        disabled={isSelected}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 disabled:opacity-40 hover:bg-stone-800 transition-colors whitespace-nowrap"
                      >
                        {isSelected ? 'Aktif Terbuka' : 'Buka Arsip'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#EDE9E1] dark:border-[#332F2B]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewCycleSetup();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] text-white hover:bg-[#23563F] shadow-2xs transition-all active:scale-98 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mulai Periode Baru</span>
          </button>

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
