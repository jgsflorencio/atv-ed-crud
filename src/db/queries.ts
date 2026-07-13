import { User } from './models/User';
import { Student } from './models/Student';
import { Course } from './models/Course';
import { Enrollment } from './models/Enrollment';
import mongoose from 'mongoose';

export async function listUsers() {
  return await User.find().sort({ _id: 1 });
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  return user || null;
}

export async function createUser(nome: string, email: string) {
  const user = new User({ nome, email });
  await user.save();
  return user;
}

export async function updateUser(id: string, nome: string, email: string) {
  const user = await User.findByIdAndUpdate(
    id, 
    { nome, email },
    { returnDocument: 'after', runValidators: true }
  );
  return user || null;
}

export async function deleteUserById(id: string) {
  const user = await User.findByIdAndDelete(id);
  return user ? { id: user._id.toString() } : null;
}

export async function listStudents() {
  return await Student.find().populate('user_id').sort({ _id: 1 });
}

export async function getStudentById(id: string) {
  const student = await Student.findById(id).populate('user_id');
  return student || null;
}

export async function createStudent(matricula: string, userId: string) {
  const student = new Student({ 
    matricula, 
    user_id: new mongoose.Types.ObjectId(userId) 
  });
  await student.save();
  return await student.populate('user_id');
}

export async function updateStudent(id: string, matricula: string, userId: string) {
  const student = await Student.findByIdAndUpdate(
    id,
    { matricula, user_id: new mongoose.Types.ObjectId(userId) },
    { returnDocument: 'after', runValidators: true }
  );
  return student ? await student.populate('user_id') : null;
}

export async function deleteStudentById(id: string) {
  const student = await Student.findByIdAndDelete(id);
  return student ? { id: student._id.toString() } : null;
}

export async function listCourses() {
  return await Course.find().sort({ _id: 1 });
}

export async function getCourseById(id: string) {
  const course = await Course.findById(id);
  return course || null;
}

export async function createCourse(codigo: string, nome: string) {
  const course = new Course({ codigo, nome });
  await course.save();
  return course;
}

export async function updateCourse(id: string, codigo: string, nome: string) {
  const course = await Course.findByIdAndUpdate(
    id,
    { codigo, nome },
    { returnDocument: 'after', runValidators: true }
  );
  return course || null;
}

export async function deleteCourseById(id: string) {
  const course = await Course.findByIdAndDelete(id);
  return course ? { id: course._id.toString() } : null;
}

export async function listEnrollments() {
  return await Enrollment.find()
    .populate({
      path: 'student_id',
      populate: { path: 'user_id' }
    })
    .populate('course_id')
    .sort({ _id: 1 });
}

export async function getEnrollmentById(id: string) {
  const enrollment = await Enrollment.findById(id)
    .populate({
      path: 'student_id',
      populate: { path: 'user_id' }
    })
    .populate('course_id');
  return enrollment || null;
}

export async function createEnrollment(studentId: string, courseId: string, semestre: string) {
  const enrollment = new Enrollment({
    student_id: new mongoose.Types.ObjectId(studentId),
    course_id: new mongoose.Types.ObjectId(courseId),
    semestre
  });
  await enrollment.save();
  
  return await Enrollment.findById(enrollment._id)
    .populate({
      path: 'student_id',
      populate: { path: 'user_id' }
    })
    .populate('course_id');
}

export async function updateEnrollment(id: string, studentId: string, courseId: string, semestre: string) {
  const enrollment = await Enrollment.findByIdAndUpdate(
    id,
    {
      student_id: new mongoose.Types.ObjectId(studentId),
      course_id: new mongoose.Types.ObjectId(courseId),
      semestre
    },
    { returnDocument: 'after', runValidators: true }
  );
  
  if (!enrollment) return null;
  
  return await Enrollment.findById(enrollment._id)
    .populate({
      path: 'student_id',
      populate: { path: 'user_id' }
    })
    .populate('course_id');
}

export async function deleteEnrollmentById(id: string) {
  const enrollment = await Enrollment.findByIdAndDelete(id);
  return enrollment ? { id: enrollment._id.toString() } : null;
}