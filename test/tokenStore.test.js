import assert from "node:assert/strict";
import test from "node:test";
import { createTokenStore } from "../src/auth/tokenStore.js";

const config = {
  googleCloudProject: "test-project",
  oauthRefreshTokenSecret: "google-oauth-refresh-token"
};

test("placeholder refresh-token version is treated as disconnected", async () => {
  const client = {
    secretPath: () => "projects/test-project/secrets/google-oauth-refresh-token",
    accessSecretVersion: async () => [{ payload: { data: Buffer.from("PENDING_AUTHORIZATION") } }]
  };

  const store = createTokenStore(config, client);
  assert.equal(await store.getRefreshToken(), null);
});

test("refresh token is added as a new secret version", async () => {
  let request;
  const client = {
    secretPath: () => "projects/test-project/secrets/google-oauth-refresh-token",
    addSecretVersion: async (value) => {
      request = value;
    }
  };

  const store = createTokenStore(config, client);
  await store.saveRefreshToken("refresh-token");

  assert.equal(request.parent, "projects/test-project/secrets/google-oauth-refresh-token");
  assert.equal(request.payload.data.toString("utf8"), "refresh-token");
});
