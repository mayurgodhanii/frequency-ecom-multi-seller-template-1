import { LazyLoadImage } from 'react-lazy-load-image-component';
import ALink from '~/components/features/alink';

function PostFour(props) {
  const { post } = props;

  let date = new Date(post.createdAt);
  let options = { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" };

  return (
    <article className="entry">
      <figure className="entry-media" style={{ paddingTop: '56.25%' }}> 
        <ALink href={`/blog/${post.slug}`}>
          <div className="lazy-overlay"></div>

          <LazyLoadImage
            alt={post.title}
            src={post.image} 
            threshold={500}
            effect="blur"
            height="auto"
            width="100%" 
          />
        </ALink>
      </figure>
      <div className="entry-body">
        <div className="entry-meta">
          <ALink href={`/blog/${post.slug}`}>{date.toLocaleDateString('en-US', options)}</ALink>
        </div>

        <h2 className="entry-title">
          <ALink href={`/blog/${post.slug}`}>
            {post.title}
          </ALink>
        </h2>

        <div className="entry-content">
          <ALink href={`/blog/${post.slug}`} className="read-more">
            Continue Reading
          </ALink>
        </div>
      </div>
    </article>
  );
}

export default PostFour;
