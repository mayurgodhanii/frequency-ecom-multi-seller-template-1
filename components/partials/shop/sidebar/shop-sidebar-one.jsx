
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InputRange from "react-input-range";
import SlideToggle from "react-slide-toggle";
import "react-input-range/lib/css/index.css";
import { connect } from "react-redux";
import { fetchCategoriesRequest } from "~/store/query";
import ALink from "~/components/features/alink";
import { apirequest } from "~/utils/api";

function ShopSidebarOne(props) {
  const {
    toggle = false,
    products,
    onFilterChange,
    fetchCategories,
    categories,
  } = props;
  const [page, setPage] = useState(0);
  const perPage = 9;
  const [hovered, setHovered] = useState(false);

  const hasMore = categories?.totalItems > (categories?.data?.length || 0);

  const getUniqueCategories = (categories) => {
    const seen = new Set();
    return categories?.data.filter((cat) => {
      const isDuplicate = seen.has(cat.slug);
      seen.add(cat.slug);
      return !isDuplicate;
    });
  };

  useEffect(() => {
    fetchCategories({ page, size: perPage });
  }, [fetchCategories, page]);

  const handleSlideHover = () => {
    if (!hovered) {
      setHovered(true);
      fetchCategories({ page: 0, size: categories?.totalItems || perPage });
    }
  };

  const router = useRouter();
  const query = useRouter().query;
  const [priceRange, setRange] = useState({ min: 0, max: 99999 });
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    if (query.minPrice && query.maxPrice) {
      setRange({
        min: parseInt(query.minPrice),
        max: parseInt(query.maxPrice),
      });
    } else {
      setRange({ min: 0, max: 99999 });
    }
  }, [query]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apirequest("GET", `/user/brand-list`);
        if (response.success) {
          const brandList = response.data.data.map((item) => ({
            id: item.id,
            slug: item.name.toLowerCase(),
            brand: item.name,
          }));
          setBrands(brandList);
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const handlePriceChange = (value) => {
    setRange(value);

    const currentBrands = query.brand ? query.brand.split(",") : [];
    onFilterChange({
      minPrice: value.min,
      maxPrice: value.max,
      brands: currentBrands,
    });
  };

  const handleBrandChange = (slug) => {
    const updatedBrands = query.brand ? query.brand.split(",") : [];
    const index = updatedBrands.indexOf(slug);

    if (index === -1) {
      updatedBrands.push(slug);
    } else {
      updatedBrands.splice(index, 1);
    }

    router.push({
      pathname: router.pathname,
      query: {
        ...query,
        brand: updatedBrands.join(","),
      },
    });

    onFilterChange({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      brands: updatedBrands.length > 0 ? updatedBrands : [],
    });
  };

  // const categories = props?.categories?.data;
  

  return (
    <aside className={`${toggle ? "sidebar-filter" : "sidebar"} sidebar-shop`}>
      <div className={toggle ? "sidebar-filter-wrapper" : ""}>
        <div className="widget widget-clean">
          <label>Filters:</label>
          <ALink
            href={"/shop/list"}
            className="sidebar-filter-clear"
            scroll={false}
          >
            Clean All
          </ALink>
        </div>

        {/* Categories */}
        <SlideToggle collapsed={false}>
          {({ onToggle, setCollapsibleElement, toggleState }) => (
            <div
              className="widget widget-collapsible"
              onMouseEnter={handleSlideHover} // Trigger API call on hover
            >
              <h3 className="widget-title mb-2">
                <a
                  href="#category"
                  className={toggleState === "collapsed" ? "collapsed" : ""}
                  onClick={(e) => {
                    onToggle(e);
                    e.preventDefault();
                  }}
                >
                  Category
                </a>
              </h3>
              <div ref={setCollapsibleElement}>
                <div className="widget-body pt-0">
                  <div className="filter-items">
                    {categories?.data?.length > 0 ? (
                      getUniqueCategories(categories).map((cat, index) => (
                        <div key={index} className="filter-item">
                          <ALink href={`/shop/${cat.slug}`} scroll={false}>
                            {cat.name}
                          </ALink>
                        </div>
                      ))
                    ) : (
                      <li>No categories found</li>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SlideToggle>

        {/* Brands */}
        <SlideToggle collapsed={false}>
          {({ onToggle, setCollapsibleElement, toggleState }) => (
            <div className="widget widget-collapsible">
              <h3 className="widget-title mb-2">
                <a
                  href="#brand"
                  className={toggleState === "collapsed" ? "collapsed" : ""}
                  onClick={(e) => {
                    onToggle(e);
                    e.preventDefault();
                  }}
                >
                  Brand
                </a>
              </h3>
              <div ref={setCollapsibleElement}>
                <div className="widget-body-brand pt-0">
                  <div className="filter-items">
                    {brands.map((item, index) => (
                      <div key={index} className="filter-item">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`brand-${item.id}`}
                            checked={
                              query.brand &&
                              query.brand.split(",").includes(item.slug)
                            }
                            onChange={() => handleBrandChange(item.slug)}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`brand-${item.id}`}
                          >
                            {item.brand}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SlideToggle>

        {/* Price Range */}
        <SlideToggle collapsed={false}>
          {({ onToggle, setCollapsibleElement, toggleState }) => (
            <div className="widget widget-collapsible">
              <h3 className="widget-title mb-2">
                <a
                  href="#price"
                  className={`${
                    toggleState.toLowerCase() == "collapsed" ? "collapsed" : ""
                  }`}
                  onClick={(e) => {
                    onToggle(e);
                    e.preventDefault();
                  }}
                >
                  Price
                </a>
              </h3>

              <div ref={setCollapsibleElement}>
                <div className="widget-body pt-0">
                  <div className="filter-price">
                    <div className="filter-price-text d-flex justify-content-between">
                      <span>
                        Price Range:&nbsp;
                        <span className="filter-price-range">
                          {priceRange.min} - 
                          {priceRange.max}
                        </span>
                      </span>

                      <ALink
                        href={{
                          pathname: router.pathname,
                          query: {
                            ...query,
                            minPrice: priceRange.min,
                            maxPrice: priceRange.max,
                            page: 1,
                          },
                        }}
                        className="pr-2"
                        scroll={false}
                      >
                        Filter
                      </ALink>
                    </div>

                    <div className="price-slider">
                      <InputRange
                        formatLabel={(value) =>
                          `${value}`
                        }
                        maxValue={99999}
                        minValue={0}
                        step={50}
                        value={priceRange}
                        onChange={handlePriceChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SlideToggle>
      </div>
    </aside>
  );
}

const mapStateToProps = (state) => ({
  categories: state.query.categories,
  loading: state.query.loading,
  error: state.query.error,
  category: state.query.category,
});

const mapDispatchToProps = (dispatch) => ({
  fetchCategories: (payload) => dispatch(fetchCategoriesRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShopSidebarOne);
