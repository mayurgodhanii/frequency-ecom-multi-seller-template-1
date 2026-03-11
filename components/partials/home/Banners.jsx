import { LazyLoadImage } from "react-lazy-load-image-component";
import Reveal from "react-awesome-reveal";
import ALink from "~/components/features/alink";
import {
  fadeIn,
  fadeInUpShorter,
  fadeInLeftShorter,
  fadeInRightShorter,
} from "~/utils/data";
import React from "react";

const Banners = ({ content }) => {
  return (
    <div className="container-fluid" id={content.id}>
      <div className="row">
        {content.contents.map((item, index) => {
          const { component } = item;
          const { options: componentOptions, components } = component;

          const { title, image, sub_title, button } = Object.fromEntries(
            components.map(({ name, options }) => [name, options])
          );

          const revealAnim =
            index === 0
              ? fadeIn
              : index === 1
              ? fadeIn
              : index === 2
              ? fadeInLeftShorter
              : index === 3
              ? fadeIn
              : fadeInRightShorter;

          const colClass = `col-lg-${index < 2 ? "6" : "4"} col-md-6`;
          const bannerContentClass =
            index < 2 ? "banner-content-center" : "banner-content-right";
          const bannerOverlayClass =
            index >= 2 ? "text-white banner-2" : "";
          return (
            <div key={componentOptions.id} id={componentOptions.id} className={colClass}>
              <Reveal keyframes={revealAnim} delay={200} duration={1000} triggerOnce >
                <div className={`banner banner-overlay ${bannerOverlayClass}`} id={image.id}>
                  {(!('link' in title) && !('link' in sub_title)) ? (
                    <div className="lazy-media">
                      <div className="lazy-overlay"></div>
                      <LazyLoadImage
                        // id={image.id}
                        alt={title.text}
                        src={image.image_url}
                        threshold={200}
                        width={index < 2 ? "880" : "580"}
                        height="auto"
                        effect="blur"
                      />
                    </div>
                  ) : (
                    <ALink href={button.link} className="lazy-media">
                      <div className="lazy-overlay"></div>
                      <LazyLoadImage
                        // id={image.id}
                        alt={title.text}
                        src={image.image_url}
                        threshold={200}
                        width={index < 2 ? "880" : "580"}
                        height="auto"
                        effect="blur"
                      />
                    </ALink>
                  )}
                  <div className={`banner-content ${bannerContentClass}`} id={`content_${componentOptions.id}`}>
                    <Reveal keyframes={fadeInUpShorter} delay={200} duration={1000} triggerOnce>
                      <>
                        <h3 className="banner-subtitle" id={sub_title.id}>
                          {(!('link' in title) && !('link' in sub_title)) ? <span className="text-white-important">{sub_title.text}</span> : (('link' in sub_title) ? sub_title.link : button.link) ? <ALink href={('link' in sub_title) ? sub_title.link : button.link}>{sub_title.text}</ALink> : <span className="text-white-important">{sub_title.text}</span>}
                        </h3>
                        <h2 className="banner-title" id={title.id}>
                          {(!('link' in title) && !('link' in sub_title)) ? <span className="text-white-important">{title.text}</span> : (('link' in title) ? title.link : button.link) ? <ALink href={('link' in title) ? title.link : button.link}>{title.text}</ALink> : <span className="text-white-important">{title.text}</span>}
                        </h2>
                        <ALink
                          href={button.link}
                          className="btn underline"
                          
                        >
                          <span id={button.id}>{button.text}</span>
                        </ALink>
                      </>
                    </Reveal>
                  </div>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Banners;





// import { LazyLoadImage } from "react-lazy-load-image-component";
// import Reveal from "react-awesome-reveal";

// import ALink from "~/components/features/alink";

// import {
//   fadeInLeftShorter,
//   fadeInRightShorter,
//   fadeIn,
//   fadeInUpShorter,
// } from "~/utils/data";

// import React from "react";

// const Banners = ({content}) => {

//   return (
//     <div>
//       {" "}
//       <div className="container-fluid">
//         <div className="row">
//           <div className="col-lg-6">
//             <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
//               <div className="banner banner-big banner-overlay">
//                 <ALink href="#" className="lazy-media">
//                   <div className="lazy-overlay"></div>

//                   <LazyLoadImage
//                     alt="banner"
//                     src="images/home/banners/banner-1.jpg"
//                     threshold={200}
//                     width="880"
//                     height="auto"
//                     effect="blur"
//                   />
//                 </ALink>

//                 <div className="banner-content banner-content-center">
//                   <Reveal
//                     keyframes={fadeInUpShorter}
//                     delay={200}
//                     duration={1000}
//                     triggerOnce
//                   >
//                     <>
//                       <h3 className="banner-subtitle text-white">
//                         <ALink href="/shop/sidebar/list">New Collection</ALink>
//                       </h3>
//                       <h2 className="banner-title text-white">
//                         <ALink href="/shop/sidebar/list">Shop Women's</ALink>
//                       </h2>
//                       <ALink
//                         href="/shop/sidebar/list"
//                         className="btn underline"
//                       >
//                         <span>Discover Now</span>
//                       </ALink>
//                     </>
//                   </Reveal>
//                 </div>
//               </div>
//             </Reveal>
//           </div>

//           <div className="col-lg-6">
//             <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
//               <div className="banner banner-big banner-overlay">
//                 <ALink href="/shop/sidebar/list" className="lazy-media">
//                   <div className="lazy-overlay"></div>

//                   <LazyLoadImage
//                     alt="banner"
//                     src="images/home/banners/banner-2.jpg"
//                     threshold={200}
//                     width="880"
//                     height="auto"
//                     effect="blur"
//                   />
//                 </ALink>

//                 <div className="banner-content banner-content-center">
//                   <Reveal
//                     keyframes={fadeInUpShorter}
//                     delay={200}
//                     duration={1000}
//                     triggerOnce
//                   >
//                     <>
//                       <h3 className="banner-subtitle text-white">
//                         <ALink href="/shop/sidebar/list">New Collection</ALink>
//                       </h3>
//                       <h2 className="banner-title text-white">
//                         <ALink href="/shop/sidebar/list">Shop Men's</ALink>
//                       </h2>
//                       <ALink
//                         href="/shop/sidebar/list"
//                         className="btn underline"
//                       >
//                         <span>Discover Now</span>
//                       </ALink>
//                     </>
//                   </Reveal>
//                 </div>
//               </div>
//             </Reveal>
//           </div>
//         </div>

//         <div className="row justify-content-center">
//           <div className="col-md-6 col-lg-4">
//             <Reveal
//               keyframes={fadeInLeftShorter}
//               delay={200}
//               duration={1000}
//               triggerOnce
//             >
//               <div className="banner banner-overlay text-white banner-2">
//                 <ALink href="/shop/sidebar/list" className="lazy-media">
//                   <div className="lazy-overlay"></div>

//                   <LazyLoadImage
//                     alt="banner"
//                     src="images/home/banners/banner-3.jpg"
//                     threshold={200}
//                     width="580"
//                     height="auto"
//                     effect="blur"
//                   />
//                 </ALink>

//                 <div className="banner-content banner-content-right">
//                   <h4 className="banner-subtitle">
//                     <ALink href="/shop/sidebar/list">Flip Flop</ALink>
//                   </h4>
//                   <h3 className="banner-title">
//                     <ALink href="/shop/sidebar/list">
//                       Summer
//                       <br />
//                       sale -70% off
//                     </ALink>
//                   </h3>
//                   <ALink
//                     href="/shop/sidebar/list"
//                     className="btn underline btn-outline-white-3 banner-link"
//                   >
//                     Shop Now
//                   </ALink>
//                 </div>
//               </div>
//             </Reveal>
//           </div>

//           <div className="col-md-6 col-lg-4">
//             <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
//               <div className="banner banner-overlay color-grey banner-2">
//                 <ALink href="/shop/sidebar/list" className="lazy-media">
//                   <div className="lazy-overlay"></div>

//                   <LazyLoadImage
//                     alt="banner"
//                     src="images/home/banners/banner-4.jpg"
//                     threshold={200}
//                     width="580"
//                     height="auto"
//                     effect="blur"
//                   />
//                 </ALink>

//                 <div className="banner-content">
//                   <h4 className="banner-subtitle">
//                     <ALink href="/shop/sidebar/list">Accessories</ALink>
//                   </h4>
//                   <h3 className="banner-title">
//                     <ALink href="/shop/sidebar/list">
//                       2021 Winter
//                       <br />
//                       up to 50% off
//                     </ALink>
//                   </h3>
//                   <ALink
//                     href="/shop/sidebar/list"
//                     className="btn underline banner-link"
//                   >
//                     Shop Now
//                   </ALink>
//                 </div>
//               </div>
//             </Reveal>
//           </div>

//           <div className="col-md-6 col-lg-4">
//             <Reveal
//               keyframes={fadeInRightShorter}
//               delay={200}
//               duration={1000}
//               triggerOnce
//             >
//               <div className="banner banner-overlay text-white banner-2">
//                 <ALink href="/shop/sidebar/list" className="lazy-media">
//                   <div className="lazy-overlay"></div>

//                   <LazyLoadImage
//                     alt="banner"
//                     src="images/home/banners/banner-5.jpg"
//                     threshold={200}
//                     width="580"
//                     height="auto"
//                     effect="blur"
//                   />
//                 </ALink>

//                 <div className="banner-content banner-content-right mr">
//                   <h4 className="banner-subtitle">
//                     <ALink href="/shop/sidebar/list">New in</ALink>
//                   </h4>
//                   <h3 className="banner-title">
//                     <ALink href="/shop/sidebar/list">
//                       Women’s
//                       <br />
//                       sportswear
//                     </ALink>
//                   </h3>
//                   <ALink
//                     href="/shop/sidebar/list"
//                     className="btn underline btn-outline-white-3 banner-link"
//                   >
//                     Shop Now
//                   </ALink>
//                 </div>
//               </div>
//             </Reveal>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Banners;



