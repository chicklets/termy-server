// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  isVerified: boolean; // 이메일 인증 상태
  verificationToken?: string; // 인증 토큰
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }, // 기본값: 인증되지 않음
  verificationToken: { type: String }, // 인증 토큰
});

export default mongoose.model<IUser>('User', UserSchema);
