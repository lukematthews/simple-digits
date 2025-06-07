// // src/components/AccountManager.tsx

// import { useForm, Controller } from "react-hook-form";
// import CurrencyInput from "react-currency-input-field";
// import { useEffect, useState } from "react";
// import { socket } from "../lib/socket";
// import { EditableAccountRow } from "./EditableAccountRow";
// import { Account } from "@/types";

// function formatCurrency(value: number): string {
//   return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);
// }

// export function AccountManagerAside() {
//   const [accounts, setAccounts] = useState<Account[]>([]);

//   const { control, handleSubmit, register, reset } = useForm<{
//     name: string;
//     balance: number;
//   }>({ defaultValues: { name: "", balance: 0 } });

//   // Emit new account creation
//   const onSubmit = (data: { name: string; balance: number }) => {
//     console.log(`Emitting account.add event ${data.name}:${data.balance}`);
//     socket.emit("account", { client: 'frontend', type: "create", data: data });
//     reset();
//   };

//   const deleteAccount = (id: number) => {
//     console.log(`Emitting account.delete event ${id}`);
//     socket.emit("account", { client: 'frontend', type: "delete", data: id });
//   };

//   const updateAccount = (id: number, data: Partial<Account>) => {
//     console.log(`Emitting account.update event ${JSON.stringify({ client: "frontend", type: "update", data: {id: id, ...data} })}`);
//     socket.emit("account", { client: "frontend", type: "update", data: {id: id, ...data} });
//   };

//   useEffect(() => {
//     // Fetch initial data via REST (only once)
//     fetch(import.meta.env.VITE_API_HTTP_URL + "/accounts")
//       .then((res) => res.json())
//       .then((data) => setAccounts(data));

//     // Listen for WebSocket messages
//     socket.on("account", (message) => {
//       console.log(`received account message ${JSON.stringify(message)}`);
//       if (message.client !== 'api') {
//         return;
//       }
//       if (message.type === "create") {
//         setAccounts((prev) => [...prev, message.data]);
//       } else if (message.type === 'delete') {
//         setAccounts((prev) => prev.filter((a) => a.id !== message.data));
//       } else if (message.type === 'update') {
//         setAccounts((prev) => prev.map((a) => (a.id === message.data.id ? message.data : a)));
//       }
//     });

//     return () => {
//       socket.off("account");
//     };
//   }, []);

//   return (
//     <div className="space-y-6">
//       <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
//         <label className="flex items-center gap-2">
//           Name:
//           <input {...register("name", { required: true })} className="border p-1" />
//         </label>

//         <Controller
//           name="balance"
//           control={control}
//           rules={{ required: "Balance is required" }}
//           render={({ field }) => (
//             <label className="flex items-center gap-2">
//               Balance:
//               <CurrencyInput
//                 id="balance"
//                 name="balance"
//                 className="border rounded px-2 py-1 w-full"
//                 decimalsLimit={2}
//                 allowDecimals
//                 allowNegativeValue={false}
//                 intlConfig={{ locale: "en-AU", currency: "AUD" }}
//                 defaultValue={field.value}
//                 onValueChange={(_value, _name, values) => {
//                   field.onChange(values?.float);
//                 }}
//                 onBlur={field.onBlur}
//               />
//             </label>
//           )}
//         />

//         <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
//           Add Account
//         </button>
//       </form>

//       <ul className="space-y-2">
//         {accounts.map((acc) => (
//           <div key={acc.id}>
//             <EditableAccountRow account={acc} onUpdate={updateAccount} onDelete={deleteAccount} />
//           </div>
//         ))}
//       </ul>
//       <span>{formatCurrency(accounts.reduce((sum, acc) => sum + +acc.balance, 0))}</span>
//     </div>
//   );
// }
