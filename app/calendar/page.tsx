"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { SummaryCards } from "@/components/shared/SummaryCard";
import TransactionForm from "@/components/calendar/TransactionForm";
import TransactionCalendar from "@/components/calendar/TransactionCalendar";
import type { DayData } from "@/components/calendar/TransactionCalendar";
import { DayPanel } from "@/components/calendar/DayPanel";
import { deleteTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { CalendarProvider, useCalendar } from "@/contexts/CalendarContext";

function CalendarContent() {
  const { selectedMonthIndex, selectedYear } = useCalendar();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCalendarPanel, setShowCalendarPanel] = useState(false);
  const [selectedDateForPanel, setSelectedDateForPanel] = useState<
    string | null
  >(null);
  const [selectedDayDataForPanel, setSelectedDayDataForPanel] =
    useState<DayData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const resetState = () => {
    setEditingTransaction(null);
    setShowForm(false);
    setShowCalendarPanel(false);
    setSelectedDateForPanel(null);
    setSelectedDayDataForPanel(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    setShowCalendarPanel(false);
  };

  const handleTransactionSaved = () => {
    resetState();
    setRefreshKey((prev) => prev + 1);
  };

  const handleFloatingButtonClick = () => {
    setEditingTransaction(null);
    setShowForm(true);
    setShowCalendarPanel(false);
  };

  const openDayDetailsPanel = (dateStr: string, dayData: DayData | null) => {
    setSelectedDateForPanel(dateStr);
    setSelectedDayDataForPanel(dayData);
    setShowCalendarPanel(true);
    setShowForm(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result?.success) {
        setSelectedDayDataForPanel((prev) => {
          if (!prev) return prev;

          const newTxs = prev.transactions.filter((t) => t.id !== id);
          if (newTxs.length === 0) return null;

          const income = newTxs
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0);
          const expense = newTxs
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + t.amount, 0);

          return {
            ...prev,
            transactions: newTxs,
            income,
            expense,
            balance: income - expense,
          };
        });

        setRefreshKey((prev) => prev + 1);
        toast.success("Transaction deleted successfully");
      } else {
        toast.error(result?.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("An error occurred while deleting the transaction");
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    document.body.style.overflow =
      (showForm || showCalendarPanel) && isMobile ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showForm, showCalendarPanel]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <hr className="border-muted" />
      <h1 className="font-bold text-2xl mt-1">Summary</h1>
      <SummaryCards
        key={`summary-${refreshKey}-${selectedMonthIndex}-${selectedYear}`}
      />

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-4 mt-4 h-[calc(100vh-200px)]">
        <div
          className={`transition-all duration-300 ${
            showCalendarPanel || showForm ? "w-2/3" : "w-full"
          }`}
        >
          <TransactionCalendar
            key={`calendar-${refreshKey}`}
            onDaySelected={openDayDetailsPanel}
          />
        </div>

        {/* Desktop Panels */}
        {showCalendarPanel && !showForm && (
          <DayPanel
            selectedDate={selectedDateForPanel}
            dayData={selectedDayDataForPanel}
            onClose={() => setShowCalendarPanel(false)}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}

        {showForm && (
          <div className="w-1/3 transition-all duration-300">
            <div className="h-full flex flex-col border rounded-lg bg-card text-card-foreground shadow-sm">
              <div className="flex-1 overflow-y-auto p-4">
                <TransactionForm
                  editingTransaction={editingTransaction}
                  onTransactionSaved={handleTransactionSaved}
                  onCancelEdit={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mt-6">
        {!showCalendarPanel && !showForm && (
          <TransactionCalendar
            key={`calendar-mobile-${refreshKey}`}
            onDaySelected={openDayDetailsPanel}
          />
        )}

        {showCalendarPanel && !showForm && (
          <DayPanel
            selectedDate={selectedDateForPanel}
            dayData={selectedDayDataForPanel}
            onClose={() => setShowCalendarPanel(false)}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            isMobile
          />
        )}

        {showForm && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="p-4">
              <TransactionForm
                editingTransaction={editingTransaction}
                onTransactionSaved={handleTransactionSaved}
                onCancelEdit={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Button */}
      {!showForm && (
        <Button
          onClick={handleFloatingButtonClick}
          className="fixed bottom-14 right-6 md:bottom-10 md:right-10 h-12 w-12 rounded-full shadow-lg z-1 cursor-pointer"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  );
}
