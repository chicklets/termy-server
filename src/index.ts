// src/index.ts
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from './config/passport'; // Passport 설정 파일
import userRoutes from './routes/userRoutes'; // 사용자 라우트
import { errorHandler } from './middleware/errorHandler'; // 에러 핸들링 미들웨어

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(express.json());

// Passport 초기화
app.use(passport.initialize());

// 라우트 설정
app.use('/api/users', userRoutes);

// 기본 라우트
app.get('/', (req: Request, res: Response) => {
  res.send('Termy 서버에 오신 것을 환영합니다!');
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI || '', {
    // mongoose 6.x부터는 옵션 생략 가능
  })
  .then(() => {
    console.log('MongoDB에 성공적으로 연결되었습니다.');
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
  });
