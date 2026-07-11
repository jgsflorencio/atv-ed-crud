import { NextResponse } from "next/server";
import { createStudent, listStudents } from "@/db/queries";
import { isPgError, jsonError } from "@/lib/api";

export async function GET() {
  const data = await listStudents();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: number };
  const userId = Number(body.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return jsonError("userId válido é obrigatório.");
  }

  try {
    const created = await createStudent(userId);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Já existe estudante vinculado a esse usuário.", 409);
    }
    if (isPgError(error) && error.code === "23503") {
      return jsonError("Usuário informado não existe.", 409);
    }
    return jsonError("Falha ao criar estudante.", 500);
  }
}
