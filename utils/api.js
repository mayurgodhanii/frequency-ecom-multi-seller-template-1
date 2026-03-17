const isBrowser = typeof window !== "undefined";
import axios from "axios";
import crypto from "crypto";

const ALGORITHM = process.env.ALGORITHM;
const ENCRYPT = process.env.ENCRYPT;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getToken = () => {
  if (isBrowser) {
    const auth = JSON.parse(localStorage.getItem("frequency-auth"));
    return auth?.token ? auth.token.replace(/"/g, "") : null;
  }
  return null;
};

const token = getToken();

const getHeaders = (isFileUpload = false) => {
  const headers = {};

  if (!isFileUpload) {
    headers["Content-Type"] =
      ENCRYPT === "true" ? "text/plain" : "application/json";
  }

  if (token) {
    headers["x-access-token"] = token;
  }

  return headers;
};

const EncryptResponse = (data) => {
  try {
    if (!ALGORITHM) return data;

    const secretKey = Buffer.from(process.env.ENCRYPT_SECRET_KEY, "base64");
    const iv = Buffer.from(process.env.ENCRYPT_IV, "base64");
    const algorithm = process.env.ALGORITHM || "aes-256-cbc";

    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    let encrypted = cipher.update(json, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  } catch (error) {
    console.error("Error during encryption:", error);
    throw new Error("Encryption failed");
  }
};

const DecryptResponse = (encryptedData) => {
  // Early return for any falsy values or non-strings
  if (!encryptedData || typeof encryptedData !== 'string' || encryptedData.trim() === '') {
    console.warn("DecryptResponse: Invalid input data:", { 
      type: typeof encryptedData, 
      value: encryptedData,
      isString: typeof encryptedData === 'string',
      length: encryptedData?.length 
    });
    return encryptedData;
  }

  // Early return if no algorithm configured
  if (!ALGORITHM) {
    return encryptedData;
  }

  try {
    const secretKey = Buffer.from(process.env.ENCRYPT_SECRET_KEY, "base64");
    const iv = Buffer.from(process.env.ENCRYPT_IV, "base64");
    const algorithm = process.env.ALGORITHM || "aes-256-cbc";

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error during decryption:", error);
    console.error("EncryptedData details:", { 
      type: typeof encryptedData, 
      value: encryptedData,
      length: encryptedData?.length 
    });
    // Return the original data instead of throwing error
    return encryptedData;
  }
};

const api = axios.create({
  baseURL: API_URL,
});

export const apirequest = async (method, url, data = null, params = null) => {
  try {
    const isFileUpload =
      typeof FormData !== "undefined" && data instanceof FormData;

    const config = {
      method,
      url,
      params,
      headers: getHeaders(isFileUpload),
    };

    if (method !== "GET" && data) {
      if (isFileUpload) {
        // For file uploads, don't modify FormData, just pass it directly
        config.data = data;
      } else {
        // For regular requests, inject site_id
        data = {
          ...data,
        };
        config.data = ENCRYPT === "true" ? EncryptResponse(data) : data;
      }
    }

    const response = await api(config);
    
    // Only decrypt if encryption is enabled AND we have valid response data
    if (ENCRYPT === "true" && response.data && typeof response.data === 'string') {
      return DecryptResponse(response.data);
    }
    
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  if (error.response) {
    let errorMessage = error.response.data;
    
    // Only try to decrypt if we have valid data and encryption is enabled
    if (ENCRYPT === "true" && errorMessage && typeof errorMessage === 'string' && errorMessage.trim() !== '') {
      try {
        const decryptedMessage = DecryptResponse(errorMessage);
        if (decryptedMessage !== errorMessage) {
          errorMessage = decryptedMessage;
        }
      } catch (decryptionError) {
        console.error("Error response decryption failed:", decryptionError);
        // Keep the original error message if decryption fails
      }
    }

    if (errorMessage === "Invalid token" || error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("frequency-auth");
        window.location.href = "/login";
      }
    }

    throw new Error(
      (errorMessage && errorMessage.message) ||
        error.response.data.message ||
        error.response.statusText
    );
  } else {
    console.error("API Error:", error.message);
    throw new Error(error.message);
  }
};


// const isBrowser = typeof window !== "undefined";
// import axios from "axios";
// import crypto from "crypto";

// const ALGORITHM = process.env.ALGORITHM;
// const ENCRYPT = process.env.ENCRYPT;
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// export const getToken = () => {
//   if (isBrowser) {
//     const auth = JSON.parse(localStorage.getItem("frequency-auth"));
//     return auth?.token ? auth.token.replace(/"/g, "") : null;
//   }
//   return null;
// };

// const token = getToken();

// const getHeaders = (isFileUpload = false) => {
//   const headers = {};

//   if (!isFileUpload) {
//     headers["Content-Type"] = ENCRYPT === "true" ? "text/plain" : "application/json";
//   }

//   if (token) {
//     headers["x-access-token"] = token;
//   }

//   return headers;
// };

// const EncryptResponse = (data) => {
//   try {
//     if (!ALGORITHM) return data;

//     const secretKey = Buffer.from(process.env.ENCRYPT_SECRET_KEY, "base64");
//     const iv = Buffer.from(process.env.ENCRYPT_IV, "base64");
//     const algorithm = process.env.ALGORITHM || "aes-256-cbc";

//     const json = JSON.stringify(data);
//     const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

//     let encrypted = cipher.update(json, "utf8", "hex");
//     encrypted += cipher.final("hex");

//     return encrypted;
//   } catch (error) {
//     console.error("Error during encryption:", error);
//     throw new Error("Encryption failed");
//   }
// };

// const DecryptResponse = (encryptedData) => {
//   try {
//     if (!ALGORITHM) return encryptedData;

//     const secretKey = Buffer.from(process.env.ENCRYPT_SECRET_KEY, "base64");
//     const iv = Buffer.from(process.env.ENCRYPT_IV, "base64");
//     const algorithm = process.env.ALGORITHM || "aes-256-cbc";

//     const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

//     let decrypted = decipher.update(encryptedData, "hex", "utf8");
//     decrypted += decipher.final("utf8");

//     return JSON.parse(decrypted);
//   } catch (error) {
//     console.error("Error during decryption:", error);
//     throw new Error("Decryption failed");
//   }
// };

// const api = axios.create({
//   baseURL: API_URL,
// });

// export const apirequest = async (method, url, data = null, params = null) => {
//   try {
//     const isFileUpload = typeof FormData !== "undefined" && data instanceof FormData;

//     const config = {
//       method,
//       url,
//       params,
//       headers: getHeaders(isFileUpload),
//     };

//     if (method !== "GET" && method !== "DELETE" && data) {
//       config.data = isFileUpload
//         ? data
//         : ENCRYPT === "true"
//         ? EncryptResponse(data)
//         : data;
//     }

//     const response = await api(config);

//     return ENCRYPT === "true"
//       ? DecryptResponse(response.data)
//       : response.data;
//   } catch (error) {
//     handleError(error);
//   }
// };

// const handleError = (error) => {
//   if (error.response) {
//     let errorMessage = error.response.data;
//     try {
//       errorMessage = DecryptResponse(error.response.data);
//     } catch (decryptionError) {
//       console.error("Error response decryption failed:", decryptionError);
//     }

//     if (
//       errorMessage === "Invalid token" &&
//       window.location.pathname !== "/shop/checkout/"
//     ) {
//       localStorage.removeItem("frequency-auth");
//       window.location.href = "/login";
//     }

//     throw new Error(
//       (errorMessage && errorMessage.message) ||
//       error.response.data.message ||
//       error.response.statusText
//     );
//   } else {
//     console.error("API Error:", error.message);
//     throw new Error(error.message);
//   }
// };
 
