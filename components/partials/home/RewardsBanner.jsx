import { LazyLoadImage } from "react-lazy-load-image-component";
import Reveal from "react-awesome-reveal";
import ALink from "~/components/features/alink";
import {
  fadeIn,
  fadeInUpShorter,
} from "~/utils/data";
import React from "react";

const RewardsBanner = ({ content }) => {
  return (
    <div className=" rewards-banner-section" id={content.id}>
      <div className="row">
        {content.contents.map((item, index) => {
          const { component } = item;
          const { options: componentOptions, components } = component;

          const { title, description, button, image } = Object.fromEntries(
            components.map(({ name, options }) => [name, options])
          );

          return (
            <div key={componentOptions.id} id={componentOptions.id} className="col-12">
              <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
                <div 
                  className="rewards-banner-container" 
                  id={image.id}
                  style={{
                    backgroundImage: `url(${image.image_url})`,
                  }}
                >
                  <div className="rewards-overlay"></div>
                  <div className="rewards-content-wrapper">
                    <div className="rewards-text-content container-fluid">
                      <Reveal keyframes={fadeInUpShorter} delay={200} duration={1000} triggerOnce>
                        <div>
                          <h2 className="rewards-title" id={title.id}>
                            {title.text}
                          </h2>
                          <p className="rewards-description" id={description.id}>
                            {description.text}
                          </p>
                          <ALink
                            href={button.link}
                            className="rewards-btn"
                          >
                            <span id={button.id}>{button.text}</span>
                          </ALink>
                        </div>
                      </Reveal>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RewardsBanner;