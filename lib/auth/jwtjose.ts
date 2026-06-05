import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

//jose expects Uint8Array key

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JoseJwtPayload {
  id?: string;
  email: string;
  name: string;
  passwordHash?: string;
  tokenVersion?: number;
  [key: string]: unknown;
}

export const signTokenJose = async (
  payload: JoseJwtPayload,
): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
};

export const verifyTokenJose = async (
  token: string,
): Promise<JoseJwtPayload | null> => {
  try {
    const { payload } = await jwtVerify<JoseJwtPayload>(token, secretKey);
    return payload;
  } catch (_err) {
    return null;
  }
};
