"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { getTransactionsByMonth, deleteTransaction } from "@/lib/actions";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { useCalendar } from "@/contexts/CalendarContext";
import { TransactionGroup } from "./TransactionGroup";

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionList({ onEdit, onRefresh }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedMonthIndex, selectedMonth } = useCalendar();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const data = await getTransactionsByMonth(
        selectedMonthIndex,
        currentYear
      );
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transactions", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonthIndex]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast.error("Transaction deleted!", {
          duration: 3000,
          icon: <Trash2 className="text-red-600" size={18} />,
          description: "The transaction has been removed successfully.",
        });
        onRefresh(); // refresh parent component
      } else {
        toast.error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("An error occurred while deleting the transaction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 h-[600px]">
        <Spinner />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <div className="flex-1 flex items-center">
          <p className="text-muted-foreground text-sm text-center">
            No transactions for {selectedMonth}. Add your first transaction!
          </p>
        </div>
      </div>
    );
  }

  // Group transactions
  const groupedTransactions = transactions.reduce(
    (groups: Record<string, Transaction[]>, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  Object.keys(groupedTransactions).forEach((date) => {
    groupedTransactions[date].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalIncomes = transactions.filter((t) => t.type === "income").length;
  const totalExpenses = transactions.filter((t) => t.type === "expense").length;

  return (
    <div className="md:h-[60vh] flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <p className="text-muted-foreground text-sm mb-6">
          You have{" "}
          <span className="font-semibold">
            {totalIncomes} {totalIncomes > 1 ? "incomes" : "income"}
          </span>{" "}
          and{" "}
          <span className="font-semibold">
            {totalExpenses} {totalExpenses > 1 ? "expenses" : "expense"}
          </span>{" "}
          in {selectedMonth}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-0">
          {sortedDates.map((date) => (
            <TransactionGroup
              key={date}
              date={date}
              transactions={groupedTransactions[date]}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
