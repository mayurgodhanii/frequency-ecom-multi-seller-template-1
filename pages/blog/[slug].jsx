import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import StickyBox from "react-sticky-box";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import BlogSidebar from "~/components/partials/blog/sidebar/blog-detail-sidebar";
import RelatedPosts from "~/components/partials/blog/related/related-posts";
import withApollo from "~/api/apollo";
import Helmet from "react-helmet";
import { apirequest } from "~/utils/api";
import Cookies from "js-cookie";

function BlogDefault() {
  const router = useRouter();
  const slug = router.asPath.split("/").filter(Boolean).pop();
  const [blogData, setBlogData] = useState(null);
  const [relatedBlogData, setRelatedBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggle, setToggle] = useState(false);
  const spaceName = Cookies.get("spaceName");
  const options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await apirequest(
          "GET",
          `/user/blog/${slug}`,
          null,
          null
        );

        if (response && response.success) {
          setBlogData(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlogData();

    window.addEventListener("resize", resizeHandle);
    resizeHandle();
    return () => window.removeEventListener("resize", resizeHandle);
  }, [slug]);

  useEffect(() => {
    const fetchRelatedBlogData = async () => {
      try {
        const response = await apirequest(
          "GET",
          `/user/recommand-blog-list`,
          null,
          { page: 1, size: 9, search: "", slug }
        );

        if (response && response.success) {
          setRelatedBlogData(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchRelatedBlogData();

    window.addEventListener("resize", resizeHandle);
    resizeHandle();
    return () => window.removeEventListener("resize", resizeHandle);
  }, [slug]);

  const related = relatedBlogData?.data;
  const resizeHandle = () => {
    if (document.querySelector("body").offsetWidth < 992) setToggle(true);
    else setToggle(false);
  };

  const toggleSidebar = () => {
    document.querySelector("body").classList.toggle("sidebar-filter-active");
  };

  const hideSidebar = () => {
    document.querySelector("body").classList.remove("sidebar-filter-active");
  };

  if (error) {
    return <div>Error loading blog data. Please try again later.</div>;
  }

  return (
    <div className="main">
      <Helmet>
        <title>{`${blogData?.seo_title} | ${spaceName}` || "template"}</title>

        <meta name="description" content={blogData?.seo_description} />
      </Helmet>
      <PageHeader
        title={blogData ? blogData.seo_title : "Loading..."}
      // subTitle="Single Post"
      />
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/blog">Blog</ALink>
            </li>
            <li className="breadcrumb-item active">
              {blogData ? blogData.title : "Loading..."}
            </li>
          </ol>
        </div>
      </nav>
      <div className="page-content">
        <div className="container">
          <div className={`row skeleton-body ${!loading ? "loaded" : ""}`}>
            <div className="col-lg-9">
              {loading ? (
                <div className="skel-single-post"></div>
              ) : (
                blogData && (
                  <>
                    <article className="entry single-entry">
                      <figure
                        className="entry-media"
                        style={{
                          paddingTop: "56.25%",
                        }}
                      >
                        <LazyLoadImage
                          alt={blogData.title}
                          src={blogData.image}
                          threshold={500}
                          effect="blur"
                        />
                      </figure>

                      <div className="entry-body">
                        <div className="entry-meta">
                          <span className="entry-author">
                            by <ALink href="#">{blogData.author}</ALink>
                          </span>
                          <span className="meta-separator">|</span>
                          <ALink href="#">
                            {new Date(blogData.createdAt).toLocaleDateString(
                              "en-US",
                              options
                            )}
                          </ALink>
                        </div>

                        <h2 className="entry-title">{blogData.title}</h2>

                        {/* <div className="entry-content editor-content">
                          <p>{blogData.content}</p>
                        </div> */}

                        <div className="entry-content editor-content">
                          <div dangerouslySetInnerHTML={{ __html: blogData.content }} />
                        </div>
                      </div>
                    </article>
                  </>
                )
              )}

              <RelatedPosts related={related} loading={loading} />
            </div>
            <div className="col-lg-3">
              <StickyBox className="sticky-content" offsetTop={70}>
                <BlogSidebar toggle={toggle} />
                {toggle ? (
                  <button
                    className="sidebar-fixed-toggler right"
                    onClick={toggleSidebar}
                  >
                    <i className="icon-cog"></i>
                  </button>
                ) : null}
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

export default withApollo({ ssr: false })(BlogDefault);