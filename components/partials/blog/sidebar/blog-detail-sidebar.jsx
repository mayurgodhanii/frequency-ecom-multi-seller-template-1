import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ALink from "~/components/features/alink";

import { apirequest } from "~/utils/api";

async function fetchBlogData() {
  try {
    const response = await apirequest(
      "GET", // Method
      `/user/recommand-blog-list`, // URL
      null, // Data (payload) - not needed for GET
      { page: 1, size: 9, search: "", slug: "" } // Params (query parameters)
    );

    // Check if response is valid and successful
    if (response && response.success) {
      return response.data; // Return the data field from decrypted response
    } else {
      throw new Error(response?.message || "Failed to fetch blogs.");
    }
  } catch (error) {
    console.error("Error fetching blog data:", error);
    throw error;
  }
}

function BlogSidebar({ onSearch, toggle = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: blogData, isLoading, isError } = useQuery({
    queryKey: ["recommendedBlogs"],
    queryFn: fetchBlogData,
  });

  const relatedBlogs = blogData?.data || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  };

  return (
    <div className={`sidebar mt-0 ${toggle ? "sidebar-filter px-3 right pt-3" : ""}`}>
      {/* <div className="widget widget-search">
        <h3 className="widget-title">Search</h3>
        <form onSubmit={handleSearchSubmit}>
          <div className="header-search-wrapper search-wrapper-wide">
            <label htmlFor="ws" className="sr-only">Search in blog</label>
            <input
              type="search"
              className="form-control"
              name="ws"
              id="ws"
              placeholder="Search in blog"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
            <button type="submit" className="btn">
              <i className="icon-search"></i>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </form>
      </div> */}

      <div className="widget">
        <h3 className="widget-title">Other Posts</h3>

        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : isError ? (
          <p className="text-center text-danger">Error loading blogs.</p>
        ) : (
          <ul className="posts-list">
            {relatedBlogs.slice(0, 5).map((blog) => (
              <li key={blog.id}>
                <figure className="position-relative">
                  <ALink href={`/blog/${blog.slug}`} className="w-100">
                    <div className="lazy-overlay"></div>
                    <LazyLoadImage
                      alt={blog.title}
                      src={
                        blog.image.startsWith("http")
                          ? blog.image
                          : `${process.env.NEXT_PUBLIC_ASSET_URI}/${blog.image}`
                      }
                      threshold={500}
                      effect="blur"
                      height="80"
                    />
                  </ALink>
                </figure>
                <div>
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", options)}
                  </span>
                  <h4>
                    <ALink href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </ALink>
                  </h4>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default React.memo(BlogSidebar);