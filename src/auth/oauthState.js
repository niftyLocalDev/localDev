import { randomBytes, timingSafeEqual } from "node:crypto";

const STATE_COOKIE_NAME = "oauth_state";

export const createOAuthState = () => randomBytes(32).toString("base64url");

export const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        const name = separator === -1 ? part : part.slice(0, separator);
        const value = separator === -1 ? "" : part.slice(separator + 1);
        return [decodeURIComponent(name), decodeURIComponent(value)];
      })
  );

export const getOAuthStateCookie = (cookieHeader) => parseCookies(cookieHeader)[STATE_COOKIE_NAME] ?? "";

export const oauthStateCookie = (state) =>
  `${STATE_COOKIE_NAME}=${encodeURIComponent(state)}; Max-Age=600; Path=/; HttpOnly; Secure; SameSite=Lax`;

export const clearOAuthStateCookie = () =>
  `${STATE_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;

export const statesMatch = (expected, received) => {
  const expectedBuffer = Buffer.from(expected ?? "");
  const receivedBuffer = Buffer.from(received ?? "");

  return (
    expectedBuffer.length > 0 &&
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

