import React, { useMemo } from "react";
import OwlCarousel from "~/components/features/owl-carousel";
import ProductTwelve from "~/components/features/products/product-twelve";
import { productSlider } from "~/utils/data";
import { useQuery } from "@tanstack/react-query";
import { fetchSaleProducts } from "~/api/homeService";

function TopCollection({ content }) {
  const wrapperId = content.id;

  const titleComponent = content.contents.find(item => item.component.name === "title")?.component;
  const titleId = titleComponent?.options?.id;
  const titleText = titleComponent?.components?.[0]?.options?.text || "New Arrivals";
  const titleTextId = titleComponent?.components?.[0]?.options?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["topSellingProducts"],
    queryFn: () => fetchSaleProducts("is_new_arrivals", 0, 50, null),
    enabled: true
  });

  const products = data?.data?.data || [];

  // Memoize the carousel content to prevent unnecessary re-renders
  const carouselContent = useMemo(() => {
    if (isLoading) {
      return [1, 2, 3, 4, 5, 6].map((_, index) => (
        <div className="skel-pro" key={`skeleton-${index}`}></div>
      ));
    }

    if (products.length === 0) {
      return null;
    }

    return products.map((item, index) => (
      <div key={`product-${item.id || index}`}>
        <ProductTwelve product={item} />
      </div>
    ));
  }, [isLoading, products]);

  return (
    <div className="bg-light-2 pt-6 pb-6 featured" id={wrapperId}>
      <div className="container-fluid">
        <div className="heading heading-center mb-3" id={titleId}>
          <h2 className="title" id={titleTextId}>{titleText}</h2>
        </div>
        <div className="tab-content tab-content-carousel">
          {carouselContent ? (
            <OwlCarousel
              adClass={`owl-simple carousel-equal-height carousel-with-shadow ${isLoading ? 'loading' : 'loaded'}`}
              options={productSlider}
              isTheme={false}
              key={`carousel-${isLoading ? 'loading' : 'loaded'}-${products.length}`}
            >
              {carouselContent}
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
