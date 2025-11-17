"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { months } from "@/lib/constants";
import { startOfWeek, endOfMonth } from "date-fns";

interface StatsContextType {
  selectedPeriod: "weekly" | "monthly" | "annually";
  selectedMonth: string;
  selectedYear: number;
  selectedWeek: Date;
  activeTab: "income" | "expense";
  setSelectedPeriod: (period: "weekly" | "monthly" | "annually") => void;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: number) => void;
  setSelectedWeek: (week: Date) => void;
  setActiveTab: (tab: "income" | "expense") => void;
  navigatePeriod: (direction: "prev" | "next") => void;
  goToToday: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "annually"
  >("monthly");
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");

  const handleSetSelectedPeriod = (
    period: "weekly" | "monthly" | "annually"
  ) => {
    if (period === "weekly" && selectedPeriod !== "weekly") {
      const monthIndex = months.indexOf(selectedMonth);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      if (monthIndex === currentMonth && selectedYear === currentYear) {
        // If we're in the current month, start from current week
        setSelectedWeek(new Date());
      } else {
        // If we're in a different month, start from the last week of that month
        const lastDayOfMonth = endOfMonth(new Date(selectedYear, monthIndex));
        const lastWeekOfMonth = startOfWeek(lastDayOfMonth, {
          weekStartsOn: 0,
        });
        setSelectedWeek(lastWeekOfMonth);
      }
    }
    setSelectedPeriod(period);
  };

  const handleSetSelectedMonth = (month: string) => {
    setSelectedMonth(month);
    if (selectedPeriod === "weekly") {
      const monthIndex = months.indexOf(month);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      if (monthIndex === currentMonth && selectedYear === currentYear) {
        // If switching to current month, use current week
        setSelectedWeek(new Date());
      } else {
        // Otherwise, use last week of the selected month
        const lastDayOfMonth = endOfMonth(new Date(selectedYear, monthIndex));
        const lastWeekOfMonth = startOfWeek(lastDayOfMonth, {
          weekStartsOn: 0,
        });
        setSelectedWeek(lastWeekOfMonth);
      }
    }
  };

  const handleSetSelectedYear = (year: number) => {
    setSelectedYear(year);
    if (selectedPeriod === "weekly") {
      const monthIndex = months.indexOf(selectedMonth);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      if (monthIndex === currentMonth && year === currentYear) {
        // If switching to current month/year, use current week
        setSelectedWeek(new Date());
      } else {
        // Otherwise, use last week of the selected month/year
        const lastDayOfMonth = endOfMonth(new Date(year, monthIndex));
        const lastWeekOfMonth = startOfWeek(lastDayOfMonth, {
          weekStartsOn: 0,
        });
        setSelectedWeek(lastWeekOfMonth);
      }
    }
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    if (selectedPeriod === "monthly") {
      const currentMonthIndex = months.indexOf(selectedMonth);
      if (direction === "next") {
        if (currentMonthIndex === 11) {
          setSelectedMonth(months[0]);
          setSelectedYear(selectedYear + 1);
        } else {
          setSelectedMonth(months[currentMonthIndex + 1]);
        }
      } else {
        if (currentMonthIndex === 0) {
          setSelectedMonth(months[11]);
          setSelectedYear(selectedYear - 1);
        } else {
          setSelectedMonth(months[currentMonthIndex - 1]);
        }
      }
    } else if (selectedPeriod === "annually") {
      setSelectedYear(
        direction === "next" ? selectedYear + 1 : selectedYear - 1
      );
    } else if (selectedPeriod === "weekly") {
      const newWeek = new Date(selectedWeek);
      newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
      setSelectedWeek(newWeek);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(months[today.getMonth()]);
    setSelectedYear(today.getFullYear());
    setSelectedWeek(today);
  };

  return (
    <StatsContext.Provider
      value={{
        selectedPeriod,
        selectedMonth,
        selectedYear,
        selectedWeek,
        activeTab,
        setSelectedPeriod: handleSetSelectedPeriod,
        setSelectedMonth: handleSetSelectedMonth,
        setSelectedYear: handleSetSelectedYear,
        setSelectedWeek,
        setActiveTab,
        navigatePeriod,
        goToToday,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}
