import { Account, PaginatedTransactions, Transaction } from "./types";

const API_URL = "http://localhost:3001/api";

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(`${API_URL}/accounts`);
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
};

export const getAccount = async (id: string): Promise<Account> => {
  const response = await fetch(`${API_URL}/accounts/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }
  return response.json();
};

export const getTransactions = async (
  accountId: string,
  page: number = 1,
  limit: number = 10,
  type?: string,
  sortBy: string = "createdAt",
  sortOrder: string = "DESC"
): Promise<PaginatedTransactions> => {
  let url = `${API_URL}/accounts/${accountId}/transactions?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  if (type && type !== "ALL") {
    url += `&type=${type}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch transactions");
  }
  return response.json();
};

export interface CreateTransactionPayload {
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  targetAccountId?: string;
}

export const createTransaction = async (
  accountId: string,
  payload: CreateTransactionPayload
): Promise<{ message: string; transaction: Transaction; account: Account }> => {
  const response = await fetch(`${API_URL}/accounts/${accountId}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create transaction");
  }
  return response.json();
};
