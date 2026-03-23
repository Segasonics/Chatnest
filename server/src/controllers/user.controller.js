import { User } from '../models/User.js';

export async function getMe(req, res) {
  const user = await User.findById(req.auth.userId).select('-passwordHash');
  res.json({ success: true, data: user });
}
