// import React, { useState } from "react";
// import { Tabs, Tab, TabList, TabPanel } from "react-tabs";
// import OwlCarousel from "~/components/features/owl-carousel";
// import ProductTwelve from "~/components/features/products/product-twelve";
// import { catFilter } from "~/utils";
// import { productSlider } from "~/utils/data";
// import { useQuery } from "react-query";
// import { fetchSaleProducts } from "~/api/homeService";

// function TopCollection({ content }) {

//   const title =
//     content.find((item) => item.component.name === "title")?.component
//       .components[0]?.options?.text || "Featured Products";
//   const categories =
//     content
//       .find((item) => item.component.name === "categories")
//       ?.component.components.map((cat) => ({
//         slug: cat.options.slug,
//         text: cat.options.text,
//       })) || [];

//   const [selectedCategoryId, setSelectedCategoryId] = useState(
//     categories[0]?.slug || null
//   );

//   const { data, isLoading } = useQuery(
//     ["topSellingProducts", selectedCategoryId],
//     () =>
//       fetchSaleProducts(
//         "is_new_arrivals",
//         0,
//         50,
//         selectedCategoryId
//       ),
//     { enabled: selectedCategoryId !== null }
//   );

//   const products = data?.data?.data || [];

//   const handleTabChange = (categorySlug) => {
//     setSelectedCategoryId(categorySlug);
//   };

//   return (
//     <div className="bg-light-2 pt-6 pb-6 featured">
//       <div className="container-fluid">
//         <Tabs
//           selectedTabClassName="show"
//           defaultIndex={0}
//           onSelect={(index) => handleTabChange(categories[index]?.slug)}
//         >
//           <div className="heading heading-center mb-3">
//             <h2 className="title">{title}</h2>
//             <TabList
//               className="nav nav-pills justify-content-center"
//               role="tablist"
//             >
//               {categories?.map((category) => (
//                 <Tab className="nav-item" key={category.slug}>
//                   <span className="nav-link">{category.text}</span>
//                 </Tab>
//               ))}
//             </TabList>
//           </div>
//           <div className="tab-content tab-content-carousel">
//             {categories?.map((category) => {
//               const filteredProducts = catFilter(products, category.slug);

//               return (
//                 <TabPanel key={category.slug}>
//                   {isLoading ? (
//                     <OwlCarousel
//                       adClass="owl-simple carousel-equal-height carousel-with-shadow"
//                       options={productSlider}
//                       isTheme={false}
//                     >
//                       {[1, 2, 3, 4, 5, 6].map((_, index) => (
//                         <div className="skel-pro" key={index}></div>
//                       ))}
//                     </OwlCarousel>
//                   ) : filteredProducts.length > 0 ? (
//                     <OwlCarousel
//                       adClass="owl-simple carousel-equal-height carousel-with-shadow"
//                       options={productSlider}
//                       isTheme={false}
//                     >
//                       {filteredProducts.slice(0, 6).map((item, index) => (
//                         <ProductTwelve product={item} key={index} />
//                       ))}
//                     </OwlCarousel>
//                   ) : (
//                     <div className="no-products">No products available</div>
//                   )}
//                 </TabPanel>
//               );
//             })}
//           </div>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// export default TopCollection;









import React from "react";
import OwlCarousel from "~/components/features/owl-carousel";
import ProductTwelve from "~/components/features/products/product-twelve";
import { productSlider } from "~/utils/data";
import { useQuery } from "react-query";
import { fetchSaleProducts } from "~/api/homeService";

function TopCollection({ content }) {
  const wrapperId = content.id;

  const titleComponent = content.contents.find(item => item.component.name === "title")?.component;
  const titleId = titleComponent?.options?.id;
  const titleText = titleComponent?.components?.[0]?.options?.text || "New Arrivals";
  const titleTextId = titleComponent?.components?.[0]?.options?.id;

  const { data, isLoading } = useQuery(
    ["topSellingProducts"],
    () => fetchSaleProducts("is_new_arrivals", 0, 50, null),
    { enabled: true }
  );

  const products = data?.data?.data || [];

  return (
    <div className="bg-light-2 pt-6 pb-6 featured" id={wrapperId}>
      <div className="container-fluid">
        <div className="heading heading-center mb-3" id={titleId}>
          <h2 className="title" id={titleTextId}>{titleText}</h2>
        </div>
        <div className="tab-content tab-content-carousel">
          {isLoading ? (
            <OwlCarousel
              adClass="owl-simple carousel-equal-height carousel-with-shadow"
              options={productSlider}
              isTheme={false}
            >
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <div className="skel-pro" key={index}></div>
              ))}
            </OwlCarousel>
          ) : products.length > 0 ? (
            <OwlCarousel
              adClass="owl-simple carousel-equal-height carousel-with-shadow"
              options={productSlider}
              isTheme={false}
            >
              {products.map((item, index) => (
                <ProductTwelve product={item} key={index} />
              ))}
            </OwlCarousel>
          ) : (
            <div className="no-products">No products available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopCollection;












// import { Tabs, Tab, TabList, TabPanel } from "react-tabs";

// import ALink from "~/components/features/alink";
// import ProductTwelve from "~/components/features/products/product-twelve";

// import { catFilter } from "~/utils";

// import { useQuery } from "@apollo/react-hooks";

// import { GET_HOME_DATA } from "~/server/queries";
// import { withApollo } from "next-apollo";

// function TopCollection({ content }) {


//   return (
//     // <Tabs selectedTabClassName="show" defaultIndex={0}>
//     //   <div className="heading heading-center mb-3">
//     //     <h2 className="title">New Arrivals</h2>

//     //     <TabList
//     //       className="nav nav-pills justify-content-center"
//     //       role="tablist"
//     //     >
//     //       <Tab className="nav-item">
//     //         <span className="nav-link">Womens Clothing</span>
//     //       </Tab>

//     //       <Tab className="nav-item">
//     //         <span className="nav-link">Mens Clothing</span>
//     //       </Tab>
//     //     </TabList>
//     //   </div>

//     //   <TabPanel>
//     //     <div className="products">
//     //       <div className="row justify-content-center">
//     //         {loading
//     //           ? [1, 2, 3, 4, 5].map((item, index) => (
//     //               <div
//     //                 className="col-6 col-md-4 col-lg-3 col-xl-5col"
//     //                 key={index}
//     //               >
//     //                 <div className="skel-pro"></div>
//     //               </div>
//     //             ))
//     //           : catFilter(products, ["women"])
//     //               .slice(0, 5)
//     //               .map((item, index) => (
//     //                 <div
//     //                   className="col-6 col-md-4 col-lg-3 col-xl-5col"
//     //                   key={index}
//     //                 >
//     //                   <ProductTwelve product={item} key={index} />
//     //                 </div>
//     //               ))}
//     //       </div>
//     //     </div>
//     //   </TabPanel>
//     //   <TabPanel>
//     //     <div className="products">
//     //       <div className="row justify-content-center">
//     //         {loading
//     //           ? [1, 2, 3, 4, 5].map((item, index) => (
//     //               <div
//     //                 className="col-6 col-md-4 col-lg-3 col-xl-5col"
//     //                 key={index}
//     //               >
//     //                 <div className="skel-pro"></div>
//     //               </div>
//     //             ))
//     //           : catFilter(products, ["men"])
//     //               .slice(0, 5)
//     //               .map((item, index) => (
//     //                 <div
//     //                   className="col-6 col-md-4 col-lg-3 col-xl-5col"
//     //                   key={index}
//     //                 >
//     //                   <ProductTwelve product={item} key={index} />
//     //                 </div>
//     //               ))}
//     //       </div>
//     //     </div>
//     //   </TabPanel>

//     //   <div className="more-container text-center mt-2 mb-7">
//     //     <ALink
//     //       href="/shop/sidebar/3cols"
//     //       className="btn btn-outline-dark-3 btn-more"
//     //     >
//     //       <span>Shop more</span>
//     //       <i className="icon-long-arrow-right"></i>
//     //     </ALink>
//     //   </div>
//     // </Tabs>
//     <div></div>
//   );
// }

// // export default TopCollection;
// export default TopCollection;
