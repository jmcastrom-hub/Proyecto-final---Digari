import { createHash, randomBytes, randomUUID } from 'node:crypto';

export function newTrackingCode() { return randomBytes(24).toString('base64url'); }
export function trackingHash(code: string) { return createHash('sha256').update(code).digest('hex'); }
export function newId() { return randomUUID(); }
export function validTrackingCode(code: unknown): code is string { return typeof code === 'string' && /^[A-Za-z0-9_-]{28,40}$/.test(code); }
export function validIdempotencyKey(key: unknown): key is string { return typeof key === 'string' && /^[a-f0-9-]{36}$/i.test(key); }
