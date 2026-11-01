import test from 'node:test';
import assert from 'node:assert/strict';
import { RTDB_COLLECTIONS,userDataPath } from '../server/config/dataContract.js';
test('shared Firebase paths are owner scoped',()=>{
 assert.deepEqual(RTDB_COLLECTIONS,['healthRecords','deviceTelemetry','deviceStatus','deviceCommands']);
 for(const key of RTDB_COLLECTIONS)assert.equal(userDataPath(key,'alice'),key+'/alice');
 assert.throws(()=>userDataPath('other','alice'));
 assert.throws(()=>userDataPath('healthRecords','../admin'));
});
