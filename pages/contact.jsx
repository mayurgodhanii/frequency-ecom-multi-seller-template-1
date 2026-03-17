import dynamic from "next/dynamic";
import React from "react";
import ALink from "~/components/features/alink";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import Loader from "~/components/Loader";
import { apirequest } from "~/utils/api";
import DynamicComponent from "~/components/DynamicComponent";
import Cookies from "js-cookie";

const ContactInfo = dynamic(
  () => import("~/components/partials/contact/Contact-Information"),
  { ssr: true }
);
const ContactForm = dynamic(
  () => import("~/components/partials/contact/contact-form"),
  { ssr: true }
);
const OurStores = dynamic(
  () => import("~/components/partials/contact/Our-Stores"),
  { ssr: true }
);

const fetchPageData = async () => {
  try {
    const response = await apirequest(
      "GET",
      `/user/pages-list`,
      null,
      { page_name: "contact", theme_id: process.env.THEMEID }
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

function Contact() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["contactPage"],
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
  const pageTitle = jsonData.data[0]?.web_json?.page_title || "Contact Us";
  const pageSubtitle =
    jsonData.data[0]?.web_json?.sub_title || "Keep in touch with us";
  const headerImage =
    jsonData.data[0]?.web_json?.image_url || "images/contact-header-bg.jpg";

  const spaceName = Cookies.get("spaceName");

  const contentMap = {};
  const knownComponents = ["Contact-Information", "contact-form", "Our-Stores"];
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
      case "Contact-Information":
        return <ContactInfo content={content} />;
      case "contact-form":
        return <ContactForm content={content} />;
      case "Our-Stores":
        return <OurStores content={content} />;
      default:
        return null;
    }
  };

  return (
    <div className="main">
      <Helmet>
        <meta
          name="keywords"
          content={jsonData.data[0]?.web_json.keyword || "Contact us"}
        />
        <meta
          name="description"
          content={jsonData.data[0]?.web_json.description || "Contact us"}
        />
        <title>{`${pageTitle} | ${spaceName}` || "template"}</title>
      </Helmet>

      <nav className="breadcrumb-nav border-0 mb-0">
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

      <div className="container">
        <div
          className="page-header page-header-big text-center"
          style={{ backgroundImage: `url(${headerImage})` }}
        >
          <h1 className="page-title text-white">
            {pageTitle} <span className="text-white">{pageSubtitle}</span>
          </h1>
        </div>
      </div>

      <div className="page-content pb-0">
        <div className="container">
          <div className="row">
            {contentMap["Contact-Information"] &&
              renderComponent(
                "Contact-Information",
                contentMap["Contact-Information"]
              )}
            {contentMap["contact-form"] &&
              renderComponent("contact-form", contentMap["contact-form"])}
          </div>

          <hr className="mt-4 mb-5" />
          {contentMap["Our-Stores"] &&
            renderComponent("Our-Stores", contentMap["Our-Stores"])}

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

export default Contact;






// import dynamic from "next/dynamic";
// import React from "react";
// import ALink from "~/components/features/alink";
// import GoogleMapReact from "google-map-react";
// import { Helmet } from "react-helmet";

// // Dynamically import all components
// const ContactInfo = dynamic(
//   () => import("~/components/partials/contact/Contact-Information"),
//   { ssr: true }
// );
// const ContactForm = dynamic(
//   () => import("~/components/partials/contact/contact-form"),
//   { ssr: true }
// );
// const OurStores = dynamic(
//   () => import("~/components/partials/contact/Our-Stores"),
//   { ssr: true }
// );

// const MapComponent = ({ text }) => <div>{text}</div>;

// function Contact({
//   contentMap,
//   pageTitle,
//   pageSubtitle,
//   headerImage,
//   jsonData,
// }) {
//   const renderComponent = (component, content) => {
//     switch (component) {
//       case "Contact-Information":
//         return <ContactInfo content={content} />;
//       case "contact-form":
//         return <ContactForm content={content} />;
//       case "Our-Stores":
//         return <OurStores content={content} />;
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
//       <nav className="breadcrumb-nav border-0 mb-0">
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

//       <div className="container">
//         <div
//           className="page-header page-header-big text-center"
//           style={{ backgroundImage: `url(${headerImage})` }}
//         >
//           <h1 className="page-title text-white">
//             {pageTitle} <span className="text-white">{pageSubtitle}</span>
//           </h1>
//         </div>
//       </div>

//       <div className="page-content pb-0">
//         <div className="container">
//           <div className="row">
//             {contentMap["Contact-Information"] &&
//               renderComponent(
//                 "Contact-Information",
//                 contentMap["Contact-Information"]
//               )}
//             {contentMap["contact-form"] &&
//               renderComponent("contact-form", contentMap["contact-form"])}
//           </div>

//           <hr className="mt-4 mb-5" />
//           {contentMap["Our-Stores"] &&
//             renderComponent("Our-Stores", contentMap["Our-Stores"])}
//         </div>

//         <div id="map" className="w-100">
//           <GoogleMapReact
//             bootstrapURLKeys={{
//               key: "AIzaSyBgVsModMpsR59_OIK-2sEcmhBBkW4xUuw",
//             }}
//             defaultCenter={{ lat: 59.95, lng: 30.33 }}
//             defaultZoom={11}
//           >
//             <MapComponent lat={59.955413} lng={30.337844} text="Our Location" />
//           </GoogleMapReact>
//         </div>
//       </div>
//     </div>
//   );
// }

// export async function getServerSideProps() {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/user/pages-list?page_name=Contact&theme_id=4kAa26`
//   );
//   const jsonData = await res.json();

//   const pageData = jsonData.data[0]?.web_json?.page_data || [];
//   const pageTitle = jsonData.data[0]?.web_json?.page_title || "Contact Us";
//   const pageSubtitle =
//     jsonData.data[0]?.web_json?.sub_title || "Keep in touch with us";
//   const headerImage =
//     jsonData.data[0]?.web_json?.image_url || "images/contact-header-bg.jpg";

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
//       pageSubtitle,
//       headerImage,
//       jsonData,
//     },
//   };
// }

// export default Contact;
