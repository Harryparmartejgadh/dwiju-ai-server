import { Router } from 'express';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/', authenticateToken, async (req,res,next) => {
 try {
  const { image, question = 'Describe the visible content of this image.' } = req.body ?? {};
  if(typeof image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 7_000_000) return res.status(400).json({error:'A valid bounded base64 image is required',code:'INVALID_IMAGE'});
  if(typeof question !== 'string' || question.length > 2000) return res.status(400).json({error:'Invalid question',code:'INVALID_QUESTION'});
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'Vision provider not configured',code:'VISION_UNAVAILABLE'});
  const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const response = await client.chat.completions.create({model:process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',messages:[{role:'user',content:[{type:'text',text:question},{type:'image_url',image_url:{url:image}}]}],max_tokens:500});
  const answer=response.choices?.[0]?.message?.content;
  if(!answer) return res.status(502).json({error:'Vision provider returned no result',code:'VISION_EMPTY'});
  return res.json({success:true,answer,model:response.model});
 } catch(err){next(err);}
});
export default router;
