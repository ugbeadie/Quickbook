// app/api/transactions/category/route.ts

import { NextResponse } from "next/server";
import { getTransactionsCategory } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await getTransactionsCategory(
      body.category,
      body.type,
      body.period,
      new Date(body.currentDate)
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
