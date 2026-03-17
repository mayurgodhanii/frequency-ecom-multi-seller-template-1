import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import ALink from "~/components/features/alink";
import DynamicComponent from "~/components/DynamicComponent";

function Footer({ footerContent, logo }) {
  const router = useRouter();
  const [isBottomSticky, setIsBottomSticky] = useState(false);
  const [containerClass, setContainerClass] = useState("container");

  useEffect(() => {
    handleBottomSticky();
    setContainerClass(
      router.asPath.includes("fullwidth") ? "container-fluid" : "container"
    );
  }, [router.asPath]);

  useEffect(() => {
    window.addEventListener("resize", handleBottomSticky, { passive: true });
    return () => {
      window.removeEventListener("resize", handleBottomSticky);
    };
  }, []);

  function handleBottomSticky() {
    setIsBottomSticky(
      router.pathname.includes("product/default") && window.innerWidth > 991
    );
  }

  // Helper function to find components by name
  const getComponents = (name) => {
    const contents = footerContent?.component?.options?.contents || [];
    return (
      contents.find((item) => item.component.name === name)?.component
        .components || []
    );
  };

  // Helper function to get component ID
  const getComponentId = (name) => {
    const contents = footerContent?.component?.options?.contents || [];
    return contents.find((item) => item.component.name === name)?.component
      .options?.id || "";
  };

  // Helper function to find the heading
  const getHeading = (name) => {
    const contents = footerContent?.component?.options?.contents || [];
    return contents.find((item) => item.component.name === name)?.component
      .name || name;
  };

  // Extract data from footerContent
  const imageComponent = getComponents("image");
  const descriptionComponent = getComponents("description");
  const contactComponent = getComponents("contact");
  const informationComponent = getComponents("Information");
  const customerServiceComponent = getComponents("Customer Service");
  const myAccountComponent = getComponents("My Account");
  const copyrightComponent = getComponents("Copyright");
  const socialMediaComponent = getComponents("Social Media");

  // Extract IDs for div elements
  const footerId = footerContent?.component?.options?.id || "";
  const imageId = getComponentId("image");
  const descriptionId = getComponentId("description");
  const contactId = getComponentId("contact");
  const informationId = getComponentId("Information");
  const customerServiceId = getComponentId("Customer Service");
  const myAccountId = getComponentId("My Account");
  const copyrightId = getComponentId("Copyright");
  const socialMediaId = getComponentId("Social Media");

  // Track used IDs
  const usedIds = new Set(
    [
      imageId,
      descriptionId,
      contactId,
      informationId,
      customerServiceId,
      myAccountId,
      copyrightId,
      socialMediaId,
      ...imageComponent.map((item) => item.options.id),
      ...descriptionComponent.map((item) => item.options.id),
      ...contactComponent.map((item) => item.options.id),
      ...informationComponent.map((item) => item.options.id),
      ...customerServiceComponent.map((item) => item.options.id),
      ...myAccountComponent.map((item) => item.options.id),
      ...copyrightComponent.map((item) => item.options.id),
      ...socialMediaComponent.map((item) => item.options.id),
    ].filter((id) => id)
  );

  // Filter dynamic components
  const contents = footerContent?.component?.options?.contents || [];
  const dynamicComponents = contents.filter(
    (item) => !usedIds.has(item.component?.options?.id)
  );



  return (
    <footer className="footer footer-2" id={footerId}>
      <div className="footer-middle" id={`${footerId}-middle`}>
        <div className="container-fluid" id={`${footerId}-container`}>
          <div className="row" id={`${footerId}-row`}>
            <div className="col-sm-12 col-lg-6" id={`${imageId}-col`}>
              <div className="widget widget-about" id={imageId}>
                {imageComponent.map((item, index) => (
                  <img
                    key={item.options.id}
                    id={item.options.id}
                    src={logo}
                    className="footer-logo"
                    alt="Footer Logo"
                    width="130"
                    height="80"
                  />
                ))}
                {descriptionComponent.map((item, index) => (
                  <p key={item.options.id} id={item.options.id}>
                    {item.options.text}
                  </p>
                ))}
                <div className="widget-about-info" id={`${contactId}-info`}>
                  <div className="row" id={`${contactId}-row`}>
                    <div className="col-sm-6 col-md-4" id={contactId}>
                      {contactComponent.map((item, index) => (
                        <React.Fragment key={item.options.id}>
                          {item.name === "text" && (
                            <span
                              className="widget-about-title"
                              id={item.options.id}
                            >
                              {item.options.text}
                            </span>
                          )}
                          {item.name === "phone" && (
                            <ALink
                              href={`tel:${item.options.text}`}
                              id={item.options.id}
                            >
                              {item.options.text}
                            </ALink>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-4 col-lg-2" id={`${informationId}-col`}>
              <div className="widget" id={informationId}>
                <h4 className="widget-title">
                  {getHeading("Information") || "Information"}
                </h4>
                <ul className="widget-list">
                  {informationComponent.map((item, index) => (
                    <li key={item.options.id} id={item.options.id}>
                      <ALink href={item.options.link}>{item.options.text}</ALink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-sm-4 col-lg-2" id={`${customerServiceId}-col`}>
              <div className="widget" id={customerServiceId}>
                <h4 className="widget-title">
                  {getHeading("Customer Service") || "Customer Service"}
                </h4>
                <ul className="widget-list">
                  {customerServiceComponent.map((item, index) => (
                    <li key={item.options.id} id={item.options.id}>
                      <ALink href={item.options.link}>{item.options.text}</ALink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-sm-4 col-lg-2" id={`${myAccountId}-col`}>
              <div className="widget" id={myAccountId}>
                <h4 className="widget-title">
                  {getHeading("My Account") || "My Account"}
                </h4>
                <ul className="widget-list">
                  {myAccountComponent.map((item, index) => (
                    <li key={item.options.id} id={item.options.id}>
                      <ALink href={item.options.link}>{item.options.text}</ALink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Render dynamic components in footer-middle */}
          {dynamicComponents.length > 0 && (
            <div className="dynamic-components" id={`${footerId}-dynamic`}>
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

      <div className="footer-bottom" id={`${footerId}-bottom`}>
        <div className="container-fluid" id={`${copyrightId}-container`}>
          {copyrightComponent.map((item, index) => (
            <p
              key={item.options.id}
              id={item.options.id}
              className="footer-copyright"
            >
              {item.options.text}
            </p>
          ))}

          <div className="social-icons social-icons-color" id={socialMediaId}>
            <span className="social-label">
              {getHeading("Social Media") || "Social Media "}
            </span>
            {socialMediaComponent.map((item, index) => (
              <React.Fragment key={item.options.id}>
                <ALink
                  href={item.options.facebook}
                  className="social-icon social-facebook"
                  rel="noopener noreferrer"
                  title="Facebook"
                  id={`${item.options.id}-fb`}
                >
                  <i className="icon-facebook-f"></i>
                </ALink>
                <ALink
                  href={item.options.twitter}
                  className="social-icon social-twitter"
                  rel="noopener noreferrer"
                  title="Twitter"
                  id={`${item.options.id}-tw`}
                >
                  <i className="icon-twitter"></i>
                </ALink>
                <ALink
                  href={item.options.instagram}
                  className="social-icon social-instagram"
                  rel="noopener noreferrer"
                  title="Instagram"
                  id={`${item.options.id}-ig`}
                >
                  <i className="icon-instagram"></i>
                </ALink>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {isBottomSticky && <div className="mb-10" id={`${footerId}-sticky`}></div>}
    </footer>
  );
}

export default React.memo(Footer);
















// import { useRouter } from "next/router";
// import React, { useState, useEffect } from "react";
// import ALink from "~/components/features/alink";

// function Footer({ footerContent, logo }) {
//   const router = useRouter();
//   const [isBottomSticky, setIsBottomSticky] = useState(false);
//   const [containerClass, setContainerClass] = useState("container");

//   useEffect(() => {
//     handleBottomSticky();
//     setContainerClass(
//       router.asPath.includes("fullwidth") ? "container-fluid" : "container"
//     );
//   }, [router.asPath]);

//   useEffect(() => {
//     window.addEventListener("resize", handleBottomSticky, { passive: true });
//     return () => {
//       window.removeEventListener("resize", handleBottomSticky);
//     };
//   }, []);

//   function handleBottomSticky() {
//     setIsBottomSticky(
//       router.pathname.includes("product/default") && window.innerWidth > 991
//     );
//   }

//   // Helper function to find components by name
//   const getComponents = (name) => {
//     const contents = footerContent?.component?.options?.contents || [];
//     return (
//       contents.find((item) => item.component.name === name)?.component
//         .components || []
//     );
//   };

//   // Helper function to get component ID
//   const getComponentId = (name) => {
//     const contents = footerContent?.component?.options?.contents || [];
//     return contents.find((item) => item.component.name === name)?.component
//       .options?.id || "";
//   };

//   // Helper function to find the heading
//   const getHeading = (name) => {
//     const contents = footerContent?.component?.options?.contents || [];
//     return contents.find((item) => item.component.name === name)?.component
//       .name || name;
//   };

//   // Extract data from footerContent
//   const imageComponent = getComponents("image");
//   const descriptionComponent = getComponents("description");
//   const contactComponent = getComponents("contact");
//   const informationComponent = getComponents("Information");
//   const customerServiceComponent = getComponents("Customer Service");
//   const myAccountComponent = getComponents("My Account");
//   const copyrightComponent = getComponents("Copyright");
//   const socialMediaComponent = getComponents("Social Media");

//   // Extract IDs for div elements
//   const footerId = footerContent?.component?.options?.id || "";
//   const imageId = getComponentId("image");
//   const descriptionId = getComponentId("description");
//   const contactId = getComponentId("contact");
//   const informationId = getComponentId("Information");
//   const customerServiceId = getComponentId("Customer Service");
//   const myAccountId = getComponentId("My Account");
//   const copyrightId = getComponentId("Copyright");
//   const socialMediaId = getComponentId("Social Media");

//   return (
//     <footer className="footer footer-2" id={footerId}>
//       <div className="footer-middle" id={`${footerId}-middle`}>
//         <div className={containerClass} id={`${footerId}-container`}>
//           <div className="row" id={`${footerId}-row`}>
//             <div className="col-sm-12 col-lg-6" id={`${imageId}-col`}>
//               <div className="widget widget-about" id={imageId}>
//                 {imageComponent.map((item, index) => (
//                   <img
//                     key={item.options.id}
//                     id={item.options.id}
//                     src={logo}
//                     className="footer-logo"
//                     alt="Footer Logo"
//                     width="100"
//                     height="100"
//                   />
//                 ))}
//                 {descriptionComponent.map((item, index) => (
//                   <p key={item.options.id} id={descriptionId}>
//                     {item.options.text}
//                   </p>
//                 ))}
//                 <div className="widget-about-info" id={`${contactId}-info`}>
//                   <div className="row" id={`${contactId}-row`}>
//                     <div className="col-sm-6 col-md-4" id={contactId}>
//                       {contactComponent.map((item, index) => (
//                         <React.Fragment key={item.options.id}>
//                           {item.name === "text" && (
//                             <span
//                               className="widget-about-title"
//                               id={item.options.id}
//                             >
//                               {item.options.text}
//                             </span>
//                           )}
//                           {item.name === "phone" && (
//                             <ALink
//                               href={`tel:${item.options.text}`}
//                               id={item.options.id}
//                             >
//                               {item.options.text}
//                             </ALink>
//                           )}
//                         </React.Fragment>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="col-sm-4 col-lg-2" id={`${informationId}-col`}>
//               <div className="widget" id={informationId}>
//                 <h4 className="widget-title">
//                   {getHeading("Information") || "Information"}
//                 </h4>
//                 <ul className="widget-list">
//                   {informationComponent.map((item, index) => (
//                     <li key={item.options.id} id={item.options.id}>
//                       <ALink href={item.options.link}>{item.options.text}</ALink>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             <div className="col-sm-4 col-lg-2" id={`${customerServiceId}-col`}>
//               <div className="widget" id={customerServiceId}>
//                 <h4 className="widget-title">
//                   {getHeading("Customer Service") || "Customer Service"}
//                 </h4>
//                 <ul className="widget-list">
//                   {customerServiceComponent.map((item, index) => (
//                     <li key={item.options.id} id={item.options.id}>
//                       <ALink href={item.options.link}>{item.options.text}</ALink>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             <div className="col-sm-4 col-lg-2" id={`${myAccountId}-col`}>
//               <div className="widget" id={myAccountId}>
//                 <h4 className="widget-title">
//                   {getHeading("My Account") || "My Account"}
//                 </h4>
//                 <ul className="widget-list">
//                   {myAccountComponent.map((item, index) => (
//                     <li key={item.options.id} id={item.options.id}>
//                       <ALink href={item.options.link}>{item.options.text}</ALink>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="footer-bottom" id={`${footerId}-bottom`}>
//         <div className={containerClass} id={`${copyrightId}-container`}>
//           {copyrightComponent.map((item, index) => (
//             <p
//               key={item.options.id}
//               id={item.options.id}
//               className="footer-copyright"
//             >
//               {item.options.text}
//             </p>
//           ))}

//           <div
//             className="social-icons social-icons-color"
//             id={socialMediaId}
//           >
//             <span className="social-label">
//               {getHeading("Social Media") || "Social Media "}
//             </span>
//             {socialMediaComponent.map((item, index) => (
//               <React.Fragment key={item.options.id}>
//                 <ALink
//                   href={item.options.facebook}
//                   className="social-icon social-facebook"
//                   rel="noopener noreferrer"
//                   title="Facebook"
//                   id={`${item.options.id}-fb`}
//                 >
//                   <i className="icon-facebook-f"></i>
//                 </ALink>
//                 <ALink
//                   href={item.options.twitter}
//                   className="social-icon social-twitter"
//                   rel="noopener noreferrer"
//                   title="Twitter"
//                   id={`${item.options.id}-tw`}
//                 >
//                   <i className="icon-twitter"></i>
//                 </ALink>
//                 <ALink
//                   href={item.options.instagram}
//                   className="social-icon social-instagram"
//                   rel="noopener noreferrer"
//                   title="Instagram"
//                   id={`${item.options.id}-ig`}
//                 >
//                   <i className="icon-instagram"></i>
//                 </ALink>
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       </div>
//       {isBottomSticky && <div className="mb-10" id={`${footerId}-sticky`}></div>}
//     </footer>
//   );
// }

// export default React.memo(Footer);




