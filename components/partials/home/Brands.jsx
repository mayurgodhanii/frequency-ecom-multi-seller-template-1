import React from "react";
import Reveal from "react-awesome-reveal";
import ALink from "~/components/features/alink";
import OwlCarousel from "~/components/features/owl-carousel";
import { brandSlider, fadeIn } from "~/utils/data";

const Brands = ({ content }) => {
  return (
    <div id={content?.id || "brands-section"}>
      <Reveal keyframes={fadeIn} delay={100} duration={500} triggerOnce>
        <OwlCarousel
          adClass="brands-border owl-simple brand-carousel"
          options={brandSlider}
        >
          {content?.contents?.map((brandWrapper, index) => {
            const brand = brandWrapper.component;
            const brandId = brand?.options?.id || `brand-${index}`;
            const imageComponent = brand.components?.find(comp => comp.name === "image");
            const imageUrl = imageComponent?.options?.image_url || "";
            const imageId = imageComponent?.options?.id || `image-${index}`;

            return (
              <div id={brandId}>
              <ALink href="#" className="brand mr-0" key={brandId} >
                <img
                  id={imageId}
                  src={imageUrl}
                  alt={`brand-${index + 1}`}
                  width={100}
                  height={50}
                />
              </ALink>
              </div>
            );
          })}
        </OwlCarousel>
      </Reveal>
    </div>
  );
};

export default Brands;
