import { Router } from "express";
import {
  clearOAuthStateCookie,
  createOAuthState,
  getOAuthStateCookie,
  oauthStateCookie,
  statesMatch
} from "../auth/oauthState.js";

export const createAuthRouter = ({ config, googleOAuth, tokenStore }) => {
  const router = Router();

  router.get("/auth/status", async (_request, response) => {
    if (!config.oauthConfigured) {
      response.json({ connected: false, configured: false });
      return;
    }

    try {
      const refreshToken = await tokenStore.getRefreshToken();
      if (!refreshToken) {
        response.json({ connected: false, configured: true });
        return;
      }

      const email = await googleOAuth.emailFromRefreshToken(refreshToken);
      response.json({ connected: true, configured: true, email });
    } catch (error) {
      console.error("Unable to check Google authorization status", error.message);
      response.status(503).json({ connected: false, configured: true, error: "Status unavailable" });
    }
  });

  router.get("/auth/google", (request, response) => {
    if (!config.oauthConfigured) {
      response.status(503).send("Google OAuth is not configured.");
      return;
    }

    const state = createOAuthState();
    response.setHeader("Set-Cookie", oauthStateCookie(state));
    response.redirect(googleOAuth.authorizationUrl(state));
  });

  router.get("/oauth/callback", async (request, response) => {
    response.setHeader("Set-Cookie", clearOAuthStateCookie());

    const expectedState = getOAuthStateCookie(request.headers.cookie);
    const receivedState = String(request.query.state ?? "");
    if (!statesMatch(expectedState, receivedState)) {
      response.status(400).send("Invalid OAuth state. Start the connection again.");
      return;
    }

    if (request.query.error) {
      response.redirect("/?auth=denied");
      return;
    }

    const code = String(request.query.code ?? "");
    if (!code) {
      response.status(400).send("Google did not provide an authorization code.");
      return;
    }

    try {
      const tokens = await googleOAuth.exchangeCode(code);
      const email = await googleOAuth.emailFromTokens(tokens);

      if (!email || (config.authorizedEmail && email !== config.authorizedEmail)) {
        response.status(403).send("This Google account is not authorized for this application.");
        return;
      }

      await tokenStore.saveRefreshToken(tokens.refresh_token);
      response.redirect("/?auth=success");
    } catch (error) {
      console.error("Google OAuth callback failed", error.message);
      response.redirect("/?auth=error");
    }
  });

  return router;
};

