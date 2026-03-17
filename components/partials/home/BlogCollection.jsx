import Reveal from "react-awesome-reveal";
import ALink from "~/components/features/alink";
import OwlCarousel from "~/components/features/owl-carousel";
import PostFour from "~/components/features/posts/post-four";

import { fadeIn, blogSlider } from "~/utils/data";
import { useState, useEffect, useMemo } from "react";
import { apirequest } from "~/utils/api";

function BlogCollection({ content, className = "", style = {} }) {
  const wrapperId = content?.id;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await apirequest(
          "GET",
          `/user/blog-list`,
          null,
          { page: "", size: "", search: "" }
        );

        if (response && response.success) {
          setPosts(response.data.data);
        } else {
          setError("Failed to fetch blogs.");
        }
      } catch (error) {
        setError("An error occurred while fetching blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Memoize the carousel content to prevent unnecessary re-renders
  const carouselContent = useMemo(() => {
    if (loading || posts.length === 0) {
      return [0, 1, 2, 3, 4].map((item, index) => (
        <div className="skel-pro" key={`skeleton-${index}`}></div>
      ));
    }

    return posts.map((item, index) => (
      <div key={`post-${item.id || index}`}>
        <Reveal
          keyframes={fadeIn}
          delay={100}
          duration={1000}
          triggerOnce
        >
          <PostFour post={item} />
        </Reveal>
      </div>
    ));
  }, [loading, posts]);

  return (
    <section
      className={`blog-posts ${className}`}
      id={wrapperId}
      style={style}
    >
      <div className="container-fluid">
        <h2 className="title text-center mb-3">From Our Blog</h2>

        <OwlCarousel
          adClass={`owl-simple pb-3 carousel-with-shadow cols-lg-3 cols-sm-2 cols-1 ${loading ? 'loading' : 'loaded'}`}
          options={blogSlider}
          key={`carousel-${loading ? 'loading' : 'loaded'}-${posts.length}`}
        >
          {carouselContent}
        </OwlCarousel>

        <div className="text-center mb-7 mt-2">
          <ALink
            href="/blog"
            className="btn btn-outline-darker btn-more"
          >
            <span>View more Blogs</span>
            <i className="icon-long-arrow-right"></i>
          </ALink>
        </div>
      </div>
    </section>
  );
}

export default BlogCollection;
