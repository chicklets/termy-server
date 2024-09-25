// src/routes/userRoutes.ts
import express from 'express';
import {
  registerUser,
  loginUser,
  getUserInfo,
  verifyEmail,
} from '../controllers/userController';
import passport from 'passport';

const router = express.Router();

// 회원가입 라우트
router.post('/register', registerUser);

// 로그인 라우트
router.post('/login', loginUser);

// 이메일 인증 라우트
router.get('/verify-email', verifyEmail);

// 사용자 정보 가져오기 (보호된 라우트)
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  getUserInfo
);

export default router;
