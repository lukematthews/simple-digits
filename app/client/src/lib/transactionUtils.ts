import { Month, Transaction } from "@/types";
import axios from "axios";

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

export function calculateTotal(data, field: string) {
  if (!data) {
    return 0;
  }
  return (data as []).reduce((sum, acc) => sum + +acc[field], 0);
}

export function calculateClosingBalance(month: Month, startingBalance: number) {
  const unpaidAmount = month.transactions.filter((trxn) => !trxn.paid).reduce((sum, trxn) => sum + trxn.amount, 0);
  return startingBalance + unpaidAmount;
}

export function setBalances(month: Month): Promise<{ startingBalance: number; closingBalance: number }> {
  const calculate = async (monthParam: Month) => {
    const accountsTotal = calculateTotal(monthParam.accounts, "balance");
    if (monthParam.started || monthParam.position === 1) {
      return { startingBalance: accountsTotal, closingBalance: calculateClosingBalance(monthParam, accountsTotal) };
    } else {
      const previousMonth = await axios.get<Month>(`${import.meta.env.VITE_API_HTTP_URL}/month/position/${monthParam.position - 1}`);
      const previousMonthAccountsTotal = calculateTotal(previousMonth.data.accounts, "balance");
      const previousMonthClosingBalance = calculateClosingBalance(previousMonth.data, previousMonthAccountsTotal);
      return { startingBalance: previousMonthClosingBalance, closingBalance: calculateClosingBalance(month, previousMonthClosingBalance) };
    }
  };
  return calculate(month);
}

export async function calculateTransactionBalances(month: Month, transactions: Transaction[]): Promise<Transaction[]> {
  const balances = await setBalances(month);

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
  let runningBalance = balances.startingBalance;

  return sorted.map((txn) => {
    if (!txn.paid) {
      runningBalance += txn.amount;
    }
    return { ...txn, balance: runningBalance };
  });
}

/*
Calculate starting and closing balances.

Go back to the last started month.

| Month   | Started | Accounts total | Transaction total | unpaid total | Starting | Closing |
| June    | Yes     | $2000          | $-400             | $-200        | $2000    | $1800   |
| July    | No      | $4000          | $-800             | $-800        | $1800    | $1000   |
| August  | No      | $4000          | $-700             | $-700        | $1000    | $300    |


*/