import { NextResponse } from "next/server";
import { deleteStudentById, getStudentById, updateStudent } from "@/db/queries";
import { isPgError, jsonError, parseId } from "@/lib/api";
import { connectDB } from "@/db/connection";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const studentId = parseId(id);
  if (!studentId) {
    return jsonError("id inválido.");
  }

  const data = await getStudentById(studentId);

  if (!data) {
    return jsonError("Estudante não encontrado.", 404);
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const studentId = parseId(id);
  if (!studentId) {
    return jsonError("id inválido.");
  }

  const body = (await request.json()) as { userId?: number };
  const userId = Number(body.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return jsonError("userId válido é obrigatório.");
  }

  try {
    const updated = await updateStudent(studentId, userId);
    if (!updated) {
      return jsonError("Estudante não encontrado.", 404);
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Já existe estudante vinculado a esse usuário.", 409);
    }
    if (isPgError(error) && error.code === "23503") {
      return jsonError("Usuário informado não existe.", 409);
    }
    return jsonError("Falha ao atualizar estudante.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const studentId = parseId(id);
  if (!studentId) {
    return jsonError("id inválido.");
  }

  const deleted = await deleteStudentById(studentId);
  if (!deleted) {
    return jsonError("Estudante não encontrado.", 404);
  }
  return NextResponse.json({ success: true });
}
