import sqlite3 from "sqlite3";
import { Database } from "sqlite3";

export const dbReady = new Promise<void>((resolve, reject) => {
  db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
      reject(err);
      return;
    }

    resolve();
  });
});

export let db: Database;

export const dbRun = (query: string, params: unknown[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = <T>(query: string, params: unknown[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
};

export const dbAll = <T>(query: string, params: unknown[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};
