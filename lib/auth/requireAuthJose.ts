import { cookies } from "next/headers";
import { verifyTokenJose } from "./jwtjose";

export async function requireAuthJose() {
  const token = (await cookies()).get("jwt")?.value;

  if (!token) return null;

  const payload = await verifyTokenJose(token);
  if (!payload) return null;

  return payload;
}
