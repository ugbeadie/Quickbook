"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Transaction } from "@/types/transaction";
import { getTransactionsCategory, deleteTransaction } from "@/lib/actions";
import { Spinner } from "@/components/ui/spinner";
import { TransactionGroup } from "@/components/home/TransactionGroup";
import TransactionForm from "@/components/calendar/TransactionForm";
import { format, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

interface CategoryDetailProps {
  category: string;
  type: "income" | "expense";
  period: "weekly" | "monthly" | "annually";
  currentMonth?: string;
  currentYear?: number;
  currentWeek?: Date;
  onBack: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDataChange?: () => void;
  isMobile?: boolean;
}

interface ChartDataProps {
  period: string;
  amount: number;
}

export function CategoryDetail({
  category,
  type,
  period,
  currentMonth,
  currentYear = new Date().getFullYear(),
  currentWeek,
  onBack,
  onEditTransaction,
  onDataChange,
  isMobile = false,
}: CategoryDetailProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartDataProps[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (period === "weekly" && currentWeek) {
      return currentWeek;
    }
    return new Date(
      currentYear,
      currentMonth
        ? new Date(`${currentMonth} 1`).getMonth()
        : new Date().getMonth()
    );
  });

  // Fetch category data when inputs change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getTransactionsCategory(
          category,
          type,
          period,
          currentDate
        );
        setTransactions(data.transactions);
        setChartData(data.chartData);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category, type, period, currentDate]);

  const navigateDate = (direction: "prev" | "next") => {
    if (period === "monthly") {
      setCurrentDate(
        direction === "next"
          ? addMonths(currentDate, 1)
          : subMonths(currentDate, 1)
      );
    } else if (period === "annually") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear() + (direction === "next" ? 1 : -1),
          currentDate.getMonth()
        )
      );
    } else if (period === "weekly") {
      const newWeek = new Date(currentDate);
      newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
      setCurrentDate(newWeek);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        // Re-fetch after delete
        const data = await getTransactionsCategory(
          category,
          type,
          period,
          currentDate
        );
        setTransactions(data.transactions);
        setChartData(data.chartData);

        onDataChange?.();
      } else {
        console.error("Failed to delete transaction:", result.error);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (isMobile) {
      onEditTransaction(transaction);
    } else {
      setEditingTransaction(transaction);
      setShowForm(true);
    }
  };

  const handleFormSave = async () => {
    setShowForm(false);
    setEditingTransaction(null);

    const data = await getTransactionsCategory(
      category,
      type,
      period,
      currentDate
    );
    setTransactions(data.transactions);
    setChartData(data.chartData);

    onDataChange?.();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const getDateDisplay = () => {
    if (period === "weekly") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "MMM dd")} - ${format(
        weekEnd,
        "MMM dd, yyyy"
      )}`;
    } else if (period === "monthly") {
      return format(currentDate, "MMM yyyy");
    } else if (period === "annually") {
      return format(currentDate, "yyyy");
    }
    return "This Week";
  };

  const groupTransactionsByDate = (txns: Transaction[]) => {
    const grouped: Record<string, Transaction[]> = {};

    txns.forEach((transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div
        className={`${
          isMobile ? "fixed inset-0 bg-background z-50" : "w-full"
        } flex items-center justify-center`}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={`${
        isMobile ? "fixed inset-0 bg-background z-50 overflow-y-auto" : "w-full"
      }`}
    >
      <div className="space-y-4 mx-auto max-w-6xl px-4">
        <hr className="border-muted" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 " />
              Back
            </Button>
            <h1 className="text-xl font-bold">{category}</h1>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[120px] text-center">
            {getDateDisplay()}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigateDate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-5 min-h-[70vh]">
          {/* Chart */}
          <Card className="w-full max-h-[70vh]">
            <CardHeader>
              <h3 className="text-lg font-semibold">Spending Trend</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `₦${value.toLocaleString()}`,
                        "Amount",
                      ]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List / Form */}
          <Card className="w-full max-h-[70vh] overflow-auto relative">
            {!showForm || isMobile ? (
              <>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Transactions</h3>
                  <p className="text-sm text-muted-foreground">
                    Total: ₦{totalAmount.toLocaleString()} •{" "}
                    {transactions.length} transaction
                    {transactions.length !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent>
                  {sortedDates.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No transactions found for this period.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {sortedDates.map((date) => (
                        <TransactionGroup
                          key={date}
                          date={date}
                          transactions={groupedTransactions[date]}
                          onEdit={handleEditTransaction}
                          onDelete={handleDeleteTransaction}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <div className="p-4">
                <TransactionForm
                  editingTransaction={editingTransaction}
                  onTransactionSaved={handleFormSave}
                  onCancelEdit={handleFormCancel}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
