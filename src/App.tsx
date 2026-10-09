import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { WelcomeSetup } from './components/onboarding/WelcomeSetup';
import { RunwayHero } from './components/dashboard/RunwayHero';
import { BurnRateMetrics } from './components/dashboard/BurnRateMetrics';
import { CategoryBreakdown } from './components/dashboard/CategoryBreakdown';
import { TransactionLedger } from './components/transaction/TransactionLedger';
import { QuickEntryModal } from './components/transaction/QuickEntryModal';
import { CycleConfigModal } from './components/cycle/CycleConfigModal';
import { ExportCenterModal } from './components/export/ExportCenterModal';
import { AuthModal } from './components/auth/AuthModal';

const DashboardContent: React.FC = () => {
  const { isOnboarded, isInitializing } = useBudget();

  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isCycleConfigOpen, setIsCycleConfigOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global keyboard shortcut 'N' for new transaction when onboarded
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOnboarded) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        isQuickEntryOpen ||
        isCycleConfigOpen ||
        isExportOpen
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsQuickEntryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboarded, isQuickEntryOpen, isCycleConfigOpen, isExportOpen]);

  // Layar loading saat inisialisasi sesi login awal agar tidak ada flash onboarding
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#191816] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs animate-pulse">
            <span className="font-bold text-sm tracking-tight">JK</span>
          </div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Menyiapkan data keuangan...
          </p>
        </div>
      </div>
    );
  }

  // If user hasn't set up budget yet, show initial onboarding screen
  if (!isOnboarded) {
    return (
      <>
        <WelcomeSetup onOpenAuth={() => setIsAuthModalOpen(true)} />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#191816] text-stone-900 dark:text-[#F2EFE9] flex flex-col font-sans selection:bg-amber-100 dark:selection:bg-[#3D3833] selection:text-amber-950 dark:selection:text-[#F2EFE9] transition-colors">
      {/* Navbar */}
      <Navbar
        onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        onOpenCycleConfig={() => setIsCycleConfigOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 1. Focal Hero: Daily Safe Allowance & Financial Health */}
        <section aria-label="Jatah Harian Utama">
          <RunwayHero
            onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
            onOpenCycleConfig={() => setIsCycleConfigOpen(true)}
          />
        </section>

        {/* 2. Secondary Metrics Grid */}
        <section aria-label="Metrik Pengeluaran">
          <BurnRateMetrics />
        </section>

        {/* 3. Category Breakdown */}
        <section aria-label="Distribusi Kategori">
          <CategoryBreakdown />
        </section>

        {/* 4. Ledger Transaksi Harian */}
        <section aria-label="Riwayat Transaksi">
          <TransactionLedger onOpenQuickEntry={() => setIsQuickEntryOpen(true)} />
        </section>
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsQuickEntryOpen(true)}
          className="flex items-center justify-center w-13 h-13 rounded-full bg-[#2D6A4F] text-white shadow-lg active:scale-95 transition-transform"
          aria-label="Catat Transaksi"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E7E3DA] dark:border-[#332F2B] py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <p className="font-semibold text-stone-600 dark:text-stone-300">
          JatahKu : Catatan Jatah Harian & Uang Saku Mahasiswa
        </p>
        <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
          Data 100% tersimpan aman di browser pribadi Anda • Bebas pelacak atau server luar
        </p>
      </footer>

      {/* Modals */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
      />
      <CycleConfigModal
        isOpen={isCycleConfigOpen}
        onClose={() => setIsCycleConfigOpen(false)}
      />
      <ExportCenterModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <DashboardContent />
      </BudgetProvider>
    </ThemeProvider>
  );
}
