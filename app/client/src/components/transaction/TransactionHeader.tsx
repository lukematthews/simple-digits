import { Card, CardContent } from "../ui/card";

export default function TransactionHeader() {
  return (
    <Card className="mx-1 px-0 py-1 mb-0 font-semibold text-gray-700 border-b bg-gray-100 transition-colors duration-200 rounded-none">
      <CardContent className="px-3 py-1">
        <div className="grid grid-cols-[1fr_130px_7rem_60px_7rem_32px] items-center gap-x-2">
          <div>Description</div>
          <div>Date</div>
          <div>Amount</div>
          <div className="text-center">Paid</div>
          <div>Balance</div>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
}
