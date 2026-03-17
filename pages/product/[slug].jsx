import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import Breadcrumb from "~/components/partials/product/breadcrumb";
import GalleryDefault from "~/components/partials/product/gallery/gallery-default";
import DetailOne from "~/components/partials/product/details/detail-one";
import InfoOne from "~/components/partials/product/info-tabs/info-one";
import RelatedProductsOne from "~/components/partials/product/related/related-one";
import { apirequest } from "~/utils/api";
import ALink from "~/components/features/alink";
import Helmet from "react-helmet";
import Loader from "~/components/Loader";
import Cookies from "js-cookie";

const fetchProduct = async (slug) => {
  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token;
  const primaryApiUrl = `/product/details/${slug}`;
  const fallbackApiUrl = `/product/details/${slug}`;

  if (token === "null" || !token) {
    return await apirequest("GET", fallbackApiUrl);
  }

  try {
    return await apirequest("GET", primaryApiUrl, null, {
      "x-access-token": token.replace(/"/g, ""),
    });
  } catch (error) {
    console.error("Error in primary API, falling back to secondary:", error);

    return await apirequest("GET", fallbackApiUrl);
  }
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 300000,
    onError: (error) => {
      console.error("Error fetching product:", error.message);
    },
  });
};

const fetchRelatedProducts = async (slug) => {
  const primaryApiUrl = `/product/recommend/${slug}`;
  const fallbackApiUrl = `/product/recommend/${slug}`;

  const payload = {
    search: "",
    page: 1,
    size: 5,
  };

  try {
    return await apirequest("POST", primaryApiUrl, payload);
  } catch (error) {
    console.error("Error in primary API, falling back to secondary:", error);

    return await apirequest("POST", fallbackApiUrl, payload);
  }
};

export const useRelatedProducts = (slug) => {
  return useQuery({
    queryKey: ["relatedProducts", slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 300000,
    onError: (error) => {
      console.error("Error fetching related products:", error.message);
    },
  });
};

function ProductDefault() {
  const router = useRouter();
  const { slug } = router.query;
  const [currentImages, setCurrentImages] = React.useState([]);


  const {
    data: productData,
    isLoading: isProductLoading,
    isError: isProductError,
    error: productError,
  } = useProduct(slug);

  const {
    data: relatedData,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
    error: relatedError,
  } = useRelatedProducts(slug);

  const product = productData?.data;
  const prev = productData?.data?.prev;
  const next = productData?.data?.next;
  const related = relatedData?.data?.data || [];
  const spaceName = Cookies.get("spaceName");

  // Initialize images when product loads
  React.useEffect(() => {
    if (product?.image) {
      setCurrentImages(product.image);
    }
  }, [product]);

  // Handle variant image change
  const handleVariantImageChange = (selectedVariant) => {
    console.log('=== handleVariantImageChange called ===');
    console.log('selectedVariant:', selectedVariant);
    
    if (!product?.variant_json?.combinations) {
      console.log('No combinations found');
      return;
    }

    const combinations = product.variant_json.combinations;
    const options = product.variant_json.options || [];
    
    console.log('Combinations:', combinations);
    console.log('Options:', options);
    
    // Get the primary option name (usually the first option like 'color')
    const primaryOptionName = options[0]?.option;
    
    if (!primaryOptionName) {
      console.log('No primary option name');
      return;
    }

    // Find the selected value for the primary option
    const selectedValue = selectedVariant.find(
      v => v.option.toLowerCase() === primaryOptionName.toLowerCase()
    )?.value;

    console.log('Primary option:', primaryOptionName, 'Selected value:', selectedValue);

    if (!selectedValue) {
      // Reset to default images if no selection
      console.log('No selected value, resetting to default images');
      setCurrentImages(product.image);
      return;
    }

    // Find the matching combination
    const matchingCombination = combinations.find(combo => {
      console.log('Checking combination:', combo);
      
      // Check if the combination matches the selected color
      const comboValue = combo[primaryOptionName.toLowerCase()];
      console.log(`Checking ${primaryOptionName.toLowerCase()}:`, comboValue);
      
      if (comboValue && comboValue.toLowerCase() === selectedValue.toLowerCase()) {
        console.log('✓ Match found');
        return true;
      }
      
      return false;
    });

    console.log('Matching combination:', matchingCombination);

    // Update images if combination has variants with images
    if (matchingCombination?.variants && Array.isArray(matchingCombination.variants)) {
      // Look for images in any variant of this combination
      for (const variant of matchingCombination.variants) {
        if (variant.image && Array.isArray(variant.image) && variant.image.length > 0) {
          console.log('✓ Setting images from variant:', variant.image);
          setCurrentImages(variant.image);
          return;
        }
      }
    }
    
    // If no variant images found, use default product images
    console.log('No variant images found, using default product images');
    setCurrentImages(product.image);
  };



  if (isProductLoading || isRelatedLoading) return (
    <div>
      <Loader />
    </div>
  );

  if (isProductError) {
    return <div>Error loading product: {productError.message}</div>;
  }

  if (isRelatedError) {
    return <div>Error loading related products: {relatedError.message}</div>;
  }
  return (
    <div className="main">
      <Helmet>
        <meta name="keywords" content={product?.name} />
        <meta name="description" content={product?.description} />


        <title>{`${product?.name} | ${spaceName}` || "template"}</title>
      </Helmet>

      <nav className="breadcrumb-nav border-0 mb-0">
        <div className="d-flex align-items-center container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/shop/list">Product</ALink>
            </li>
            <li className="breadcrumb-item active">{product?.name}</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container skeleton-body">
          <div className="product-details-top">
            <div
              className={`row skel-pro-single ${isProductLoading ? "" : "loaded"
                }`}
            >
              <div className="col-md-6">
                <div className="skel-product-gallery"></div>
                {!isProductLoading && <GalleryDefault product={{ ...product, image: currentImages }} />}
              </div>

              <div className="col-md-6">
                <div className="entry-summary row">
                  <div className="col-md-12">
                    <div className="entry-summary1 mt-2 mt-md-0"></div>
                  </div>
                  <div className="col-md-12">
                    <div className="entry-summary2"></div>
                  </div>
                </div>
                {!isProductLoading && <DetailOne product={product} onVariantChange={handleVariantImageChange} />}
              </div>
            </div>
          </div>

          {isProductLoading ? (
            <div className="skel-pro-tabs"></div>
          ) : (
            <InfoOne product={product} />
          )}

{related.length > 0 && (
            <RelatedProductsOne products={related} loading={isRelatedLoading} />
          )}        </div>
      </div>
    </div>
  );
}

export default ProductDefault;
