import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { randomInt } from "node:crypto";
import { db } from "@/db";
import { courses, enrollments, students, users } from "@/db/schema";

function generateNumericCode(length: number) {
  return Array.from({ length }, () => randomInt(0, 10)).join("");
}

async function generateUniqueCourseCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const codigo = generateNumericCode(6);
    const [existing] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.codigo, codigo))
      .limit(1);
    if (!existing) {
      return codigo;
    }
  }
  throw new Error("Falha ao gerar código de curso único.");
}

async function generateUniqueStudentMatricula() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const matricula = generateNumericCode(8);
    const [existing] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.matricula, matricula))
      .limit(1);
    if (!existing) {
      return matricula;
    }
  }
  throw new Error("Falha ao gerar matrícula única.");
}

export function listUsers() {
  return db.select().from(users).orderBy(asc(users.id));
}

export async function getUserById(id: number) {
  const [data] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return data ?? null;
}

export async function createUser(nome: string, email: string) {
  const [created] = await db.insert(users).values({ nome, email }).returning();
  return created;
}

export async function updateUser(id: number, nome: string, email: string) {
  const [updated] = await db
    .update(users)
    .set({ nome, email })
    .where(eq(users.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteUserById(id: number) {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return deleted ?? null;
}

export function listStudents() {
  return db
    .select({
      id: students.id,
      matricula: students.matricula,
      userId: students.userId,
      userNome: users.nome,
      userEmail: users.email,
    })
    .from(students)
    .leftJoin(users, eq(students.userId, users.id))
    .orderBy(asc(students.id));
}

export async function getStudentById(id: number) {
  const [data] = await db
    .select({
      id: students.id,
      matricula: students.matricula,
      userId: students.userId,
      userNome: users.nome,
      userEmail: users.email,
    })
    .from(students)
    .leftJoin(users, eq(students.userId, users.id))
    .where(eq(students.id, id))
    .limit(1);
  return data ?? null;
}

export async function createStudent(userId: number) {
  const matricula = await generateUniqueStudentMatricula();
  const [created] = await db.insert(students).values({ matricula, userId }).returning();
  return created;
}

export async function updateStudent(id: number, userId: number) {
  const [updated] = await db
    .update(students)
    .set({ userId })
    .where(eq(students.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteStudentById(id: number) {
  const [deleted] = await db
    .delete(students)
    .where(eq(students.id, id))
    .returning({ id: students.id });
  return deleted ?? null;
}

export function listCourses() {
  return db.select().from(courses).orderBy(asc(courses.id));
}

export async function getCourseById(id: number) {
  const [data] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return data ?? null;
}

export async function createCourse(nome: string) {
  const codigo = await generateUniqueCourseCode();
  const [created] = await db.insert(courses).values({ codigo, nome }).returning();
  return created;
}

export async function updateCourse(id: number, nome: string) {
  const [updated] = await db
    .update(courses)
    .set({ nome })
    .where(eq(courses.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteCourseById(id: number) {
  const [deleted] = await db
    .delete(courses)
    .where(eq(courses.id, id))
    .returning({ id: courses.id });
  return deleted ?? null;
}

export function listEnrollments() {
  return db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      courseId: enrollments.courseId,
      semestre: enrollments.semestre,
      studentMatricula: students.matricula,
      courseCodigo: courses.codigo,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .orderBy(asc(enrollments.id));
}

export async function getEnrollmentById(id: number) {
  const [data] = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      courseId: enrollments.courseId,
      semestre: enrollments.semestre,
      studentMatricula: students.matricula,
      courseCodigo: courses.codigo,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.id, id))
    .limit(1);
  return data ?? null;
}

export async function createEnrollment(studentId: number, courseId: number, semestre: string) {
  const [created] = await db
    .insert(enrollments)
    .values({ studentId, courseId, semestre })
    .returning();
  return created;
}

export async function updateEnrollment(
  id: number,
  studentId: number,
  courseId: number,
  semestre: string,
) {
  const [updated] = await db
    .update(enrollments)
    .set({ studentId, courseId, semestre })
    .where(eq(enrollments.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteEnrollmentById(id: number) {
  const [deleted] = await db
    .delete(enrollments)
    .where(eq(enrollments.id, id))
    .returning({ id: enrollments.id });
  return deleted ?? null;
}

export type AcademicOverview = {
  totals: {
    users: number;
    students: number;
    courses: number;
    enrollments: number;
  };
  studentsWithoutEnrollment: number;
  coursesWithoutEnrollment: number;
  topCourses: Array<{
    id: number;
    codigo: string;
    nome: string;
    enrollments: number;
  }>;
  semesters: Array<{
    semestre: string;
    enrollments: number;
  }>;
};

async function countFrom(table: typeof users | typeof students | typeof courses | typeof enrollments) {
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(table);
  return row?.count ?? 0;
}

export async function getAcademicOverview(): Promise<AcademicOverview> {
  const [usersCount, studentsCount, coursesCount, enrollmentsCount] = await Promise.all([
    countFrom(users),
    countFrom(students),
    countFrom(courses),
    countFrom(enrollments),
  ]);

  const [studentsWithoutEnrollment, coursesWithoutEnrollment] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(students)
      .leftJoin(enrollments, eq(students.id, enrollments.studentId))
      .where(isNull(enrollments.id))
      .then((rows) => rows[0]?.count ?? 0),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(isNull(enrollments.id))
      .then((rows) => rows[0]?.count ?? 0),
  ]);

  const topCoursesRows = await db
    .select({
      id: courses.id,
      codigo: courses.codigo,
      nome: courses.nome,
      enrollments: sql<number>`cast(count(${enrollments.id}) as int)`,
    })
    .from(courses)
    .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
    .groupBy(courses.id, courses.codigo, courses.nome)
    .orderBy(desc(sql`count(${enrollments.id})`), asc(courses.codigo))
    .limit(5);

  const semesterRows = await db
    .select({
      semestre: enrollments.semestre,
      enrollments: sql<number>`cast(count(${enrollments.id}) as int)`,
    })
    .from(enrollments)
    .groupBy(enrollments.semestre)
    .orderBy(desc(enrollments.semestre));

  return {
    totals: {
      users: usersCount,
      students: studentsCount,
      courses: coursesCount,
      enrollments: enrollmentsCount,
    },
    studentsWithoutEnrollment,
    coursesWithoutEnrollment,
    topCourses: topCoursesRows.map((course) => ({
      id: course.id,
      codigo: course.codigo,
      nome: course.nome,
      enrollments: Number(course.enrollments),
    })),
    semesters: semesterRows.map((row) => ({
      semestre: row.semestre,
      enrollments: Number(row.enrollments),
    })),
  };
}
