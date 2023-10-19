import { verify } from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';

export default function(req: Request & { user: any }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json('Access denied, No token provided');

  if (authHeader && authHeader?.startsWith('Bearer ')) {
    const token = authHeader?.slice(7, authHeader.length);
    try {
      req.user = verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      return res.status(401).json(error);
    }
  } else return res.status(401).json('Authentication error, invalid token');
}
