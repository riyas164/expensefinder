import { ExpenseItem, IncomeItem, Transaction } from '../types';

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    type: 'expense',
    amount: 85.50,
    description: 'Whole Foods Grocery Market',
    category: 'Food',
    paymentMethod: 'Credit Card',
    date: '2026-10-24',
    createdAt: '2026-10-24T14:20:00Z'
  },
  {
    id: 'exp-2',
    type: 'expense',
    amount: 45.00,
    description: 'Metro Transit Monthly Pass',
    category: 'Transport',
    paymentMethod: 'Debit Card',
    date: '2026-10-22',
    createdAt: '2026-10-22T09:15:00Z'
  },
  {
    id: 'exp-3',
    type: 'expense',
    amount: 120.00,
    description: 'High-speed Fiber Internet & Power',
    category: 'Bills',
    paymentMethod: 'Bank Transfer',
    date: '2026-10-18',
    createdAt: '2026-10-18T11:00:00Z'
  },
  {
    id: 'exp-4',
    type: 'expense',
    amount: 64.99,
    description: 'Nike Running Shorts & Socks',
    category: 'Shopping',
    paymentMethod: 'Credit Card',
    date: '2026-10-15',
    createdAt: '2026-10-15T16:45:00Z'
  },
  {
    id: 'exp-5',
    type: 'expense',
    amount: 32.50,
    description: 'Cinema Tickets & Popcorn',
    category: 'Entertainment',
    paymentMethod: 'UPI',
    date: '2026-10-12',
    createdAt: '2026-10-12T20:10:00Z'
  },
  {
    id: 'exp-6',
    type: 'expense',
    amount: 210.00,
    description: 'Annual Dental Checkup & Cleaning',
    category: 'Health',
    paymentMethod: 'Credit Card',
    date: '2026-10-05',
    createdAt: '2026-10-05T10:30:00Z'
  },
  {
    id: 'exp-7',
    type: 'expense',
    amount: 140.00,
    description: 'Supermarket Household Supplies',
    category: 'Food',
    paymentMethod: 'Debit Card',
    date: '2026-09-28',
    createdAt: '2026-09-28T15:00:00Z'
  },
  {
    id: 'exp-8',
    type: 'expense',
    amount: 55.00,
    description: 'Fuel Refill Shell Station',
    category: 'Transport',
    paymentMethod: 'Credit Card',
    date: '2026-09-20',
    createdAt: '2026-09-20T12:00:00Z'
  },
  {
    id: 'exp-9',
    type: 'expense',
    amount: 115.00,
    description: 'Water & Electricity Utility Bill',
    category: 'Bills',
    paymentMethod: 'Bank Transfer',
    date: '2026-09-10',
    createdAt: '2026-09-10T09:00:00Z'
  },
  {
    id: 'exp-10',
    type: 'expense',
    amount: 95.00,
    description: 'Online Learning Subscription',
    category: 'Education',
    paymentMethod: 'Credit Card',
    date: '2026-09-03',
    createdAt: '2026-09-03T08:00:00Z'
  }
];

export const INITIAL_INCOME: IncomeItem[] = [
  {
    id: 'inc-1',
    type: 'income',
    amount: 4200.00,
    source: 'Salary',
    description: 'Monthly Tech Salary - Oct 2026',
    date: '2026-10-01',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inc-2',
    type: 'income',
    amount: 750.00,
    source: 'Freelance',
    description: 'React Web Development Milestone',
    date: '2026-10-14',
    createdAt: '2026-10-14T17:00:00Z'
  },
  {
    id: 'inc-3',
    type: 'income',
    amount: 4200.00,
    source: 'Salary',
    description: 'Monthly Tech Salary - Sep 2026',
    date: '2026-09-01',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'inc-4',
    type: 'income',
    amount: 500.00,
    source: 'Investment',
    description: 'Quarterly Dividend Payout',
    date: '2026-09-18',
    createdAt: '2026-09-18T10:00:00Z'
  }
];

const STORAGE_KEY_EXPENSES = 'expenseflow_expenses_v1';
const STORAGE_KEY_INCOME = 'expenseflow_income_v1';

export function loadStoredTransactions(): { expenses: ExpenseItem[]; income: IncomeItem[] } {
  try {
    const rawExp = localStorage.getItem(STORAGE_KEY_EXPENSES);
    const rawInc = localStorage.getItem(STORAGE_KEY_INCOME);

    const expenses = rawExp ? JSON.parse(rawExp) : INITIAL_EXPENSES;
    const income = rawInc ? JSON.parse(rawInc) : INITIAL_INCOME;

    return { expenses, income };
  } catch {
    return { expenses: INITIAL_EXPENSES, income: INITIAL_INCOME };
  }
}

export function saveStoredTransactions(expenses: ExpenseItem[], income: IncomeItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    localStorage.setItem(STORAGE_KEY_INCOME, JSON.stringify(income));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#8b5cf6',
  Entertainment: '#06b6d4',
  Health: '#10b981',
  Education: '#6366f1',
  Travel: '#14b8a6',
  Other: '#64748b'
};
