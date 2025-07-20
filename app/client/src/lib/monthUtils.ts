import { Month } from "@/types";

/**
 * Calculates the starting and closing balances for an array of `Month` objects.
 *
 * Balances are calculated based on the `started` flag for each month:
 *
 * - If a month is **started**, its `startingBalance` is the sum of its account balances,
 *   and its `closingBalance` is the starting balance plus all unpaid transactions.
 *
 * - If a month is **not started**, its `startingBalance` is the previous month's `closingBalance`,
 *   and its `closingBalance` is the starting balance plus all unpaid transactions.
 *
 * The months are first sorted by their `position` field before calculations.
 *
 * @param months - Array of `Month` objects to calculate balances for.
 * @returns The same array of months, with updated `startingBalance` and `closingBalance`.
 *
 * @example
 * const months: Month[] = [
 *   {
 *     id: 'jan',
 *     position: 1,
 *     started: true,
 *     accounts: [{ balance: 1000 }],
 *     transactions: [{ amount: -200, paid: false }, { amount: -50, paid: true }],
 *     startingBalance: 0,
 *     closingBalance: 0,
 *     // ...
 *   },
 *   {
 *     id: 'feb',
 *     position: 2,
 *     started: false,
 *     accounts: [],
 *     transactions: [{ amount: -100, paid: false }],
 *     startingBalance: 0,
 *     closingBalance: 0,
 *     // ...
 *   }
 * ];
 *
 * calculateMonthBalances(months);
 * // Result:
 * // months[0].startingBalance = 1000
 * // months[0].closingBalance = 800  // (1000 - 200) [paid = false]
 * // months[1].startingBalance = 800 // (from Jan)
 * // months[1].closingBalance = 700  // (800 - 100)
 */
export function calculateMonthBalances(months: Month[]) {
  months.sort((a, b) => a.position - b.position);
  months.forEach((month, index) => {
    if (month.started === true) {
      calculateBalancesForStartedMonth(month);
    } else {
      calculateBalancesForNonStartedMonth(month, months, index);
    }
  });
  return months;
}

function calculateBalancesForStartedMonth(month: Month) {
  const startingBalance = month.accounts?.reduce((sum, acc) => sum + +acc.balance!, 0) ?? 0;
  month.startingBalance = startingBalance;
  month.closingBalance = startingBalance + (month.transactions ? month.transactions?.filter((t) => t.paid === false).reduce((sum, trxn) => sum + trxn.amount, 0) : 0);
}

function calculateBalancesForNonStartedMonth(month: Month, months: Month[], index: number) {
  const startingBalance = months.length > 1 ? months[index - 1].closingBalance : 0;
  month.startingBalance = startingBalance;
  month.closingBalance = month.transactions ? startingBalance + month.transactions.filter((t) => t.paid === false).reduce((sum, trxn) => sum + trxn.amount, 0) : startingBalance;
}
