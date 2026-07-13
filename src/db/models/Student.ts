import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  matricula: string;
  user_id: mongoose.Types.ObjectId;
}

const StudentSchema = new Schema<IStudent>({
  matricula: { 
    type: String, 
    required: true,
    unique: true,
    maxlength: 50
  },
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

StudentSchema.index({ user_id: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);