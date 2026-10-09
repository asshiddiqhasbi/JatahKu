import type { BudgetCycle, RunwayMetrics } from './cycle';
import type { Transaction, TransactionCategory } from './transaction';

export interface CategorySummary {
  category: TransactionCategory;
  total: number;
  percentage: number;
  count: number;
}

export interface StatementReportData {
  cycle: BudgetCycle;
  metrics: RunwayMetrics;
  categorySummaries: CategorySummary[];
  transactions: Transaction[];
  generatedAt: string;
}
