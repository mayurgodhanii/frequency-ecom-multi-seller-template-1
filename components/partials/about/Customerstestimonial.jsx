import Reveal from "react-awesome-reveal";
import OwlCarousel from "~/components/features/owl-carousel";
import { fadeIn, testiSlider } from "~/utils/data";
import React from "react";

const Customerstestimonial = ({ content }) => {
  

  // Extract the section wrapper ID
  const sectionId = content?.id || "testimonial-section";

  // Extract valid testimonial items
  const testimonialItems = content.contents
    .map((section, index) => {
      const { component } = section;
      if (component.name.startsWith("testimonial")) {
        const title = component.components.find((c) => c.name === "title");
        const description = component.components.find((c) => c.name === "description");
        const name = component.components.find((c) => c.name === "name");
        const role = component.components.find((c) => c.name === "role");

        return (
          <blockquote
            key={component.options?.id || index}
            id={component.options?.id}
            className="testimonial testimonial-icon text-center"
          >
            <p className="lead" id={title?.options?.id}>“{title?.options?.text}”</p>
            <p id={description?.options?.id}>“ {description?.options?.text} ”</p>
            <cite id={name?.options?.id}>
              {name?.options?.text},
              <span id={role?.options?.id}>{role?.options?.text}</span>
            </cite>
          </blockquote>
        );
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="testimonials-wrapper" id={sectionId}>
      <div className="bg-light-2 pt-7 pb-6 testimonials">
        <div className="container-fluid">
          {/* Render Title */}
          {content.contents.map((section, index) => {
            const { component } = section;
            if (component.name === "title") {
              const textComponent = component.components[0];
              return (
                <h2
                  key={component.options?.id || index}
                  id={component.options?.id}
                  className="title text-center mb-2"
                >
                  <span id={textComponent.options?.id}>
                    {textComponent.options?.text}
                  </span>
                </h2>
              );
            }
            return null;
          })}

          <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
            {testimonialItems.length > 0 ? (
              <OwlCarousel
                adClass="owl-simple owl-testimonials"
                options={testiSlider}
              >
                {testimonialItems}
              </OwlCarousel>
            ) : (
              <p className="text-center">No testimonials available.</p>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default Customerstestimonial;



// import Reveal from "react-awesome-reveal";
// import OwlCarousel from "~/components/features/owl-carousel";
// import { fadeIn, testiSlider } from "~/utils/data";
// import React from "react";

// const Customerstestimonial = ({ content }) => {
//   return (
//     <div className="bg-light-2 pt-7 pb-6 testimonials">
//       <div className="container">
//         {content.map((section, index) => {
//           const { component } = section;
//           if (component.name === "title") {
//             return (
//               <h2 key={index} className="title text-center mb-2">
//                 {component.components[0].options.text}
//               </h2>
//             );
//           }
//           return null;
//         })}

//         <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
//           <OwlCarousel
//             adClass="owl-simple owl-testimonials"
//             options={testiSlider}
//           >
//             {content.map((section, index) => {
//               const { component } = section;
//               if (component.name.startsWith("testimonial")) {
//                 const title = component.components.find((c) => c.name === "title")?.options.text;
//                 const description = component.components.find((c) => c.name === "description")?.options.text;
//                 const name = component.components.find((c) => c.name === "name")?.options.text;
//                 const role = component.components.find((c) => c.name === "role")?.options.text;

//                 return (
//                   <blockquote key={index} className="testimonial testimonial-icon text-center">
//                     <p className="lead">“{title}”</p>
//                     <p>“ {description} ”</p>
//                     <cite>
//                       {name},
//                       <span>{role}</span>
//                     </cite>
//                   </blockquote>
//                 );
//               }
//               return null;
//             })}
//           </OwlCarousel>
//         </Reveal>
//       </div>
//     </div>
//   );
// };

// export default Customerstestimonial;
