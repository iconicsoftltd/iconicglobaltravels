import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export default {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || "development",

  auth_token: required("AUTH_TOKEN"),
  auth_token_expires_in: required("AUTH_TOKEN_EXPIRES_IN"),

  refresh_token: required("REFRESH_TOKEN"),
  refresh_token_expires_in: required("REFRESH_TOKEN_EXPIRES_IN"),

  cloud_name: process.env.CLOUD_NAME,
  cloud_api_key: process.env.CLOUD_API_KEY,
  cloud_secret_key: process.env.CLOUD_SECRET_KEY,
  clientUrl: process.env.CLIENT_URL ?? "https://accounts.techelementbd.com",
};
