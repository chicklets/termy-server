// src/config/passport.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Local Strategy 설정
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email', // 로그인 시 사용할 필드
      passwordField: 'password',
    },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, {
            message: '이메일 또는 비밀번호가 잘못되었습니다.',
          });
        }

        // 이메일 인증 여부 확인
        if (!user.isVerified) {
          return done(null, false, {
            message: '이메일 인증이 필요합니다.',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, {
            message: '이메일 또는 비밀번호가 잘못되었습니다.',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy 설정
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'default_secret',
};

passport.use(
  'jwt',
  new JwtStrategy(opts, async (jwt_payload: any, done) => {
    try {
      const user = await User.findById(jwt_payload.userId).select('-password');
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
