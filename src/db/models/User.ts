import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nome: string;
  email: string;
}

const UserSchema = new Schema<IUser>({
  nome: { 
    type: String, 
    required: true,
    maxlength: 150
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    maxlength: 255,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);