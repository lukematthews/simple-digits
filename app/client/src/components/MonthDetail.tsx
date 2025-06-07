import { Month } from "@/types";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { setBalances } from "@/lib/utils";
import CurrencyInput from "react-currency-input-field";
import { socket } from "@/lib/socket";

type Props = {
  month: Month;
};

export default function MonthDetail({ month }: Props) {
  const [monthStarted, setMonthStarted] = useState<boolean>(month.started);
  const [startingBalance, setStartingBalance] = useState<number>(0);
  const [closingBalance, setClosingBalance] = useState<number>(0);

  interface WebSocketMessage {
    client: "frontend";
    type: "create" | "update" | "delete";
    data: unknown;
  }

  const updateStarted = (started: boolean) => {
    setMonthStarted(started);
    month.started = started;
    socket.emit("month", { type: "update", data: month } as WebSocketMessage);
  };

  useEffect(() => {
    (async () => {
      const balances = await setBalances(month);
      setStartingBalance(balances.startingBalance);
      setClosingBalance(balances.closingBalance);
    })();

    socket.on("month", (message) => {
      console.log(`received month message ${JSON.stringify(message)}`);
      if (message.client !== "api") {
        return;
      }
      if (message.type === "update") {
        month.started = message.data.started;
      }
    });

    socket.on("account", (message) => {
      console.log(`MonthDetail: received account message ${JSON.stringify(message)}`);
      if (message.client !== "api") {
        return;
      }
      const monthForAccount = month.accounts.find((account) => account.id === message.data.id);
      if (monthForAccount) {
        monthForAccount.name = message.data.name;
        monthForAccount.balance = message.data.balance;
        (async () => {
          const balances = await setBalances(month);
          setStartingBalance(balances.startingBalance);
          setClosingBalance(balances.closingBalance);
        })();
      }
    });
  }, [monthStarted, month, month.accounts, month.transactions]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{month.name}</h1>
      <div className="flex">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <Checkbox checked={monthStarted} onCheckedChange={(checked) => updateStarted(Boolean(checked))} />
            <Label>Started</Label>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyInput
              id="startingBalance"
              name="startingBalance"
              className="border rounded px-2 py-1"
              disabled
              fixedDecimalLength={2}
              decimalScale={2}
              intlConfig={{ locale: "en-AU", currency: "AUD" }}
              value={startingBalance}
            ></CurrencyInput>
            <Label>Starting Balance</Label>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyInput
              id="startingBalance"
              name="startingBalance"
              className="border rounded px-2 py-1"
              disabled
              fixedDecimalLength={2}
              decimalScale={2}
              intlConfig={{ locale: "en-AU", currency: "AUD" }}
              value={closingBalance}
            ></CurrencyInput>
            <Label>Closing Balance</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
