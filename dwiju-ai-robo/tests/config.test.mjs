import test from 'node:test';
import assert from 'node:assert/strict';
import { getJwtSecret, validateServerConfig } from '../server/config/validate.js';
test('JWT missing or unsafe secrets fail closed', () => {
  const old = process.env.JWT_SECRET;
  try {
    for (const value of ['', 'fallback_secret', 'your_placeholder', 'short']) {
      process.env.JWT_SECRET = value;
      assert.throws(() => getJwtSecret());
    }
    process.env.JWT_SECRET = 'a'.repeat(48);
    assert.equal(getJwtSecret(), 'a'.repeat(48));
    const oldEnv = process.env.NODE_ENV, oldMongo = process.env.MONGODB_URI;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.MONGODB_URI;
      assert.throws(() => validateServerConfig());
    } finally {
      if (oldEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldEnv;
      if (oldMongo === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = oldMongo;
    }
  } finally {
    if (old === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = old;
  }
});
