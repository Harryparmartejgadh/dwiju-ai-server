// Fail closed: never start or sign tokens with a default secret.
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || /^(fallback_secret|your_|changeme|change_me|secret)/i.test(secret)) {
    throw new Error('JWT_SECRET must be a non-placeholder secret of at least 32 characters');
  }
  return secret;
}
export function validateServerConfig() {
  getJwtSecret();
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in production');
  }
}
