import { NextResponse } from "next/server";
import { createCourse, listCourses } from "@/db/queries";
import { isPgError, jsonError } from "@/lib/api";

export async function GET() {
  const data = await listCourses();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { nome?: string };
  const nome = body.nome?.trim();

  if (!nome) {
    return jsonError("nome é obrigatório.");
  }

  try {
    const created = await createCourse(nome);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Código de curso já cadastrado.", 409);
    }
    return jsonError("Falha ao criar curso.", 500);
  }
}
