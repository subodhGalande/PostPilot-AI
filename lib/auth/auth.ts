import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

let cachedSecretKey: Uint8Array | null = null;

function getSecretKey(): Uint8Array {
  if (cachedSecretKey) return cachedSecretKey;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not defined. Set JWT_SECRET in your .env or environment.",
    );
  }
  cachedSecretKey = new TextEncoder().encode(secret);
  return cachedSecretKey;
}

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

export const verifyPassword = async (
  hash: string,
  password: string,
): Promise<boolean> => {
  return await argon2.verify(hash, password);
};

export interface JwtPayload {
  id?: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

export const signToken = async (payload: JwtPayload): Promise<string> => {
  const key = getSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
};

export const verifyToken = async (
  token: string,
): Promise<JwtPayload | null> => {
  try {
    const { payload } = await jwtVerify<JwtPayload>(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
};

export async function requireAuth(): Promise<JwtPayload | null> {
  const token = (await cookies()).get("jwt")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload;
}

export async function requireAuthJose(): Promise<JwtPayload | null> {
  return await requireAuth();
}
