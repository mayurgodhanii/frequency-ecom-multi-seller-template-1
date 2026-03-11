import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import ALink from "~/components/features/alink";

function Footer_forth({ footerContent, logo }) {
  const router = useRouter();
  const [isBottomSticky, setIsBottomSticky] = useState(false);
  const [containerClass, setContainerClass] = useState("container");

  useEffect(() => {
    handleBottomSticky();
    setContainerClass(
      router.asPath.includes("fullwidth") ? "container-fluid" : "container-fluid"
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

  const footerSections = footerContent?.component?.options?.contents || [];

  const getComponent = (name) => {
    return (
      footerSections.find((item) => item.component.name === name)?.component
        .components || []
    );
  };

  const getHeading = (name) => {
    return (
      footerSections.find((item) => item.component.name === name)?.component
        .name || ""
    );
  };

  const getId = (name) => {
    return (
      footerSections.find((item) => item.component.name === name)?.component
        .options?.id || ""
    );
  };

  const imageComponent = getComponent("image");
  const descriptionComponent = getComponent("description");
  const contactComponent = getComponent("contact");
  const informationComponent = getComponent("Information");
  const customerServiceComponent = getComponent("Customer Service");
  const myAccountComponent = getComponent("My Account");
  const copyrightComponent = getComponent("Copyright");
  const socialMediaComponent = getComponent("Social Media");

  return (

    <div className="footer-forth">
  <footer className="footer footer-2" id={footerContent?.component?.options?.id}>
    <div className="footer-middle" id={`${footerContent?.component?.options?.id}-middle`}>
      <div className={containerClass} id={`${footerContent?.component?.options?.id}-container`}>
        <div className="row" id={`${footerContent?.component?.options?.id}-row`}>
          <div className="col-sm-12 col-lg-6" id={`${getId("image")}-col`}>
            <div className="widget widget-about" id={getId("image")}>
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
              <div className="widget-about-info" id={`${getId("contact")}-info`}>
                <div className="row" id={`${getId("contact")}-row`}>
                  <div className="col-sm-6 col-md-4" id={getId("Social Media")}>
                    <div className="social-icons social-icons-color">
                      {/* <span className="social-label">
                        {getHeading("Social Media") || "Social Media "}
                      </span> */}
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
              </div>
            </div>
          </div>

          <div className="col-sm-4 col-lg-2" id={`${getId("Information")}-col`}>
            <div className="widget" id={getId("Information")}>
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

          <div className="col-sm-4 col-lg-2" id={`${getId("Customer Service")}-col`}>
            <div className="widget" id={getId("Customer Service")}>
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

          <div className="col-sm-4 col-lg-2" id={`${getId("My Account")}-col`}>
            <div className="widget" id={getId("My Account")}>
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
      </div>
    </div>

    <div className="footer-bottom" id={`${footerContent?.component?.options?.id}-bottom`}>
      <div className={containerClass} id={`${footerContent?.component?.options?.id}-container`} style={{display : 'flex' , justifyContent:'space-between'}}>
        {copyrightComponent.map((item, index) => (
          <p
            key={item.options.id}
            id={item.options.id}
            className="footer-copyright"
          >
            {item.options.text}
          </p>
        ))}
        <div className="widget-about-info" id={getId("contact")}>
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
    {isBottomSticky && <div className="mb-10" id={`${footerContent?.component?.options?.id}-sticky`}></div>}
  </footer>
</div>

    //      <div className="footer-forth">
    // <footer className="footer footer-2" id={footerContent?.component?.options?.id}>
    //   <div className="footer-middle">
    //     <div className={containerClass}>
    //       <div className="row">
    //         <div className="col-sm-12 col-lg-6">
    //           <div className="widget widget-about" id={getId("image")}>
    //             {imageComponent.map((item, index) => (
    //               <img
    //                 key={item.options.id || index}
    //                 id={item.options.id}
    //                 src={logo}
    //                 className="footer-logo"
    //                 alt="Footer Logo"
    //                 width="130"
    //                 height="80"
    //               />
    //             ))}
    //             {descriptionComponent.map((item, index) => (
    //               <p key={item.options.id || index} id={item.options.id}>
    //                 {item.options.text}
    //               </p>
    //             ))}
    //             <div className="widget-about-info" id={getId("contact")}>
    //               <div className="row">
    //                 <div className="col-sm-6 col-md-4">
    //                   {contactComponent.map((item, index) => (
    //                     <React.Fragment key={item.options.id || index}>
    //                       {item.name === "text" && (
    //                         <span
    //                           className="widget-about-title"
    //                           id={item.options.id}
    //                         >
    //                           {item.options.text}
    //                         </span>
    //                       )}
    //                       {item.name === "phone" && (
    //                         <ALink
    //                           id={item.options.id}
    //                           href={`tel:${item.options.text}`}
    //                         >
    //                           {item.options.text}
    //                         </ALink>
    //                       )}
    //                     </React.Fragment>
    //                   ))}
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //         <div className="col-sm-4 col-lg-2">
    //           <div className="widget" id={getId("Information")}>
    //             <h4 className="widget-title">{getHeading("Information")}</h4>
    //             <ul className="widget-list">
    //               {informationComponent.map((item, index) => (
    //                 <li key={item.options.id || index} id={item.options.id}>
    //                   <ALink href={item.options.link}>
    //                     {item.options.text}
    //                   </ALink>
    //                 </li>
    //               ))}
    //             </ul>
    //           </div>
    //         </div>

    //         <div className="col-sm-4 col-lg-2">
    //           <div className="widget" id={getId("Customer Service")}>
    //             <h4 className="widget-title">
    //               {getHeading("Customer Service")}
    //             </h4>
    //             <ul className="widget-list">
    //               {customerServiceComponent.map((item, index) => (
    //                 <li key={item.options.id || index} id={item.options.id}>
    //                   <ALink href={item.options.link}>
    //                     {item.options.text}
    //                   </ALink>
    //                 </li>
    //               ))}
    //             </ul>
    //           </div>
    //         </div>

    //         <div className="col-sm-4 col-lg-2">
    //           <div className="widget" id={getId("My Account")}>
    //             <h4 className="widget-title">{getHeading("My Account")}</h4>
    //             <ul className="widget-list">
    //               {myAccountComponent.map((item, index) => (
    //                 <li key={item.options.id || index} id={item.options.id}>
    //                   <ALink href={item.options.link}>
    //                     {item.options.text}
    //                   </ALink>
    //                 </li>
    //               ))}
    //             </ul>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="footer-bottom">
    //     <div className={containerClass}>
    //       {copyrightComponent.map((item, index) => (
    //         <p
    //           key={item.options.id || index}
    //           className="footer-copyright"
    //           id={item.options.id}
    //         >
    //           {item.options.text}
    //         </p>
    //       ))}

    //       <div
    //         className="social-icons social-icons-color"
    //         id={getId("Social Media")}
    //       >
    //         <span className="social-label">{getHeading("Social Media")}</span>
    //         {socialMediaComponent.map((item, index) => (
    //           <React.Fragment key={item.options.id || index}>
    //             <ALink
    //               id={`${item.options.id}-fb`}
    //               href={item.options.facebook}
    //               className="social-icon social-facebook"
    //               rel="noopener noreferrer"
    //               title="Facebook"
    //             >
    //               <i className="icon-facebook-f"></i>
    //             </ALink>
    //             <ALink
    //               id={`${item.options.id}-tw`}
    //               href={item.options.twitter}
    //               className="social-icon social-twitter"
    //               rel="noopener noreferrer"
    //               title="Twitter"
    //             >
    //               <i className="icon-twitter"></i>
    //             </ALink>
    //             <ALink
    //               id={`${item.options.id}-ig`}
    //               href={item.options.instagram}
    //               className="social-icon social-instagram"
    //               rel="noopener noreferrer"
    //               title="Instagram"
    //             >
    //               <i className="icon-instagram"></i>
    //             </ALink>
    //           </React.Fragment>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    //   {isBottomSticky && <div className="mb-10"></div>}
    // </footer>
    // </div>
  );
}

export default React.memo(Footer_forth);









// import { useRouter } from "next/router";
// import React, { useState, useEffect } from "react";

// import ALink from "~/components/features/alink";

// function Footer() {
//   const router = useRouter("");
//   const [isBottomSticky, setIsBottomSticky] = useState(false);

//   useEffect(() => {
//     handleBottomSticky();
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

//   return (
//     <footer className="footer footer-2">
//       <div className="footer-middle">
//         <div className="container-fluid">
//           <div className="row">
//             <div className="col-sm-12 col-lg-6">
//               <div className="widget widget-about">
//                 <ALink href="/">
//                   <img
//                     src="images/logo-footer.png"
//                     className="footer-logo"
//                     alt="Footer Logo"
//                     width="105"
//                     height="25"
//                   />
//                 </ALink>
//                 <p>
//                   Praesent dapibus, neque id cursus ucibus, tortor neque egestas
//                   augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.
//                   Nam dui mi, tincidunt quis, accumsan porttitor, facilisis
//                   luctus, metus.
//                 </p>

//                 <div className="widget-about-info">
//                   <div className="row">
//                     <div className="col-sm-6 col-md-4">
//                       <span className="widget-about-title">
//                         Got Question? Call us 24/7
//                       </span>
//                       <a href="tel:123456789">+0123 456 789</a>
//                     </div>

//                     <div className="col-sm-6 col-md-8">
//                       <span className="widget-about-title payment">
//                         Payment Method
//                       </span>
//                       <img
//                         src="images/payments.png"
//                         alt="Payment methods"
//                         width="272"
//                         height="20"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="col-sm-4 col-lg-2">
//               <div className="widget">
//                 <h4 className="widget-title">Useful links</h4>

//                 <ul className="widget-list">
//                   <li>
//                     <ALink href="/contact">Contact us</ALink>
//                   </li>
//                   <li>
//                     <ALink href="/login">Log in</ALink>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             <div className="col-sm-4 col-lg-2">
//               <div className="widget">
//                 <h4 className="widget-title">Customer Service</h4>

//                 <ul className="widget-list">
//                   <li>
//                     <ALink href="/terms-and-conditions">
//                       Terms and conditions
//                     </ALink>
//                   </li>
//                   <li>
//                     <ALink href="/privacy-policy">Privacy Policy</ALink>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             <div className="col-sm-4 col-lg-2">
//               <div className="widget">
//                 <h4 className="widget-title">My Account</h4>

//                 <ul className="widget-list">
//                   <li>
//                     <ALink href="/login">Sign In</ALink>
//                   </li>
//                   <li>
//                     <ALink href="/shop/cart">View Cart</ALink>
//                   </li>
//                   <li>
//                     <ALink href="/shop/wishlist">My Wishlist</ALink>
//                   </li>
//                   {/* <li>
//                     <ALink href="/shop/dashboard">Track My Order</ALink>
//                   </li>
//                   <li>
//                     <ALink href="#">Help</ALink>
//                   </li> */}
//                 </ul>
//               </div>
//             </div>
//             {/* <div className="col-sm-6 col-lg-2">
//               <div className="widget widget-newsletter">
//                 <h4 className="widget-title">Sign up to newsletter</h4>

//                 <p>
//                   Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan.
//                 </p>

//                 <form action="#">
//                   <div className="input-group">
//                     <input
//                       type="email"
//                       className="form-control"
//                       placeholder="Enter your Email Address"
//                       aria-label="Email Adress"
//                       required
//                     />
//                     <div className="input-group-append">
//                       <button className="btn btn-dark" type="submit">
//                         <i className="icon-long-arrow-right"></i>
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </div>

//       <div className="footer-bottom">
//         <div className="container-fluid">
//           <p className="footer-copyright">
//             Copyright © {new Date().getFullYear()} Store. All Rights
//             Reserved.
//           </p>

//           <ul className="footer-menu">
//             <li>
//               <ALink href="/terms-and-conditions">Terms Of Use</ALink>
//             </li>
//             <li>
//               <ALink href="/privacy-policy">Privacy Policy</ALink>
//             </li>
//           </ul>

//           <div className="social-icons social-icons-color">
//             <span className="social-label">Social Media</span>
//             <ALink
//               href="#"
//               className="social-icon social-facebook"
//               title="Facebook"
//             >
//               <i className="icon-facebook-f"></i>
//             </ALink>
//             <ALink
//               href="#"
//               className="social-icon social-twitter"
//               title="Twitter"
//               target="_blank"
//             >
//               <i className="icon-twitter"></i>
//             </ALink>
//             <ALink
//               href="#"
//               className="social-icon social-instagram"
//               title="Instagram"
//             >
//               <i className="icon-instagram"></i>
//             </ALink>
//             <ALink
//               href="#"
//               className="social-icon social-youtube"
//               title="Youtube"
//               target="_blank"
//             >
//               <i className="icon-youtube"></i>
//             </ALink>
//             <ALink
//               href="#"
//               className="social-icon social-pinterest"
//               title="Pinterest"
//             >
//               <i className="icon-pinterest"></i>
//             </ALink>
//           </div>
//         </div>
//       </div>
//       {isBottomSticky ? <div className="mb-10"></div> : ""}
//     </footer>
//   );
// }

// export default React.memo(Footer);
