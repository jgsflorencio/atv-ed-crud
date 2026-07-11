import { NextResponse } from "next/server";
import {
  deleteUserById,
  getUserById,
  updateUser,
} from "@/db/queries";
import { isPgError, jsonError, parseId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseId(id);
  if (!userId) {
    return jsonError("id inválido.");
  }

  const data = await getUserById(userId);
  if (!data) {
    return jsonError("Usuário não encontrado.", 404);
  }
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseId(id);
  if (!userId) {
    return jsonError("id inválido.");
  }

  const body = (await request.json()) as { nome?: string; email?: string };
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!nome || !email) {
    return jsonError("nome e email são obrigatórios.");
  }

  try {
    const updated = await updateUser(userId, nome, email);
    if (!updated) {
      return jsonError("Usuário não encontrado.", 404);
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Email já cadastrado.", 409);
    }
    return jsonError("Falha ao atualizar usuário.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseId(id);
  if (!userId) {
    return jsonError("id inválido.");
  }

  const deleted = await deleteUserById(userId);
  if (!deleted) {
    return jsonError("Usuário não encontrado.", 404);
  }
  return NextResponse.json({ success: true });
}
