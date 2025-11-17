"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactionSummaryByMonth } from "@/lib/actions";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";
import { Spinner } from "@/components/ui/spinner";
import type { TransactionSummary } from "@/types/transaction";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  colorClass: string;
}

function SummaryCard({
  title,
  value,
  icon,
  loading,
  colorClass,
}: SummaryCardProps) {
  return (
    <>
      {/* Desktop SummaryCard */}
      <Card className="w-full py-2 md:py-3 hidden md:block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${colorClass}`}>
            {loading ? (
              <Spinner />
            ) : (
              <span className={colorClass}>₦{Math.abs(value).toFixed(2)}</span>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Mobile SummaryCard */}
      <Card className="w-full py-2 md:py-3 md:hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardContent>
            <div className="flex items-center justify-center h-8 text-lg md:text-2xl font-bold">
              {loading ? (
                <Spinner />
              ) : (
                <span className={colorClass}>
                  ₦{Math.abs(value).toFixed(2)}
                </span>
              )}
            </div>
          </CardContent>
          <div className="flex-shrink-0">{icon}</div>
        </CardHeader>
      </Card>
    </>
  );
}

export function SummaryCards() {
  const { selectedMonthIndex, selectedYear } = useCalendar();
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        // Use the selected year from calendar context
        const data = await getTransactionSummaryByMonth(
          selectedMonthIndex,
          selectedYear
        );
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedMonthIndex, selectedYear]);

  return (
    <div className="w-full">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-2 w-full">
        <SummaryCard
          title="Balance"
          value={summary.balance}
          icon={<Wallet className="h-4 w-4 text-blue" />}
          loading={loading}
          colorClass={summary.balance >= 0 ? "text-green-600" : "text-red-600"}
        />
        <SummaryCard
          title="Income"
          value={summary.totalIncome}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          loading={loading}
          colorClass="text-green-600"
        />
        <SummaryCard
          title="Expense"
          value={summary.totalExpenses}
          icon={<TrendingDown className="h-4 w-4 text-red-600" />}
          loading={loading}
          colorClass="text-red-600"
        />
      </div>
    </div>
  );
}
