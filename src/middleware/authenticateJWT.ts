// src/middleware/authenticateJWT.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Bearer <token> 형식
    const token = authHeader.split(' ')[1];

    jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret',
      (err, user) => {
        if (err) {
          return res.sendStatus(403); // Forbidden
        }

        // 사용자 정보를 req에 추가
        (req as any).user = user;
        next();
      }
    );
  } else {
    res.sendStatus(401); // Unauthorized
  }
};
