"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Minus, Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  onConfirm: () => void;
  trigger: React.ReactNode;
}

export function DeleteTransactionModal({
  transaction,
  onConfirm,
  trigger,
}: DeleteTransactionDialogProps) {
  const isIncome = transaction.type === "income";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
            <div className="mt-3 p-3 bg-muted rounded-md text-center">
              <div className="flex justify-center items-center gap-2 text-sm font-medium">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isIncome ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {isIncome ? (
                    <Plus className="w-2 h-2 text-green-600" />
                  ) : (
                    <Minus className="w-2 h-2 text-red-600" />
                  )}
                </div>
                ₦{transaction.amount.toFixed(2)} • {transaction.category}
              </div>
              {transaction.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {transaction.description}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
