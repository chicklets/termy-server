// src/config/nodemailer.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail 주소
    pass: process.env.EMAIL_PASS, // Gmail 앱 비밀번호
  },
});

export default transporter;
