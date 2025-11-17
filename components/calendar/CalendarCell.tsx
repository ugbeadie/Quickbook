"use client";

import type { DayData } from "./TransactionCalendar";

interface CalendarCellProp {
  dayNumber: string;
  data?: DayData;
}

export function CalendarCell({ dayNumber, data }: CalendarCellProp) {
  return (
    <div className="fc-daygrid-day-frame">
      <div className="fc-daygrid-day-top">
        <div className="fc-daygrid-day-number">{dayNumber}</div>
      </div>
      {data && (
        <div className="fc-daygrid-day-events">
          <div className="transaction-summary p-1 text-xs space-y-1">
            {data.income > 0 && (
              <div className="text-green-600 font-medium lg:text-sm">
                ₦{data.income.toLocaleString()}
              </div>
            )}
            {data.expense > 0 && (
              <div className="text-red-600 font-medium lg:text-sm">
                ₦{data.expense.toLocaleString()}
              </div>
            )}
            <div
              className={`font-bold lg:text-sm ${
                data.balance > 0
                  ? "text-green-600"
                  : data.balance < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              ₦{Math.abs(data.balance).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
