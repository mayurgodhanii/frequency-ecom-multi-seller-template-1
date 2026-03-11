

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
        }
      } catch (error) {
        console.error("Error fetching primary color:", error.message);
      }
    };

    fetchPrimaryColor();
  }, []); 
};

export default usePrimaryColor;
