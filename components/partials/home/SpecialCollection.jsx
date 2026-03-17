import React from "react";
import ProductTwelve from "~/components/features/products/product-twelve";
import { useQuery } from "@tanstack/react-query";
import { fetchSaleProducts } from "~/api/homeService";
import ALink from "~/components/features/alink";

function SpecialCollection({ content }) {
  const wrapperId = content.id;

  const titleComponent = content.contents.find(item => item.component.name === "title")?.component;
  const titleId = titleComponent?.options?.id;
  const titleText = titleComponent?.components?.[0]?.options?.text || "Featured Products";
  const titleTextId = titleComponent?.components?.[0]?.options?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["specialCollectionProducts"],
    queryFn: () => fetchSaleProducts("exclusive_deals", 0, 10, null),
    enabled: true
  });

  const products = data?.data?.data || [];

  return (
    <div className="bg-light-2 pt-6 pb-6 featured collection-section" id={wrapperId}>
      <div className="container-fluid">
        <div className="heading-wrapper" id={titleId}>
          <h2 className="title collection-title" id={titleTextId}>{titleText}</h2>
          <ALink href="/shop/list" className="view-all-link">View All</ALink>
        </div>
        
        <div className="products-grid">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
              <div className="skel-pro" key={`skeleton-${index}`}></div>
            ))
          ) : products.length > 0 ? (
            products.map((item, index) => (
              <div key={`product-${item.id || index}`} className="product-grid-item">
                <ProductTwelve product={item} />
              </div>
            ))
          ) : (
            <div className="no-products">No products available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpecialCollection;
