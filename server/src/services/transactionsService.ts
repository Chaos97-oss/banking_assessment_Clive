import { randomUUID } from "crypto";
import {
  Account,
  CreateTransactionInput,
  PaginatedTransactions,
  Transaction,
  TransactionQuery,
} from "../types/banking";
import { AppError } from "../utils/AppError";
import { dbAll, dbGet, dbRun } from "../database/connection";

interface CountRow {
  total: number;
}

const findAccountByIdOrNumber = (accountId: string) => {
  return dbGet<Account>("SELECT * FROM accounts WHERE id = ? OR accountNumber = ?", [accountId, accountId]);
};

export const getTransactionsForAccount = async (
  accountId: string,
  query: TransactionQuery
): Promise<PaginatedTransactions> => {
  const account = await dbGet<Account>("SELECT * FROM accounts WHERE id = ?", [accountId]);

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  const offset = (query.page - 1) * query.limit;
  const filters: unknown[] = [accountId];
  let transactionsQuery = "SELECT * FROM transactions WHERE accountId = ?";
  let countQuery = "SELECT COUNT(*) as total FROM transactions WHERE accountId = ?";

  if (query.type) {
    transactionsQuery += " AND type = ?";
    countQuery += " AND type = ?";
    filters.push(query.type);
  }

  transactionsQuery += ` ORDER BY ${query.sortBy} ${query.sortOrder} LIMIT ? OFFSET ?`;

  const [transactions, totalRow] = await Promise.all([
    dbAll<Transaction>(transactionsQuery, [...filters, query.limit, offset]),
    dbGet<CountRow>(countQuery, filters),
  ]);

  const total = totalRow?.total ?? 0;

  return {
    transactions,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const createTransactionForAccount = async (
  accountId: string,
  input: CreateTransactionInput
): Promise<{ transaction: Transaction; account: Account }> => {
  if (input.type === "TRANSFER" && input.targetAccountId === accountId) {
    throw new AppError(400, "Cannot transfer money to the same account.");
  }

  const sourceAccount = await dbGet<Account>("SELECT * FROM accounts WHERE id = ?", [accountId]);

  if (!sourceAccount) {
    throw new AppError(404, "Source account not found.");
  }

  const targetAccount = input.type === "TRANSFER" && input.targetAccountId
    ? await findAccountByIdOrNumber(input.targetAccountId)
    : undefined;

  if (input.type === "TRANSFER" && !targetAccount) {
    throw new AppError(404, "Destination account not found.");
  }

  if ((input.type === "WITHDRAWAL" || input.type === "TRANSFER") && sourceAccount.balance < input.amount) {
    throw new AppError(400, "Insufficient funds.");
  }

  const transaction: Transaction = {
    id: randomUUID(),
    accountId,
    type: input.type,
    amount: input.amount,
    description: input.description,
    createdAt: new Date().toISOString(),
    targetAccountId: targetAccount?.id ?? null,
  };

  try {
    await dbRun("BEGIN EXCLUSIVE TRANSACTION");

    if (input.type === "DEPOSIT") {
      await updateAccountBalance(accountId, sourceAccount.balance + input.amount);
      await insertTransaction(transaction);
    }

    if (input.type === "WITHDRAWAL") {
      await updateAccountBalance(accountId, sourceAccount.balance - input.amount);
      await insertTransaction(transaction);
    }

    if (input.type === "TRANSFER" && targetAccount) {
      await updateAccountBalance(accountId, sourceAccount.balance - input.amount);
      await updateAccountBalance(targetAccount.id, targetAccount.balance + input.amount);
      await insertTransaction(transaction);
      await insertTransaction({
        id: randomUUID(),
        accountId: targetAccount.id,
        type: "TRANSFER",
        amount: input.amount,
        description: `Received from ${sourceAccount.accountHolder}: ${input.description}`,
        createdAt: transaction.createdAt,
        targetAccountId: accountId,
      });
    }

    await dbRun("COMMIT");
  } catch (err) {
    await dbRun("ROLLBACK");
    throw err;
  }

  const updatedAccount = await dbGet<Account>("SELECT * FROM accounts WHERE id = ?", [accountId]);

  if (!updatedAccount) {
    throw new AppError(500, "Transaction completed but updated account could not be loaded.");
  }

  return { transaction, account: updatedAccount };
};

const updateAccountBalance = (accountId: string, balance: number) => {
  return dbRun("UPDATE accounts SET balance = ? WHERE id = ?", [balance, accountId]);
};

const insertTransaction = (transaction: Transaction) => {
  return dbRun(
    "INSERT INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      transaction.id,
      transaction.accountId,
      transaction.type,
      transaction.amount,
      transaction.description,
      transaction.createdAt,
      transaction.targetAccountId,
    ]
  );
};
