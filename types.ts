export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO Date string
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export type View = 'dashboard' | 'transactions' | 'settings';

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Rent', 'Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health'],
};

export type BudgetMap = Record<string, number>;