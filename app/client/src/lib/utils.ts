import { Month } from "@/types";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  return (data as []).reduce((sum, acc) => sum + +acc[field], 0);
}

export function calculateClosingBalance(month: Month, startingBalance: number) {
  const unpaidAmount = month.transactions.filter((trxn) => !trxn.paid).reduce((sum, trxn) => sum + trxn.amount, 0);
  return startingBalance + unpaidAmount;
}

export function setBalances(month: Month): Promise<{ startingBalance: number; closingBalance: number }> {
  const calculate = async (month: Month) => {
    const accountsTotal = calculateTotal(month.accounts, "balance");
    if (month.started || month.position === 1) {
      return { startingBalance: accountsTotal, closingBalance: calculateClosingBalance(month, accountsTotal) };
    } else {
      const previousMonth = await axios.get<Month>(`${import.meta.env.VITE_API_HTTP_URL}/month/position/${month.position - 1}`);
      const previousMonthAccountsTotal = calculateTotal(previousMonth.data.accounts, "balance");
      const previousMonthClosingBalance = calculateClosingBalance(previousMonth.data, previousMonthAccountsTotal);
      return { startingBalance: previousMonthClosingBalance, closingBalance: calculateClosingBalance(month, previousMonthClosingBalance) };
    }
  };
  return calculate(month);
}
