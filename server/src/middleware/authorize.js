// eslint-disable-next-line import/prefer-default-export
export function authorize(roles = []) {
  if (typeof roles === 'string') {
    // eslint-disable-next-line no-param-reassign
    roles = [roles];
  }
  // eslint-disable-next-line consistent-return
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(401).json('Unauthorized Resource');
    }
    next();
  };
}
