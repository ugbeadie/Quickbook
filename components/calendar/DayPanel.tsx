"use client";

import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import type { DayData } from "@/components/calendar/TransactionCalendar";
import { TransactionItem } from "./TransactionItem";

interface DayPanelProps {
  selectedDate: string | null;
  dayData: DayData | null;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

export function DayPanel({
  selectedDate,
  dayData,
  onClose,
  onEdit,
  onDelete,
  isMobile = false,
}: DayPanelProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString(
      "en-US",
      isMobile
        ? { month: "short", day: "numeric" }
        : { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );
  };

  const containerClass = isMobile
    ? "fixed inset-0 bg-background z-50 flex flex-col"
    : "w-1/3 transition-all duration-300";

  const contentClass = isMobile
    ? ""
    : "h-full flex flex-col border rounded-lg bg-card text-card-foreground shadow-sm";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {isMobile ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold">
                {selectedDate ? formatDate(selectedDate) : "Select Date"}
              </h2>
            </div>
          ) : (
            <h2 className="font-semibold text-lg">
              {selectedDate ? formatDate(selectedDate) : "Select Date"}
            </h2>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            {isMobile ? "Close" : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {dayData ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 text-sm text-center">
                <div>
                  <div className="font-medium">Income</div>
                  <div className="text-green-600">
                    ₦{dayData.income.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Expense</div>
                  <div className="text-red-600">
                    ₦{dayData.expense.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Balance</div>
                  <div
                    className={
                      dayData.balance >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    ₦{Math.abs(dayData.balance).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div
                className={isMobile ? "space-y-3 text-sm" : "space-y-2 text-sm"}
              >
                {dayData.transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              No transactions for this day
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
