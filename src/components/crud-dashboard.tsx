"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type User = { id: number; nome: string; email: string };
type Student = {
  id: number;
  matricula: string;
  userId: number;
  userNome: string | null;
  userEmail: string | null;
};
type Course = { id: number; codigo: string; nome: string };
type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
  semestre: string;
  studentMatricula: string | null;
  courseCodigo: string | null;
};
type AcademicOverview = {
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

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Falha na requisição.");
  }

  return response.json() as Promise<T>;
}

export function CrudDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [overview, setOverview] = useState<AcademicOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({ nome: "", email: "" });
  const [studentForm, setStudentForm] = useState({ userId: "" });
  const [courseForm, setCourseForm] = useState({ nome: "" });
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: "",
    courseId: "",
    semestre: "",
  });

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<number | null>(
    null,
  );
  const [enrollmentSemesterFilter, setEnrollmentSemesterFilter] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");

  const usersById = useMemo(
    () =>
      new Map(users.map((user) => [user.id, `${user.nome} (${user.email})`])),
    [users],
  );
  const studentsById = useMemo(
    () => new Map(students.map((student) => [student.id, student.matricula])),
    [students],
  );
  const courseCodeById = useMemo(
    () => new Map(courses.map((course) => [course.id, course.codigo])),
    [courses],
  );
  const courseNameById = useMemo(
    () => new Map(courses.map((course) => [course.id, course.nome])),
    [courses],
  );
  const editingStudentUserId = useMemo(
    () =>
      students.find((student) => student.id === editingStudentId)?.userId ??
      null,
    [students, editingStudentId],
  );
  const availableUsersForStudent = useMemo(() => {
    const usedUserIds = new Set(students.map((student) => student.userId));
    return users.filter(
      (user) => user.id === editingStudentUserId || !usedUserIds.has(user.id),
    );
  }, [users, students, editingStudentUserId]);
  const semesterOptions = useMemo(
    () =>
      [...new Set(enrollments.map((enrollment) => enrollment.semestre))]
        .sort()
        .reverse(),
    [enrollments],
  );
  const filteredEnrollments = useMemo(() => {
    const search = enrollmentSearch.trim().toLowerCase();
    return enrollments.filter((enrollment) => {
      if (
        enrollmentSemesterFilter &&
        enrollment.semestre !== enrollmentSemesterFilter
      ) {
        return false;
      }
      if (!search) {
        return true;
      }
      const studentCode = (
        enrollment.studentMatricula ??
        studentsById.get(enrollment.studentId) ??
        ""
      ).toLowerCase();
      const courseCode = (
        enrollment.courseCodigo ??
        courseCodeById.get(enrollment.courseId) ??
        ""
      ).toLowerCase();
      const courseName = (
        courseNameById.get(enrollment.courseId) ?? ""
      ).toLowerCase();
      return (
        studentCode.includes(search) ||
        courseCode.includes(search) ||
        courseName.includes(search)
      );
    });
  }, [
    courseCodeById,
    courseNameById,
    enrollments,
    enrollmentSearch,
    enrollmentSemesterFilter,
    studentsById,
  ]);
  const canCreateStudent =
    availableUsersForStudent.length > 0 || editingStudentId !== null;
  const canCreateEnrollment = students.length > 0 && courses.length > 0;

  async function loadAll() {
    const [
      usersData,
      studentsData,
      coursesData,
      enrollmentsData,
      overviewData,
    ] = await Promise.all([
      request<User[]>("/api/users"),
      request<Student[]>("/api/students"),
      request<Course[]>("/api/courses"),
      request<Enrollment[]>("/api/enrollments"),
      request<AcademicOverview>("/api/overview"),
    ]);

    setUsers(usersData);
    setStudents(studentsData);
    setCourses(coursesData);
    setEnrollments(enrollmentsData);
    setOverview(overviewData);
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadAll();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Falha ao carregar dados.",
        );
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const method = editingUserId ? "PUT" : "POST";
      const endpoint = editingUserId
        ? `/api/users/${editingUserId}`
        : "/api/users";
      await request(endpoint, { method, body: JSON.stringify(userForm) });
      setUserForm({ nome: "", email: "" });
      setEditingUserId(null);
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar usuário.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const method = editingStudentId ? "PUT" : "POST";
      const endpoint = editingStudentId
        ? `/api/students/${editingStudentId}`
        : "/api/students";
      await request(endpoint, {
        method,
        body: JSON.stringify({
          userId: Number(studentForm.userId),
        }),
      });
      setStudentForm({ userId: "" });
      setEditingStudentId(null);
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar estudante.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const method = editingCourseId ? "PUT" : "POST";
      const endpoint = editingCourseId
        ? `/api/courses/${editingCourseId}`
        : "/api/courses";
      await request(endpoint, {
        method,
        body: JSON.stringify({ nome: courseForm.nome }),
      });
      setCourseForm({ nome: "" });
      setEditingCourseId(null);
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar curso.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEnrollmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const method = editingEnrollmentId ? "PUT" : "POST";
      const endpoint = editingEnrollmentId
        ? `/api/enrollments/${editingEnrollmentId}`
        : "/api/enrollments";
      await request(endpoint, {
        method,
        body: JSON.stringify({
          studentId: Number(enrollmentForm.studentId),
          courseId: Number(enrollmentForm.courseId),
          semestre: enrollmentForm.semestre,
        }),
      });
      setEnrollmentForm({ studentId: "", courseId: "", semestre: "" });
      setEditingEnrollmentId(null);
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar vínculo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeRecord(
    entity: "users" | "students" | "courses" | "enrollments",
    id: number,
  ) {
    setError(null);
    setLoading(true);
    try {
      await request(`/api/${entity}/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Falha ao excluir registro.",
      );
    } finally {
      setLoading(false);
    }
  }

  function formatEnrollmentCourseLabel(enrollment: Enrollment) {
    const code =
      enrollment.courseCodigo ?? courseCodeById.get(enrollment.courseId);
    const name = courseNameById.get(enrollment.courseId);
    if (!code && !name) return "N/A";
    if (!name) return code ?? "N/A";
    return `${code ?? "N/A"} - ${name}`;
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Sistema Acadêmico
        </h1>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-600">Carregando dados...</p>
      ) : null}

      {overview ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">Usuários</p>
            <p className="text-2xl font-semibold text-zinc-900">
              {overview.totals.users}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">Estudantes</p>
            <p className="text-2xl font-semibold text-zinc-900">
              {overview.totals.students}
            </p>
            <p className="text-xs text-zinc-500">
              Sem matrícula: {overview.studentsWithoutEnrollment}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">Cursos</p>
            <p className="text-2xl font-semibold text-zinc-900">
              {overview.totals.courses}
            </p>
            <p className="text-xs text-zinc-500">
              Sem alunos: {overview.coursesWithoutEnrollment}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">Matrículas</p>
            <p className="text-2xl font-semibold text-zinc-900">
              {overview.totals.enrollments}
            </p>
          </article>
        </section>
      ) : null}

      {overview ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Mais matriculadas
            </h2>
            {overview.topCourses.length === 0 ? (
              <p className="text-sm text-zinc-500">Sem dados.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {overview.topCourses.map((course) => (
                  <li
                    key={course.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-zinc-700">
                      {course.codigo} - {course.nome}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                      {course.enrollments} mat.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Distribuição por semestre
            </h2>
            {overview.semesters.length === 0 ? (
              <p className="text-sm text-zinc-500">Sem dados.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {overview.semesters.map((semester) => (
                  <li
                    key={semester.semestre}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-zinc-700">{semester.semestre}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                      {semester.enrollments} mat.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Usuários</h2>
          <form
            onSubmit={handleUserSubmit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Nome"
              value={userForm.nome}
              onChange={(event) =>
                setUserForm((prev) => ({ ...prev, nome: event.target.value }))
              }
              required
            />
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(event) =>
                setUserForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
            <div className="sm:col-span-2 flex gap-2">
              <button
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
                type="submit"
              >
                {editingUserId ? "Atualizar" : "Cadastrar"}
              </button>
              {editingUserId ? (
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  onClick={() => {
                    setEditingUserId(null);
                    setUserForm({ nome: "", email: "" });
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th className="py-2">ID</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-100">
                    <td className="py-2">{user.id}</td>
                    <td className="py-2">{user.nome}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                          onClick={() => {
                            setEditingUserId(user.id);
                            setUserForm({ nome: user.nome, email: user.email });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          onClick={() => removeRecord("users", user.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Estudantes</h2>
          <form
            onSubmit={handleStudentSubmit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <select
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={studentForm.userId}
              onChange={(event) =>
                setStudentForm((prev) => ({
                  ...prev,
                  userId: event.target.value,
                }))
              }
              disabled={!canCreateStudent}
              required
            >
              <option value="">Selecione um usuário</option>
              {availableUsersForStudent.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome} ({user.email})
                </option>
              ))}
            </select>
            <div className="sm:col-span-2 flex gap-2">
              <button
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="submit"
                disabled={!canCreateStudent}
              >
                {editingStudentId ? "Atualizar" : "Cadastrar"}
              </button>
              {editingStudentId ? (
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  onClick={() => {
                    setEditingStudentId(null);
                    setStudentForm({ userId: "" });
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
          {!canCreateStudent ? (
            <p className="text-xs text-amber-700">
              Cadastre um usuário primeiro.
            </p>
          ) : availableUsersForStudent.length === 0 && !editingStudentId ? (
            <p className="text-xs text-amber-700">
              Todos os usuários já possuem estudante.
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th className="py-2">ID</th>
                  <th className="py-2">Matrícula</th>
                  <th className="py-2">Usuário</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-100">
                    <td className="py-2">{student.id}</td>
                    <td className="py-2">{student.matricula}</td>
                    <td className="py-2">
                      {usersById.get(student.userId) ?? "N/A"}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setStudentForm({ userId: String(student.userId) });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          onClick={() => removeRecord("students", student.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Cursos</h2>
          <form
            onSubmit={handleCourseSubmit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Nome"
              value={courseForm.nome}
              onChange={(event) =>
                setCourseForm((prev) => ({ ...prev, nome: event.target.value }))
              }
              required
            />
            <div className="sm:col-span-2 flex gap-2">
              <button
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
                type="submit"
              >
                {editingCourseId ? "Atualizar" : "Cadastrar"}
              </button>
              {editingCourseId ? (
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  onClick={() => {
                    setEditingCourseId(null);
                    setCourseForm({ nome: "" });
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th className="py-2">ID</th>
                  <th className="py-2">Código</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-zinc-100">
                    <td className="py-2">{course.id}</td>
                    <td className="py-2">{course.codigo}</td>
                    <td className="py-2">{course.nome}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                          onClick={() => {
                            setEditingCourseId(course.id);
                            setCourseForm({ nome: course.nome });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          onClick={() => removeRecord("courses", course.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Vínculos</h2>
          <form
            onSubmit={handleEnrollmentSubmit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <select
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={enrollmentForm.studentId}
              onChange={(event) =>
                setEnrollmentForm((prev) => ({
                  ...prev,
                  studentId: event.target.value,
                }))
              }
              disabled={!canCreateEnrollment}
              required
            >
              <option value="">Selecione um estudante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.matricula}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={enrollmentForm.courseId}
              onChange={(event) =>
                setEnrollmentForm((prev) => ({
                  ...prev,
                  courseId: event.target.value,
                }))
              }
              disabled={!canCreateEnrollment}
              required
            >
              <option value="">Selecione um curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.codigo} - {course.nome}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Semestre (2026.1)"
              value={enrollmentForm.semestre}
              onChange={(event) =>
                setEnrollmentForm((prev) => ({
                  ...prev,
                  semestre: event.target.value,
                }))
              }
              disabled={!canCreateEnrollment}
              pattern="^\d{4}\.[12]$"
              required
            />
            <div className="sm:col-span-2 flex gap-2">
              <button
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="submit"
                disabled={!canCreateEnrollment}
              >
                {editingEnrollmentId ? "Atualizar" : "Cadastrar"}
              </button>
              {editingEnrollmentId ? (
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  onClick={() => {
                    setEditingEnrollmentId(null);
                    setEnrollmentForm({
                      studentId: "",
                      courseId: "",
                      semestre: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
          {!canCreateEnrollment ? (
            <p className="text-xs text-amber-700">
              Cadastre estudante e curso primeiro.
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Buscar matrícula, código ou curso"
              value={enrollmentSearch}
              onChange={(event) => setEnrollmentSearch(event.target.value)}
            />
            <select
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={enrollmentSemesterFilter}
              onChange={(event) =>
                setEnrollmentSemesterFilter(event.target.value)
              }
            >
              <option value="">Todos os semestres</option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th className="py-2">ID</th>
                  <th className="py-2">Estudante</th>
                  <th className="py-2">Curso</th>
                  <th className="py-2">Semestre</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-zinc-100">
                    <td className="py-2">{enrollment.id}</td>
                    <td className="py-2">
                      {enrollment.studentMatricula ??
                        studentsById.get(enrollment.studentId) ??
                        "N/A"}
                    </td>
                    <td className="py-2">
                      {formatEnrollmentCourseLabel(enrollment)}
                    </td>
                    <td className="py-2">{enrollment.semestre}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                          onClick={() => {
                            setEditingEnrollmentId(enrollment.id);
                            setEnrollmentForm({
                              studentId: String(enrollment.studentId),
                              courseId: String(enrollment.courseId),
                              semestre: enrollment.semestre,
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          onClick={() =>
                            removeRecord("enrollments", enrollment.id)
                          }
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEnrollments.length === 0 ? (
              <p className="pt-2 text-xs text-zinc-500">
                Nenhum vínculo encontrado.
              </p>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
