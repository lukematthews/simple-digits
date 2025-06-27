import { Month, Transaction } from "@/types";

export function getLocalDateString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

export function calculateClosingBalance(month: Month, startingBalance: number) {
  const unpaidAmount = month.transactions.filter((trxn) => !trxn.paid).reduce((sum, trxn) => sum + trxn.amount, 0);
  return startingBalance + unpaidAmount;
}

export function calculateTransactionBalances(month: Month, transactions: Transaction[]): Transaction[] {
  if (!transactions) {
    return [];
  }

  // Clone and sort transactions
  const sorted = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB; // earlier date first
    }

    return b.amount - a.amount; // for same date, higher amount first
  });

  // Calculate running balance
  let runningBalance = month.startingBalance;

  return sorted.map((txn) => {
    if (!txn.paid) {
      runningBalance += txn.amount;
    }
    return { ...txn, balance: runningBalance };
  });
}
