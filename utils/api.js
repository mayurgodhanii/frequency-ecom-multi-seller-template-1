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
  try {
    if (!ALGORITHM) return encryptedData;

    const secretKey = Buffer.from(process.env.ENCRYPT_SECRET_KEY, "base64");
    const iv = Buffer.from(process.env.ENCRYPT_IV, "base64");
    const algorithm = process.env.ALGORITHM || "aes-256-cbc";

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error during decryption:", error);
    throw new Error("Decryption failed");
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

    if (method !== "GET" && method !== "DELETE" && data) {
      config.data = isFileUpload
        ? data
        : ENCRYPT === "true"
        ? EncryptResponse(data)
        : data;
    }

    const response = await api(config);
    return ENCRYPT === "true" ? DecryptResponse(response.data) : response.data;
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  if (error.response) {
    let errorMessage = error.response.data;
    try {
      errorMessage = DecryptResponse(error.response.data);
    } catch (decryptionError) {
      console.error("Error response decryption failed:", decryptionError);
    }

    if (errorMessage === "Invalid token" || error.response.status === 401) {
      localStorage.removeItem("frequency-auth");
      window.location.href = "/login";
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
 