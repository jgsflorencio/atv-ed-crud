import { NextResponse } from "next/server";
import {
  deleteEnrollmentById,
  getEnrollmentById,
  updateEnrollment,
} from "@/db/queries";
import { connectDB } from "@/db/connection";
import { isPgError, jsonError, normalizeSemester, parseId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const enrollmentId = parseId(id);
  if (!enrollmentId) {
    return jsonError("id inválido.");
  }

  const data = await getEnrollmentById(enrollmentId);

  if (!data) {
    return jsonError("Vínculo não encontrado.", 404);
  }
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const enrollmentId = parseId(id);
  if (!enrollmentId) {
    return jsonError("id inválido.");
  }

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
    return jsonError(
      "studentId e courseId válidos são obrigatórios e semestre deve ser YYYY.1 ou YYYY.2.",
    );
  }

  try {
    const updated = await updateEnrollment(
      enrollmentId,
      studentId,
      courseId,
      semestre,
    );
    if (!updated) {
      return jsonError("Vínculo não encontrado.", 404);
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (isPgError(error) && error.code === "23505") {
      return jsonError(
        "Vínculo já cadastrado para estudante, curso e semestre.",
        409,
      );
    }
    if (isPgError(error) && error.code === "23503") {
      return jsonError("Estudante ou curso informado não existe.", 409);
    }
    return jsonError("Falha ao atualizar vínculo.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const enrollmentId = parseId(id);
  if (!enrollmentId) {
    return jsonError("id inválido.");
  }

  const deleted = await deleteEnrollmentById(enrollmentId);
  if (!deleted) {
    return jsonError("Vínculo não encontrado.", 404);
  }
  return NextResponse.json({ success: true });
}
