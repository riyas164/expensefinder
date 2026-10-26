export type TransactionType = 'expense' | 'income';

export interface ExpenseItem {
  id: string;
  type: 'expense';
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  date: string;
  createdAt: string;
}

export interface IncomeItem {
  id: string;
  type: 'income';
  amount: number;
  source: string;
  description: string;
  date: string;
  createdAt: string;
}

export type Transaction = ExpenseItem | IncomeItem;

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface GcpDeployConfig {
  projectId: string;
  serviceName: string;
  region: string;
  hostingMethod: 'cloud-run' | 'app-engine' | 'cloud-storage' | 'firebase';
}
