// TransactionHeader.tsx
export default function TransactionHeader() {
  return (
    <div className="flex justify-between items-center gap-4 px-4 py-2 font-semibold text-gray-700 border-b bg-gray-100">
      <div className="w-1/4">Description</div>
      <div>Date</div>
      <div className="w-32 text-right">Amount</div>
      <div className="w-20 flex justify-center items-center">Paid</div>
      <div className="w-32 text-right">Balance</div>
      <div className="w-12 text-center">Actions</div>
    </div>
  );
}