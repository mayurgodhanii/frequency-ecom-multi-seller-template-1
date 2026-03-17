import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Reveal from 'react-awesome-reveal';
import { fadeIn, fadeInUpShorter } from '~/utils/data';

function Highlights({ content }) {
    if (!content || !content.contents) {
        return null;
    }

    // Extract title from the content structure
    const titleComponent = content.contents.find(item => item.component.name === "title");
    const titleText = titleComponent?.component?.components?.[0]?.options?.text || "Highlights for you";

    // Extract highlight items (excluding the title)
    const highlights = content.contents.filter(item => item.component.name.startsWith("highlight_"));

    return (
        <section className="highlights-section" id={content.id}>
            <div className="container-fluid">
                <div className="row">
                <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
                    <div className="highlights-container">
                        {/* Section Title */}
                        <div className="section-header">
                            <h2 className="section-title">{titleText}</h2>
                        </div>

                        {/* Highlights Grid */}
                        <div className="highlights-grid">
                            {highlights.map((highlight, index) => {
                                const { component } = highlight;
                                const { components } = component;

                                // Extract data from components
                                const imageData = components.find(c => c.name === "image")?.options;
                                const profileIconData = components.find(c => c.name === "profile_icon")?.options;
                                const titleData = components.find(c => c.name === "title")?.options;
                                const descriptionData = components.find(c => c.name === "description")?.options;
                                const ratingData = components.find(c => c.name === "rating")?.options;

                                return (
                                    <Reveal 
                                        key={component.options.id} 
                                        keyframes={fadeInUpShorter} 
                                        delay={300 + (index * 100)} 
                                        duration={800} 
                                        triggerOnce
                                    >
                                        <div className="highlight-card">
                                            {/* Heart Icon */}
                                            {/* <div className="heart-icon">
                                                <i className="icon-heart-o"></i>
                                            </div> */}

                                            {/* Main Image - Large */}
                                            <div className="highlight-image-large">
                                                <LazyLoadImage
                                                    src={imageData?.image_url}
                                                    alt={titleData?.text || 'Highlight'}
                                                    width="100%"
                                                    height="300"
                                                    effect="blur"
                                                    className="card-image-large"
                                                />
                                            </div>

                                            {/* Card Content - Below Image */}
                                            <div className="highlight-content-bottom">
                                                {/* Profile Icon, Title+Description and Rating in one row */}
                                                <div className="highlight-bottom-row">
                                                    <div className="profile-icon-small">
                                                        <LazyLoadImage
                                                            src={profileIconData?.image_url}
                                                            alt="Profile"
                                                            width="40"
                                                            height="40"
                                                            effect="blur"
                                                            className="profile-image-small"
                                                        />
                                                    </div>
                                                    
                                                    <div className="highlight-info-bottom">
                                                        <h3 className="highlight-title-large">
                                                            {titleData?.text}
                                                        </h3>
                                                        <p className="highlight-description-large">
                                                            {descriptionData?.text}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="highlight-rating-right">
                                                        {/* <i className="icon-star-full"> */}
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
<path d="M5.42731 4.75348L0.642314 5.44723L0.557564 5.46448C0.429268 5.49854 0.31231 5.56603 0.218633 5.66008C0.124956 5.75412 0.0579163 5.87134 0.0243603 5.99977C-0.0091957 6.1282 -0.00806585 6.26323 0.0276344 6.39108C0.0633346 6.51893 0.132326 6.63501 0.227564 6.72748L3.69406 10.1017L2.87656 14.868L2.86681 14.9505C2.85896 15.0832 2.88651 15.2156 2.94665 15.3341C3.00679 15.4526 3.09735 15.5531 3.20906 15.6251C3.32078 15.6971 3.44963 15.7382 3.58242 15.7441C3.71522 15.7499 3.84719 15.7204 3.96481 15.6585L8.24431 13.4085L12.5141 15.6585L12.5891 15.693C12.7129 15.7417 12.8474 15.7567 12.9789 15.7363C13.1104 15.7159 13.234 15.6609 13.3373 15.5769C13.4405 15.493 13.5195 15.383 13.5662 15.2585C13.6129 15.1339 13.6256 14.9991 13.6031 14.868L12.7848 10.1017L16.2528 6.72673L16.3113 6.66298C16.3949 6.56005 16.4497 6.43682 16.4701 6.30582C16.4905 6.17483 16.4759 6.04076 16.4276 5.91727C16.3794 5.79379 16.2993 5.6853 16.1954 5.60286C16.0916 5.52042 15.9678 5.46698 15.8366 5.44798L11.0516 4.75348L8.91256 0.418477C8.85067 0.292878 8.75485 0.187113 8.63596 0.113155C8.51706 0.0391975 8.37984 0 8.23981 0C8.09979 0 7.96257 0.0391975 7.84367 0.113155C7.72478 0.187113 7.62896 0.292878 7.56706 0.418477L5.42731 4.75348Z" fill="#FFB405"/>
</svg>
                                                        {/* </i> */}
                                                        <span className="rating-value-large">
                                                            {ratingData?.value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>
             </div>

            </div>
        </section>
    );
}

export default Highlights;