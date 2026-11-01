import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import uploadRoutes from '../server/routes/upload.js';
import visionRoutes from '../server/routes/vision.js';
import adminRoutes from '../server/routes/admin.js';
import { authenticateToken } from '../server/middleware/auth.js';
const app=express();app.use(express.json({limit:'10mb'}));app.use('/api/upload',uploadRoutes);app.use('/api/vision',visionRoutes);app.use('/api/admin',authenticateToken,adminRoutes);
test('unauthenticated protected endpoints return 401',async()=>{for(const path of ['/api/upload','/api/vision','/api/admin/summary']){const res=await request(app).post(path).send({});assert.equal(res.status,401);}});
test('vision validates image input and requires a configured provider',async()=>{const token=jwt.sign({userId:'test',role:'user'},process.env.JWT_SECRET);const res=await request(app).post('/api/vision').set('Authorization','Bearer '+token).send({image:'invalid'});assert.equal(res.status,400);});
test('admin rejects non-admin token',async()=>{const token=jwt.sign({userId:'test',role:'user'},process.env.JWT_SECRET);const res=await request(app).get('/api/admin/summary').set('Authorization','Bearer '+token);assert.equal(res.status,403);});
test('upload validates and does not claim persistence',async()=>{const token=jwt.sign({userId:'test',role:'user'},process.env.JWT_SECRET);const res=await request(app).post('/api/upload').set('Authorization','Bearer '+token).attach('file',Buffer.from('hello'),'hello.txt');assert.equal(res.status,200);assert.equal(res.body.stored,false);});

test('rejects JWT signed with wrong secret',async()=>{
 const token=jwt.sign({userId:'test',role:'admin'},'not-the-real-secret');
 const res=await request(app).get('/api/admin/summary').set('Authorization','Bearer '+token);
 assert.equal(res.status,401);
});
test('rejects JWT without required role claim',async()=>{
 const token=jwt.sign({userId:'test'},process.env.JWT_SECRET);
 const res=await request(app).get('/api/admin/summary').set('Authorization','Bearer '+token);
 assert.equal(res.status,401);
});
test('rejects unsupported JWT algorithm',async()=>{
 const token=jwt.sign({userId:'test',role:'admin'},process.env.JWT_SECRET,{algorithm:'HS384'});
 const res=await request(app).get('/api/admin/summary').set('Authorization','Bearer '+token);
 assert.equal(res.status,401);
});
test('upload rejects unsupported MIME types',async()=>{
 const token=jwt.sign({userId:'test',role:'user'},process.env.JWT_SECRET);
 const res=await request(app).post('/api/upload').set('Authorization','Bearer '+token).attach('file',Buffer.from('test'),'sample.exe');
 assert.equal(res.status,400);
});
