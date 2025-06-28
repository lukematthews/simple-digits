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

export interface MonthControlProps {
  months: Month[];
  setMonths: React.Dispatch<React.SetStateAction<Month[]>>;
  activeMonth: string | null;
  setActiveMonth: React.Dispatch<React.SetStateAction<string | null>>;
  setShowTxnModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export type WsEvent<T> =
  | {
      source: "api" | "frontend";
      entity: string;
      operation: "create";
      payload: T;
    }
  | {
      source: "api" | "frontend";
      entity: string;
      operation: "update" | "delete";
      id: string | number;
      payload: T;
    };
