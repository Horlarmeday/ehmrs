export function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(401).json('Unauthorized Resource');
    }
    next();
  };
}
