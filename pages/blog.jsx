
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import StickyBox from "react-sticky-box";

import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import PostOne from "~/components/features/posts/post-one";
import BlogSidebar from "~/components/partials/blog/sidebar/blog-sidebar";
import { scrollToPageContent } from "~/utils";
import { fetchBlogList } from "~/api/blog";
import Helmet from "react-helmet";
import Cookies from "js-cookie";


function BlogClassic() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggle, setToggle] = useState(false);
const spaceName = Cookies.get("spaceName");
  const fetchBlogs = async (search = "") => {
    try {
      setLoading(true);
      const data = await fetchBlogList("", "", search);
      if (data.success) {
        setPosts(data.data.data);
      }
    } catch (error) {
      console.error("Failed to load blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    scrollToPageContent();
  }, [router.query]);

  useEffect(() => {
    window.addEventListener("resize", resizeHandle);
    resizeHandle();

    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, []);

  function resizeHandle() {
    if (document.querySelector("body").offsetWidth < 992) setToggle(true);
    else setToggle(false);
  }

  function toggleSidebar() {
    const body = document.querySelector("body");
    if (body.classList.contains("sidebar-filter-active")) {
      body.classList.remove("sidebar-filter-active");
    } else {
      body.classList.add("sidebar-filter-active");
    }
  }

  function hideSidebar() {
    document.querySelector("body").classList.remove("sidebar-filter-active");
  }

  const handleSearch = (searchQuery) => {
    fetchBlogs(searchQuery);
  };

  return (
    <div className="main">
       <Helmet>
        <title>Blog | {spaceName}</title>

        <meta name="description" content="Blog" />
      </Helmet>
      <PageHeader title="Blog" />
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item active">Blog</li>
          </ol>
        </div>
      </nav>
      <div className="page-content">
        <div className="container">
          <div className={`row skeleton-body ${!loading ? "loaded" : ""}`}>
            <div className="col-lg-9">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((item) => (
                  <div className="skel-single-post" key={item}></div>
                ))
              ) : posts.length === 0 ? (
                <p className="blogs-info">
                  No posts were found matching your selection.
                </p>
              ) : (
                posts.map((post, index) => <PostOne post={post} key={index} />)
              )}
            </div>
            <div
              className={`col-lg-3 skel-shop-sidebar skeleton-body ${
                !loading ? "loaded" : ""
              }`}
            >
              <StickyBox className="sticky-content" offsetTop={70}>
                <BlogSidebar onSearch={handleSearch} toggle={toggle} />
                {toggle ? (
                  <button
                    className="sidebar-fixed-toggler right"
                    onClick={toggleSidebar}
                  >
                    <i className="icon-cog"></i>
                  </button>
                ) : (
                  ""
                )}
                <div
                  className="sidebar-filter-overlay"
                  onClick={hideSidebar}
                ></div>
              </StickyBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogClassic;
