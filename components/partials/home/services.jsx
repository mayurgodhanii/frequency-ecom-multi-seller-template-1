import Reveal from "react-awesome-reveal";
import {
  fadeInLeftShorter,
  fadeInRightShorter,
  fadeIn,
} from "~/utils/data";
import React from "react";

const Services = ({ content }) => {
  return (
    <div className="icon-boxes-container bg-transparent" id={content?.id}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-xxl-8 col-12 icon-boxes">
            {content.contents.map((item, index) => {
              const {
                title,
                image,
                description
              } = item.component.components.reduce((acc, comp) => {
                acc[comp.name] = comp.options;
                return acc;
              }, {});

              const { id: wrapperId } = item.component.options;
              const animation = [fadeInRightShorter, fadeIn, fadeInLeftShorter][index % 3];

              return (
                <div key={wrapperId} className="col-sm-6 col-lg-4" id={wrapperId}>
                  <Reveal
                    keyframes={animation}
                    delay={200}
                    duration={1000}
                    triggerOnce
                  >
                    <div className="icon-box icon-box-side" id={`box_${wrapperId}`}>
                      <span className="icon-box-icon" id={image.id}>
                        <img
                          src={image.image_url}
                          alt={title.text}
                          width="40"
                          height="40"
                        />
                      </span>
                      <div className="icon-box-content" id={`content_${wrapperId}`}>
                        <h3 className="icon-box-title" id={title.id}>{title.text}</h3>
                        <p id={description.id}>{description.text}</p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
