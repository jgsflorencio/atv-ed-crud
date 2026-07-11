import { NextResponse } from "next/server";
import { createUser, listUsers } from "@/db/queries";
import { isPgError, jsonError } from "@/lib/api";

export async function GET() {
  const data = await listUsers();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { nome?: string; email?: string };
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!nome || !email) {
    return jsonError("nome e email são obrigatórios.");
  }

  try {
    const created = await createUser(nome, email);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Email já cadastrado.", 409);
    }
    return jsonError("Falha ao criar usuário.", 500);
  }
}
