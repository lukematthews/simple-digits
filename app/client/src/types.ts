import { AccountSlice } from "./store/slices/AccountSlice";
import { BudgetSlice } from "./store/slices/BudgetSlice";
import { MonthSlice } from "./store/slices/MonthSlice";
import { TransactionSlice } from "./store/slices/TransactionSlice";

export type Transaction = {
  id?: string;
  description: string;
  monthId: string;
  amount: number;
  date: string;
  paid: boolean;
  balance?: number;
};

export type Month = {
  id: string;
  name: string;
  transactions: Transaction[];
  accounts: Account[];
  position: number;
  started: boolean;
  startingBalance: number;
  closingBalance: number;
  shortCode: string;
  fromDate: Date;
  toDate: Date;
};

export type Account = {
  id?: string;
  name: string;
  balance: number;
  monthId: string;
};

export type Budget = {
  id: string;
  name: string;
  shortCode: string;
  months: Month[];
};

export type BudgetSummary = {
  id: string;
  name: string;
  shortCode: string;
};

export type Role = "OWNER" | "EDITOR" | "VIEWER";

export type Store = BudgetSlice & TransactionSlice & MonthSlice & AccountSlice & { reset: () => void };

export interface MonthControlProps {
  months: Month[];
  setMonths: React.Dispatch<React.SetStateAction<Month[]>>;
  activeMonth: string | null;
  setActiveMonth: React.Dispatch<React.SetStateAction<string | null>>;
  setShowTxnModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export type EditableMonthFields = Pick<Month, "started" | "fromDate" | "toDate" | "name">;

export type WsEvent<T> =
  | {
      source: "api" | "frontend";
      entity: string;
      operation: "create";
      payload: Partial<T>;
    }
  | {
      source: "api" | "frontend";
      entity: string;
      operation: "update" | "delete";
      id: string | number;
      payload: Partial<T>;
    };
