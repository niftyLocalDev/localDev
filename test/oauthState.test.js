import assert from "node:assert/strict";
import test from "node:test";
import {
  createOAuthState,
  getOAuthStateCookie,
  oauthStateCookie,
  statesMatch
} from "../src/auth/oauthState.js";

test("OAuth state round trips through the secure cookie", () => {
  const state = createOAuthState();
  const cookie = oauthStateCookie(state);

  assert.equal(getOAuthStateCookie(cookie), state);
  assert.equal(statesMatch(state, getOAuthStateCookie(cookie)), true);
});

test("OAuth state rejects missing and different values", () => {
  assert.equal(statesMatch("", ""), false);
  assert.equal(statesMatch("expected", "different"), false);
});
