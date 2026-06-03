/**
 * Banking Dashboard API Server
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Currently uses in-memory SQLite (not persistent)
 * - Basic error handling
 * - No authentication/authorization
 * - No input validation
 * - No rate limiting
 * - No caching
 * - No logging system
 * - No tests
 *
 * Candidates should consider:
 * - Data persistence
 * - Security measures
 * - API documentation
 * - Error handling
 * - Performance optimization
 * - Code organization
 * - Testing strategy
 */

import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { Database } from "sqlite3";

const app = express();
const PORT = 3001;

// Basic middleware setup - Consider additional security middleware
app.use(cors());
app.use(express.json());

// Database setup - Currently using in-memory SQLite for simplicity
// Consider: Production database, connection pooling, error handling
const db: Database = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to in-memory SQLite database");
    initializeDatabase();
  }
});

// Promise wrapper helpers for sqlite3
const dbRun = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Basic database initialization
// Consider: Migration system, seed data management, error handling
function initializeDatabase() {
  const createAccountsTableQuery = `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      accountNumber TEXT UNIQUE,
      accountType TEXT CHECK(accountType IN ('CHECKING', 'SAVINGS')),
      balance REAL,
      accountHolder TEXT,
      createdAt TEXT
    )
  `;

  const createTransactionsTableQuery = `
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
  `;

  db.run(createAccountsTableQuery, (err) => {
    if (err) {
      console.error("Error creating accounts table:", err);
      return;
    }
    console.log("Accounts table created");
    
    db.run(createTransactionsTableQuery, (err) => {
      if (err) {
        console.error("Error creating transactions table:", err);
        return;
      }
      console.log("Transactions table created");
      insertSampleData();
    });
  });
}

// Sample data insertion
// Consider: Data validation, error handling, transaction management
function insertSampleData() {
  const sampleAccounts = [
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

  const insertQuery = `
    INSERT OR REPLACE INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  let completedAccounts = 0;
  sampleAccounts.forEach((account) => {
    db.run(
      insertQuery,
      [
        account.id,
        account.accountNumber,
        account.accountType,
        account.balance,
        account.accountHolder,
        account.createdAt,
      ],
      (err) => {
        if (err) {
          console.error("Error inserting sample account data:", err);
        } else {
          completedAccounts++;
          if (completedAccounts === sampleAccounts.length) {
            insertSampleTransactions();
          }
        }
      }
    );
  });
}

function insertSampleTransactions() {
  const sampleTransactions = [
    // John Doe Transactions
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
    // Jane Smith Transactions
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

  const insertQuery = `
    INSERT OR REPLACE INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  sampleTransactions.forEach((tx) => {
    db.run(
      insertQuery,
      [tx.id, tx.accountId, tx.type, tx.amount, tx.description, tx.createdAt, tx.targetAccountId],
      (err) => {
        if (err) {
          console.error("Error inserting sample transaction data:", err);
        }
      }
    );
  });
  console.log("Sample transaction data seeded");
}

// Basic API routes
// Consider: Input validation, authentication, rate limiting, response formatting
app.get("/api/accounts", (req, res) => {
  db.all("SELECT * FROM accounts", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get("/api/accounts/:id", (req, res) => {
  db.get("SELECT * FROM accounts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json(row);
  });
});

// GET /api/accounts/:id/transactions
app.get("/api/accounts/:id/transactions", async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const typeFilter = req.query.type as string;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = (req.query.sortOrder as string) || "DESC";

  // Validate pagination parameters
  if (page < 1 || limit < 1) {
    res.status(400).json({ error: "Invalid pagination parameters" });
    return;
  }

  // Validate sorting fields to prevent SQL injection
  const allowedSortFields = ["createdAt", "amount", "type"];
  const allowedSortOrders = ["ASC", "DESC"];
  
  if (!allowedSortFields.includes(sortBy) || !allowedSortOrders.includes(sortOrder.toUpperCase())) {
    res.status(400).json({ error: "Invalid sorting parameters" });
    return;
  }

  const offset = (page - 1) * limit;

  try {
    // Check if account exists
    const accountExists = await dbGet("SELECT 1 FROM accounts WHERE id = ?", [id]);
    if (!accountExists) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    // Build SQL query dynamically based on filters
    let query = "SELECT * FROM transactions WHERE accountId = ?";
    let countQuery = "SELECT COUNT(*) as total FROM transactions WHERE accountId = ?";
    const params: any[] = [id];

    if (typeFilter && ["DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(typeFilter.toUpperCase())) {
      query += " AND type = ?";
      countQuery += " AND type = ?";
      params.push(typeFilter.toUpperCase());
    }

    // Add ordering and pagination
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    const queryParams = [...params, limit, offset];

    const [rows, totalRow] = await Promise.all([
      dbAll(query, queryParams),
      dbGet(countQuery, params),
    ]);

    const total = totalRow ? totalRow.total : 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Database error while fetching transactions: " + err.message });
  }
});

// POST /api/accounts/:id/transactions
app.post("/api/accounts/:id/transactions", async (req, res) => {
  const { id } = req.params;
  const { type, amount, description, targetAccountId } = req.body;

  // 1. Input Validation
  if (!type || !["DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(type)) {
    res.status(400).json({ error: "Invalid transaction type. Must be DEPOSIT, WITHDRAWAL, or TRANSFER." });
    return;
  }

  if (typeof amount !== "number" || amount <= 0 || isNaN(amount)) {
    res.status(400).json({ error: "Amount must be a positive number." });
    return;
  }

  if (!description || typeof description !== "string" || description.trim() === "") {
    res.status(400).json({ error: "Description must be a non-empty string." });
    return;
  }

  if (type === "TRANSFER" && !targetAccountId) {
    res.status(400).json({ error: "Destination account (targetAccountId) is required for transfer transactions." });
    return;
  }

  if (type === "TRANSFER" && targetAccountId === id) {
    res.status(400).json({ error: "Cannot transfer money to the same account." });
    return;
  }

  try {
    // 2. Fetch source account
    const sourceAccount = await dbGet("SELECT * FROM accounts WHERE id = ?", [id]);
    if (!sourceAccount) {
      res.status(404).json({ error: "Source account not found." });
      return;
    }

    let targetAccount = null;
    if (type === "TRANSFER") {
      // Find target account (support ID or accountNumber lookup)
      targetAccount = await dbGet("SELECT * FROM accounts WHERE id = ? OR accountNumber = ?", [targetAccountId, targetAccountId]);
      if (!targetAccount) {
        res.status(404).json({ error: "Destination account not found." });
        return;
      }
    }

    // 3. Balance checks
    if ((type === "WITHDRAWAL" || type === "TRANSFER") && sourceAccount.balance < amount) {
      res.status(400).json({ error: "Insufficient funds." });
      return;
    }

    // 4. Perform transaction
    const txId = Math.random().toString(36).substring(2, 11);
    const createdAt = new Date().toISOString();

    try {
      await dbRun("BEGIN EXCLUSIVE TRANSACTION");

      if (type === "DEPOSIT") {
        const newBalance = sourceAccount.balance + amount;
        await dbRun("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, id]);
        await dbRun(
          "INSERT INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [txId, id, type, amount, description, createdAt, null]
        );
      } else if (type === "WITHDRAWAL") {
        const newBalance = sourceAccount.balance - amount;
        await dbRun("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, id]);
        await dbRun(
          "INSERT INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [txId, id, type, amount, description, createdAt, null]
        );
      } else if (type === "TRANSFER" && targetAccount) {
        const newSourceBalance = sourceAccount.balance - amount;
        await dbRun("UPDATE accounts SET balance = ? WHERE id = ?", [newSourceBalance, id]);
        
        const newTargetBalance = targetAccount.balance + amount;
        await dbRun("UPDATE accounts SET balance = ? WHERE id = ?", [newTargetBalance, targetAccount.id]);

        await dbRun(
          "INSERT INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [txId, id, type, amount, description, createdAt, targetAccount.id]
        );

        const rxTxId = Math.random().toString(36).substring(2, 11);
        await dbRun(
          "INSERT INTO transactions (id, accountId, type, amount, description, createdAt, targetAccountId) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [rxTxId, targetAccount.id, "TRANSFER", amount, `Received from ${sourceAccount.accountHolder}: ${description}`, createdAt, id]
        );
      }

      await dbRun("COMMIT");

      const updatedSourceAccount = await dbGet("SELECT * FROM accounts WHERE id = ?", [id]);
      res.status(201).json({
        message: "Transaction completed successfully",
        transaction: {
          id: txId,
          accountId: id,
          type,
          amount,
          description,
          createdAt,
          targetAccountId: targetAccount ? targetAccount.id : null,
        },
        account: updatedSourceAccount,
      });
    } catch (txErr) {
      await dbRun("ROLLBACK");
      throw txErr;
    }
  } catch (err: any) {
    console.error("Database error during transaction processing:", err);
    res.status(500).json({ error: "Failed to process transaction. " + err.message });
  }
});

// Server startup
// Consider: Graceful shutdown, environment configuration, clustering
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
