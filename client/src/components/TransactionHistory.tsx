import { useState, useEffect } from "react";
import { Transaction, PaginationMeta } from "../types";
import { getTransactions } from "../api";
import styles from "./TransactionHistory.module.css";

interface TransactionHistoryProps {
  accountId: string;
  refreshTrigger: number; // Increment this to force-reload transactions
}

export function TransactionHistory({ accountId, refreshTrigger }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset to page 1 if account changes
    setPage(1);
  }, [accountId]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactions(accountId, page, pagination.limit, typeFilter, sortBy, sortOrder);
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, page, typeFilter, sortBy, sortOrder, refreshTrigger]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
    setPage(1); // Reset to page 1 on sort change
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "WITHDRAWAL" || type === "TRANSFER" ? "-" : "+";
    const className = type === "WITHDRAWAL" || type === "TRANSFER" ? styles.debit : styles.credit;
    return <span className={className}>{sign}${amount.toFixed(2)}</span>;
  };

  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "DESC" ? " ↓" : " ↑";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Transaction History</h3>
        
        <div className={styles.filters}>
          <label htmlFor="type-filter" className={styles.label}>Filter:</label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className={styles.select}
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>Error: {error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.empty}>No transactions found for this account.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => toggleSort("createdAt")} className={styles.sortableHeader}>
                    Date {renderSortIndicator("createdAt")}
                  </th>
                  <th>Type</th>
                  <th>Description</th>
                  <th onClick={() => toggleSort("amount")} className={`${styles.sortableHeader} ${styles.amountHeader}`}>
                    Amount {renderSortIndicator("amount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className={styles.row}>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[tx.type.toLowerCase()]}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.description}</td>
                    <td className={styles.amountCell}>{formatAmount(tx.amount, tx.type)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={styles.pageBtn}
                aria-label="Previous Page"
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page <strong>{page}</strong> of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className={styles.pageBtn}
                aria-label="Next Page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
