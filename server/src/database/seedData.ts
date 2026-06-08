import { Account, Transaction } from "../types/banking";
import { dbRun } from "./connection";

const sampleAccounts: Account[] = [
  {
    id: "1",
    accountNumber: "1001",
    accountType: "CHECKING",
    balance: 5000.0,
    accountHolder: "John Doe",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    accountNumber: "1002",
    accountType: "SAVINGS",
    balance: 10000.0,
    accountHolder: "Jane Smith",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

const sampleTransactions: Transaction[] = [
  {
    id: "t1",
    accountId: "1",
    type: "DEPOSIT",
    amount: 1000.0,
    description: "Received salary deposit of $1,000",
    createdAt: "2024-01-15T09:00:00.000Z",
    targetAccountId: null,
  },
  {
    id: "t2",
    accountId: "1",
    type: "WITHDRAWAL",
    amount: 50.0,
    description: "Withdrew $50 from ATM",
    createdAt: "2024-01-16T10:30:00.000Z",
    targetAccountId: null,
  },
  {
    id: "t3",
    accountId: "1",
    type: "TRANSFER",
    amount: 200.0,
    description: "Transferred $200 to savings account",
    createdAt: "2024-01-17T14:15:00.000Z",
    targetAccountId: "2",
  },
  {
    id: "t4",
    accountId: "2",
    type: "DEPOSIT",
    amount: 2000.0,
    description: "Received investment return of $2,000",
    createdAt: "2024-01-15T11:00:00.000Z",
    targetAccountId: null,
  },
  {
    id: "t5",
    accountId: "2",
    type: "WITHDRAWAL",
    amount: 100.0,
    description: "Online purchase debit of $100",
    createdAt: "2024-01-16T15:20:00.000Z",
    targetAccountId: null,
  },
  {
    id: "t6",
    accountId: "2",
    type: "DEPOSIT",
    amount: 500.0,
    description: "Received refund of $500",
    createdAt: "2024-01-17T09:45:00.000Z",
    targetAccountId: null,
  },
];

export const seedSampleData = async () => {
  const insertAccountQuery = `
    INSERT OR REPLACE INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  for (const account of sampleAccounts) {
    await dbRun(insertAccountQuery, [
      account.id,
      account.accountNumber,
      account.accountType,
      account.balance,
      account.accountHolder,
      account.createdAt,
    ]);
  }

  const insertTransactionQuery = `
    INSERT OR REPLACE INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  for (const transaction of sampleTransactions) {
    await dbRun(insertTransactionQuery, [
      transaction.id,
      transaction.accountId,
      transaction.type,
      transaction.amount,
      transaction.description,
      transaction.createdAt,
      transaction.targetAccountId,
    ]);
  }
};
