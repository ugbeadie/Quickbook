"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { DeleteTransactionModal } from "../shared/DeleteTransModal";
interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  isMobile = false,
}: TransactionItemProps) {
  const amountColor =
    transaction.type === "income" ? "text-green-600" : "text-red-600";

  return (
    <div
      className={`border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
        isMobile ? "p-4" : "p-3"
      }`}
      onClick={() => onEdit(transaction)}
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium truncate ${
              isMobile ? "text-sm" : "text-sm"
            }`}
          >
            {transaction.description}
          </div>
          <div className="text-sm text-muted-foreground">
            {transaction.category}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`font-medium ${amountColor}`}>
            ₦{transaction.amount.toFixed(2)}
          </div>

          <DeleteTransactionModal
            transaction={transaction}
            onConfirm={() => onDelete(transaction.id)}
            trigger={
              <Button
                size="sm"
                variant="ghost"
                className="h-8 has-[>svg]:px-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
