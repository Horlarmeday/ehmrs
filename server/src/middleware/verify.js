import { verify } from 'jsonwebtoken';

// eslint-disable-next-line consistent-return
export default function(req, res, next) {
  const authHeader = req.headers['x-auth-token'] || req.headers.authorization;
  if (!authHeader) return res.status(401).json('Access denied, No token provided');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7, authHeader.length);
    try {
      req.user = verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      return res.status(401).json(error);
    }
  } else return res.status(401).json('Authentication error, invalid token');
}
