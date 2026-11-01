export const RTDB_COLLECTIONS = Object.freeze(['healthRecords','deviceTelemetry','deviceStatus','deviceCommands']);
export function userDataPath(collection, uid) {
 if (!RTDB_COLLECTIONS.includes(collection) || typeof uid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new Error('Invalid Firebase data path');
 return collection + '/' + uid;
}
