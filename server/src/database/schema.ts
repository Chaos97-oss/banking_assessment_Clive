import { dbRun } from "./connection";
import { seedSampleData } from "./seedData";

export const initializeDatabase = async () => {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      accountNumber TEXT UNIQUE,
      accountType TEXT CHECK(accountType IN ('CHECKING', 'SAVINGS')),
      balance REAL,
      accountHolder TEXT,
      createdAt TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      accountId TEXT,
      type TEXT CHECK(type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
      amount REAL,
      description TEXT,
      createdAt TEXT,
      targetAccountId TEXT,
      FOREIGN KEY(accountId) REFERENCES accounts(id)
    )
  `);

  await seedSampleData();
};
