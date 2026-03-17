import React from "react";
import DynamicComponent from "~/components/DynamicComponent";

const AboutContent = ({ content }) => {
  const { contents } = content;

  // Log contents for debugging
  

  // Helper function to find a component by name
  const findComponentByName = (name) => {
    return contents.find((item) => item.component.name === name);
  };

  // Extract components
  const titleComponent = findComponentByName("title");
  const descriptionComponent = findComponentByName("description");
  const signatureImageComponent = findComponentByName("image_1");
  const mainImageComponent = contents.find(
    (item) =>
      item.component.name === "image_2" &&
      item.component.options.id !== signatureImageComponent?.component.options.id
  );

  // Track used IDs
  const usedIds = new Set(
    [
      titleComponent?.component.options.id,
      descriptionComponent?.component.options.id,
      signatureImageComponent?.component.options.id,
      mainImageComponent?.component.options.id,
      titleComponent?.component.components[0]?.options.id,
      descriptionComponent?.component.components[0]?.options.id,
      signatureImageComponent?.component.components[0]?.options.id,
      mainImageComponent?.component.components[0]?.options.id,
    ].filter((id) => id)
  );

  // Filter dynamic components
  const dynamicComponents = contents.filter(
    (item) => !usedIds.has(item.component?.options?.id)
  );

  // Log dynamic components
  

  return (
    <div className="row" id={content.id}>
      <div className="col-lg-10 offset-lg-1">
        <div className="about-text text-center mt-3">
          {/* Render title */}
          {titleComponent && (
            <h2
              className="title text-center mb-2"
              id={titleComponent.component.options.id}
            >
              {titleComponent.component.components[0]?.options.text}
            </h2>
          )}

          {/* Render description */}
          {descriptionComponent && (
            <p id={descriptionComponent.component.options.id}>
              {descriptionComponent.component.components[0]?.options.text}
            </p>
          )}

          {/* Render signature image */}
          {signatureImageComponent && (
            <div id={signatureImageComponent.component.options.id}>
              <img
                src={signatureImageComponent.component.components[0]?.options.image_url}
                alt="signature"
                className="mx-auto mb-5"
                width="140"
                height="46"
                id={signatureImageComponent.component.components[0]?.options.id}
              />
            </div>
          )}

          {/* Render main image */}
          {mainImageComponent && (
            <div id={mainImageComponent.component.options.id}>
              <img
                src={mainImageComponent.component.components[0]?.options.image_url}
                alt="main visual"
                className="mx-auto mb-6"
                width="933"
                height="390"
                id={mainImageComponent.component.components[0]?.options.id}
              />
            </div>
          )}

          {/* Render dynamic components */}
          {dynamicComponents.length > 0 && (
            <div className="dynamic-components">
              {dynamicComponents.map((item, idx) => (
                <DynamicComponent
                  key={item.component?.options?.id || `dynamic-${idx}`}
                  component={item.component}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutContent;










// import React from "react";

// const AboutContent = ({ content }) => {
//   const { contents } = content;

//   // Helper function to find a component by name
//   const findComponentByName = (name) => {
//     return contents.find((item) => item.component.name === name);
//   };

//   // Extract components
//   const titleComponent = findComponentByName("title");
//   const descriptionComponent = findComponentByName("description");
//   const signatureImageComponent = findComponentByName("image_1");
//   const mainImageComponent = contents.find(
//     (item) =>
//       item.component.name === "image_2" &&
//       item.component.options.id !== signatureImageComponent?.component.options.id
//   );

//   return (
//     <div className="row" id={content.id}>
//       <div className="col-lg-10 offset-lg-1">
//         <div className="about-text text-center mt-3">
//           {/* Render title */}
//           {titleComponent && (
//             <h2
//               className="title text-center mb-2"
//               id={titleComponent.component.options.id}
//             >
//               {
//                 titleComponent.component.components[0].options.text
//               }
//             </h2>
//           )}

//           {/* Render description */}
//           {descriptionComponent && (
//             <p id={descriptionComponent.component.options.id}>
//               {
//                 descriptionComponent.component.components[0].options.text
//               }
//             </p>
//           )}

//           {/* Render signature image */}
//           {signatureImageComponent && (
//             <div id={signatureImageComponent.component.options.id}>
//               <img
//                 src={
//                   signatureImageComponent.component.components[0].options.image_url
//                 }
//                 alt="signature"
//                 className="mx-auto mb-5"
//                 width="140"
//                 height="46"
//                 id={
//                   signatureImageComponent.component.components[0].options.id
//                 }
//               />
//             </div>
//           )}

//           {/* Render main image */}
//           {mainImageComponent && (
//             <div id={mainImageComponent.component.options.id}>
//               <img
//                 src={
//                   mainImageComponent.component.components[0].options.image_url
//                 }
//                 alt="main visual"
//                 className="mx-auto mb-6"
//                 width="933"
//                 height="390"
//                 id={
//                   mainImageComponent.component.components[0].options.id
//                 }
//               />
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default AboutContent;
