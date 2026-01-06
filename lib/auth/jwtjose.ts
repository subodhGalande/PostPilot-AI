import { SignJWT, jwtVerify } from "jose";

// Delay reading/validating `JWT_SECRET` until runtime so importing this
// module doesn't throw during server startup when env may not be set
// (e.g. during local dev or tests). The secret is cached after first use.
let cachedSecretKey: Uint8Array | null = null;

function getSecretKey(): Uint8Array {
  if (cachedSecretKey) return cachedSecretKey;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not defined. Set JWT_SECRET in your .env or environment."
    );
  }
  cachedSecretKey = new TextEncoder().encode(secret);
  return cachedSecretKey;
}

export interface JoseJwtPayload {
  id?: string;
  email: string;
  name: string;
  passwordHash?: string;
  [key: string]: unknown;
}

export const signTokenJose = async (
  payload: JoseJwtPayload
): Promise<string> => {
  // validate secret at call-time; this provides a clearer error when the
  // function is actually used instead of causing an import-time crash.
  const key = getSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
};

export const verifyTokenJose = async (
  token: string
): Promise<JoseJwtPayload | null> => {
  try {
    const { payload } = await jwtVerify<JoseJwtPayload>(token, getSecretKey());
    return payload;
  } catch (_err) {
    return null;
  }
};
