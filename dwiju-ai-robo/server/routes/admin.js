import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
// Administrative endpoints must never return fake success.
router.use(requireAdmin, (_req, res) => res.status(501).json({ error: 'Admin service is not configured', code: 'ADMIN_NOT_CONFIGURED' }));
export default router;
