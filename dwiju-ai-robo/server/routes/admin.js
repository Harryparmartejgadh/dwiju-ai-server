import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Feature from '../models/Feature.js';
const router = Router();
router.use(requireAdmin);
router.get('/summary', async (_req,res,next) => {
 try {
  const [users,features,activeFeatures]=await Promise.all([User.countDocuments(),Feature.countDocuments(),Feature.countDocuments({isActive:true})]);
  return res.json({success:true,users,features,activeFeatures});
 } catch(err){next(err);}
});
export default router;
