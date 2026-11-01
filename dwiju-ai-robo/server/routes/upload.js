import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// Upload processing is not yet configured. Do not pretend an upload succeeded.
router.use(authenticateToken, (_req, res) => res.status(501).json({ error: 'Upload service is not configured', code: 'UPLOAD_NOT_CONFIGURED' }));
export default router;
