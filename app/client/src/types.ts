// src/types.ts

export interface Budget {
  id: number;
  name: string;
  months: Month[];
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

export interface Transaction {
  id: number | null;
  description: string;
  date: string;
  amount: number;
  paid: boolean;
  balance: number | null;
  month: Month;
}

export interface Account {
  id: number;
  name: string;
  balance: number | null | undefined;
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

export type WsEvent<T> = {
  source: "api";
  entity: string;
  operation: "create" | "update" | "delete";
  id: string | number;
  payload: T;
};
