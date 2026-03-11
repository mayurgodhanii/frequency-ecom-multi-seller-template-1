import React from "react";
import ALink from "~/components/features/alink";
import DynamicComponent from "~/components/DynamicComponent";

const OurTeam = ({ content }) => {
  // Log contents for debugging
  

  // Get section title and its id
  const titleComponent = content?.contents[0]?.component?.components?.[0];
  const title = titleComponent?.options?.text || "Our Team";
  const titleId = titleComponent?.options?.id || "title-default";

  // Get all team members
  const teamMembers = content?.contents?.slice(1).map(({ component }) => {
    const memberData = {
      id: component.options.id,
    };
    const components = component.components;
    components.forEach(({ name, options }) => {
      if (name === "name") {
        memberData.name = options.text;
        memberData.nameId = options.id;
      }
      if (name === "role") {
        memberData.role = options.text;
        memberData.roleId = options.id;
      }
      if (name === "image") {
        memberData.image = options.image_url;
        memberData.imageId = options.id;
      }
      if (name === "socialLinks") {
        memberData.socialLinks = options;
        memberData.socialLinksId = options.id;
      }
    });
    // Filter dynamic components
    memberData.dynamicComponents = components.filter(
      (comp) =>
        ![
          memberData.nameId,
          memberData.roleId,
          memberData.imageId,
          memberData.socialLinksId,
        ].includes(comp.options?.id)
    );
    // Log dynamic components
    
    return memberData;
  });

  return (
    <div className="bg-light-2 pt-6 pb-7 mb-6" id={content.id}>
      <div className="container">
        <h2 className="title text-center mb-4" id={titleId}>
          {title}
        </h2>

        <div className="row">
          {teamMembers.map((member, index) => (
            <div className="col-sm-6 col-lg-3" key={index} id={member.id}>
              <div className="member member-2 text-center">
                <figure className="member-media" id={member.imageId}>
                  <img src={member.image} alt={`${member.name} photo`} />
                  <figcaption className="member-overlay" id={`${member.imageId}-overlay`}>
                    <div className="social-icons social-icons-simple" id={member.socialLinksId}>
                      {Object.keys(member.socialLinks || {})
                        .filter((key) => key !== "id")
                        .map((key, idx) => (
                          <ALink
                            href={member.socialLinks[key]}
                            className="social-icon"
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                            key={idx}
                            id={`${member.socialLinksId}-${key}`}
                          >
                            <i className={`icon-${key}`} />
                          </ALink>
                        ))}
                    </div>
                  </figcaption>
                </figure>
                <div className="member-content">
                  <h3 className="member-title" id={member.nameId}>
                    {member.name}
                    <span id={member.roleId}>{member.role}</span>
                  </h3>
                  {/* Render dynamic components */}
                  {member.dynamicComponents?.length > 0 && (
                    <div className="dynamic-components">
                      {member.dynamicComponents.map((comp, idx) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeam;






// import React from 'react';
// import ALink from '~/components/features/alink';

// const OurTeam = ({ content }) => {

//   // Get section title and its id
//   const titleComponent = content?.contents[0]?.component?.components?.[0];
//   const title = titleComponent?.options?.text || 'Our Team';
//   const titleId = titleComponent?.options?.id || 'title-default';

//   // Get all team members
//   const teamMembers = content?.contents?.slice(1).map(({ component }) => {
//     const memberData = {
//       id: component.options.id,
//     };
//     component.components.forEach(({ name, options }) => {
//       if (name === 'name') {
//         memberData.name = options.text;
//         memberData.nameId = options.id;
//       }
//       if (name === 'role') {
//         memberData.role = options.text;
//         memberData.roleId = options.id;
//       }
//       if (name === 'image') {
//         memberData.image = options.image_url;
//         memberData.imageId = options.id;
//       }
//       if (name === 'socialLinks') {
//         memberData.socialLinks = options;
//         memberData.socialLinksId = options.id;
//       }
//     });
//     return memberData;
//   });

//   return (
//     <div className="bg-light-2 pt-6 pb-7 mb-6" id={content.id}>
//       <div className="container">
//         <h2 className="title text-center mb-4" id={titleId}>{title}</h2>

//         <div className="row">
//           {teamMembers.map((member, index) => (
//             <div className="col-sm-6 col-lg-3" key={index} id={member.id}>
//               <div className="member member-2 text-center">
//                 <figure className="member-media" id={member.imageId}>
//                   <img src={member.image} alt={`${member.name} photo`} />
//                   <figcaption className="member-overlay" id={`${member.imageId}-overlay`}>
//                     <div className="social-icons social-icons-simple" id={member.socialLinksId}>
//                       {Object.keys(member.socialLinks || {}).filter(key => key !== 'id').map((key, idx) => (
//                         <ALink
//                           href={member.socialLinks[key]}
//                           className="social-icon"
//                           title={key.charAt(0).toUpperCase() + key.slice(1)}
//                           key={idx}
//                           id={`${member.socialLinksId}-${key}`}
//                         >
//                           <i className={`icon-${key}`} />
//                         </ALink>
//                       ))}
//                     </div>
//                   </figcaption>
//                 </figure>
//                 <div className="member-content">
//                   <h3 className="member-title" id={member.nameId}>
//                     {member.name}
//                     <span id={member.roleId}>{member.role}</span>
//                   </h3>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OurTeam;