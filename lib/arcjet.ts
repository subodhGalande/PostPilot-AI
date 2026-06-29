import arcjet, { shield } from "@arcjet/next";

export const aj = arcjet({
  // biome-ignore lint/style/noNonNullAssertion: ENV var is guaranteed to be set or fail gracefully in arcjet
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: "LIVE" })],
});

export default aj;
