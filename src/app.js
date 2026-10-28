import express from "express";
import { fileURLToPath } from "node:url";
import { createGoogleOAuth } from "./auth/googleOAuth.js";
import { createTokenStore } from "./auth/tokenStore.js";
import { createAuthRouter } from "./routes/authRoutes.js";

const publicDirectory = fileURLToPath(new URL("../public", import.meta.url));

export const createApp = (config) => {
  const app = express();
  const googleOAuth = createGoogleOAuth(config);
  const tokenStore = createTokenStore(config);

  app.disable("x-powered-by");
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.use(createAuthRouter({ config, googleOAuth, tokenStore }));
  app.use(express.static(publicDirectory));
  app.use((_request, response) => response.status(404).json({ error: "Not found" }));

  return app;
};

