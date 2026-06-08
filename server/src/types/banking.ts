export type AccountType = "CHECKING" | "SAVINGS";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
export type SortBy = "createdAt" | "amount" | "type";
export type SortOrder = "ASC" | "DESC";

export interface Account {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  accountHolder: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
  targetAccountId: string | null;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  targetAccountId?: string;
}

export interface TransactionQuery {
  page: number;
  limit: number;
  type?: TransactionType;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
