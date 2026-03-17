
import { useEffect } from "react";
import { apirequest } from "~/utils/api";

const usePrimaryColor = () => {
  useEffect(() => {
    const fetchPrimaryColor = async () => {
      try {
        const response = await apirequest("GET", "/user/theme-color-setting");
        
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          const primaryColor = response.data[0].value;
          document.documentElement.style.setProperty("--primary-color", primaryColor);
          document.documentElement.style.setProperty("--link-color-dark", primaryColor);
          document.documentElement.style.setProperty("--secondary-color", primaryColor);
        } else {
          console.warn("Primary color setting not available or invalid format");
        }
      } catch (error) {
        console.warn("Could not fetch primary color, using default:", error.message);
        // Set a default primary color if the API fails
        document.documentElement.style.setProperty("--primary-color", "#007bff");
        document.documentElement.style.setProperty("--link-color-dark", "#007bff");
        document.documentElement.style.setProperty("--secondary-color", "#007bff");
      }
    };

    fetchPrimaryColor();
  }, []); 
};

export default usePrimaryColor;
