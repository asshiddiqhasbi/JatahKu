export interface BudgetCycle {
  id: string;
  userName: string; // Nama mahasiswa/anak kos untuk kop laporan resmi
  startDate: string; // Format YYYY-MM-DD
  endDate: string; // Format YYYY-MM-DD
  initialBalance: number; // Saldo awal siklus (Rp)
  emergencyBuffer: number; // Dana cadangan darurat tak tersentuh (Rp)
  notes?: string;
  createdAt: string;
}

export type HealthStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface HealthEvaluation {
  status: HealthStatus;
  label: string; // "Aman", "Waspada", "Hemat Keras"
  description: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

export interface RunwayMetrics {
  totalDays: number;
  daysPassed: number;
  daysRemaining: number;
  initialBalance: number;
  emergencyBuffer: number;
  effectiveInitialBalance: number; // initialBalance - emergencyBuffer
  totalExpense: number;
  totalIncome: number;
  currentBalance: number; // initialBalance + totalIncome - totalExpense
  effectiveCurrentBalance: number; // currentBalance - emergencyBuffer
  initialDailyBaseline: number; // effectiveInitialBalance / totalDays
  safeDailyAllowance: number; // effectiveCurrentBalance / daysRemaining
  spentToday: number;
  remainingDailyQuotaToday: number; // safeDailyAllowance - spentToday
  burnRatePercentage: number; // (safeDailyAllowance / initialDailyBaseline) * 100
  averageDailyExpense: number; // totalExpense / max(1, daysPassed)
  evaluation: HealthEvaluation;
}
