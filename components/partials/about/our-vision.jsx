import React from "react";

function OurVision({ content }) {
  if (!content || !content.contents) {
    return null;
  }

  const visionItems = content.contents;

  return (
    <div className="our-vision-section" id={content.id}>
      <div className="container-fluid">
        <div className="row">
          {visionItems.map((item, index) => {
            const visionData = item.component;
            const titleComponent = visionData.components?.find(comp => comp.name === "title");
            const descComponent = visionData.components?.find(comp => comp.name === "description");
            
            const title = titleComponent?.options?.text || "";
            const description = descComponent?.options?.text || "";

            return (
              <div key={visionData.options.id || index} className="col-lg-6 col-md-6 mb-4">
                <div className="vision-item">
                  <div className="vision-content">
                    <h3 className="vision-title">{title}</h3>
                    <p className="vision-description">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OurVision;