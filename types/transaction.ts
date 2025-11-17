export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface AddTransactionResult {
  success: boolean;
  error?: string;
}
