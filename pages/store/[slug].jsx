import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import StickyBox from "react-sticky-box";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import ShopListOne from "~/components/partials/shop/list/shop-list-one";
import Pagination from "~/components/features/pagination";
import ShopSidebarOne from "~/components/partials/shop/sidebar/shop-sidebar-one";
import { apirequest } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { fetchPageData } from "~/api/fetchPageData";
import Loader from "~/components/Loader";
import Cookies from "js-cookie";
import { LazyLoadImage } from "react-lazy-load-image-component";

function StoreDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const spaceName = Cookies.get("spaceName");

  const [storeData, setStoreData] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [products, setProducts] = useState([]);
  const [metaData, setMetaData] = useState();

  const perPage = 12;
  const currentPage = parseInt(router.query.page) || 1;

  // Fetch store details
  const { data: storeDetails, isLoading: storeLoading } = useQuery({
    queryKey: ["store-details", slug],
    queryFn: async () => {
      // Handle both slug and ID-based routing
      const storeIdentifier = slug;
      const response = await apirequest("GET", `/store/details/${storeIdentifier}`, null, {
      });
      return response;
    },
    enabled: !!slug,
    staleTime: 300000,
    retry: 1,
    onSuccess: (data) => {
      if (data.success) {
        setStoreData(data.data);
      }
    },
    onError: (error) => {
      console.error("Error fetching store details:", error);
    },
  });

  // Fetch store products
  const { data: productsData, isLoading: productsLoading, isError, error } = useQuery({
    queryKey: ["store-products", slug, currentPage],
    queryFn: async () => {
      const storeIdentifier = slug;
      const requestData = {
        search: "",
        page: currentPage,
        size: perPage,
        filter: {}
      };

      const response = await apirequest("POST", `/product/store/${storeIdentifier}`, requestData);
      return response;
    },
    enabled: !!slug,
    staleTime: 300000,
    retry: 1,
    onError: (error) => {
      console.error("Error fetching store products:", error);
    },
  });

  const totalCount = productsData?.data?.totalItems || 0;

  useEffect(() => {
    if (productsData?.data?.data) {
      setProducts(productsData.data.data);
    }
  }, [productsData]);

  useEffect(() => {
    if (storeDetails?.success) {
      setStoreData(storeDetails.data);
    }
  }, [storeDetails]);

  useEffect(() => {
    const fetchMeta = async () => {
      const theme_id = process.env.THEMEID;
      const pageData = await fetchPageData("plp", theme_id);
      setMetaData(pageData[0]?.web_json);
    };

    fetchMeta();
  }, []);

  const fetchFilteredProducts = async (filters) => {
    const requestData = {
      search: filters.search || "",
      page: 1,
      size: perPage,
      filter: {
        price: {
          min: filters.minPrice || 0,
          max: filters.maxPrice || 99999,
        },
        category_id: filters.categories || [],
        brand_id: filters.brand_ids || [],
      },
    };

    try {
      const storeIdentifier = slug;
      const response = await apirequest("POST", `/product/store/${storeIdentifier}`, requestData);
      if (response.success) {
        if (
          filters.minPrice === 0 &&
          filters.maxPrice === 99999 &&
          (!filters.brand_ids || filters.brand_ids.length === 0) &&
          (!filters.categories || filters.categories.length === 0)
        ) {
          setProducts(productsData?.data?.data || []);
        } else {
          setProducts(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setToggle(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    document.body.classList.toggle("sidebar-filter-active");
  };

  const hideSidebar = () => {
    document.body.classList.remove("sidebar-filter-active");
  };

  if (storeLoading || productsLoading) return (
    <div>
      <Loader />
    </div>
  );

  if (isError) return <div>Error: {error.message}</div>;

  return (
    <main className="main shop store-detail">
      <Helmet>
        <meta name="keywords" content={metaData?.keyword || "store"} />
        <meta name="description" content={metaData?.description || "store"} />
        <title>{`${storeData?.store_name || "Store"} | ${spaceName}` || "Store"}</title>
      </Helmet>

      <PageHeader title={storeData?.store_name || "Store"} subTitle="Store" />
      
      <nav className="breadcrumb-nav mb-2">
        <div className="container-fluid">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/stores">Stores</ALink>
            </li>
            <li className="breadcrumb-item active">{storeData?.store_name || "Store"}</li>
          </ol>
        </div>
      </nav>

      {/* Store Info Section */}
      {storeData && (
        <div className="store-info-section">
          <div className="container-fluid">
            <div className="store-info-card">
              <div className="store-image-wrapper">
                <LazyLoadImage
                  alt={storeData.store_name}
                  src={storeData.store_image || storeData.image}
                  threshold={200}
                  effect="blur"
                  className="store-image"
                />
              </div>
              <div className="store-details">
                <h1 className="store-name">{storeData.store_name}</h1>
                <div className="store-meta">
                  <div className="store-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 11 11" fill="none">
                      <path d="M3.61821 3.16898L0.428209 3.63148L0.371709 3.64298C0.286179 3.66569 0.208207 3.71069 0.145755 3.77339C0.0833039 3.83608 0.0386109 3.91423 0.0162402 3.99985C-0.00613047 4.08547 -0.00537724 4.17549 0.0184229 4.26072C0.0422231 4.34595 0.0882174 4.42334 0.151709 4.48498L2.46271 6.73448L1.91771 9.91198L1.91121 9.96698C1.90597 10.0554 1.92434 10.1437 1.96443 10.2227C2.00453 10.3018 2.0649 10.3687 2.13938 10.4167C2.21385 10.4648 2.29975 10.4921 2.38828 10.496C2.47681 10.4999 2.56479 10.4803 2.64321 10.439L5.49621 8.93898L8.34271 10.439L8.39271 10.462C8.47524 10.4945 8.56493 10.5045 8.65259 10.4909C8.74024 10.4773 8.8227 10.4406 8.89151 10.3846C8.96031 10.3286 9.01299 10.2554 9.04413 10.1723C9.07527 10.0892 9.08375 9.9994 9.06871 9.91198L8.52321 6.73448L10.8352 4.48448L10.8742 4.44198C10.9299 4.37337 10.9664 4.29121 10.9801 4.20388C10.9937 4.11655 10.9839 4.02717 10.9518 3.94485C10.9196 3.86253 10.8662 3.7902 10.797 3.73524C10.7277 3.68028 10.6452 3.64465 10.5577 3.63198L7.36771 3.16898L5.94171 0.278985C5.90045 0.195252 5.83657 0.124742 5.7573 0.0754369C5.67804 0.0261317 5.58656 0 5.49321 0C5.39986 0 5.30838 0.0261317 5.22912 0.0754369C5.14985 0.124742 5.08597 0.195252 5.04471 0.278985L3.61821 3.16898Z" fill="#FFC107" />
                    </svg>
                    <span>{storeData.store_average_rating || storeData.rating || "0"} ({storeData.store_rating_count || "0"})</span>
                  </div>
                  {storeData.store_location && (
                    <div className="store-location">
                      <i className="icon-map-marker"></i>
                      <span>{storeData.store_location}</span>
                    </div>
                  )}
                  {storeData.delivery_days && (
                    <div className="store-delivery">
                      <i className="icon-clock-o"></i>
                      <span>{storeData.delivery_days} Days</span>
                    </div>
                  )}
                </div>
                {storeData.description && (
                  <p className="store-description">{storeData.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-content">
        <div className="container-fluid">
          <div className="row skeleton-body">
            <div className="col-lg-9 skel-shop-products loaded">
              <div className="toolbox">
                <div className="toolbox-left">
                  {products.length > 0 && (
                    <div className="toolbox-info">
                      Showing <span>{products.length}</span> of{" "}
                      <span>{totalCount}</span> Products
                    </div>
                  )}
                </div>
              </div>

              <ShopListOne
                products={products}
                perPage={perPage}
                loading={productsLoading}
              />
              
              {totalCount > perPage && products.length !== 0 && (
                <Pagination
                  perPage={perPage}
                  total={totalCount}
                  currentPage={currentPage}
                  onPageChange={(newPage) => {
                    router.push({
                      pathname: router.pathname,
                      query: { ...router.query, page: newPage },
                    });
                  }}
                />
              )}
            </div>

            <aside
              className={`col-lg-3 skel-shop-sidebar order-lg-first skeleton-body ${!productsLoading || productsLoading ? "loaded" : ""
                }`}
            >
              <StickyBox className="sticky-content" offsetTop={70}>
                <ShopSidebarOne
                  toggle={toggle}
                  products={products}
                  onFilterChange={fetchFilteredProducts}
                />
              </StickyBox>
              {toggle && (
                <button
                  className="sidebar-fixed-toggler"
                  onClick={toggleSidebar}
                >
                  <i className="icon-cog"></i>
                </button>
              )}
              <div
                className="sidebar-filter-overlay"
                onClick={hideSidebar}
              ></div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

export default StoreDetail;