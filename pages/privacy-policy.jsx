import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import Loader from "~/components/Loader";
import { apirequest } from "~/utils/api";
import DynamicComponent from "~/components/DynamicComponent";
import Cookies from "js-cookie";

const fetchPrivacyPolicy = async () => {
  try {
    const response = await apirequest(
      "GET",
      `/user/pages-list`,
      null,
      { page_name: "PrivacyPolicy", theme_id: process.env.THEMEID }
    );

    if (response) {
      return response;
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    throw error;
  }
};

function PrivacyPolicy() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["privacyPolicy"],
    queryFn: fetchPrivacyPolicy,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <p><Loader /></p>;
  if (error) return <p>Error loading privacy policy.</p>;

  const jsonData = data;
  const privacyPolicy = Array.isArray(jsonData?.data[0]?.web_json?.page_data)
    ? jsonData.data[0].web_json.page_data
    : [];
  const pageTitle = jsonData?.data[0]?.web_json?.page_title || "Privacy Policy";



  // Separate main section and dynamic sections
  const mainSection = Array.isArray(privacyPolicy)
    ? privacyPolicy.find((section) => section?.component?.name === "privacy-policy")
    : null;
  const dynamicSections = Array.isArray(privacyPolicy)
    ? privacyPolicy.filter((section) => section?.component?.name !== "privacy-policy")
    : [];



  const contents = mainSection?.component?.options?.contents || [];
const spaceName = Cookies.get("spaceName");


  return (
    <main className="main shop" id={mainSection?.component?.options?.id || "privacy-policy"}>
      <Helmet>
        <meta
          name="keywords"
          content={jsonData?.data[0]?.web_json?.keyword || "Privacy Policy"}
        />
        <meta
          name="description"
          content={jsonData?.data[0]?.web_json?.description || "Privacy Policy"}
        />
<title>{`${pageTitle} | ${spaceName}` || "template"}</title>      </Helmet>

      <PageHeader title={pageTitle} />
      <nav className="breadcrumb-nav mb-2">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item active">{pageTitle}</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          {contents.length > 0 ? (
            contents.map((section, index) => {
              const sectionId = section?.component?.options?.id || `section-${index}`;
              const titleComp = section?.component?.components?.find(
                (c) => c.name === "title"
              );
              const contentComp = section?.component?.components?.find(
                (c) => c.name === "content"
              );

              // Track used IDs
              const usedIds = new Set(
                [titleComp?.options?.id, contentComp?.options?.id].filter((id) => id)
              );

              // Filter dynamic components for this section
              const dynamicComponents = section?.component?.components?.filter(
                (item) => !usedIds.has(item.options?.id)
              ) || [];


              return (
                <ul key={index} className="mb-5" id={sectionId}>
                  {titleComp && (
                    <strong id={titleComp.options.id} style={{ color: "#333333" }}>
                      {titleComp.options.text}
                    </strong>
                  )}
                  {contentComp && (
                    <div
                      id={contentComp.options.id}
                      style={{ color: "#666666", lineHeight: "1.6" }}
                    >
                      {contentComp.options.text}
                    </div>
                  )}
                  {/* Render dynamic components for this section */}
                  {dynamicComponents.length > 0 && (
                    <div className="dynamic-components">
                      {dynamicComponents.map((item, idx) => (
                        <DynamicComponent
                          key={item.options?.id || `dynamic-${idx}`}
                          component={item}
                        />
                      ))}
                    </div>
                  )}
                </ul>
              );
            })
          ) : (
            <p>No content available.</p>
          )}
          {/* Render top-level dynamic sections */}
          {dynamicSections.length > 0 && (
            <div className="dynamic-sections">
              {dynamicSections.map((section, idx) => (
                <DynamicComponent
                  key={section?.component?.options?.id || `dynamic-section-${idx}`}
                  component={section.component}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default PrivacyPolicy;






// import React from "react";
// import { Helmet } from "react-helmet";
// import { useQuery } from "react-query";
// import ALink from "~/components/features/alink";
// import PageHeader from "~/components/features/page-header";
// import Loader from "~/components/Loader";
// import { apirequest } from "~/utils/api";

// const fetchPrivacyPolicy = async () => {
//   try {
//     const response = await apirequest(
//       "GET",
//       `/user/pages-list`,
//       null,
//       { page_name: "PrivacyPolicy", theme_id: process.env.THEMEID }
//     );

//     if (response) {
//       return response;
//     } else {
//       throw new Error("Failed to fetch data");
//     }
//   } catch (error) {
//     console.error("Error fetching privacy policy:", error);
//     throw error;
//   }
// };

// function PrivacyPolicy() {
//   const { data, error, isLoading } = useQuery({
//     queryKey: ["privacyPolicy"],
//     queryFn: fetchPrivacyPolicy,
//     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
//   });

//   if (isLoading) return <p><Loader /></p>;
//   if (error) return <p>Error loading privacy policy.</p>;

//   const jsonData = data;
//   const privacyPolicy = jsonData.data[0]?.web_json?.page_data || [];
//   const pageTitle = jsonData.data[0]?.web_json?.page_title || "Privacy Policy";

//   return (
//     <main className="main shop" id={privacyPolicy[0]?.component?.options?.id}>
//       <Helmet>
//         <meta
//           name="keywords"
//           content={jsonData?.data[0]?.web_json.keyword || "Privacy Policy"}
//         />
//         <meta
//           name="description"
//           content={jsonData?.data[0]?.web_json.description || "Privacy Policy"}
//         />
//         <title>{pageTitle}</title>
//       </Helmet>

//       <PageHeader title={pageTitle} />
//       <nav className="breadcrumb-nav mb-2">
//         <div className="container">
//           <ol className="breadcrumb">
//             <li className="breadcrumb-item">
//               <ALink href="/">Home</ALink>
//             </li>
//             <li className="breadcrumb-item active">{pageTitle}</li>
//           </ol>
//         </div>
//       </nav>

//       <div className="page-content">
//         <div className="container">
//           {privacyPolicy.length > 0 &&
//             privacyPolicy[0]?.component?.options?.contents.map(
//               (section, index) => {
//                 const sectionId = section.component.options.id;
//                 const titleComp = section.component.components[0];
//                 const contentComp = section.component.components[1];
  
//                 return (
//                   <ul key={index} className="mb-5" id={sectionId}>
//                   <strong id={titleComp.options.id} style={{ color: "#333333" }}>
//                     {titleComp.options.text}
//                   </strong>
//                   <div id={contentComp.options.id} style={{ color: "#666666", lineHeight: "1.6" }}>
//                     {contentComp.options.text}
//                   </div>
//                 </ul>
//                 );
//               }
//             )}
//         </div>
//       </div>
//     </main>
//   );
// }

// export default PrivacyPolicy;
