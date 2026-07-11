import { NextResponse } from "next/server";
import { createEnrollment, listEnrollments } from "@/db/queries";
import { isPgError, jsonError, normalizeSemester } from "@/lib/api";

export async function GET() {
  const data = await listEnrollments();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    studentId?: number;
    courseId?: number;
    semestre?: string;
  };

  const studentId = Number(body.studentId);
  const courseId = Number(body.courseId);
  const semestre = normalizeSemester(body.semestre);

  if (
    !Number.isInteger(studentId) ||
    studentId <= 0 ||
    !Number.isInteger(courseId) ||
    courseId <= 0 ||
    !semestre
  ) {
    return jsonError("studentId e courseId válidos são obrigatórios e semestre deve ser YYYY.1 ou YYYY.2.");
  }

  try {
    const created = await createEnrollment(studentId, courseId, semestre);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError("Vínculo já cadastrado para estudante, curso e semestre.", 409);
    }
    if (isPgError(error) && error.code === "23503") {
      return jsonError("Estudante ou curso informado não existe.", 409);
    }
    return jsonError("Falha ao criar vínculo.", 500);
  }
}
