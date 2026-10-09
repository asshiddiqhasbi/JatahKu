import type { BudgetCycle, HealthEvaluation, RunwayMetrics } from '../types/cycle';
import type { Transaction, TransactionCategory } from '../types/transaction';
import type { CategorySummary } from '../types/report';
import { getDaysPassed, getInclusiveDays, getRemainingDays, getTodayDateString } from './dateUtils';
import { TRANSACTION_CATEGORIES } from '../constants/categories';

export function calculateRunway(
  cycle: BudgetCycle,
  transactions: Transaction[],
  todayStr = getTodayDateString()
): RunwayMetrics {
  const totalDays = getInclusiveDays(cycle.startDate, cycle.endDate);
  const daysPassed = getDaysPassed(cycle.startDate, todayStr);
  const daysRemaining = getRemainingDays(cycle.endDate, todayStr);

  const initialBalance = cycle.initialBalance;
  const emergencyBuffer = cycle.emergencyBuffer || 0;
  const effectiveInitialBalance = Math.max(0, initialBalance - emergencyBuffer);

  let totalExpense = 0;
  let totalIncome = 0;
  let spentToday = 0;

  for (const tx of transactions) {
    if (tx.cycleId !== cycle.id) continue;

    if (tx.type === 'EXPENSE') {
      totalExpense += tx.amount;
      if (tx.date === todayStr) {
        spentToday += tx.amount;
      }
    } else if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    }
  }

  const currentBalance = initialBalance + totalIncome - totalExpense;
  const effectiveCurrentBalance = currentBalance - emergencyBuffer;

  const initialDailyBaseline = totalDays > 0 ? effectiveInitialBalance / totalDays : 0;

  // Safe daily allowance for remaining days (including today)
  const balanceAtStartOfToday = effectiveCurrentBalance + spentToday;
  const nominalTodayAllowance =
    daysRemaining > 0 ? Math.max(0, balanceAtStartOfToday / daysRemaining) : 0;

  const remainingDailyQuotaToday = nominalTodayAllowance - spentToday;
  const safeDailyAllowance = Math.max(0, nominalTodayAllowance);

  const burnRatePercentage =
    initialDailyBaseline > 0
      ? Math.round((nominalTodayAllowance / initialDailyBaseline) * 100)
      : 100;

  const averageDailyExpense =
    daysPassed > 0 ? Math.round(totalExpense / daysPassed) : totalExpense;

  // Evaluate Financial Health with friendly, supportive Indonesian phrasing
  let evaluation: HealthEvaluation;

  if (effectiveCurrentBalance <= 0) {
    evaluation = {
      status: 'CRITICAL',
      label: 'Hemat Keras',
      description:
        effectiveCurrentBalance < 0
          ? 'Uang belanja operasional sudah habis dan mulai memakai tabungan cadangan. Tahan belanja non-pokok.'
          : 'Sisa uang pas di batas tabungan cadangan. Prioritaskan kebutuhan makan pokok saja.',
      colorClass: {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      },
    };
  } else if (remainingDailyQuotaToday < 0 || burnRatePercentage < 60) {
    evaluation = {
      status: 'WARNING',
      label: 'Perlu Waspada',
      description:
        remainingDailyQuotaToday < 0
          ? 'Belanja hari ini sudah melampaui jatah harian. Jatah untuk hari-hari berikutnya sudah otomatis disesuaikan agar tetap cukup.'
          : 'Laju belanja sedikit lebih cepat dari rencana awal. Atur ritme pengeluaran agar akhir bulan tetap tenang.',
      colorClass: {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      },
    };
  } else {
    evaluation = {
      status: 'SAFE',
      label: 'Sangat Aman',
      description: 'Pengeluaran sangat terkendali. Jatah harian aman untuk bertahan sampai akhir bulan.',
      colorClass: {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      },
    };
  }

  return {
    totalDays,
    daysPassed,
    daysRemaining,
    initialBalance,
    emergencyBuffer,
    effectiveInitialBalance,
    totalExpense,
    totalIncome,
    currentBalance,
    effectiveCurrentBalance,
    initialDailyBaseline,
    safeDailyAllowance,
    spentToday,
    remainingDailyQuotaToday,
    burnRatePercentage,
    averageDailyExpense,
    evaluation,
  };
}

export function calculateCategorySummaries(
  transactions: Transaction[],
  cycleId: string
): CategorySummary[] {
  const totals: Record<TransactionCategory, { total: number; count: number }> = {
    Makanan: { total: 0, count: 0 },
    'Kebutuhan Kos': { total: 0, count: 0 },
    Transportasi: { total: 0, count: 0 },
    Kuliah: { total: 0, count: 0 },
    'Hiburan & Sosial': { total: 0, count: 0 },
    Lainnya: { total: 0, count: 0 },
  };

  let grandTotalExpense = 0;

  for (const tx of transactions) {
    if (tx.cycleId === cycleId && tx.type === 'EXPENSE') {
      if (!totals[tx.category]) {
        totals[tx.category] = { total: 0, count: 0 };
      }
      totals[tx.category].total += tx.amount;
      totals[tx.category].count += 1;
      grandTotalExpense += tx.amount;
    }
  }

  return TRANSACTION_CATEGORIES.map((cat) => {
    const item = totals[cat.id] || { total: 0, count: 0 };
    const percentage =
      grandTotalExpense > 0 ? Math.round((item.total / grandTotalExpense) * 100) : 0;

    return {
      category: cat.id,
      total: item.total,
      percentage,
      count: item.count,
    };
  }).sort((a, b) => b.total - a.total);
}
