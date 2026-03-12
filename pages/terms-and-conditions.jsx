import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import Loader from "~/components/Loader";
import { apirequest } from "~/utils/api";
import DynamicComponent from "~/components/DynamicComponent";
import Cookies from "js-cookie";

const fetchTermsData = async () => {
  try {
    const response = await apirequest(
      "GET",
      `/user/pages-list`,
      null,
      { page_name: "Termsandconditions", theme_id: process.env.THEMEID }
    );

    if (response) {
      return response;
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    throw error;
  }
};

function TermsConditions() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["termsConditions"],
    queryFn: fetchTermsData,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <p><Loader /></p>;
  if (error) return <p>Error loading terms and conditions.</p>;

  const jsonData = data;
  const termsConditionsData = Array.isArray(jsonData?.data[0]?.web_json?.page_data)
    ? jsonData.data[0].web_json.page_data
    : [];
  const pageTitle = jsonData?.data[0]?.web_json?.page_title || "Terms & Conditions";

  const spaceName = Cookies.get("spaceName");

  const mainSection = termsConditionsData.find(
    (section) => section?.component?.name === "terms-and-conditions"
  );

  const dynamicSections = termsConditionsData.filter(
    (section) => section?.component?.name !== "terms-and-conditions"
  );

  // ✅ Here: contents contains section-like components
  const contents = mainSection?.component?.options?.contents || [];

  return (
    <main className="main shop" id={mainSection?.component?.options?.id || "terms-conditions"}>
      <Helmet>
        <meta
          name="keywords"
          content={jsonData?.data[0]?.web_json?.keyword || "Terms Conditions"}
        />
        <meta
          name="description"
          content={jsonData?.data[0]?.web_json?.description || "Terms Conditions"}
        />
        <title>{`${pageTitle} | ${spaceName}` || "template"}</title>
      </Helmet>

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
              const component = section?.component;
              const sectionId = component?.options?.id || `section-${index}`;
              const titleComp = component?.components?.find((c) => c.name === "title");
              const contentComp = component?.components?.find((c) => c.name === "content");

              const usedIds = new Set(
                [titleComp?.options?.id, contentComp?.options?.id].filter(Boolean)
              );

              const dynamicComponents = component?.components?.filter(
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

export default TermsConditions;





// import React from "react";
// import { Helmet } from "react-helmet";
// import { useQuery } from "react-query";
// import ALink from "~/components/features/alink";
// import PageHeader from "~/components/features/page-header";
// import Loader from "~/components/Loader";

// import { apirequest } from "~/utils/api";

// const fetchTermsData = async () => {
//   try {
//     const response = await apirequest(
//       "GET",
//       `/user/pages-list`,
//       null,
//       { page_name: "Termsandconditions", theme_id: process.env.THEMEID }
//     );

//     if (response) {
//       return response;
//     } else {
//       throw new Error("Failed to fetch data");
//     }
//   } catch (error) {
//     console.error("Error fetching terms and conditions:", error);
//     throw error;
//   }
// };

// function TermsConditions() {
//   const { data, error, isLoading } = useQuery({
//     queryKey: ["termsConditions"],
//     queryFn: fetchTermsData,
//     staleTime: 1000 * 60 * 5,
//   });

//   if (isLoading) return <p><Loader /></p>;
//   if (error) return <p>Error loading terms and conditions.</p>;

//   const jsonData = data;
//   const TermsConditionsData = jsonData.data[0]?.web_json?.page_data || [];
//   const pageTitle = jsonData.data[0]?.web_json?.page_title || "Terms & Conditions";

//   return (
//     <main className="main shop" id={TermsConditionsData[0]?.component?.options?.id}>
//       <Helmet>
//         <meta
//           name="keywords"
//           content={jsonData?.data[0]?.web_json.keyword || "Terms Conditions"}
//         />
//         <meta
//           name="description"
//           content={jsonData?.data[0]?.web_json.description || "Terms Conditions"}
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
//           {TermsConditionsData.length > 0 &&
//             TermsConditionsData[0]?.component?.options?.contents.map((section, index) => {
//               const sectionId = section.component.options.id;
//               const titleComp = section.component.components[0];
//               const contentComp = section.component.components[1];

//               return (
//                 <ul key={index} className="mb-5" id={sectionId}>
//                   <strong id={titleComp.options.id} style={{ color: "#333333" }}>
//                     {titleComp.options.text}
//                   </strong>
//                   <div id={contentComp.options.id} style={{ color: "#666666", lineHeight: "1.6" }}>
//                     {contentComp.options.text}
//                   </div>
//                 </ul>
//               );
//             })}
//         </div>
//       </div>
//     </main>
//   );
// }

// export default TermsConditions;

