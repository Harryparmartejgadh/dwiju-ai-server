import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
const allowed = new Set(['image/jpeg','image/png','image/webp','application/pdf','text/plain']);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 }, fileFilter: (_req,file,cb) => cb(null, allowed.has(file.mimetype)) });
router.post('/', authenticateToken, (req,res,next) => upload.single('file')(req,res,err => {
 if(err) return next(err);
 if(!req.file) return res.status(400).json({error:'A supported file is required',code:'INVALID_UPLOAD'});
 return res.status(200).json({success:true,filename:req.file.originalname,mimeType:req.file.mimetype,size:req.file.size,stored:false,message:'Validated in memory only; not persisted'});
}));
export default router;
