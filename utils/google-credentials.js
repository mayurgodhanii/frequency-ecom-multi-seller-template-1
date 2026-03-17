// services/googleAuthService.js
import crypto from "crypto";

import { apirequest } from "~/utils/api";

export const fetchGoogleCredentials = async () => {
  try {
    const response = await apirequest("GET", `/users/google-list`, null, null);

    if (response && response.success && response.data) {
      return response.data;
    } else {
      console.warn("Google credentials not available:", response?.message || "No data returned");
      return null; // Return null instead of throwing error
    }
  } catch (error) {
    console.error("API Error:", error);
    return null; // Return null instead of throwing error
  }
};


export const decryptGoogleCredentials = async (encryptedData, key) => {
  // Handle null, undefined, or empty encrypted data
  if (!encryptedData || typeof encryptedData !== 'string') {
    console.warn("No encrypted data provided for decryption");
    return null;
  }

  try {
    const hashedKey = crypto.createHash("sha256").update(key).digest();

    const textParts = encryptedData.split(":");
    
    // Validate that we have both IV and encrypted text
    if (textParts.length !== 2 || !textParts[0] || !textParts[1]) {
      console.error("Invalid encrypted data format");
      return null;
    }

    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = textParts[1];

    const decipher = crypto.createDecipheriv("aes-256-cbc", hashedKey, iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null;
  }
};
