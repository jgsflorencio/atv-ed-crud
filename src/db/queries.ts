import { randomInt } from "node:crypto";
import mongoose from "mongoose";
import { User, IUser } from "./models/User";
import { Student, IStudent } from "./models/Student";
import { Course, ICourse } from "./models/Course";
import { Enrollment } from "./models/Enrollment";

function generateNumericCode(length: number): string {
  return Array.from({ length }, () => randomInt(0, 10)).join("");
}

async function generateUniqueCourseCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const codigo = generateNumericCode(6);
    const existing = await Course.findOne({ codigo }).select("_id").lean();
    if (!existing) {
      return codigo;
    }
  }
  throw new Error("Falha ao gerar código de curso único.");
}

async function generateUniqueStudentMatricula(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const matricula = generateNumericCode(8);
    const existing = await Student.findOne({ matricula }).select("_id").lean();
    if (!existing) {
      return matricula;
    }
  }
  throw new Error("Falha ao gerar matrícula única.");
}

function castIdToNumber(id: any): number {
  if (!id) return 0;
  const hex = id.toString();
  return parseInt(hex.substring(0, 8), 16);
}

export async function listUsers() {
  const list = await User.find().sort({ _id: 1 }).lean();
  return list.map((doc) => ({
    id: castIdToNumber(doc._id),
    nome: doc.nome,
    email: doc.email,
  }));
}

export async function getUserById(id: number) {
  const list = await User.find().lean();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;
  return {
    id: castIdToNumber(matched._id),
    nome: matched.nome,
    email: matched.email,
  };
}

export async function createUser(nome: string, email: string) {
  const [created] = await User.create([{ nome, email }]);
  return {
    id: castIdToNumber(created._id),
    nome: created.nome,
    email: created.email,
  };
}

export async function updateUser(id: number, nome: string, email: string) {
  const list = await User.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  matched.nome = nome;
  matched.email = email;
  await matched.save();

  return {
    id: castIdToNumber(matched._id),
    nome: matched.nome,
    email: matched.email,
  };
}

export async function deleteUserById(id: number) {
  const list = await User.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  await User.deleteOne({ _id: matched._id });
  return { id: castIdToNumber(matched._id) };
}

interface PopulatedStudent {
  _id: mongoose.Types.ObjectId;
  matricula: string;
  user_id: {
    _id: mongoose.Types.ObjectId;
    nome: string;
    email: string;
  } | null;
}

export async function listStudents() {
  const list = (await Student.find()
    .populate<{ user_id: IUser | null }>("user_id")
    .sort({ _id: 1 })
    .lean()) as unknown as PopulatedStudent[];

  return list.map((doc) => ({
    id: castIdToNumber(doc._id),
    matricula: doc.matricula,
    userId: doc.user_id ? castIdToNumber(doc.user_id._id) : 0,
    userNome: doc.user_id ? doc.user_id.nome : null,
    userEmail: doc.user_id ? doc.user_id.email : null,
  }));
}

export async function getStudentById(id: number) {
  const list = (await Student.find()
    .populate<{ user_id: IUser | null }>("user_id")
    .lean()) as unknown as PopulatedStudent[];

  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  return {
    id: castIdToNumber(matched._id),
    matricula: matched.matricula,
    userId: matched.user_id ? castIdToNumber(matched.user_id._id) : 0,
    userNome: matched.user_id ? matched.user_id.nome : null,
    userEmail: matched.user_id ? matched.user_id.email : null,
  };
}

export async function createStudent(userId: number) {
  const userList = await User.find().lean();
  const matchedUser = userList.find(
    (doc) => castIdToNumber(doc._id) === userId,
  );
  if (!matchedUser) {
    throw new Error("Usuário não encontrado.");
  }

  const matricula = await generateUniqueStudentMatricula();
  const [created] = await Student.create([
    { matricula, user_id: matchedUser._id },
  ]);
  return {
    id: castIdToNumber(created._id),
    matricula: created.matricula,
    userId: castIdToNumber(created.user_id),
  };
}

export async function updateStudent(id: number, userId: number) {
  const list = await Student.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  const userList = await User.find().lean();
  const matchedUser = userList.find(
    (doc) => castIdToNumber(doc._id) === userId,
  );
  if (!matchedUser) {
    throw new Error("Usuário não encontrado.");
  }

  matched.user_id = matchedUser._id;
  await matched.save();

  return {
    id: castIdToNumber(matched._id),
    matricula: matched.matricula,
    userId: castIdToNumber(matched.user_id),
  };
}

export async function deleteStudentById(id: number) {
  const list = await Student.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  await Student.deleteOne({ _id: matched._id });
  return { id: castIdToNumber(matched._id) };
}

export async function listCourses() {
  const list = await Course.find().sort({ _id: 1 }).lean();
  return list.map((doc) => ({
    id: castIdToNumber(doc._id),
    codigo: doc.codigo,
    nome: doc.nome,
  }));
}

export async function getCourseById(id: number) {
  const list = await Course.find().lean();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;
  return {
    id: castIdToNumber(matched._id),
    codigo: matched.codigo,
    nome: matched.nome,
  };
}

export async function createCourse(nome: string) {
  const codigo = await generateUniqueCourseCode();
  const [created] = await Course.create([{ codigo, nome }]);
  return {
    id: castIdToNumber(created._id),
    codigo: created.codigo,
    nome: created.nome,
  };
}

export async function updateCourse(id: number, nome: string) {
  const list = await Course.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  matched.nome = nome;
  await matched.save();

  return {
    id: castIdToNumber(matched._id),
    codigo: matched.codigo,
    nome: matched.nome,
  };
}

export async function deleteCourseById(id: number) {
  const list = await Course.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  await Course.deleteOne({ _id: matched._id });
  return { id: castIdToNumber(matched._id) };
}

interface PopulatedEnrollment {
  _id: mongoose.Types.ObjectId;
  student_id: {
    _id: mongoose.Types.ObjectId;
    matricula: string;
  } | null;
  course_id: {
    _id: mongoose.Types.ObjectId;
    codigo: string;
  } | null;
  semestre: string;
}

export async function listEnrollments() {
  const list = (await Enrollment.find()
    .populate<{ student_id: IStudent | null }>("student_id")
    .populate<{ course_id: ICourse | null }>("course_id")
    .sort({ _id: 1 })
    .lean()) as unknown as PopulatedEnrollment[];

  return list.map((doc) => ({
    id: castIdToNumber(doc._id),
    studentId: doc.student_id ? castIdToNumber(doc.student_id._id) : 0,
    courseId: doc.course_id ? castIdToNumber(doc.course_id._id) : 0,
    semestre: doc.semestre,
    studentMatricula: doc.student_id ? doc.student_id.matricula : null,
    courseCodigo: doc.course_id ? doc.course_id.codigo : null,
  }));
}

export async function getEnrollmentById(id: number) {
  const list = (await Enrollment.find()
    .populate<{ student_id: IStudent | null }>("student_id")
    .populate<{ course_id: ICourse | null }>("course_id")
    .lean()) as unknown as PopulatedEnrollment[];

  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  return {
    id: castIdToNumber(matched._id),
    studentId: matched.student_id ? castIdToNumber(matched.student_id._id) : 0,
    courseId: matched.course_id ? castIdToNumber(matched.course_id._id) : 0,
    semestre: matched.semestre,
    studentMatricula: matched.student_id ? matched.student_id.matricula : null,
    courseCodigo: matched.course_id ? matched.course_id.codigo : null,
  };
}

export async function createEnrollment(
  studentId: number,
  courseId: number,
  semestre: string,
) {
  const studentList = await Student.find().lean();
  const matchedStudent = studentList.find(
    (doc) => castIdToNumber(doc._id) === studentId,
  );
  if (!matchedStudent) {
    throw new Error("Estudante não encontrado.");
  }

  const courseList = await Course.find().lean();
  const matchedCourse = courseList.find(
    (doc) => castIdToNumber(doc._id) === courseId,
  );
  if (!matchedCourse) {
    throw new Error("Curso não encontrado.");
  }

  const [created] = await Enrollment.create([
    {
      student_id: matchedStudent._id,
      course_id: matchedCourse._id,
      semestre,
    },
  ]);

  return {
    id: castIdToNumber(created._id),
    studentId: castIdToNumber(created.student_id),
    courseId: castIdToNumber(created.course_id),
    semestre: created.semestre,
  };
}

export async function updateEnrollment(
  id: number,
  studentId: number,
  courseId: number,
  semestre: string,
) {
  const list = await Enrollment.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  const studentList = await Student.find().lean();
  const matchedStudent = studentList.find(
    (doc) => castIdToNumber(doc._id) === studentId,
  );
  if (!matchedStudent) {
    throw new Error("Estudante não encontrado.");
  }

  const courseList = await Course.find().lean();
  const matchedCourse = courseList.find(
    (doc) => castIdToNumber(doc._id) === courseId,
  );
  if (!matchedCourse) {
    throw new Error("Curso não encontrado.");
  }

  matched.student_id = matchedStudent._id;
  matched.course_id = matchedCourse._id;
  matched.semestre = semestre;
  await matched.save();

  return {
    id: castIdToNumber(matched._id),
    studentId: castIdToNumber(matched.student_id),
    courseId: castIdToNumber(matched.course_id),
    semestre: matched.semestre,
  };
}

export async function deleteEnrollmentById(id: number) {
  const list = await Enrollment.find();
  const matched = list.find((doc) => castIdToNumber(doc._id) === id);
  if (!matched) return null;

  await Enrollment.deleteOne({ _id: matched._id });
  return { id: castIdToNumber(matched._id) };
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

export async function getAcademicOverview(): Promise<AcademicOverview> {
  const [usersCount, studentsCount, coursesCount, enrollmentsCount] =
    await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
    ]);

  const enrolledStudentIds = await Enrollment.distinct("student_id");
  const studentsWithoutEnrollment = await Student.countDocuments({
    _id: { $nin: enrolledStudentIds },
  });

  const enrolledCourseIds = await Enrollment.distinct("course_id");
  const coursesWithoutEnrollment = await Course.countDocuments({
    _id: { $nin: enrolledCourseIds },
  });

  const topCoursesAgg = await Course.aggregate([
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "course_id",
        as: "enrollmentDocs",
      },
    },
    {
      $project: {
        _id: 1,
        codigo: 1,
        nome: 1,
        enrollmentCount: { $size: "$enrollmentDocs" },
      },
    },
    { $sort: { enrollmentCount: -1, codigo: 1 } },
    { $limit: 5 },
  ]);

  const semestersAgg = await Enrollment.aggregate([
    {
      $group: {
        _id: "$semestre",
        enrollmentCount: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return {
    totals: {
      users: usersCount,
      students: studentsCount,
      courses: coursesCount,
      enrollments: enrollmentsCount,
    },
    studentsWithoutEnrollment,
    coursesWithoutEnrollment,
    topCourses: topCoursesAgg.map((item) => ({
      id: castIdToNumber(item._id),
      codigo: item.codigo,
      nome: item.nome,
      enrollments: item.enrollmentCount,
    })),
    semesters: semestersAgg.map((item) => ({
      semestre: item._id,
      enrollments: item.enrollmentCount,
    })),
  };
}
