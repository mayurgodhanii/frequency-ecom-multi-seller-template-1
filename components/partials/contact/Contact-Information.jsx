import React from "react";
import DynamicComponent from "~/components/DynamicComponent";

const ContactInfo = ({ content }) => {
  const { contents } = content;

  // Log contents for debugging
  

  // Extract known components
  const titleComponent = contents.find((c) => c.component.name === "title")?.component;
  const descriptionComponent = contents.find((c) => c.component.name === "description")?.component;
  const contactDetails = contents.filter((c) => c.component.name.includes("ContactDetail"));

  const title = titleComponent?.components[0]?.options?.text || "";
  const titleId = titleComponent?.options?.id || "";
  const titleTextId = titleComponent?.components[0]?.options?.id || "";
  const description = descriptionComponent?.components[0]?.options?.text || "";
  const descriptionId = descriptionComponent?.options?.id || "";
  const descriptionTextId = descriptionComponent?.components[0]?.options?.id || "";

  // ContactDetail_1
  const officeDetailComponent = contactDetails[0]?.component;
  const officeDetails = officeDetailComponent?.components.reduce((acc, curr) => {
    acc[curr.name] = {
      text: curr.options.text,
      id: curr.options.id,
    };
    return acc;
  }, {});
  const officeDetailId = officeDetailComponent?.options?.id || "";

  // ContactDetail_2
  const officeHoursComponent = contactDetails[1]?.component;
  const officeHoursTitle = officeHoursComponent?.components[0]?.options?.text || "";
  const officeHoursTitleId = officeHoursComponent?.components[0]?.options?.id || "";
  const officeHoursTitleWrapperId = officeHoursComponent?.options?.id || "";
  const officeHours = officeHoursComponent?.components.slice(1).map((hour) => ({
    text: hour.options.text,
    details: hour.options.details,
    id: hour.options.id,
  })) || [];

  // Track used IDs
  const usedIds = new Set(
    [
      titleId,
      titleTextId,
      descriptionId,
      descriptionTextId,
      officeDetailId,
      officeHoursTitleWrapperId,
      officeHoursTitleId,
      ...(officeDetails ? Object.values(officeDetails).map((detail) => detail.id) : []),
      ...officeHours.map((hour) => hour.id),
    ].filter((id) => id)
  );

  // Filter dynamic components
  const dynamicComponents = contents.filter(
    (item) => !usedIds.has(item.component.options.id)
  );

  // Log dynamic components
  

  return (
    <div className="col-lg-6 mb-2 mb-lg-0" id={content?.id}>
      <h2 className="title mb-1" id={titleId}>
        <span id={titleTextId}>{title}</span>
      </h2>
      <p className="mb-3" id={descriptionId}>
        <span id={descriptionTextId}>{description}</span>
      </p>
      <div className="row">
        <div className="col-sm-7">
          <div className="contact-info" id={officeDetailId}>
            <h3 id={officeDetails?.title?.id}>{officeDetails?.title?.text}</h3>
            <ul className="contact-list">
              <li id={officeDetails?.address?.id}>
                <i className="icon-map-marker"></i>
                {officeDetails?.address?.text}
              </li>
              <li id={officeDetails?.phone?.id}>
                <i className="icon-phone"></i>
                <a href={`tel:${officeDetails?.phone?.text}`}>{officeDetails?.phone?.text}</a>
              </li>
              <li id={officeDetails?.email?.id}>
                <i className="icon-envelope"></i>
                <a href={`mailto:${officeDetails?.email?.text}`}>{officeDetails?.email?.text}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-sm-5">
          <div className="contact-info" id={officeHoursTitleWrapperId}>
            <h3 id={officeHoursTitleId}>{officeHoursTitle}</h3>
            <ul className="contact-list">
              {officeHours.map((hour, index) => (
                <li key={index} id={hour.id}>
                  <i className="icon-clock-o"></i>
                  <span className="text-dark">{hour.text}</span> <br />
                  {hour.details}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Render dynamic components */}
      {dynamicComponents.length > 0 && (
        <div className="dynamic-components">
          {dynamicComponents.map((item, idx) => (
            <DynamicComponent
              key={item.component.options.id || `dynamic-${idx}`}
              component={item.component}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactInfo;



// import React from "react";

// const ContactInfo = ({ content }) => {


//   const titleComponent = content.contents.find(c => c.component.name === "title")?.component;
//   const descriptionComponent = content.contents.find(c => c.component.name === "description")?.component;

//   const title = titleComponent?.components[0]?.options?.text;
//   const titleId = titleComponent?.options?.id;
//   const titleTextId = titleComponent?.components[0]?.options?.id;

//   const description = descriptionComponent?.components[0]?.options?.text;
//   const descriptionId = descriptionComponent?.options?.id;
//   const descriptionTextId = descriptionComponent?.components[0]?.options?.id;

//   const contactDetails = content.contents.filter(c => c.component.name.includes("ContactDetail"));

//   // ContactDetail_1
//   const officeDetailComponent = contactDetails[0]?.component;
//   const officeDetails = officeDetailComponent?.components.reduce((acc, curr) => {
//     acc[curr.name] = {
//       text: curr.options.text,
//       id: curr.options.id
//     };
//     return acc;
//   }, {});

//   const officeDetailId = officeDetailComponent?.options?.id;

//   // ContactDetail_2
//   const officeHoursComponent = contactDetails[1]?.component;
//   const officeHoursTitle = officeHoursComponent?.components[0]?.options?.text;
//   const officeHoursTitleId = officeHoursComponent?.components[0]?.options?.id;
//   const officeHoursTitleWrapperId = officeHoursComponent?.options?.id;

//   const officeHours = officeHoursComponent?.components.slice(1).map(hour => ({
//     text: hour.options.text,
//     details: hour.options.details,
//     id: hour.options.id
//   })) || [];

//   return (
//     <div className="col-lg-6 mb-2 mb-lg-0" id={content?.id}>
//       <h2 className="title mb-1" id={titleId}>
//         <span id={titleTextId}>{title}</span>
//       </h2>
//       <p className="mb-3" id={descriptionId}>
//         <span id={descriptionTextId}>{description}</span>
//       </p>
//       <div className="row">
//         <div className="col-sm-7">
//           <div className="contact-info" id={officeDetailId}>
//             <h3 id={officeDetails?.title?.id}>{officeDetails?.title?.text}</h3>
//             <ul className="contact-list">
//               <li id={officeDetails?.address?.id}>
//                 <i className="icon-map-marker"></i>
//                 {officeDetails?.address?.text}
//               </li>
//               <li id={officeDetails?.phone?.id}>
//                 <i className="icon-phone"></i>
//                 <a href={`tel:${officeDetails?.phone?.text}`}>{officeDetails?.phone?.text}</a>
//               </li>
//               <li id={officeDetails?.email?.id}>
//                 <i className="icon-envelope"></i>
//                 <a href={`mailto:${officeDetails?.email?.text}`}>{officeDetails?.email?.text}</a>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="col-sm-5">
//           <div className="contact-info" id={officeHoursTitleWrapperId}>
//             <h3 id={officeHoursTitleId}>{officeHoursTitle}</h3>
//             <ul className="contact-list">
//               {officeHours.map((hour, index) => (
//                 <li key={index} id={hour.id}>
//                   <i className="icon-clock-o"></i>
//                   <span className="text-dark">{hour.text}</span> <br />
//                   {hour.details}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContactInfo;
