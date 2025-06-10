import { Month } from "@/types";

export async function calculateMonthBalances(months: Month[]) {
//   const months = await this.monthRepo.find({ order: { position: "ASC" } });
  const balances: {
    month: Month;
    startingBalance: number;
    closingBalance: number;
  }[] = months.sort((a, b) => a.position - b.position).map((month: Month) => {
    return { month: month, startingBalance: 0, closingBalance: 0 };
  });

  balances.forEach((item, index) => {
    if (item.month.started === true) {
      calculateBalancesForStartedMonth(item);
    } else {
      calculateBalancesForNonStartedMonth(item, balances, index);
    }
  });
  return balances;
}

function calculateBalancesForStartedMonth(item: { month: Month; startingBalance: number; closingBalance: number }) {
  const startingBalance = item.month.accounts.reduce((sum, acc) => sum + +acc.balance!, 0);
  item.startingBalance = startingBalance;
  item.closingBalance = startingBalance + item.month.transactions.filter((t) => t.paid === false).reduce((sum, trxn) => sum + trxn.amount, 0);
}

function calculateBalancesForNonStartedMonth(
  item: {
    month: Month;
    startingBalance: number;
    closingBalance: number;
  },
  balances: {
    month: Month;
    startingBalance: number;
    closingBalance: number;
  }[],
  index: number
) {
  const startingBalance = balances[index - 1].closingBalance;
  item.startingBalance = startingBalance;
  item.closingBalance = startingBalance + item.month.transactions.filter((t) => t.paid === false).reduce((sum, trxn) => sum + trxn.amount, 0);
}
