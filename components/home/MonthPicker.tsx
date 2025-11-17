"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { months } from "@/lib/constants";

interface MonthPickerProps {
  selectedMonth: string;
  onSelect: (month: string) => void;
}

export function MonthPicker({ selectedMonth, onSelect }: MonthPickerProps) {
  return (
    <Select value={selectedMonth} onValueChange={onSelect}>
      <SelectTrigger className="max-w-24 cursor-pointer">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month} value={month} className="cursor-pointer">
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
