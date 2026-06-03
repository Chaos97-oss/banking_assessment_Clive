import { useState, useEffect } from "react";
import { Account } from "../types";
import { createTransaction } from "../api";
import styles from "./NewTransactionForm.module.css";

interface NewTransactionFormProps {
  accountId: string;
  accounts: Account[];
  onTransactionSuccess: (updatedAccount: Account) => void;
}

export function NewTransactionForm({ accountId, accounts, onTransactionSuccess }: NewTransactionFormProps) {
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL" | "TRANSFER">("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Filter out the current account for transfers
  const otherAccounts = accounts.filter((acc) => acc.id !== accountId);

  // Reset form when active account changes
  useEffect(() => {
    setType("DEPOSIT");
    setAmount("");
    setDescription("");
    setTargetAccountId("");
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [accountId]);

  // Handle transfer recipient list auto-selection
  useEffect(() => {
    if (type === "TRANSFER" && otherAccounts.length > 0 && !targetAccountId) {
      setTargetAccountId(otherAccounts[0].id);
    }
  }, [type, otherAccounts, targetAccountId]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const amountNum = parseFloat(amount);
    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length < 3) {
      newErrors.description = "Description must be at least 3 characters";
    }

    if (type === "TRANSFER" && !targetAccountId) {
      newErrors.targetAccountId = "Destination account is required";
    }

    // Balance check for withdrawals and transfers (client-side warning)
    const currentAccount = accounts.find((acc) => acc.id === accountId);
    if (currentAccount && (type === "WITHDRAWAL" || type === "TRANSFER") && amountNum > currentAccount.balance) {
      newErrors.amount = `Insufficient funds. Available balance: $${currentAccount.balance.toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        targetAccountId: type === "TRANSFER" ? targetAccountId : undefined,
      };

      const result = await createTransaction(accountId, payload);
      
      setSubmitSuccess("Transaction processed successfully!");
      // Reset inputs except success message
      setAmount("");
      setDescription("");
      
      // Call parent success callback to update balances and lists
      onTransactionSuccess(result.account);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to execute transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Create Transaction</h3>
      
      {submitSuccess && <div className={styles.successBanner}>{submitSuccess}</div>}
      {submitError && <div className={styles.errorBanner}>{submitError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="tx-type" className={styles.label}>Transaction Type</label>
          <select
            id="tx-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as any);
              setSubmitSuccess(null);
              setSubmitError(null);
            }}
            className={styles.select}
            disabled={loading}
          >
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>

        {type === "TRANSFER" && (
          <div className={styles.formGroup}>
            <label htmlFor="tx-target" className={styles.label}>Destination Account</label>
            <select
              id="tx-target"
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              {otherAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountHolder} ({acc.accountType} - #{acc.accountNumber})
                </option>
              ))}
            </select>
            {errors.targetAccountId && <span className={styles.errorText}>{errors.targetAccountId}</span>}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="tx-amount" className={styles.label}>Amount ($)</label>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setSubmitSuccess(null);
            }}
            className={`${styles.input} ${errors.amount ? styles.inputError : ""}`}
            disabled={loading}
          />
          {errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tx-desc" className={styles.label}>Description</label>
          <input
            id="tx-desc"
            type="text"
            placeholder="e.g. Salary, Rent, Grocery"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSubmitSuccess(null);
            }}
            className={`${styles.input} ${errors.description ? styles.inputError : ""}`}
            disabled={loading}
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? (
            <span className={styles.btnContent}>
              <span className={styles.spinner}></span>
              Processing...
            </span>
          ) : (
            "Submit Transaction"
          )}
        </button>
      </form>
    </div>
  );
}
