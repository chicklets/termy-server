// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import passport from 'passport';
import transporter from '../config/nodemailer'; // Nodemailer 설정
import { v4 as uuidv4 } from 'uuid';
import { compileTemplate } from '../config/emailTemplates'; // 템플릿 컴파일 함수

dotenv.config();

// 회원가입
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 사용자 존재 여부 확인
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 이메일 인증 토큰 생성
    const verificationToken = uuidv4();

    // 사용자 생성
    const newUser: IUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      loginMethod: 'local',
    });

    await newUser.save();

    // 이메일 인증 링크 생성
    const verificationLink = `${process.env.APP_URL}/api/users/verify-email?token=${verificationToken}`;

    // 템플릿 데이터 준비
    const templateData = {
      username,
      verificationLink,
      year: new Date().getFullYear(),
    };

    // HTML 이메일 템플릿 렌더링
    const htmlContent = compileTemplate('verificationEmail', templateData);

    // 이메일 발송
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Termy 앱 이메일 인증',
      html: htmlContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('이메일 발송 오류:', error);
        return res.status(500).json({ message: '이메일 발송에 실패했습니다.' });
      } else {
        console.log('이메일 발송 성공:', info.response);
        return res
          .status(201)
          .json({
            message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
          });
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
};

// 로그인
export const loginUser = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: any, user: IUser | false, info: any) => {
      if (err) {
        return res
          .status(500)
          .json({ message: '서버 오류', error: err.message });
      }

      if (!user) {
        return res.status(400).json({ message: info.message || '로그인 실패' });
      }

      // JWT 생성
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      return res.status(200).json({ token });
    }
  )(req, res, next);
};

// 이메일 인증
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res
        .status(400)
        .json({ message: '유효하지 않은 인증 토큰입니다.' });
    }

    // 토큰으로 사용자 찾기
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: '유효하지 않은 인증 토큰입니다.' });
    }

    // 이메일 인증 상태 업데이트
    user.isVerified = true;
    user.verificationToken = undefined; // 토큰 제거
    await user.save();

    res
      .status(200)
      .json({
        message: '이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.',
      });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
};

// 사용자 정보 가져오기 (보호된 라우트)
export const getUserInfo = (req: Request, res: Response) => {
  // Passport의 JWT 전략을 통해 user 정보가 추가되어 있음
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
  }
};
