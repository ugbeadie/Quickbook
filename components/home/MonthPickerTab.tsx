"use client";
import { MonthPicker } from "./MonthPicker";
import { useCalendar } from "@/contexts/CalendarContext";

export function MonthPickerTab() {
  const { selectedMonth, setSelectedMonth } = useCalendar();

  return (
    <div className="flex justify-between items-center mt-2 mb-2">
      <p className="font-bold text-2xl">Summary</p>
      <MonthPicker selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
    </div>
  );
}
