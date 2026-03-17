import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Reveal from 'react-awesome-reveal';
import ALink from '~/components/features/alink';
import { fadeIn, fadeInLeftShorter, fadeInRightShorter, fadeInUpShorter } from '~/utils/data';

function Banners2({ content }) {
    if (!content || !content.contents) {
        return null;
    }

    // Extract banner items
    const banners = content.contents.filter(item => item.component.name.startsWith("banner_"));

    return (
        <section className="banners2-section" id={content.id}>
            <div className="container-fluid">
                <div className="row">
                    {banners.map((banner, index) => {
                        const { component } = banner;
                        const { options: componentOptions, components } = component;

                        // Extract data from components
                        const { sub_title, title, button, image, background_color } = Object.fromEntries(
                            components.map(({ name, options }) => [name, options])
                        );

                        const revealAnim = index === 0 ? fadeInLeftShorter : fadeInRightShorter;
                        const colClass = "col-lg-6 col-md-6";

                        return (
                            <div key={componentOptions.id} id={componentOptions.id} className={colClass}>
                                <Reveal keyframes={revealAnim} delay={200 + (index * 200)} duration={1000} triggerOnce>
                                    <div 
                                        className="banner2-custom"
                                        style={{ backgroundColor: background_color?.color || '#f5f5f5' }}
                                    >
                                        {/* Content on Left */}
                                        <div className="banner2-content-left ">
                                            <Reveal keyframes={fadeInUpShorter} delay={400 + (index * 200)} duration={1000} triggerOnce>
                                                <div className="banner2-text-content">
                                                    <p className="banner-subtitle">
                                                        {sub_title?.text}
                                                    </p>
                                                    <h2 className="banner-title">
                                                        {title?.text}
                                                    </h2>
                                                    <ALink
                                                        href={button?.link || '#'}
                                                        className="btn underline"
                                                    >
                                                        {button?.text}
                                                    </ALink>
                                                </div>
                                            </Reveal>
                                        </div>
                                        
                                        {/* Image on Right */}
                                        <div className="banner2-image-right">
                                            <LazyLoadImage
                                                alt={title?.text || 'Banner'}
                                                src={image?.image_url}
                                                threshold={200}
                                                width="100%"
                                                height="auto"
                                                effect="blur"
                                                className="banner2-image-custom"
                                            />
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Banners2;