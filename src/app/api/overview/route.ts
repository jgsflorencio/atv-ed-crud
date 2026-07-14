import { NextResponse } from "next/server";
import { getAcademicOverview } from "@/db/queries";
import { connectDB } from "@/db/connection";

export async function GET() {
  await connectDB();

  const overview = await getAcademicOverview();
  return NextResponse.json(overview);
}
