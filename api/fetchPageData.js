

import { apirequest } from "~/utils/api";

export const fetchPageData = async (pageName, theme_id) => {
  try {
    const response = await apirequest("GET", `/user/pages-list`, null, {
      page_name: pageName,
      theme_id: theme_id,
    });

    if (response && response.success) {
      return response.data;
    } else {
      console.error(
        "Failed to fetch page data:",
        response?.message || "Unknown error"
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
};
