


import { connect } from 'react-redux';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import ALink from '~/components/features/alink';

function PostOne(props) {
    const { post, adClass = "", isContent = true, isAuthor = true } = props;

    const openVideoModal = (e) => {
        e.preventDefault();
        props.showVideo();
    };

    const date = new Date(post.createdAt);
    const options = { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" };

    return (
        <article className={`entry ${adClass}`}>
            <figure
                className="entry-media"
                style={{ paddingTop: "56.25%" }}
            >
                <ALink href={`/blog/${post.slug}`}>
                    <div className="lazy-overlay"></div>

                    <LazyLoadImage
                        alt={post.title}
                        src={post.image}
                        threshold={500}
                        effect="blur"
                        height="auto"
                    />
                </ALink>
            </figure>

            <div className="entry-body">
                <div className="entry-meta">
                    {isAuthor ? (
                        <>
                            <span className="entry-author">
                                by <ALink href={`/blog/${post.slug}`}>{post.author}</ALink>
                            </span>
                            <span className="meta-separator">|</span>
                        </>
                    ) : null}
                    <ALink href={`/blog/${post.slug}`}>
                        {date.toLocaleDateString("en-US", options)}
                    </ALink>
                </div>

                <h2 className="entry-title">
                    <ALink href={`/blog/${post.slug}`}>{post.title}</ALink>
                </h2>

                {isContent && (
                    <div className="entry-content">
                        <p>{post.description}</p>
                        <ALink href={`/blog/${post.slug}`} className="read-more">
                            Continue Reading
                        </ALink>
                    </div>
                )}
            </div>
        </article>
    );
}

export default connect(null, null)(PostOne);
