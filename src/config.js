const clean = (value) => String(value ?? "").trim();

export const loadConfig = (env = process.env) => {
  const config = {
    port: Number.parseInt(env.PORT ?? "8080", 10),
    googleCloudProject: clean(env.GOOGLE_CLOUD_PROJECT),
    oauthClientId: clean(env.OAUTH_CLIENT_ID),
    oauthClientSecret: clean(env.OAUTH_CLIENT_SECRET),
    oauthRedirectUri: clean(env.OAUTH_REDIRECT_URI),
    oauthRefreshTokenSecret: clean(env.OAUTH_REFRESH_TOKEN_SECRET) || "google-oauth-refresh-token",
    authorizedEmail: clean(env.AUTHORIZED_EMAIL).toLowerCase(),
    bigQueryDataset: clean(env.BIGQUERY_DATASET) || "gmb_data"
  };

  config.oauthConfigured = Boolean(
    config.googleCloudProject &&
      config.oauthClientId &&
      config.oauthClientSecret &&
      config.oauthRedirectUri &&
      !config.oauthClientId.startsWith("SET_")
  );

  return config;
};

