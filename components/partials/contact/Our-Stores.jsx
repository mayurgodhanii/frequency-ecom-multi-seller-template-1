import React from "react";
import ALink from "~/components/features/alink";
import DynamicComponent from "~/components/DynamicComponent";

const OurStores = ({ content }) => {
  const { contents } = content;

  // Log contents for debugging
  

  // Map over store components
  const stores = contents
    .filter((item) => item.component.name.startsWith("Store_"))
    .map((item) => {
      const { component } = item;
      const storeData = {
        id: component.options.id,
        components: component.components,
      };

      component.components.forEach((child) => {
        const { name, options } = child;
        switch (name) {
          case "title":
            storeData.title = options.text;
            storeData.titleId = options.id;
            break;
          case "address":
            storeData.address = options.text;
            storeData.addressId = options.id;
            break;
          case "phone":
            storeData.phone = options.text;
            storeData.phoneId = options.id;
            break;
          case "hours-title":
            storeData.hoursTitle = options.text;
            storeData.hoursTitleId = options.id;
            break;
          case "Hours":
            storeData.hours = storeData.hours || [];
            storeData.hours.push({
              dayRange: options.dayRange,
              time: options.time,
              id: options.id,
            });
            break;
          case "image":
            storeData.image = options.image_url;
            storeData.imageId = options.id;
            break;
          case "button":
            storeData.mapLink = options.link;
            storeData.mapLinkId = options.id;
            break;
          default:
            break;
        }
      });

      return storeData;
    });

  // Extract Map component
  const mapComp = contents.find((item) => item.component.name === "Map")?.component;
  const mapWrapperId = mapComp?.options.id || "";
  const mapLinkComp = mapComp?.components.find((c) => c.name === "Link");
  const mapIframeHtml = mapLinkComp?.options.link || "";
  const mapLinkId = mapLinkComp?.options.id || "";

  // Track used IDs
  const usedIds = new Set(
    [
      mapWrapperId,
      mapLinkId,
      ...stores.flatMap((store) => [
        store.id,
        store.titleId,
        store.addressId,
        store.phoneId,
        store.hoursTitleId,
        store.imageId,
        store.mapLinkId,
        ...(store.hours || []).map((hr) => hr.id),
      ]),
    ].filter((id) => id)
  );

  // Filter dynamic components (section-level)
  const dynamicComponents = contents.filter(
    (item) => !usedIds.has(item.component.options.id)
  );

  // Log dynamic components
  

  return (
    <>
      <div className="stores mb-4 mb-lg-5" id={content.id}>
        <h2 className="title text-center mb-3">Our Stores</h2>

        <div className="row">
          {stores.map((store, idx) => {
            // Filter dynamic components for this store
            const storeDynamicComponents = store.components.filter(
              (item) => !usedIds.has(item.options.id)
            );

            // Log store dynamic components
            

            return (
              <div className="col-lg-6" key={store.id} id={store.id}>
                <div className="store">
                  <div className="row align-items-center">
                    <div className="col-sm-5 col-xl-6">
                      <figure className="store-media mb-2 mb-lg-0" id={store.imageId}>
                        <img
                          src={store.image}
                          alt={store.title}
                          className="w-100"
                        />
                      </figure>
                    </div>

                    <div className="col-sm-7 col-xl-6">
                      <div className="store-content">
                        <h3 className="store-title" id={store.titleId}>
                          {store.title}
                        </h3>
                        <address id={store.addressId}>{store.address}</address>
                        <div>
                          <ALink href={`tel:${store.phone}`} id={store.phoneId}>
                            {store.phone}
                          </ALink>
                        </div>

                        <h4 className="store-subtitle" id={store.hoursTitleId}>
                          {store.hoursTitle}
                        </h4>
                        {store.hours?.map((hr, i) => (
                          <div key={i} id={hr.id}>
                            <strong>{hr.dayRange}</strong>: {hr.time}
                          </div>
                        ))}

                        <ALink
                          href={store.mapLink}
                          className="btn btn-link"
                          target="_blank"
                          id={store.mapLinkId}
                        >
                          <span>View Map</span>
                          <i className="icon-long-arrow-right"></i>
                        </ALink>

                        {/* Render dynamic components for this store */}
                        {storeDynamicComponents.length > 0 && (
                          <div className="dynamic-components">
                            {storeDynamicComponents.map((item, idx) => (
                              <DynamicComponent
                                key={item.options.id || `dynamic-store-${idx}`}
                                component={item}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Render section-level dynamic components */}
        {dynamicComponents.length > 0 && (
          <div className="dynamic-components">
            {dynamicComponents.map((item, idx) => (
              <DynamicComponent
                key={item.component.options.id || `dynamic-section-${idx}`}
                component={item.component}
              />
            ))}
          </div>
        )}
      </div>

      {/* Map Section */}
      {mapIframeHtml && (
        <div id={mapWrapperId} className="w-100">
          <div
            style={{ width: "100%", height: "400px", marginBottom: "20px" }}
            dangerouslySetInnerHTML={{ __html: mapIframeHtml }}
            id={mapLinkId}
          />
        </div>
      )}
    </>
  );
};

export default OurStores;






// import React from "react";
// import ALink from "~/components/features/alink";

// const OurStores = ({ content }) => {
//   // Map over store components extracting IDs and content
//   const stores = content.contents
//     .filter(item => item.component.name.startsWith("Store_"))
//     .map(item => {
//       const { component } = item;
//       const storeData = {
//         id: component.options.id
//       };

//       component.components.forEach(child => {
//         const { name, options } = child;
//         switch (name) {
//           case "title":
//             storeData.title = options.text;
//             storeData.titleId = options.id;
//             break;
//           case "address":
//             storeData.address = options.text;
//             storeData.addressId = options.id;
//             break;
//           case "phone":
//             storeData.phone = options.text;
//             storeData.phoneId = options.id;
//             break;
//           case "hours-title":
//             storeData.hoursTitle = options.text;
//             storeData.hoursTitleId = options.id;
//             break;
//           case "Hours":
//             storeData.hours = storeData.hours || [];
//             storeData.hours.push({
//               dayRange: options.dayRange,
//               time: options.time,
//               id: options.id
//             });
//             break;
//           case "image":
//             storeData.image = options.image_url;
//             storeData.imageId = options.id;
//             break;
//           case "button":
//             storeData.mapLink = options.link;
//             storeData.mapLinkId = options.id;
//             break;
//           default:
//             break;
//         }
//       });

//       return storeData;
//     });

//   // Extract Map component
//   const mapComp = content.contents.find(item => item.component.name === "Map")?.component;
//   const mapWrapperId = mapComp?.options.id;
//   const mapLinkComp = mapComp?.components.find(c => c.name === "Link");
//   const mapIframeHtml = mapLinkComp?.options.link;
//   const mapLinkId = mapLinkComp?.options.id;

//   return (
//     <>
//       <div className="stores mb-4 mb-lg-5" id={content.id}>
//         <h2 className="title text-center mb-3">Our Stores</h2>

//         <div className="row">
//           {stores.map((store, idx) => (
//             <div className="col-lg-6" key={idx} id={store.id}>
//               <div className="store">
//                 <div className="row align-items-center">
//                   <div className="col-sm-5 col-xl-6">
//                     <figure className="store-media mb-2 mb-lg-0" id={store.imageId}>
//                       <img
//                         src={store.image}
//                         alt={store.title}
//                         className="w-100"
//                       />
//                     </figure>
//                   </div>

//                   <div className="col-sm-7 col-xl-6">
//                     <div className="store-content">
//                       <h3 className="store-title" id={store.titleId}>
//                         {store.title}
//                       </h3>
//                       <address id={store.addressId}>{store.address}</address>
//                       <div>
//                         <ALink href={`tel:${store.phone}`} id={store.phoneId}>
//                           {store.phone}
//                         </ALink>
//                       </div>

//                       <h4 className="store-subtitle" id={store.hoursTitleId}>
//                         {store.hoursTitle}
//                       </h4>
//                       {store.hours.map((hr, i) => (
//                         <div key={i} id={hr.id}>
//                           <strong>{hr.dayRange}</strong>: {hr.time}
//                         </div>
//                       ))}

//                       <ALink
//                         href={store.mapLink}
//                         className="btn btn-link"
//                         target="_blank"
//                         id={store.mapLinkId}
//                       >
//                         <span>View Map</span>
//                         <i className="icon-long-arrow-right"></i>
//                       </ALink>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Map Section */}
//       <div id={mapWrapperId} className="w-100">
//         <div
//           style={{ width: "100%", height: "100%" }}
//           dangerouslySetInnerHTML={{ __html: mapIframeHtml }}
//           id={mapLinkId}
//         />
//       </div>
//     </>
//   );
// };

// export default OurStores;






