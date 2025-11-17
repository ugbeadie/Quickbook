"use client";

import type React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/transaction";
import { DeleteTransactionModal } from "../shared/DeleteTransModal"; // ← import reusable modal

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  const handleItemClick = () => {
    onEdit(transaction);
  };

  return (
    <div
      className="flex items-center py-3 group cursor-pointer -mx-2 px-2 rounded transition-colors duration-200"
      onClick={handleItemClick}
    >
      {/* Transaction Icon & Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isIncome ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isIncome ? (
            <Plus className="w-3 h-3 text-green-600" />
          ) : (
            <Minus className="w-3 h-3 text-red-600" />
          )}
        </div>
        <div className="md:flex min-w-0 flex-1">
          {transaction.description && (
            <div className="font-medium text-sm truncate">
              {transaction.description}
            </div>
          )}
          <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-0.5 md:ml-2">
            {transaction.category}
          </div>
        </div>
      </div>

      {/* Amount & Delete Button */}
      <div className="flex items-center justify-end gap-1 md:-mr-3">
        <div
          className={`font-semibold text-sm transition-transform duration-200 ${
            isIncome ? "text-green-600" : "text-red-600"
          } group-hover:-translate-x-2`}
        >
          ₦{transaction.amount.toFixed(2)}
        </div>

        {/* Delete Modal Trigger */}
        <div className="md:opacity-0 md:group-hover:opacity-100 md:mr-2 transition-opacity duration-200">
          <DeleteTransactionModal
            transaction={transaction}
            onConfirm={() => onDelete(transaction.id)}
            trigger={
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 relative z-10 cursor-pointer"
                onClick={(e) => e.stopPropagation()} // prevent triggering onEdit
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
