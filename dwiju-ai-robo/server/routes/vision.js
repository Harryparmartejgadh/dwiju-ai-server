import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// Fail explicitly until real vision processing and its security checks are integrated.
router.use(authenticateToken, (_req, res) => res.status(501).json({ error: 'Vision service is not configured', code: 'VISION_NOT_CONFIGURED' }));
export default router;
