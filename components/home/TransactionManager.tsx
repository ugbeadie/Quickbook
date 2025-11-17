"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { SummaryCards } from "../shared/SummaryCard";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";

export default function TransactionManager() {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  // Handle refresh
  const handleRefresh = () => {
    refresh();
  };

  // Handle editing a transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowMobileForm(true); // Show form on mobile when editing
  };

  // Handle transaction saved (add or edit)
  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    setShowMobileForm(false); // Hide form on mobile after saving
    refresh();
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setShowMobileForm(false); // Hide form on mobile when canceling
  };

  // Handle floating button click
  const handleFloatingButtonClick = () => {
    setEditingTransaction(null); // Clear any editing transaction
    setShowMobileForm(true);
  };

  // Prevent body scroll when mobile form is open - ONLY on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (showMobileForm && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showMobileForm]);

  return (
    <div className="relative">
      <SummaryCards key={`summary-${refreshKey}`} />

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:mt-6 md:h-[60vh]">
        {/* Transaction List */}
        <div>
          <TransactionList
            key={refreshKey}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Transaction Form */}
        <div className="md:h-[60vh]">
          <TransactionForm
            editingTransaction={editingTransaction}
            onTransactionSaved={handleTransactionSaved}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mt-8 mb-5">
        {/* Transaction List - Always visible on mobile */}
        <TransactionList
          key={refreshKey}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
        />

        {/* Floating Plus Button */}
        {!showMobileForm && (
          <Button
            onClick={handleFloatingButtonClick}
            className="fixed bottom-14 right-5 h-12 w-12 rounded-full shadow-lg z-1 cursor-pointer"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Mobile Form Overlay */}
        {showMobileForm && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="p-4">
              <TransactionForm
                editingTransaction={editingTransaction}
                onTransactionSaved={handleTransactionSaved}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
