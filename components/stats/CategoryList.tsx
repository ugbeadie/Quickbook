"use client";

import type { CategoryStats } from "@/lib/actions";

interface CategoryListProps {
  data: CategoryStats[];
  onCategoryClick?: (category: string) => void;
}

// Same color palette as the chart
const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#facc15", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function CategoryList({ data, onCategoryClick }: CategoryListProps) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        return (
          <div
            key={item.category}
            className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
            onClick={() => onCategoryClick?.(item.category)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Percentage indicator */}
              <div
                className="w-8 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {Math.round(item.percentage)}%
              </div>

              {/* Category with emoji */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{item.category}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <div className="font-semibold">
                ₦{item.amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.count} transaction{item.count !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
