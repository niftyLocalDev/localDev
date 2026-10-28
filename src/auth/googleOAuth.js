import { OAuth2Client } from "google-auth-library";

export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/analytics.readonly"
];

export const createGoogleOAuth = (config) => {
  const client = new OAuth2Client({
    clientId: config.oauthClientId,
    clientSecret: config.oauthClientSecret,
    redirectUri: config.oauthRedirectUri
  });

  const authorizationUrl = (state) =>
    client.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      prompt: "consent",
      scope: GOOGLE_OAUTH_SCOPES,
      state
    });

  const exchangeCode = async (code) => {
    const { tokens } = await client.getToken(code);
    return tokens;
  };

  const emailFromTokens = async (tokens) => {
    if (tokens.id_token) {
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.oauthClientId
      });
      return String(ticket.getPayload()?.email ?? "").toLowerCase();
    }

    client.setCredentials(tokens);
    const headers = await client.getRequestHeaders();
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers });
    if (!response.ok) throw new Error(`Unable to load Google user profile (${response.status})`);
    const profile = await response.json();
    return String(profile.email ?? "").toLowerCase();
  };

  const emailFromRefreshToken = async (refreshToken) => {
    client.setCredentials({ refresh_token: refreshToken });
    const headers = await client.getRequestHeaders();
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers });
    if (!response.ok) throw new Error(`Unable to load Google user profile (${response.status})`);
    const profile = await response.json();
    return String(profile.email ?? "").toLowerCase();
  };

  return { authorizationUrl, exchangeCode, emailFromTokens, emailFromRefreshToken };
};

