
import jwt from 'jsonwebtoken';

export const createJWT = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
