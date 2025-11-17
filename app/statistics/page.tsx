"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  getStatsData,
  type StatsData,
  type CategoryStats,
} from "@/lib/actions";
import { months } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";
import { TransactionChart } from "@/components/stats/TransactionChart";
import { CategoryList } from "@/components/stats/CategoryList";
import { CategoryDetail } from "@/components/stats/CategoryDetail";
import { useStats } from "@/contexts/StatsContext";
import type { Transaction } from "@/types/transaction";
import TransactionForm from "@/components/calendar/TransactionForm";
import { format, startOfWeek, endOfWeek } from "date-fns";

const periodOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

export default function StatsPage() {
  const [statsData, setStatsData] = useState<StatsData>({
    totalIncome: 0,
    totalExpenses: 0,
    incomeByCategory: [],
    expensesByCategory: [],
    dateRange: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Use the global stats context
  const {
    selectedPeriod,
    selectedMonth,
    selectedYear,
    selectedWeek,
    activeTab,
    setSelectedPeriod,
    setActiveTab,
    navigatePeriod,
    goToToday,
  } = useStats();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // useCallback to fix missing dependency warning
  const fetchStatsData = useCallback(async () => {
    setLoading(true);
    try {
      const monthIndex = months.indexOf(selectedMonth);

      const data = await getStatsData(
        selectedPeriod,
        selectedPeriod === "monthly" ? monthIndex : undefined,
        selectedYear,
        selectedPeriod === "weekly" ? selectedWeek : undefined
      );
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch stats data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedMonth, selectedYear, selectedWeek]);

  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  const currentData =
    activeTab === "income"
      ? statsData.incomeByCategory
      : statsData.expensesByCategory;
  const currentTotal =
    activeTab === "income" ? statsData.totalIncome : statsData.totalExpenses;

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBackFromDetail = () => {
    setSelectedCategory(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    fetchStatsData(); // Refresh data
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const getCurrentPeriodDisplay = () => {
    if (selectedPeriod === "weekly") {
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 }); // Sunday
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 }); // Saturday

      const startFormatted = format(weekStart, "MMM dd, yyyy");
      const endFormatted = format(weekEnd, "MMM dd, yyyy");

      return `${startFormatted} - ${endFormatted}`;
    } else if (selectedPeriod === "monthly") {
      return `${selectedMonth} ${selectedYear}`;
    } else {
      return selectedYear.toString();
    }
  };

  // Show transaction form
  if (editingTransaction) {
    return (
      <div
        className={`${
          isMobile
            ? "fixed inset-0 bg-background z-50 overflow-y-auto"
            : "container mx-auto p-4 max-w-4xl"
        }`}
      >
        <div className="p-4">
          <TransactionForm
            editingTransaction={editingTransaction}
            onTransactionSaved={handleTransactionSaved}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>
    );
  }

  // Show category detail view
  if (selectedCategory) {
    return (
      <CategoryDetail
        category={selectedCategory}
        type={activeTab}
        period={selectedPeriod}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        currentWeek={selectedWeek}
        onBack={handleBackFromDetail}
        onEditTransaction={handleEditTransaction}
        onDataChange={fetchStatsData} // Refresh stats data when transaction is deleted
        isMobile={isMobile}
      />
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 mb-12 md:mb-6">
        <hr className="border-muted" />

        <div className="space-y-6 mt-2">
          {/* Header with filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start justify-center md:justify-between">
            <div className="flex items-center justify-center gap-4 ">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => navigatePeriod("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[120px] text-center">
                {getCurrentPeriodDisplay()}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => navigatePeriod("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 ">
              <Select
                value={selectedPeriod}
                onValueChange={(value: "weekly" | "monthly" | "annually") =>
                  setSelectedPeriod(value)
                }
              >
                <SelectTrigger className="w-32 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="flex items-center gap-2 bg-transparent cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                Today
              </Button>
            </div>
          </div>

          {/* Income/Expense Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "income" | "expense")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="income"
                className="flex items-center gap-2 cursor-pointer"
              >
                Income
                <span className="text-sm font-medium">
                  ₦{statsData.totalIncome.toLocaleString()}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                className="flex items-center gap-2 cursor-pointer"
              >
                Expense
                <span className="text-sm font-medium">
                  ₦{statsData.totalExpenses.toLocaleString()}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <StatsContent
                data={currentData}
                total={currentTotal}
                loading={loading}
                type={activeTab}
                onCategoryClick={handleCategoryClick}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

interface StatsContentProps {
  data: CategoryStats[];
  total: number;
  loading: boolean;
  type: "income" | "expense";
  onCategoryClick: (category: string) => void;
}

function StatsContent({
  data,
  loading,
  type,
  onCategoryClick,
}: StatsContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No {type} data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <h3
            className={`text-lg font-semibold capitalize ${
              type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {type} by Category
          </h3>
        </CardHeader>
        <CardContent className="px-0">
          <TransactionChart data={data} onCategoryClick={onCategoryClick} />
        </CardContent>
      </Card>

      {/* Category List */}
      <Card>
        <CardHeader className="px-2 md:px-6">
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          <CategoryList data={data} onCategoryClick={onCategoryClick} />
        </CardContent>
      </Card>
    </div>
  );
}
