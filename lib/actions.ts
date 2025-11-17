// "use server";
// import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";
// import type {
//   Transaction,
//   TransactionSummary,
//   AddTransactionResult,
//   TransactionType,
// } from "@/types/transaction";
// import {
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   startOfYear,
//   endOfYear,
//   format,
//   eachDayOfInterval,
//   eachMonthOfInterval,
//   eachYearOfInterval,
// } from "date-fns";

// export async function addTransaction(
//   formData: FormData
// ): Promise<AddTransactionResult> {
//   try {
//     const type = formData.get("type") as string;
//     const amountStr = formData.get("amount") as string;
//     const category = formData.get("category") as string;
//     const description = formData.get("description") as string;
//     const imageUrl = formData.get("imageUrl") as string;
//     const dateStr = formData.get("date") as string;

//     if (!type || !amountStr || !category || !dateStr) {
//       return { success: false, error: "Missing required fields" };
//     }

//     const amount = Number.parseFloat(amountStr);
//     if (isNaN(amount) || amount <= 0) {
//       return { success: false, error: "Invalid amount" };
//     }

//     // Create date in local timezone, then store as UTC
//     const localDate = new Date(dateStr); // This creates a date at midnight in local timezone
//     // Prisma will convert this local date to UTC when storing.
//     // Example: 2023-10-26 00:00:00 PST (UTC-7) -> 2023-10-26 07:00:00Z in DB
//     const date = localDate;

//     await prisma.transaction.create({
//       data: {
//         type,
//         amount,
//         category,
//         description: description || null,
//         imageUrl: imageUrl || null,
//         date,
//       },
//     });

//     revalidatePath("/", "page");
//     return { success: true };
//   } catch (error) {
//     console.error("Failed to add transaction:", error);
//     return { success: false, error: "Failed to add transaction" };
//   }
// }

// export async function updateTransaction(
//   formData: FormData
// ): Promise<AddTransactionResult> {
//   try {
//     const id = formData.get("id") as string;
//     const type = formData.get("type") as string;
//     const amountStr = formData.get("amount") as string;
//     const category = formData.get("category") as string;
//     const description = formData.get("description") as string;
//     const imageUrl = formData.get("imageUrl") as string;
//     const dateStr = formData.get("date") as string;

//     if (!id || !type || !amountStr || !category || !dateStr) {
//       return { success: false, error: "Missing required fields" };
//     }

//     const amount = Number.parseFloat(amountStr);
//     if (isNaN(amount) || amount <= 0) {
//       return { success: false, error: "Invalid amount" };
//     }

//     const localDate = new Date(dateStr);
//     const date = localDate;

//     await prisma.transaction.update({
//       where: { id },
//       data: {
//         type,
//         amount,
//         category,
//         description: description || null,
//         imageUrl: imageUrl || null,
//         date,
//       },
//     });

//     revalidatePath("/", "page");
//     return { success: true };
//   } catch (error) {
//     console.error("Failed to update transaction:", error);
//     return { success: false, error: "Failed to update transaction" };
//   }
// }

// export async function deleteTransaction(
//   id: string
// ): Promise<AddTransactionResult> {
//   try {
//     await prisma.transaction.delete({
//       where: { id },
//     });
//     revalidatePath("/", "page");
//     return { success: true };
//   } catch (error) {
//     console.error("Failed to delete transaction:", error);
//     return { success: false, error: "Failed to delete transaction" };
//   }
// }

// export async function getTransactions(): Promise<Transaction[]> {
//   try {
//     const transactions = await prisma.transaction.findMany({
//       orderBy: { date: "desc" },
//     });
//     return transactions.map((transaction) => ({
//       ...transaction,
//       type: transaction.type as TransactionType,
//     }));
//   } catch (error) {
//     console.error("Error fetching all transactions:", error);
//     return [];
//   }
// }

// export async function getTransactionsByMonth(
//   month: number, // 0-indexed
//   year: number
// ): Promise<Transaction[]> {
//   try {
//     // Calculate the start of the month in local time
//     const localStartDate = new Date(year, month, 1);
//     // Calculate the end of the month in local time
//     const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

//     // Convert local dates to UTC for database query
//     // This ensures that transactions whose local date falls within the month
//     // are correctly fetched, regardless of timezone offset.
//     const utcStartDate = new Date(
//       Date.UTC(
//         localStartDate.getFullYear(),
//         localStartDate.getMonth(),
//         localStartDate.getDate(),
//         0,
//         0,
//         0,
//         0
//       )
//     );
//     const utcEndDate = new Date(
//       Date.UTC(
//         localEndDate.getFullYear(),
//         localEndDate.getMonth(),
//         localEndDate.getDate(),
//         23,
//         59,
//         59,
//         999
//       )
//     );

//     const transactions = await prisma.transaction.findMany({
//       where: {
//         date: {
//           gte: utcStartDate,
//           lte: utcEndDate,
//         },
//       },
//       orderBy: { date: "desc" },
//     });

//     return transactions.map((transaction) => ({
//       ...transaction,
//       type: transaction.type as TransactionType,
//     }));
//   } catch (error) {
//     console.error("Error fetching transactions by month:", error);
//     return [];
//   }
// }

// export async function getTransactionSummary(): Promise<TransactionSummary> {
//   try {
//     const transactions = await prisma.transaction.findMany();
//     const totalIncome = transactions
//       .filter((t) => t.type === "income")
//       .reduce((sum, t) => sum + t.amount, 0);
//     const totalExpenses = transactions
//       .filter((t) => t.type === "expense")
//       .reduce((sum, t) => sum + t.amount, 0);

//     return {
//       totalIncome,
//       totalExpenses,
//       balance: totalIncome - totalExpenses,
//     };
//   } catch (error) {
//     console.error("Error fetching transaction summary:", error);
//     return { totalIncome: 0, totalExpenses: 0, balance: 0 };
//   }
// }

// export async function getTransactionSummaryByMonth(
//   month: number,
//   year: number
// ): Promise<TransactionSummary> {
//   try {
//     const localStartDate = new Date(year, month, 1);
//     const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

//     const utcStartDate = new Date(
//       Date.UTC(
//         localStartDate.getFullYear(),
//         localStartDate.getMonth(),
//         localStartDate.getDate(),
//         0,
//         0,
//         0,
//         0
//       )
//     );
//     const utcEndDate = new Date(
//       Date.UTC(
//         localEndDate.getFullYear(),
//         localEndDate.getMonth(),
//         localEndDate.getDate(),
//         23,
//         59,
//         59,
//         999
//       )
//     );

//     const transactions = await prisma.transaction.findMany({
//       where: {
//         date: {
//           gte: utcStartDate,
//           lte: utcEndDate,
//         },
//       },
//     });

//     const totalIncome = transactions
//       .filter((t) => t.type === "income")
//       .reduce((sum, t) => sum + t.amount, 0);
//     const totalExpenses = transactions
//       .filter((t) => t.type === "expense")
//       .reduce((sum, t) => sum + t.amount, 0);

//     return {
//       totalIncome,
//       totalExpenses,
//       balance: totalIncome - totalExpenses,
//     };
//   } catch (error) {
//     console.error("Error fetching transaction summary by month:", error);
//     return { totalIncome: 0, totalExpenses: 0, balance: 0 };
//   }
// }

// //STATS ACTIONS

// export interface CategoryStats {
//   category: string;
//   amount: number;
//   percentage: number;
//   count: number;
// }

// export interface StatsData {
//   totalIncome: number;
//   totalExpenses: number;
//   incomeByCategory: CategoryStats[];
//   expensesByCategory: CategoryStats[];
//   dateRange: string;
// }

// export interface CategoryDetailData {
//   transactions: Transaction[];
//   chartData: { period: string; amount: number }[];
// }

// export async function getStatsData(
//   period: "weekly" | "monthly" | "annually",
//   month?: number,
//   year?: number,
//   selectedWeek?: Date
// ): Promise<StatsData> {
//   try {
//     let startDate: Date;
//     let endDate: Date;
//     let dateRange: string;
//     const currentYear = year || new Date().getFullYear();

//     switch (period) {
//       case "weekly":
//         const weekDate = selectedWeek || new Date();
//         startDate = startOfWeek(weekDate);
//         endDate = endOfWeek(weekDate);

//         dateRange = `${startDate.toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//         })} - ${endDate.toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         })}`;
//         break;

//       case "monthly":
//         const targetMonth = month !== undefined ? month : new Date().getMonth();
//         startDate = new Date(currentYear, targetMonth, 1);
//         endDate = new Date(currentYear, targetMonth + 1, 0, 23, 59, 59, 999);

//         const monthNames = [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ];
//         dateRange = `${monthNames[targetMonth]} ${currentYear}`;
//         break;

//       case "annually":
//         startDate = new Date(currentYear, 0, 1);
//         endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
//         dateRange = `${currentYear}`;
//         break;
//     }

//     // Convert to UTC for database query
//     const utcStartDate = new Date(
//       Date.UTC(
//         startDate.getFullYear(),
//         startDate.getMonth(),
//         startDate.getDate(),
//         0,
//         0,
//         0,
//         0
//       )
//     );
//     const utcEndDate = new Date(
//       Date.UTC(
//         endDate.getFullYear(),
//         endDate.getMonth(),
//         endDate.getDate(),
//         23,
//         59,
//         59,
//         999
//       )
//     );

//     const rawTransactions = await prisma.transaction.findMany({
//       where: {
//         date: {
//           gte: utcStartDate,
//           lte: utcEndDate,
//         },
//       },
//     });

//     // Transform raw transactions to match Transaction interface
//     const transactions: Transaction[] = rawTransactions.map((t) => ({
//       id: t.id,
//       type: t.type as TransactionType,
//       amount: Number(t.amount), // Convert Decimal to number
//       category: t.category,
//       description: t.description,
//       imageUrl: t.imageUrl,
//       date: new Date(t.date),
//       createdAt: new Date(t.createdAt),
//       updatedAt: new Date(t.updatedAt),
//     }));

//     const incomeTransactions = transactions.filter((t) => t.type === "income");
//     const expenseTransactions = transactions.filter(
//       (t) => t.type === "expense"
//     );

//     const totalIncome = incomeTransactions.reduce(
//       (sum, t) => sum + t.amount,
//       0
//     );
//     const totalExpenses = expenseTransactions.reduce(
//       (sum, t) => sum + t.amount,
//       0
//     );

//     // Group by category and calculate stats
//     const incomeByCategory = groupByCategory(incomeTransactions, totalIncome);
//     const expensesByCategory = groupByCategory(
//       expenseTransactions,
//       totalExpenses
//     );

//     return {
//       totalIncome,
//       totalExpenses,
//       incomeByCategory,
//       expensesByCategory,
//       dateRange,
//     };
//   } catch (error) {
//     console.error("Error fetching stats data:", error);
//     return {
//       totalIncome: 0,
//       totalExpenses: 0,
//       incomeByCategory: [],
//       expensesByCategory: [],
//       dateRange: "",
//     };
//   }
// }

// export async function getTransactionsCategory(
//   category: string,
//   type: "income" | "expense",
//   period: "weekly" | "monthly" | "annually",
//   currentDate: Date
// ): Promise<CategoryDetailData> {
//   try {
//     let startDate: Date;
//     let endDate: Date;

//     // Determine period boundaries in local time
//     switch (period) {
//       case "weekly":
//         startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
//         endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
//         break;
//       case "monthly":
//         startDate = startOfMonth(currentDate);
//         endDate = endOfMonth(currentDate);
//         break;
//       case "annually":
//         startDate = startOfYear(currentDate);
//         endDate = endOfYear(currentDate);
//         break;
//     }

//     // Fetch all transactions in period
//     const rawTransactions = await prisma.transaction.findMany({
//       where: {
//         category,
//         type,
//         date: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//       orderBy: { date: "asc" },
//     });

//     const transactions: Transaction[] = rawTransactions.map((t) => ({
//       id: t.id,
//       type: t.type as "income" | "expense",
//       amount: Number(t.amount),
//       category: t.category,
//       description: t.description,
//       imageUrl: t.imageUrl,
//       date: new Date(t.date),
//       createdAt: new Date(t.createdAt),
//       updatedAt: new Date(t.updatedAt),
//     }));

//     // Build chart data safely in JS
//     let chartData: { period: string; amount: number }[] = [];

//     if (period === "weekly") {
//       const days = eachDayOfInterval({ start: startDate, end: endDate });
//       const dayMap = new Map<string, number>();
//       days.forEach((d) => dayMap.set(format(d, "EEE"), 0));

//       transactions.forEach((t) => {
//         const key = format(new Date(t.date), "EEE");
//         dayMap.set(key, (dayMap.get(key) || 0) + t.amount);
//       });

//       chartData = Array.from(dayMap.entries()).map(([period, amount]) => ({
//         period,
//         amount,
//       }));
//     } else if (period === "monthly") {
//       const months = eachMonthOfInterval({
//         start: new Date(
//           currentDate.getFullYear(),
//           currentDate.getMonth() - 5,
//           1
//         ),
//         end: currentDate,
//       });
//       const monthMap = new Map<string, number>();
//       months.forEach((m) => monthMap.set(format(m, "MMM"), 0));

//       transactions.forEach((t) => {
//         const key = format(new Date(t.date), "MMM");
//         monthMap.set(key, (monthMap.get(key) || 0) + t.amount);
//       });

//       chartData = Array.from(monthMap.entries()).map(([period, amount]) => ({
//         period,
//         amount,
//       }));
//     } else if (period === "annually") {
//       const years = eachYearOfInterval({
//         start: new Date(currentDate.getFullYear() - 4, 0, 1),
//         end: currentDate,
//       });
//       const yearMap = new Map<string, number>();
//       years.forEach((y) => yearMap.set(format(y, "yyyy"), 0));

//       transactions.forEach((t) => {
//         const key = format(new Date(t.date), "yyyy");
//         yearMap.set(key, (yearMap.get(key) || 0) + t.amount);
//       });

//       chartData = Array.from(yearMap.entries()).map(([period, amount]) => ({
//         period,
//         amount,
//       }));
//     }

//     return { transactions, chartData };
//   } catch (error) {
//     console.error("Error fetching category transactions:", error);
//     return { transactions: [], chartData: [] };
//   }
// }

// function groupByCategory(
//   transactions: Transaction[],
//   total: number
// ): CategoryStats[] {
//   const categoryMap = new Map<string, { amount: number; count: number }>();

//   transactions.forEach((transaction) => {
//     // Use the category exactly as stored in database
//     const category = transaction.category;

//     const existing = categoryMap.get(category) || { amount: 0, count: 0 };
//     categoryMap.set(category, {
//       amount: existing.amount + Number(transaction.amount),
//       count: existing.count + 1,
//     });
//   });

//   return Array.from(categoryMap.entries())
//     .map(([category, data]) => ({
//       category,
//       amount: data.amount,
//       percentage: total > 0 ? (data.amount / total) * 100 : 0,
//       count: data.count,
//     }))
//     .sort((a, b) => b.amount - a.amount);
// }

"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
  Transaction,
  TransactionSummary,
  AddTransactionResult,
  TransactionType,
} from "@/types/transaction";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "date-fns";

export async function addTransaction(
  formData: FormData
): Promise<AddTransactionResult> {
  try {
    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const dateStr = formData.get("date") as string;

    if (!type || !amountStr || !category || !dateStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Number.parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    // Create date in local timezone, then store as UTC
    const localDate = new Date(dateStr); // This creates a date at midnight in local timezone
    // Prisma will convert this local date to UTC when storing.
    // Example: 2023-10-26 00:00:00 PST (UTC-7) -> 2023-10-26 07:00:00Z in DB
    const date = localDate;

    await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
      },
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error: "Failed to add transaction" };
  }
}

export async function updateTransaction(
  formData: FormData
): Promise<AddTransactionResult> {
  try {
    const id = formData.get("id") as string;
    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const dateStr = formData.get("date") as string;

    if (!id || !type || !amountStr || !category || !dateStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Number.parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    const localDate = new Date(dateStr);
    const date = localDate;

    await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
      },
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(
  id: string
): Promise<AddTransactionResult> {
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });
    return transactions.map((transaction) => ({
      ...transaction,
      type: transaction.type as TransactionType,
    }));
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
}

export async function getTransactionsByMonth(
  month: number, // 0-indexed
  year: number
): Promise<Transaction[]> {
  try {
    // Calculate the start of the month in local time
    const localStartDate = new Date(year, month, 1);
    // Calculate the end of the month in local time
    const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Convert local dates to UTC for database query
    // This ensures that transactions whose local date falls within the month
    // are correctly fetched, regardless of timezone offset.
    const utcStartDate = new Date(
      Date.UTC(
        localStartDate.getFullYear(),
        localStartDate.getMonth(),
        localStartDate.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const utcEndDate = new Date(
      Date.UTC(
        localEndDate.getFullYear(),
        localEndDate.getMonth(),
        localEndDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
      orderBy: { date: "desc" },
    });

    return transactions.map((transaction) => ({
      ...transaction,
      type: transaction.type as TransactionType,
    }));
  } catch (error) {
    console.error("Error fetching transactions by month:", error);
    return [];
  }
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  try {
    const transactions = await prisma.transaction.findMany();
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

export async function getTransactionSummaryByMonth(
  month: number,
  year: number
): Promise<TransactionSummary> {
  try {
    const localStartDate = new Date(year, month, 1);
    const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const utcStartDate = new Date(
      Date.UTC(
        localStartDate.getFullYear(),
        localStartDate.getMonth(),
        localStartDate.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const utcEndDate = new Date(
      Date.UTC(
        localEndDate.getFullYear(),
        localEndDate.getMonth(),
        localEndDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (error) {
    console.error("Error fetching transaction summary by month:", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

//STATS ACTIONS

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface StatsData {
  totalIncome: number;
  totalExpenses: number;
  incomeByCategory: CategoryStats[];
  expensesByCategory: CategoryStats[];
  dateRange: string;
}

export interface CategoryDetailData {
  transactions: Transaction[];
  chartData: { period: string; amount: number }[];
}

export async function getStatsData(
  period: "weekly" | "monthly" | "annually",
  month?: number,
  year?: number,
  selectedWeek?: Date
): Promise<StatsData> {
  try {
    let startDate: Date;
    let endDate: Date;
    let dateRange: string;
    const currentYear = year || new Date().getFullYear();

    switch (period) {
      case "weekly":
        const weekDate = selectedWeek || new Date();
        startDate = startOfWeek(weekDate);
        endDate = endOfWeek(weekDate);

        dateRange = `${startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
        break;

      case "monthly":
        const targetMonth = month !== undefined ? month : new Date().getMonth();
        startDate = new Date(currentYear, targetMonth, 1);
        endDate = new Date(currentYear, targetMonth + 1, 0, 23, 59, 59, 999);

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        dateRange = `${monthNames[targetMonth]} ${currentYear}`;
        break;

      case "annually":
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        dateRange = `${currentYear}`;
        break;
    }

    // Convert to UTC for database query
    const utcStartDate = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const utcEndDate = new Date(
      Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    const rawTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
    });

    // Transform raw transactions to match Transaction interface
    const transactions: Transaction[] = rawTransactions.map((t) => ({
      id: t.id,
      type: t.type as TransactionType,
      amount: Number(t.amount), // Convert Decimal to number
      category: t.category,
      description: t.description,
      imageUrl: t.imageUrl,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));

    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalExpenses = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Group by category and calculate stats
    const incomeByCategory = groupByCategory(incomeTransactions, totalIncome);
    const expensesByCategory = groupByCategory(
      expenseTransactions,
      totalExpenses
    );

    return {
      totalIncome,
      totalExpenses,
      incomeByCategory,
      expensesByCategory,
      dateRange,
    };
  } catch (error) {
    console.error("Error fetching stats data:", error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      incomeByCategory: [],
      expensesByCategory: [],
      dateRange: "",
    };
  }
}

export async function getTransactionsCategory(
  category: string,
  type: "income" | "expense",
  period: "weekly" | "monthly" | "annually",
  currentDate: Date
): Promise<CategoryDetailData> {
  try {
    let startDate: Date;
    let endDate: Date;

    // Determine period boundaries in local time
    switch (period) {
      case "weekly":
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
      case "monthly":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case "annually":
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
        break;
    }

    // Fetch all transactions in period
    const normalizeDate = (d: Date) =>
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    startDate = normalizeDate(startDate);
    endDate = normalizeDate(endDate);

    const rawTransactions = await prisma.transaction.findMany({
      where: {
        category,
        type,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    const transactions: Transaction[] = rawTransactions.map((t) => ({
      id: t.id,
      type: t.type as "income" | "expense",
      amount: Number(t.amount),
      category: t.category,
      description: t.description,
      imageUrl: t.imageUrl,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));

    // Build chart data safely in JS
    let chartData: { period: string; amount: number }[] = [];

    if (period === "weekly") {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dayMap = new Map<string, number>();
      days.forEach((d) => dayMap.set(format(d, "EEE"), 0));

      transactions.forEach((t) => {
        const key = format(new Date(t.date), "EEE");
        dayMap.set(key, (dayMap.get(key) || 0) + t.amount);
      });

      chartData = Array.from(dayMap.entries()).map(([period, amount]) => ({
        period,
        amount,
      }));
    } else if (period === "monthly") {
      const months = eachMonthOfInterval({
        start: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 5,
          1
        ),
        end: currentDate,
      });
      const monthMap = new Map<string, number>();
      months.forEach((m) => monthMap.set(format(m, "MMM"), 0));

      transactions.forEach((t) => {
        const key = format(new Date(t.date), "MMM");
        monthMap.set(key, (monthMap.get(key) || 0) + t.amount);
      });

      chartData = Array.from(monthMap.entries()).map(([period, amount]) => ({
        period,
        amount,
      }));
    } else if (period === "annually") {
      const years = eachYearOfInterval({
        start: new Date(currentDate.getFullYear() - 4, 0, 1),
        end: currentDate,
      });
      const yearMap = new Map<string, number>();
      years.forEach((y) => yearMap.set(format(y, "yyyy"), 0));

      transactions.forEach((t) => {
        const key = format(new Date(t.date), "yyyy");
        yearMap.set(key, (yearMap.get(key) || 0) + t.amount);
      });

      chartData = Array.from(yearMap.entries()).map(([period, amount]) => ({
        period,
        amount,
      }));
    }

    return { transactions, chartData };
  } catch (error) {
    console.error("Error fetching category transactions:", error);
    return { transactions: [], chartData: [] };
  }
}

function groupByCategory(
  transactions: Transaction[],
  total: number
): CategoryStats[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  transactions.forEach((transaction) => {
    // Use the category exactly as stored in database
    const category = transaction.category;

    const existing = categoryMap.get(category) || { amount: 0, count: 0 };
    categoryMap.set(category, {
      amount: existing.amount + Number(transaction.amount),
      count: existing.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}
