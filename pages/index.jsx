import dynamic from "next/dynamic";
import { fetchPageData } from "~/api/fetchPageData";
import Reveal from "react-awesome-reveal";
import { fadeIn } from "~/utils/data";
import { useQuery } from "@tanstack/react-query";
import Loader from "~/components/Loader";

// Dynamically import components
const Banners = dynamic(() => import("~/components/partials/home/Banners"), { ssr: true });
const Services = dynamic(() => import("~/components/partials/home/services"), { ssr: true });
const SpecialCollection = dynamic(() => import("~/components/partials/home/SpecialCollection"), { ssr: true });
const TopCollection = dynamic(() => import("~/components/partials/home/TopCollection"), { ssr: true });
const BlogCollection = dynamic(() => import("~/components/partials/home/BlogCollection"), { ssr: true });
const Customerstestimonial = dynamic(() => import("~/components/partials/home/Customerstestimonial"), { ssr: true });
const Brands = dynamic(() => import("~/components/partials/home/Brands"), { ssr: true });

function Home() {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['homePageData', process.env.THEMEID],
    queryFn: () => fetchPageData("Home", process.env.THEMEID),
  });

  let contentArray = [];

  // Process data if available and not loading
  if (!isLoading && pageData?.[0]?.web_json?.page_data) {
    contentArray = pageData[0].web_json.page_data.map(section => ({
      name: section.component?.name,
      options: section.component?.options || {}
    }));
  }

  const renderComponent = (component, index) => {
    switch (component.name) {
      case "Banners":
        return <Banners key={index} content={component.options} />;

      case "services":
        return <Services key={index} content={component.options} />;

      case "SpecialCollection":
        return (
          <Reveal 
            key={index} 
            keyframes={fadeIn} 
            delay={200} 
            duration={1000} 
            triggerOnce
          >
            <SpecialCollection content={component.options} />
          </Reveal>
        );

      case "TopCollection":
        return (
          <div key={index} className="container-fluid">
            <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
              <TopCollection content={component.options} />
            </Reveal>
          </div>
        );

      case "BlogCollection":
        return (
          <div key={index} className="container-fluid">
            <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
              <BlogCollection content={component.options} />
            </Reveal>
          </div>
        );

      case "Customerstestimonial":
        return <Customerstestimonial key={index} content={component.options} />;

      case "brands":
        return <Brands key={index} content={component.options} />;

      default:
        return null;
    }
  };

  // Show loading state or render content
  if (isLoading) {
    return <div className="main home-page skeleton-body"><Loader/></div>; // You can customize this loading state
  }

  return (
    <div className="main home-page skeleton-body">
      {contentArray.map((component, index) => 
        renderComponent(component, index)
      )}
    </div>
  );
}

export default Home;














// import dynamic from "next/dynamic";
// import { fetchPageData } from "~/api/fetchPageData";
// import Reveal from "react-awesome-reveal";
// import { fadeIn } from "~/utils/data";

// // Dynamically import components
// const Banners = dynamic(() => import("~/components/partials/home/Banners"), { ssr: true });
// const Services = dynamic(() => import("~/components/partials/home/services"), { ssr: true });
// const SpecialCollection = dynamic(() => import("~/components/partials/home/SpecialCollection"), { ssr: true });
// const TopCollection = dynamic(() => import("~/components/partials/home/TopCollection"), { ssr: true });
// const BlogCollection = dynamic(() => import("~/components/partials/home/BlogCollection"), { ssr: true });
// const Customerstestimonial = dynamic(() => import("~/components/partials/home/Customerstestimonial"), { ssr: true });
// const Brands = dynamic(() => import("~/components/partials/home/Brands"), { ssr: true });

// function Home({ contentArray }) {
//   const renderComponent = (component, index) => {
//     switch (component.name) {
//       case "Banners":
//         return <Banners key={index} content={component.options.contents} />;

//       case "services":
//         return <Services key={index} content={component.options.contents} />;

//       case "SpecialCollection":
//         return (
//           <Reveal 
//             key={index} 
//             keyframes={fadeIn} 
//             delay={200} 
//             duration={1000} 
//             triggerOnce
//           >
//             <SpecialCollection content={component.options.contents} />
//           </Reveal>
//         );

//       case "TopCollection":
//         return (
//           <div key={index} className="container-fluid">
//             <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
//               <TopCollection content={component.options.contents} />
//             </Reveal>
//           </div>
//         );

//       case "BlogCollection":
//         return (
//           <div key={index} className="container-fluid">
//             <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
//               <BlogCollection content={component.options.contents} />
//             </Reveal>
//           </div>
//         );

//       case "Customerstestimonial":
//         return <Customerstestimonial key={index} content={component.options.contents} />;

//       case "brands":
//         return <Brands key={index} content={component.options.contents} />;

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="main home-page skeleton-body">
//       {contentArray.map((component, index) => 
//         renderComponent(component, index)
//       )}
//     </div>
//   );
// }

// export async function getServerSideProps() {
//   const siteId = "4kAa26";
//   const pageData = await fetchPageData("Home", siteId);
//   let contentArray = [];

//   if (pageData?.[0]?.web_json?.page_data) {
//     contentArray = pageData[0].web_json.page_data.map(section => ({
//       name: section.component?.name,
//       options: section.component?.options || {}
//     }));
//   }

//   return {
//     props: {
//       contentArray
//     }
//   };
// }

// export default Home;
