import { Account } from "../types/banking";
import { AppError } from "../utils/AppError";
import { dbAll, dbGet } from "../database/connection";

export const listAccounts = () => {
  return dbAll<Account>("SELECT * FROM accounts");
};

export const getAccountById = async (id: string) => {
  const account = await dbGet<Account>("SELECT * FROM accounts WHERE id = ?", [id]);

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  return account;
};
