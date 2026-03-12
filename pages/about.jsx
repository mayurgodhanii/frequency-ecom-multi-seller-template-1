import dynamic from "next/dynamic";
import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import Loader from "~/components/Loader";
import { apirequest } from "~/utils/api";
import DynamicComponent from "~/components/DynamicComponent";
import Cookies from "js-cookie";

const AboutContent = dynamic(() => import("~/components/partials/about/about-content"), {
  ssr: true,
});
const Features = dynamic(() => import("~/components/partials/about/features"), {
  ssr: true,
});
const Statistics = dynamic(() => import("~/components/partials/about/statistics"), {
  ssr: true,
});
const OurTeam = dynamic(() => import("~/components/partials/about/OurTeam"), {
  ssr: true,
});
const Brands = dynamic(() => import("~/components/partials/about/brands"), {
  ssr: true,
});

const fetchPageData = async () => {
  try {
    const response = await apirequest(
      "GET",
      `/user/pages-list`,
      null,
      { page_name: "Aboutus", theme_id: process.env.THEMEID }
    );

    if (response) {
      return response;
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching page data:", error);
    throw error;
  }
};

function About2() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["aboutPage"],
    queryFn: fetchPageData,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return (
    <div>
      <Loader />
    </div>
  );
  if (error) return <p>Error loading data.</p>;

  const jsonData = data;
  const pageData = jsonData.data[0]?.web_json?.page_data || [];
  const pageTitle = jsonData.data[0]?.web_json?.page_title || "About Us";
const spaceName = Cookies.get("spaceName");


  const contentMap = {};
  const knownComponents = ["about-content", "features", "statistics", "OurTeam", "brands"];
  const dynamicSections = [];

  pageData.forEach((section) => {
    const componentName = section.component.name;
    const componentOptions = section.component.options;
    if (knownComponents.includes(componentName) && componentOptions) {
      contentMap[componentName] = componentOptions;
    } else {
      dynamicSections.push(section);
    }
  });

  const renderComponent = (component, content) => {
    switch (component) {
      case "about-content":
        return <AboutContent content={content} />;
      case "features":
        return <Features content={content} />;
      case "statistics":
        return <Statistics content={content} />;
      case "OurTeam":
        return <OurTeam content={content} />;
      case "brands":
        return <Brands content={content} />;
      default:
        return null;
    }
  };

  return (
    <div className="main">
      <Helmet>
        <meta
          name="keywords"
          content={jsonData.data[0]?.web_json.keyword || "About us"}
        />
        <meta
          name="description"
          content={jsonData.data[0]?.web_json.description || "About us"}
        />
        <title>{`${pageTitle} | ${spaceName}` || "template"}</title>
      </Helmet>

      <PageHeader title={pageTitle} />
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="#">Pages</ALink>
            </li>
            <li className="breadcrumb-item active">{pageTitle}</li>
          </ol>
        </div>
      </nav>

      <div className="page-content pb-3">
        <div className="container">
          {Object.keys(contentMap).map((component, index) => (
            <div key={index}>{renderComponent(component, contentMap[component])}</div>
          ))}
          {/* Render top-level dynamic sections */}
          {dynamicSections.length > 0 && (
            <div className="dynamic-sections">
              {dynamicSections.map((section, idx) => (
                <DynamicComponent
                  key={section.component.options.id || `dynamic-section-${idx}`}
                  component={section.component}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(About2);






// import dynamic from "next/dynamic";
// import React from "react";
// import { Helmet } from "react-helmet";
// import ALink from "~/components/features/alink";
// import PageHeader from "~/components/features/page-header";

// const AboutContent = dynamic(
//   () => import("~/components/partials/about/about-content"),
//   { ssr: true }
// );
// const Features = dynamic(() => import("~/components/partials/about/features"), {
//   ssr: true,
// });
// const Statistics = dynamic(
//   () => import("~/components/partials/about/statistics"),
//   { ssr: true }
// );
// const OurTeam = dynamic(() => import("~/components/partials/about/OurTeam"), {
//   ssr: true,
// });
// const Brands = dynamic(() => import("~/components/partials/about/brands"), {
//   ssr: true,
// });

// function About2({ contentMap, pageTitle, jsonData }) {
//   const renderComponent = (component, content) => {
//     switch (component) {
//       case "about-content":
//         return <AboutContent content={content} />;
//       case "features":
//         return <Features content={content} />;
//       case "statistics":
//         return <Statistics content={content} />;
//       case "OurTeam":
//         return <OurTeam content={content} />;
//       case "brands":
//         return <Brands content={content} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="main">
//       <Helmet>
//         <meta
//           name="keywords"
//           content={jsonData.data[0]?.web_json.keyword || "About us"}
//         />
//         <meta
//           name="description"
//           content={jsonData.data[0]?.web_json.description || "About us"}
//         />

//         <title>{jsonData.data[0]?.web_json?.page_title || "About us"}</title>
//       </Helmet>
//       <PageHeader title={pageTitle} />
//       <nav className="breadcrumb-nav">
//         <div className="container">
//           <ol className="breadcrumb">
//             <li className="breadcrumb-item">
//               <ALink href="/">Home</ALink>
//             </li>
//             <li className="breadcrumb-item">
//               <ALink href="#">Pages</ALink>
//             </li>
//             <li className="breadcrumb-item active">{pageTitle}</li>
//           </ol>
//         </div>
//       </nav>

//       <div className="page-content pb-3">
//         <div className="container">
//           {Object.keys(contentMap).map((component, index) => (
//             <div key={index}>
//               {renderComponent(component, contentMap[component])}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export async function getServerSideProps() {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/user/pages-list?page_name=Aboutus&theme_id=4kAa26`
//   );
//   const jsonData = await res.json();

//   const pageData = jsonData.data[0]?.web_json?.page_data || [];
//   const pageTitle = jsonData.data[0]?.web_json?.page_title || "About Us";
//   const contentMap = {};

//   // Updated data processing for new JSON structure
//   pageData.forEach((section) => {
//     const componentName = section.component.name;
//     const componentOptions = section.component.options;

//     if (componentName && componentOptions) {
//       contentMap[componentName] = componentOptions;
//     }
//   });

//   return {
//     props: {
//       contentMap,
//       pageTitle,
//       jsonData,
//     },
//   };
// }

// export default React.memo(About2);
