import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received in backend:', token);

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      console.log('Decoded JWT in backend:', decoded);

      // 先用 firebaseUid 查找
      let user = await User.findOne({ firebaseUid: decoded.userId }).select('-password');
      // 如果找不到，再用 ObjectId 查找
      if (!user && /^[a-fA-F0-9]{24}$/.test(decoded.userId)) {
        user = await User.findById(decoded.userId).select('-password');
      }
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verify error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Token is not valid' });
  }
};

export default auth; 