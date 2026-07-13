import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  codigo: string;
  nome: string;
}

const CourseSchema = new Schema<ICourse>({
  codigo: { 
    type: String, 
    required: true,
    unique: true,
    maxlength: 50
  },
  nome: { 
    type: String, 
    required: true,
    maxlength: 150
  }
}, {
  timestamps: true
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);