import React from "react";

function WhoWeAre({ content }) {
  if (!content || !content.contents) {
    return null;
  }

  // Helper function to find a component by name
  const findComponentByName = (name) => {
    return content.contents.find((item) => item.component.name === name);
  };

  // Extract components
  const titleComponent = findComponentByName("title");
  const subTitleComponent = findComponentByName("sub_title");
  const descriptionComponent = findComponentByName("description");
  const imageComponent = findComponentByName("image");

  const title = titleComponent?.component.components?.[0]?.options?.text || "";
  const subTitle = subTitleComponent?.component.components?.[0]?.options?.text || "";
  const description = descriptionComponent?.component.components?.[0]?.options?.text || "";
  const imageUrl = imageComponent?.component.components?.[0]?.options?.image_url || "";

  return (
    <div className="who-we-are-section-wrapper" id={content.id}>
      <div className="who-we-are-section pt-6 pb-6">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="who-we-are-content">
                 {title && (
                  <h2 className="title mb-3">{title}</h2>
                )}
                {subTitle && (
                  <span className="subtitle text-primary mb-2 d-block">{subTitle}</span>
                )}
               
                {description && (
                  <p className="description">{description}</p>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              {imageUrl && (
                <div className="who-we-are-image">
                  <img 
                    src={imageUrl} 
                    alt={title || "Who We Are"} 
                    className="img-fluid rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhoWeAre;