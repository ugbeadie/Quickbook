"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { months } from "@/lib/constants";

interface CalendarContextType {
  selectedMonth: string;
  selectedYear: number;
  selectedMonthIndex: number;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: number) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const selectedMonthIndex = months.indexOf(selectedMonth);

  return (
    <CalendarContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        selectedMonthIndex,
        setSelectedMonth,
        setSelectedYear,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
