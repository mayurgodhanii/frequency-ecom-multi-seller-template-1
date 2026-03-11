// services/googleAuthService.js
import crypto from "crypto";

import { apirequest } from "~/utils/api";

export const fetchGoogleCredentials = async () => {
  try {
    const response = await apirequest("GET", `/user/google-list`, null, null);

    if (response && response.success) {
      return response.data;
    } else {
      throw new Error(response?.message || "Error fetching Google credentials");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};


export const decryptGoogleCredentials = async (encryptedData, key) => {
  const hashedKey = crypto.createHash("sha256").update(key).digest();

  const textParts = encryptedData.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = textParts[1];

  const decipher = crypto.createDecipheriv("aes-256-cbc", hashedKey, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
