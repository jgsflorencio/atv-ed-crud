import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student_id: mongoose.Types.ObjectId;
  course_id: mongoose.Types.ObjectId;
  semestre: string;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  student_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student',
    required: true
  },
  course_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  semestre: { 
    type: String, 
    required: true,
    maxlength: 10
  }
}, {
  timestamps: true
});

EnrollmentSchema.index({ student_id: 1, course_id: 1, semestre: 1 }, { unique: true });
EnrollmentSchema.index({ student_id: 1 });
EnrollmentSchema.index({ course_id: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);