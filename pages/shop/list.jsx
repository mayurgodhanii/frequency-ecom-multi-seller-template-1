

import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import StickyBox from "react-sticky-box";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import ShopListOne from "~/components/partials/shop/list/shop-list-one";
import Pagination from "~/components/features/pagination";
import ShopSidebarOne from "~/components/partials/shop/sidebar/shop-sidebar-one";
import { apirequest } from "~/utils/api";
import { useQuery } from "react-query";
import { getToken } from "~/utils/api";
import Helmet from "react-helmet";
import { fetchPageData } from "~/api/fetchPageData";
import Loader from "~/components/Loader";
import Cookies from "js-cookie";

function ShopGrid() {
  const router = useRouter();
  const spaceName = Cookies.get("spaceName");
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    const handleRouteChange = () => {
      const newTitle = "list";
      setPageTitle(newTitle);
    };
    handleRouteChange(router.asPath);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);
  const [toggle, setToggle] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [metaData, setMetaData] = useState();

  const perPage = 9;
  const currentPage = parseInt(router.query.page) || 1;

  const { data, isLoading, isError, error } = useQuery(
    ["products", currentPage],
    async () => {
      const primaryApiUrl = `/user/product-list?page=${currentPage}&size=${perPage}&category=`;
      const fallbackApiUrl = `/user/products-list?page=${currentPage}&size=${perPage}&category=`;
      const token = getToken();

      if (!token || token === "null") {
        const response = await apirequest("GET", fallbackApiUrl);
        return response;
      }

      const response = await apirequest(
        "GET",
        primaryApiUrl,
        null,
        null,
        token
      );
      return response;
    },
    {
      //   enabled: !!category,
      staleTime: 300000,
      retry: 1,
      onError: (error) => {
        console.error("Error fetching products:", error);
      },
    }
  );

  const totalCount = data?.data?.totalItems || 0;

  useEffect(() => {
    if (data?.data?.data) {
      setProducts(data.data.data);
    }
  }, [data]);

  useEffect(() => {
    const fetchMeta = async () => {
      const theme_id = process.env.THEMEID;
      const pageData = await fetchPageData("plp", theme_id);
      setMetaData(pageData[0]?.web_json);
    };

    fetchMeta();
  }, []);

   const fetchFilteredProducts = async (filters) => {
      const apiUrl = "/user/filter-product-list";
      const fallbackApiUrl = "/user/search-products-list";
      const token = getToken();
  
      const filterData = {
        filter: {
          price: {
            min: filters.minPrice || 0,
            max: filters.maxPrice || 99999,
          },
          category: [],
          brand: filters.brands || [],
        },
      };
  
      const requestData = filterData;
      const url = token === "null" || !token ? fallbackApiUrl : apiUrl;
  
      try {
        const response = await apirequest("POST", url, requestData);
        if (response.success) {
          if (
            filters.minPrice === 0 &&
            filters.maxPrice === 99999 &&
            filters.brands.length === 0
          ) {
            setProducts(data?.data?.data);
          } else {
            setFilteredProducts(response.data.data);
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

  if (isLoading) return <div><Loader /></div>;
  if (isError) return <div>Error: {error.message}</div>;


  return (
    <main className="main shop">
      <Helmet>
        <meta name="keywords" content={metaData?.keyword || "list"} />
        <meta name="description" content={metaData?.description || "list"} />

        <title>{`${metaData?.page_title} | ${spaceName}` || "template"}</title>
      </Helmet>

      <PageHeader title={pageTitle} subTitle="Shop" />
      <nav className="breadcrumb-nav mb-2">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/shop/list">Shop</ALink>
            </li>
            <li className="breadcrumb-item active">{pageTitle}</li>
            {/* {search && (
              <li className="breadcrumb-item">
                <span>Search - {search}</span>
              </li>
            )} */}
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
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
                loading={isLoading}
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

            {/* <aside className="col-lg-3 skel-shop-sidebar skeleton-body loaded"> */}
            <aside
              className={`col-lg-3 skel-shop-sidebar order-lg-first skeleton-body ${!isLoading || isLoading ? "loaded" : ""
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

export default ShopGrid;
