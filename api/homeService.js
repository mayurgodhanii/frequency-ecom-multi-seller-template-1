import { apirequest } from "~/utils/api";

// const API_URL = `/user/sale-products-list`;

// export const fetchSaleProducts = async (type = '', page = 0, size = 50, category = '') => {
//   try {
//     const params = { page, size, type };
    
    
//     if (category) {
//       params.category = category;
//     }

//     const response = await apirequest(
//       "GET",
//       API_URL, // URL
//       null, 
//       params
//     );

//     if (response) {
//       return response;
      
//     } else {
//       throw new Error("Failed to fetch sale products");
//     }
//   } catch (error) {
//     console.error("Error fetching sale products:", error);
//     throw error;
//   }
// };



const API_URL = `/product/list`;

export const fetchSaleProducts = async (
  type = "",
  page = 1,
  size = 10,
  category = "",
  search = ""
) => {
  try {
    const payload = {
      type, // "top_deals", "best_selling", "exclusive_deals"
      search,
      page,
      size,
    };

    if (category) {
      payload.category = category;
    }

    const response = await apirequest(
      "POST",
      API_URL, // URL
      payload, // payload instead of params
      null
    );

    if (response) {
      return response;
    } else {
      throw new Error("Failed to fetch sale products");
    }
  } catch (error) {
    console.error("Error fetching sale products:", error);
    throw error;
  }
};

export const subscribeToNewsletter = async (email) => {
  try {
    const response = await apirequest(
      "POST",
      `/user/email-subscriber`, // URL
      { email },
      null
    );

    if (response) {
      return response;
      
    } else {
      throw new Error("Failed to subscribe to newsletter");
    }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
};

export const checkPincode = async (pincode) => {
  try {
    const response = await apirequest(
      "GET",
      `/user/pincode-check/${pincode}`, 
      null, 
      null 
    );

    if (response) {
      return response;
      
    } else {
      throw new Error("Failed to check pincode");
    }
  } catch (error) {
    console.error("Error checking pincode:", error);
    throw error;
  }
};
