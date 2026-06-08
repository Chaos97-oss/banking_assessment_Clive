import { CreateTransactionInput, SortBy, SortOrder, TransactionQuery, TransactionType } from "../types/banking";
import { AppError } from "../utils/AppError";

const transactionTypes: TransactionType[] = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"];
const sortFields: SortBy[] = ["createdAt", "amount", "type"];
const sortOrders: SortOrder[] = ["ASC", "DESC"];

export const parseTransactionQuery = (query: Record<string, unknown>): TransactionQuery => {
  const page = Number.parseInt(String(query.page ?? "1"), 10);
  const limit = Number.parseInt(String(query.limit ?? "10"), 10);
  const sortBy = String(query.sortBy ?? "createdAt") as SortBy;
  const sortOrder = String(query.sortOrder ?? "DESC").toUpperCase() as SortOrder;
  const rawType = query.type ? String(query.type).toUpperCase() : undefined;

  if (page < 1 || limit < 1 || Number.isNaN(page) || Number.isNaN(limit)) {
    throw new AppError(400, "Invalid pagination parameters");
  }

  if (!sortFields.includes(sortBy) || !sortOrders.includes(sortOrder)) {
    throw new AppError(400, "Invalid sorting parameters");
  }

  if (rawType && !transactionTypes.includes(rawType as TransactionType)) {
    throw new AppError(400, "Invalid transaction type filter");
  }

  return {
    page,
    limit,
    type: rawType as TransactionType | undefined,
    sortBy,
    sortOrder,
  };
};

export const validateCreateTransaction = (body: Record<string, unknown>): CreateTransactionInput => {
  const type = body.type as TransactionType;
  const amount = body.amount as number;
  const description = body.description as string;
  const targetAccountId = body.targetAccountId ? String(body.targetAccountId) : undefined;

  if (!transactionTypes.includes(type)) {
    throw new AppError(400, "Invalid transaction type. Must be DEPOSIT, WITHDRAWAL, or TRANSFER.");
  }

  if (typeof amount !== "number" || amount <= 0 || Number.isNaN(amount)) {
    throw new AppError(400, "Amount must be a positive number.");
  }

  if (!description || typeof description !== "string" || description.trim() === "") {
    throw new AppError(400, "Description must be a non-empty string.");
  }

  if (type === "TRANSFER" && !targetAccountId) {
    throw new AppError(400, "Destination account (targetAccountId) is required for transfer transactions.");
  }

  return {
    type,
    amount,
    description: description.trim(),
    targetAccountId,
  };
};
