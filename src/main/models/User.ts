import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Worker'], default: 'Worker' }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
