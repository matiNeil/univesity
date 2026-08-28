import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}
const SECRET: string = AUTH_SECRET;

type ActivationPayload = {
  kind: "student" | "lecturer";
  registryId: string;
  exp: number;
};

const TTL_MS = 10 * 60 * 1000;

export function signActivationToken(payload: Omit<ActivationPayload, "exp">) {
  const full: ActivationPayload = { ...payload, exp: Date.now() + TTL_MS };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyActivationToken(token: string): ActivationPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = createHmac("sha256", SECRET).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as ActivationPayload;
  if (payload.exp < Date.now()) return null;
  return payload;
}
