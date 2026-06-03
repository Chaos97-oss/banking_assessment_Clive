/**
 * AccountList Component
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Basic error handling
 * - Simple loading state
 * - No skeleton loading
 * - No retry mechanism
 * - No pagination
 * - No sorting/filtering
 * - No animations
 * - No accessibility features
 * - No tests
 *
 * Candidates should consider:
 * - Component structure
 * - Error boundary implementation
 * - Loading states and animations
 * - User feedback
 * - Performance optimization
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Testing strategy
 */

import { useState, useEffect } from "react";
import { Account } from "../types";
import { getAccounts } from "../api";
import { TransactionHistory } from "./TransactionHistory";
import { NewTransactionForm } from "./NewTransactionForm";
import styles from "./AccountList.module.css";

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track selected account for transactions
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  // Trigger to reload transactions list
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAccounts = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
      // Auto-select the first account if none is selected
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(true);
  }, []);

  const handleTransactionSuccess = async () => {
    // Reload accounts to get the latest balances
    await fetchAccounts(false);
    // Increment trigger to reload transaction history
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Failed to Load Data</h3>
        <p>{error}</p>
        <button onClick={() => fetchAccounts(true)} className={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  return (
    <div className={styles.container}>
      <header className={styles.listHeader}>
        <h2>Your Accounts</h2>
        <p className={styles.subtitle}>Select an account to view transactions and perform deposits, withdrawals, or transfers</p>
      </header>

      <div className={styles.grid}>
        {accounts.map((account) => {
          const isSelected = account.id === selectedAccountId;
          return (
            <div
              key={account.id}
              className={`${styles.card} ${isSelected ? styles.cardActive : ""}`}
              onClick={() => setSelectedAccountId(account.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.holderName}>{account.accountHolder}</span>
                <span className={`${styles.typeBadge} ${styles[account.accountType.toLowerCase()]}`}>
                  {account.accountType}
                </span>
              </div>
              <div className={styles.cardNumber}>
                Account #: {account.accountNumber}
              </div>
              <div className={styles.cardBalanceWrapper}>
                <span className={styles.balanceLabel}>Available Balance</span>
                <span className={styles.balanceAmount}>
                  ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                className={`${styles.viewBtn} ${isSelected ? styles.viewBtnActive : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAccountId(account.id);
                }}
              >
                {isSelected ? "Viewing Account" : "View Transactions"}
              </button>
            </div>
          );
        })}
      </div>

      {selectedAccountId && selectedAccount && (
        <div className={styles.detailsSection}>
          <div className={styles.divider}></div>
          <div className={styles.detailsHeader}>
            <h3>Managing Account: <strong>{selectedAccount.accountHolder}</strong></h3>
          </div>
          <div className={styles.transactionGrid}>
            <div className={styles.historyColumn}>
              <TransactionHistory accountId={selectedAccountId} refreshTrigger={refreshTrigger} />
            </div>
            <div className={styles.formColumn}>
              <NewTransactionForm
                accountId={selectedAccountId}
                accounts={accounts}
                onTransactionSuccess={handleTransactionSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
