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
  const primaryApiUrl = `/user/product/${slug}`;
  const fallbackApiUrl = `/user/products/${slug}`;

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
  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token;

  const primaryApiUrl = `/user/recommand-productId-list?product_id=${slug}&page=0&size=5&search=`;
  const fallbackApiUrl = `/user/recommand-productsId-list?product_id=${slug}&page=0&size=5&search=`;

  if (token === "null" || !token) {
    // console.error("Token is invalid or missing, using fallback API.");
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

    // Find the matching combination - try multiple key variations
    const matchingCombination = combinations.find(combo => {
      console.log('Checking combination:', combo);
      
      // Try different possible keys (case-insensitive)
      const possibleKeys = [
        primaryOptionName,
        primaryOptionName.toLowerCase(),
        primaryOptionName + 's', // plural
        primaryOptionName.toLowerCase() + 's', // plural lowercase
        primaryOptionName.slice(0, -1), // singular (remove 's')
        'colors', // common key
        'color'   // common key
      ];
      
      for (const key of possibleKeys) {
        const comboValue = combo[key];
        console.log(`Trying key "${key}":`, comboValue);
        
        if (comboValue) {
          // Compare case-insensitively
          if (comboValue.toLowerCase() === selectedValue.toLowerCase()) {
            console.log('✓ Match found with key:', key);
            return true;
          }
        }
      }
      
      return false;
    });

    console.log('Matching combination:', matchingCombination);

    // Update images if combination has images, otherwise use default
    if (matchingCombination?.image && Array.isArray(matchingCombination.image) && matchingCombination.image.length > 0) {
      console.log('✓ Setting images from combination:', matchingCombination.image);
      
      // Clean up image URLs (remove encoded quotes if present)
      const cleanedImages = matchingCombination.image.map(img => 
        typeof img === 'string' ? img.replace(/%22/g, '').replace(/"/g, '') : img
      );
      
      console.log('Cleaned images:', cleanedImages);
      setCurrentImages(cleanedImages);
    } else {
      console.log('No images in combination, using default product images');
      setCurrentImages(product.image);
    }
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
