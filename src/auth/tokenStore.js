import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const isNotFound = (error) => error?.code === 5 || error?.code === "NOT_FOUND";

export const createTokenStore = (config, client = new SecretManagerServiceClient()) => {
  const secretName = client.secretPath(config.googleCloudProject, config.oauthRefreshTokenSecret);
  const latestVersionName = `${secretName}/versions/latest`;

  const getRefreshToken = async () => {
    try {
      const [version] = await client.accessSecretVersion({ name: latestVersionName });
      const token = version.payload?.data?.toString("utf8").trim() ?? "";
      return token && token !== "PENDING_AUTHORIZATION" ? token : null;
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  };

  const saveRefreshToken = async (refreshToken) => {
    if (!refreshToken) throw new Error("Google did not return a refresh token");

    await client.addSecretVersion({
      parent: secretName,
      payload: { data: Buffer.from(refreshToken, "utf8") }
    });
  };

  return { getRefreshToken, saveRefreshToken };
};

