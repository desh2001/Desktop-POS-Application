import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Employee', 'Stock Manager'], default: 'Employee' }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
