import { Card, CardContent } from "./ui/card";

// TransactionHeader.tsx
export default function TransactionHeader() {
  return (
    <Card className="mx-1 px-0 py-1 mb-0 font-semibold text-gray-700 border-b bg-gray-100 transition-colors duration-200 rounded-none">
      <CardContent className="flex justify-start items-center gap-0 px-3 py-1">
        <div className="flex-grow px-1 m-0 min-w-0">Description</div>
        <div className="w-[130px] px-1 m-0">Date</div>
        <div className="w-28 px-1 m-0">Amount</div>
        <div className="flex justify-center px-4 m-0">Paid</div>
        <div className="w-28 px-1 m-0 flex items-center justify-start">Balance</div>
        <div className="flex items-center p-0 m-0 ml-1"></div>
      </CardContent>
    </Card>
  );
}
