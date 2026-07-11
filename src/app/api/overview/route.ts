import { NextResponse } from "next/server";
import { getAcademicOverview } from "@/db/queries";

export async function GET() {
  const overview = await getAcademicOverview();
  return NextResponse.json(overview);
}
