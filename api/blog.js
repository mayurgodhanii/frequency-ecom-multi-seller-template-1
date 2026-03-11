
import { apirequest } from "~/utils/api";


export async function fetchBlogList(page = 1, size = 9, search = '') {
    try {
        const response = await apirequest(
            "GET",
            `/user/blog-list`, 
            null, 
            { page, size, search } 
        );

        if (response) {
            return response;
        } else {
            throw new Error(response?.message || 'Failed to fetch blog list');
        }
    } catch (error) {
        console.error('Error fetching blog list:', error);
        throw error; 
    }
}
