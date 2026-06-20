
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  CARD_PAYMENT = 'Card',
  DOLLAR_BUY = 'DollarBuy',
  DOLLAR_SELL = 'DollarSell'
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
  dollarAmount?: number;
  dollarRate?: number;
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
