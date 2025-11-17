// // app/api/transactions/category/route.ts

// import { NextResponse } from "next/server";
// import { getTransactionsCategory } from "@/lib/actions";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const result = await getTransactionsCategory(
//       body.category,
//       body.type,
//       body.period,
//       new Date(body.currentDate)
//     );

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("API ERROR (category):", error);
//     return NextResponse.json(
//       { error: "Failed to load category transactions" },
//       { status: 500 }
//     );
//   }
// }
// app/api/transactions/category/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getTransactionsCategory } from "@/lib/actions";

function safeParseDate(input: unknown): Date | null {
  try {
    if (!input) return null;
    // If already a string (ISO), new Date works consistently in Node (UTC)
    const d = new Date(String(input));
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch((e) => {
      console.error("Failed to parse JSON body (category route):", e);
      return null;
    });

    // defensive: return early if body missing
    if (!body) {
      console.error("No body received in /api/transactions/category");
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 }
      );
    }

    // validate fields quickly
    const { category, type, period, currentDate: currentDateRaw } = body;
    if (!category || !type || !period) {
      console.error("Missing required fields:", { category, type, period });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const safeDate = safeParseDate(currentDateRaw);
    if (!safeDate) {
      console.error("Invalid currentDate received:", currentDateRaw);
      return NextResponse.json(
        { error: "Invalid currentDate" },
        { status: 400 }
      );
    }

    // log minimal info so we can inspect Vercel logs
    console.log(
      "[category API] category:",
      category,
      "type:",
      type,
      "period:",
      period
    );
    console.log(
      "[category API] parsed currentDate (ISO):",
      safeDate.toISOString()
    );

    const result = await getTransactionsCategory(
      category,
      type,
      period,
      safeDate
    );

    // helpful debug info in dev — won't show unless error
    console.log(
      `[category API] returning ${result.transactions.length} transactions, chart points ${result.chartData.length}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("API ERROR (category):", error);
    return NextResponse.json(
      { error: "Failed to load category transactions" },
      { status: 500 }
    );
  }
}
