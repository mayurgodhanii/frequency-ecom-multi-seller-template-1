import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ALink from "~/components/features/alink";

import { apirequest } from "~/utils/api";

async function fetchBlogData() {
  try {
    const response = await apirequest(
      "GET", 
      `/user/recommand-blog-list`, 
      null, 
      { page: 1, size: 9, search: "", slug: "" } 
    );

    if (response && response.success) {
      return response.data; 
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
      {/* Search Box */}
      <div className="widget widget-search">
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
      </div>

      {/* Other Posts */}
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




{
  /* <div className="widget widget-cats">
                <h3 className="widget-title">Categories</h3>

                <ul>
                    {
                        router.pathname.includes( 'single' ) ?
                            categories.map( ( category, index ) => (
                                <li key={ index }><ALink href={ { pathname: '/blog/classic/', query: { category: category.slug } } } className={ `${query.category == category.slug ? 'active' : ''}` } scroll={ false }>{ category.name }<span>{ category.count }</span></ALink></li>
                            ) )
                            :
                            categories.map( ( category, index ) => (
                                <li key={ index }><ALink href={ { pathname: router.pathname, query: { category: category.slug } } } className={ `${query.category == category.slug ? 'active' : ''}` } scroll={ false }>{ category.name }<span>{ category.count }</span></ALink></li>
                            ) )
                    }
                </ul>
            </div> */
}

{
  /* <div className="widget widget-banner-sidebar">
                <div className="banner-sidebar-title">ad box 280 x 280</div>

                <div className="banner-sidebar banner-overlay">
                    <ALink href="/shop/sidebar/3cols" className="w-100">
                        <div className="lazy-overlay"></div>
                        <LazyLoadImage
                            alt="banner"
                            src="images/blog/sidebar/banner.jpg"
                            threshold={ 500 }
                            height={ 277 }
                            width="280"
                            effect="opacity"
                        />
                    </ALink>
                    <div className="banner-content text-left">
                        <p className="mb-1">online & in-store</p>
                        <h3 className="banner-subtitle text-uppercase">Spring Sale</h3>
                        <h2 className="banner-title">Up to 60% off<br />from $55</h2>
                        <ALink href="/shop/sidebar/3cols" className="btn btn-outline btn-md btn-outline-white text-uppercase m-0">Shop Now</ALink>
                    </div>
                </div>
            </div> */
}

{
  /* <div className="widget">
                <h3 className="widget-title">Browse Tags</h3>

                <div className="tagcloud">
                    <ALink href="#">fashion</ALink>
                    <ALink href="#">style</ALink>
                    <ALink href="#">women</ALink>
                    <ALink href="#">photography</ALink>
                    <ALink href="#">travel</ALink>
                    <ALink href="#">shopping</ALink>
                    <ALink href="#">hobbies</ALink>
                </div>
            </div> */
}

{
  /* <div className="widget widget-text">
                <h3 className="widget-title">About Blog</h3>

                <div className="widget-text-content">
                    <p>Vestibulum volutpat, lacus a ultrices sagittis, mi neque euismod dui, pulvinar nunc sapien ornare nisl.</p>
                </div>
            </div> */
}
