import { NextResponse } from "next/server";
import {
  deleteCourseById,
  getCourseById,
  updateCourse,
} from "@/db/queries";
import { isPgError, jsonError, parseId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const courseId = parseId(id);
  if (!courseId) {
    return jsonError("id inválido.");
  }

  const data = await getCourseById(courseId);
  if (!data) {
    return jsonError("Curso não encontrado.", 404);
  }
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const courseId = parseId(id);
  if (!courseId) {
    return jsonError("id inválido.");
  }

  const body = (await request.json()) as { nome?: string };
  const nome = body.nome?.trim();
  if (!nome) {
    return jsonError("nome é obrigatório.");
  }

  try {
    const updated = await updateCourse(courseId, nome);
    if (!updated) {
      return jsonError("Curso não encontrado.", 404);
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Código de curso já cadastrado.", 409);
    }
    return jsonError("Falha ao atualizar curso.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const courseId = parseId(id);
  if (!courseId) {
    return jsonError("id inválido.");
  }

  const deleted = await deleteCourseById(courseId);
  if (!deleted) {
    return jsonError("Curso não encontrado.", 404);
  }
  return NextResponse.json({ success: true });
}
