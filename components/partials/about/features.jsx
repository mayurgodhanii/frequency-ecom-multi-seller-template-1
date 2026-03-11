
import React from "react";
import DynamicComponent from "~/components/DynamicComponent";

const Features = ({ content }) => {
  // Log contents for debugging
  

  // Helper function to find a component by name within a feature
  const findComponent = (feature, name) => {
    return feature.component.components.find((item) => item.name === name);
  };

  return (
    <div className="row justify-content-center" id={content.id}>
      {content.contents?.map((feature, index) => {
        const featureId = feature.component.options.id;
        const titleComponent = findComponent(feature, "title");
        const imageComponent = findComponent(feature, "image");
        const descriptionComponent = findComponent(feature, "description");

        // Track used IDs
        const usedIds = new Set(
          [
            titleComponent?.options.id,
            imageComponent?.options.id,
            descriptionComponent?.options.id,
          ].filter((id) => id)
        );

        // Filter dynamic components
        const dynamicComponents = feature.component.components.filter(
          (comp) => !usedIds.has(comp.options?.id)
        );

        // Log dynamic components
        

        return (
          <div className="col-lg-4 col-sm-6" key={index} id={featureId}>
            <div className="icon-box icon-box-sm text-center">
              <span className="icon-box-icon">
                {/* Render image if it's a URL */}
                {imageComponent?.options.image_url && (
                  <img
                    src={imageComponent.options.image_url}
                    alt="feature icon"
                    id={imageComponent.options.id}
                    height={50}
                    width={50}
                  />
                )}
              </span>
              <div className="icon-box-content">
                {/* Render title */}
                {titleComponent && (
                  <h3 className="icon-box-title" id={titleComponent.options.id}>
                    {titleComponent.options.text}
                  </h3>
                )}
                {/* Render description */}
                {descriptionComponent && (
                  <p id={descriptionComponent.options.id}>
                    {descriptionComponent.options.text}
                  </p>
                )}
                {/* Render dynamic components */}
                {dynamicComponents.length > 0 && (
                  <div className="dynamic-components">
                    {dynamicComponents.map((comp, idx) => (
                      <DynamicComponent
                        key={comp.options?.id || `dynamic-${idx}`}
                        component={comp}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Features;








// import React from "react";

// const Features = ({ content }) => {

//   // Helper function to find a component by name within a feature
//   const findComponent = (feature, name) => {
//     return feature.component.components.find((item) => item.name === name);
//   };

//   return (
//     <div className="row justify-content-center" id={content.id}>
//       {content.contents.map((feature, index) => {
//         const featureId = feature.component.options.id;
//         const titleComponent = findComponent(feature, "title");
//         const imageComponent = findComponent(feature, "image");
//         const descriptionComponent = findComponent(feature, "description");

//         return (
//           <div className="col-lg-4 col-sm-6" key={index} id={featureId}>
//             <div className="icon-box icon-box-sm text-center">
//               <span className="icon-box-icon">
//                 {/* Render image if it's a URL */}
//                 {imageComponent?.options.image_url && (
//                   <img
//                     src={imageComponent.options.image_url}
//                     alt="feature icon"

//                     id={imageComponent.options.id}
//                   />
//                 )}
//               </span>
//               <div className="icon-box-content">
//                 {/* Render title */}
//                 {titleComponent && (
//                   <h3
//                     className="icon-box-title"
//                     id={titleComponent.options.id}
//                   >
//                     {titleComponent.options.text}
//                   </h3>
//                 )}
//                 {/* Render description */}
//                 {descriptionComponent && (
//                   <p id={descriptionComponent.options.id}>
//                     {descriptionComponent.options.text}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Features;