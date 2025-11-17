"use client";
import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addTransaction, updateTransaction } from "@/lib/actions";
import { PlusCircle, MinusCircle, FilePenLine, X } from "lucide-react";
import type { TransactionType, Transaction } from "@/types/transaction";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  onTransactionSaved?: () => void;
  onCancelEdit?: () => void;
}

export function TransactionForm({
  editingTransaction,
  onTransactionSaved,
  onCancelEdit,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!editingTransaction;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //convert the date to a local date string formatted as YYYY-MM-DD
  function getLocalDateISO(): string {
    const local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().split("T")[0];
  }

  // Get categories based on current type
  const categories = useMemo(() => {
    const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return cats;
  }, [type]);

  // Handle editing transaction - set both type and category
  useEffect(() => {
    if (!editingTransaction) {
      resetFormState();
      return;
    }

    // Set type and category immediately
    setType(editingTransaction.type);
    setCategory(editingTransaction.category);
    setShowTypeChangeWarning(false);
    setError(null);

    // Populate form fields immediately
    populateFormFields(editingTransaction);
  }, [editingTransaction]);

  // Helper functions
  const populateFormFields = (transaction: Transaction) => {
    const form = formRef.current;
    if (!form) return;
    (form.amount as HTMLInputElement).value = transaction.amount.toString();
    (form.description as HTMLTextAreaElement).value =
      transaction.description || "";
    (form.imageUrl as HTMLInputElement).value = transaction.imageUrl || "";
    (form.date as HTMLInputElement).value = transaction.date
      .toISOString()
      .split("T")[0];
  };

  const resetFormState = () => {
    setType("expense");
    setCategory("");
    setShowTypeChangeWarning(false);
    setError(null);
    formRef.current?.reset();
  };

  const showSuccessToast = (isEdit: boolean) => {
    const config = isEdit
      ? {
          message: "Transaction updated!",
          icon: <FilePenLine className="text-green-600" size={18} />,
          description: "Your changes have been saved successfully.",
        }
      : {
          message: "Transaction added!",
          icon: <PlusCircle className="text-green-600" size={18} />,
          description: "A new transaction has been recorded.",
        };

    toast.success(config.message, {
      duration: 3000,
      icon: config.icon,
      description: config.description,
    });
  };

  const handleTypeChange = (newType: TransactionType) => {
    if (newType === type) return;
    setType(newType);
    setCategory("");
    setError(null);
    setShowTypeChangeWarning(isEditing && newType !== editingTransaction?.type);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setError(null);
    setShowTypeChangeWarning(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!category) {
      setError("Please select a category before saving.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("category", category);

    try {
      // Add ID for editing
      if (isEditing && editingTransaction) {
        formData.set("id", editingTransaction.id);
      }

      const result =
        isEditing && editingTransaction
          ? await updateTransaction(formData)
          : await addTransaction(formData);

      if (!result.success) {
        setError(
          result.error ||
            `Failed to ${isEditing ? "update" : "add"} transaction`
        );
        return;
      }

      showSuccessToast(isEditing);
      if (!isEditing) {
        resetFormState();
      }
      onTransactionSaved?.(); // This calls handleTransactionSaved which uses handleRefresh
    } catch (error) {
      console.error("Error submitting transaction:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetFormState();
    onCancelEdit?.();
  };

  return (
    <Card className="border-none shadow-none py-0 bg-transparent md:h-[60vh]">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </CardTitle>
          {(isMobile || isEditing) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          {isEditing
            ? "Something not quite right? Let's fix it."
            : "Let's get this on the books!"}
        </p>
      </CardHeader>
      <CardContent className="px-0 overflow-y-auto scrollbar-hide">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className="flex-1 cursor-pointer"
              onClick={() => handleTypeChange("income")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Income
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className="flex-1 cursor-pointer"
              onClick={() => handleTypeChange("expense")}
            >
              <MinusCircle className="w-4 h-4 mr-2" />
              Expense
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              required
              value={category}
              onValueChange={handleCategoryChange}
              key={category + type} // Force re-render when category or type changes
            >
              <SelectTrigger
                className={`${
                  !category ? "text-muted-foreground" : ""
                } cursor-pointer`}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="cursor-pointer">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Type change warning */}
            {showTypeChangeWarning && !category && (
              <div className="text-sm text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                  <span>
                    Transaction type changed to <strong>{type}</strong>. Please
                    select a new category.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={getLocalDateISO()}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add a note about this transaction..."
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Receipt/Photo URL (Optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/receipt.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Add a link to a receipt or photo for this transaction
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300 p-3 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? `${isEditing ? "Updating" : "Saving"}...`
                : `${isEditing ? "Update" : "Save"} Transaction`}
            </Button>
            {(isMobile || isEditing) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="cursor-pointer bg-transparent"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
