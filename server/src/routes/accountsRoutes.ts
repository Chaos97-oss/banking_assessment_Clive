import { Router } from "express";
import { getAccountById, listAccounts } from "../services/accountsService";
import { createTransactionForAccount, getTransactionsForAccount } from "../services/transactionsService";
import { AppError } from "../utils/AppError";
import { parseTransactionQuery, validateCreateTransaction } from "../validators/transactions";

export const accountsRouter = Router();

accountsRouter.get("/", async (_req, res) => {
  try {
    res.json(await listAccounts());
  } catch (err) {
    handleRouteError(err, res, "Failed to fetch accounts");
  }
});

accountsRouter.get("/:id", async (req, res) => {
  try {
    res.json(await getAccountById(req.params.id));
  } catch (err) {
    handleRouteError(err, res, "Failed to fetch account");
  }
});

accountsRouter.get("/:id/transactions", async (req, res) => {
  try {
    const query = parseTransactionQuery(req.query);
    res.json(await getTransactionsForAccount(req.params.id, query));
  } catch (err) {
    handleRouteError(err, res, "Database error while fetching transactions");
  }
});

accountsRouter.post("/:id/transactions", async (req, res) => {
  try {
    const input = validateCreateTransaction(req.body);
    const result = await createTransactionForAccount(req.params.id, input);

    res.status(201).json({
      message: "Transaction completed successfully",
      transaction: result.transaction,
      account: result.account,
    });
  } catch (err) {
    handleRouteError(err, res, "Failed to process transaction");
  }
});

const handleRouteError = (err: unknown, res: import("express").Response, fallbackMessage: string) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? `${fallbackMessage}. ${err.message}` : fallbackMessage;
  console.error(fallbackMessage, err);
  res.status(500).json({ error: message });
};
