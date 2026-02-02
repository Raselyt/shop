
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  CARD_PAYMENT = 'Card'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // This will act as the "Net" amount (actual income)
  grossAmount?: number; // Optional field for Card payments
  type: TransactionType;
  category: string;
  date: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface DailyStats {
  date: string;
  income: number;
  expense: number;
}
