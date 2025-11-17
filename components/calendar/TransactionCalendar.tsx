"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type DateClickArg,
} from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import type { Transaction } from "@/types/transaction";
import { getTransactionsByMonth } from "@/lib/actions";
import { useCalendar } from "@/contexts/CalendarContext";
import { months } from "@/lib/constants";
import { CalendarCell } from "./CalendarCell";

export interface DayData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

interface TransactionCalendarProps {
  onDaySelected: (dateStr: string, dayData: DayData | null) => void;
  onAddTransaction?: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

const formatDateForKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const processTransactions = (
  transactions: Transaction[]
): Record<string, DayData> => {
  const grouped: Record<string, DayData> = {};

  transactions.forEach((transaction) => {
    const dateStr = formatDateForKey(new Date(transaction.date));

    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        date: dateStr,
        income: 0,
        expense: 0,
        balance: 0,
        transactions: [],
      };
    }

    grouped[dateStr].transactions.push(transaction);
    if (transaction.type === "income") {
      grouped[dateStr].income += transaction.amount;
    } else {
      grouped[dateStr].expense += transaction.amount;
    }

    grouped[dateStr].balance =
      grouped[dateStr].income - grouped[dateStr].expense;
  });

  return grouped;
};

// Generate year options (current year ± 5 years)
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export default function TransactionCalendar({
  onDaySelected,
}: TransactionCalendarProps) {
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the global calendar context
  const {
    selectedMonth,
    selectedYear,
    selectedMonthIndex,
    setSelectedMonth,
    setSelectedYear,
  } = useCalendar();

  const fetchCalendarData = async (month: number, year: number) => {
    try {
      setLoading(true);
      const transactions = await getTransactionsByMonth(month, year);
      setDayData(processTransactions(transactions));
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedMonth(months[today.getMonth()]);
    setSelectedYear(today.getFullYear());
  };

  const handleDayClick = (info: DateClickArg) => {
    const dateStr = formatDateForKey(new Date(info.date));
    onDaySelected(dateStr, dayData[dateStr] || null);
  };

  useEffect(() => {
    fetchCalendarData(selectedMonthIndex, selectedYear);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      Promise.resolve().then(() => {
        calendarApi.gotoDate(new Date(selectedYear, selectedMonthIndex, 1));
      });
    }
  }, [selectedMonthIndex, selectedYear]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      calendarRef.current?.getApi().updateSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Card className="h-full flex flex-col mb-10 md:mb-8 border-0 shadow-none bg-transparent py-2 ">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-center md:justify-end">
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="max-w-24 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
            >
              <SelectTrigger className="max-w-24 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="max-w-22 cursor-pointer bg-transparent"
              onClick={handleTodayClick}
            >
              <Calendar className="h-4 w-4" />
              Today
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-0">
        <div ref={containerRef} className="w-full h-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={new Date(selectedYear, selectedMonthIndex, 1)}
              dateClick={handleDayClick}
              height="auto"
              headerToolbar={false}
              dayMaxEvents={false}
              moreLinkClick="popover"
              dayHeaderFormat={{ weekday: "short" }}
              dayCellClassNames={(info) =>
                dayData[formatDateForKey(new Date(info.date))]
                  ? "has-transactions"
                  : ""
              }
              dayCellContent={(info) => {
                const dateStr = formatDateForKey(new Date(info.date));
                return (
                  <CalendarCell
                    dayNumber={info.dayNumberText}
                    data={dayData[dateStr]}
                  />
                );
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
