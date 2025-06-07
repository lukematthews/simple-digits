// src/types.ts

export interface Transaction {
  id: number | null;
  description: string;
  date: string;
  amount: number;
  paid: boolean;
  balance: number | null;
}

export interface Account {
  id: number;
  name: string;
  balance: number | null | undefined;
}

export interface Month {
  id: string;
  name: string;
  started: boolean;
  transactions: Transaction[];
  startingBalance: number;
  closingBalance: number | null;
  accounts: Account[];
  position: number;
}

export interface MonthControlProps {
  months: Month[];
  setMonths: React.Dispatch<React.SetStateAction<Month[]>>;
  activeMonth: string | null;
  setActiveMonth: React.Dispatch<React.SetStateAction<string | null>>;
  setShowTxnModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface TransactionGridProps {
  month: Month;
  months: Month[];
  setMonths: React.Dispatch<React.SetStateAction<Month[]>>;
}
