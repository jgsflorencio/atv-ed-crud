import { relations } from "drizzle-orm";
import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  (t) => ({
    id: t.serial().primaryKey(),
    nome: t.varchar({ length: 150 }).notNull(),
    email: t.varchar({ length: 255 }).notNull(),
  }),
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const students = pgTable(
  "students",
  (t) => ({
    id: t.serial().primaryKey(),
    matricula: t.varchar({ length: 50 }).notNull(),
    userId: t
      .integer()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  }),
  (t) => [
    uniqueIndex("students_matricula_unique").on(t.matricula),
    uniqueIndex("students_user_id_unique").on(t.userId),
  ],
);

export const courses = pgTable(
  "courses",
  (t) => ({
    id: t.serial().primaryKey(),
    codigo: t.varchar({ length: 50 }).notNull(),
    nome: t.varchar({ length: 150 }).notNull(),
  }),
  (t) => [uniqueIndex("courses_codigo_unique").on(t.codigo)],
);

export const enrollments = pgTable(
  "enrollments",
  (t) => ({
    id: t.serial().primaryKey(),
    studentId: t
      .integer()
      .notNull()
      .references(() => students.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    courseId: t
      .integer()
      .notNull()
      .references(() => courses.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    semestre: t.varchar({ length: 10 }).notNull(),
  }),
  (t) => [
    uniqueIndex("enrollments_student_course_semester_unique").on(
      t.studentId,
      t.courseId,
      t.semestre,
    ),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));
