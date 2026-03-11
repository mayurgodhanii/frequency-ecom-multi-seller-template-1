import { countTo } from "~/utils";
import React, { useEffect } from "react";
import DynamicComponent from "~/components/DynamicComponent";

const Brands = ({ content }) => {
  // Log contents for debugging
  

  useEffect(() => {
    countTo();
  }, []);

  // Extract title, description, and brands
  const title = content.contents.find((item) => item.component.name === "title");
  const description = content.contents.find((item) => item.component.name === "description");
  const brands = content.contents.filter((item) => item.component.name.startsWith("brand_")).map(
    (brand) => ({
      image: brand.component.components[0]?.options.image_url,
      width: 100,
      height: 100,
      id: brand.component.options.id,
      imageId: brand.component.components[0]?.options.id,
    })
  );

  // Track used IDs
  const usedIds = new Set(
    [
      title?.component.options.id,
      description?.component.options.id,
      title?.component.components[0]?.options.id,
      description?.component.components[0]?.options.id,
      ...brands.map((b) => b.id),
      ...brands.map((b) => b.imageId),
    ].filter((id) => id)
  );

  // Filter dynamic components
  const dynamicComponents = content.contents.filter(
    (item) => !usedIds.has(item.component?.options?.id)
  );

  // Log dynamic components
  

  return (
    <div className="container" id={content?.id}>
      <div className="row">
        <div className="col-lg-10 offset-lg-1">
          <div className="brands-text text-center mx-auto mb-6">
            {title && (
              <h2 className="title" id={title.component.options.id}>
                {title.component.components[0]?.options.text}
              </h2>
            )}
            {description && (
              <p id={description.component.options.id}>
                {description.component.components[0]?.options.text}
              </p>
            )}
          </div>
          <div className="brands-display">
            <div className="row justify-content-center">
              {brands.slice(0, 8).map((brand, index) => (
                <div className="col-6 col-sm-4 col-md-3" key={index}>
                  <div className="brand" id={brand.id}>
                    <img
                      src={brand.image}
                      alt="Brand Name"
                      width={brand.width}
                      height={brand.height}
                      id={brand.imageId}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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

export default Brands;









// import { countTo } from "~/utils";
// import React, { useEffect } from "react";

// const Brands = ({ content }) => {

  
//   useEffect(() => {
//     countTo();
//   }, []);

//   // Extract title, description, and brands from the content
//   const title = content.contents.find(item => item.component.name === "title")?.component.components[0]?.options.text;
//   const description = content.contents.find(item => item.component.name === "description")?.component.components[0]?.options.text;
//   const brands = content.contents.filter(item => item.component.name.startsWith("brand_")).map(brand => ({
//     image: brand.component.components[0]?.options.image_url,
//     width: 100, // Default width, adjust as needed
//     height: 100 // Default height, adjust as needed
//   }));

//   return (
//     <div className="container" id={content?.id}>
//       <div className="row">
//         <div className="col-lg-10 offset-lg-1">
//           <div className="brands-text text-center mx-auto mb-6">
//             <h2 className="title" id="id_title456b">{title}</h2>
//             <p id="id_desc012b">{description}</p>
//           </div>
//           <div className="brands-display">
//             <div className="row justify-content-center">
//               {brands.slice(0, 8).map((brand, index) => (
//                 <div className="col-6 col-sm-4 col-md-3" key={index}>
//                   <div className="brand" id={`id_b${index + 1}_678`}>
//                     <img
//                       src={brand.image}
//                       alt="Brand Name"
//                       width={brand.width}
//                       height={brand.height}
//                       id={`id_img${index + 1}_678`}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Brands;