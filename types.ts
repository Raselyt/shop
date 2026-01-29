
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  userId: string; // ট্রানজ্যাকশনটি কোন ইউজারের তা চেনার জন্য
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
