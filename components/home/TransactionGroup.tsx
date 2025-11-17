"use client";

import type { Transaction } from "@/types/transaction";
import { TransactionItem } from "./TransactionItem";

interface TransactionGroupProps {
  date: string;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionGroup({
  date,
  transactions,
  onEdit,
  onDelete,
}: TransactionGroupProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const formattedDate = (() => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const weekdayColorClass =
      weekday === "Sun"
        ? "text-red-600"
        : weekday === "Sat"
        ? "text-blue-600"
        : "text-muted-foreground";
    return (
      <>
        {`${day}/${month}/${year} `}
        <span className={`font-semibold ${weekdayColorClass}`}>
          ({weekday})
        </span>
      </>
    );
  })();

  return (
    <div className="mb-6">
      <div className="flex items-center border-2 border-muted rounded-md px-4 py-2">
        <div className="text-sm font-medium text-muted-foreground flex-1">
          {formattedDate}
        </div>
        <div className="flex justify-end">
          <div className="text-xs font-semibold space-x-3">
            <span className="text-green-600">₦{totalIncome.toFixed(2)}</span>
            <span className="text-red-600">₦{totalExpense.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="[&:not(:last-child)]:border-b [&:not(:last-child)]:border-muted"
          >
            <TransactionItem
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
