import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ALink from "~/components/features/alink";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { apirequest } from "~/utils/api";

function HeaderSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleBodyClick = (e) => {
      if (!e.target.closest(".header-search-wrapper")) {
        closeSearchForm();
      }
    };

    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      if (timer) clearTimeout(timer);

      setLoading(true);
      const timerId = setTimeout(async () => {
        try {
          const payload = {
            search: searchTerm,
            page: 1,
            size: 10,
            filter: {}
          };

          const response = await apirequest(
            "POST",
            `/product/global-search`,
            payload
          );

          if (response.success) {
            const allItems = [];
            
            // Add categories to results
            if (response.data.categories && response.data.categories.length > 0) {
              allItems.push(...response.data.categories.map(cat => ({
                ...cat,
                type: 'category'
              })));
            }
            
            // Add products to results
            if (response.data.products && response.data.products.data && response.data.products.data.length > 0) {
              allItems.push(...response.data.products.data.map(product => ({
                ...product,
                type: 'product'
              })));
            }
            
            setItems(allItems);
          } else {
            setItems([]);
            console.error("Error in response:", response.message);
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
          setItems([]);
        }
        setLoading(false);
        setTimer(timerId);
      }, 300);
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [searchTerm]);

  function closeSearchForm() {
    document.querySelector(".header .header-search").classList.remove("show");
  }

  function onSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function onSubmitSearchForm(e) {
    e.preventDefault();
    router.push({
      pathname: "/shop/list",
      query: { search: searchTerm },
    });
  }

  function handleItemClick(item) {
    if (item.type === 'product') {
      router.push(`/product/${item.slug}`);
    } else if (item.type === 'category') {
      router.push(`/shop/${item.slug}`);
    }

    setItems([]);
    setSearchTerm(item.name); 
    closeSearchForm();
  }

  function clearSearch() {
    setSearchTerm("");
    setItems([]); 
  }

  return (
    <div className="header-search header-search-extended header-search-visible header-search-no-radius d-none d-lg-block">
      <button className="search-toggle">
        <i className="icon-search"></i>
      </button>

      <form
        action="#"
        method="get"
        onSubmit={onSubmitSearchForm}
        onClick={() =>
          document.querySelector(".header .header-search").classList.add("show")
        }
        style={{ width: '100%', flex: 1 }}
      >
        <div className="header-search-wrapper search-wrapper-wide position-relative">
          <input
            type="text"
            onChange={onSearchChange}
            value={searchTerm}
            className="form-control"
            placeholder="Search product ..."
            required
          />

          {/* Clear (cross) button */}
          {searchTerm.length > 0 && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: "50px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✕
            </button>
          )}

          <button className="btn btn-primary" type="submit">
            <i className="icon-search"></i>
          </button>

          {/* Suggestions Dropdown */}
          {searchTerm.length > 0 && (
            <div
              className="live-search-list position-absolute w-100"
              style={{ top: "100%", left: 0, zIndex: 10 }}
            >
              <div className="autocomplete-suggestions border border-gray-300 bg-white shadow-sm">
                {loading ? (
                  <div className="autocomplete-suggestion p-2 text-center text-muted">
                    Loading...
                  </div>
                ) : items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={`search-suggestion-${index}`}
                      className="autocomplete-suggestion d-flex align-items-center p-2"
                      onClick={() => handleItemClick(item)}
                    >
                      {item.type === 'product' && item.image ? (
                        <>
                          <LazyLoadImage
                            src={
                              Array.isArray(item.image)
                                ? item.image[0]
                                : item.image
                            }
                            width={40}
                            height={40}
                            alt={item.name}
                            className="mr-2"
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div className="search-item-details">
                            <div className="search-name font-weight-bold">{item.name}</div>
                            <div className="search-type text-muted small">Product</div>
                          </div>
                        </>
                      ) : item.type === 'category' && item.image ? (
                        <>
                          <LazyLoadImage
                            src={item.image}
                            width={40}
                            height={40}
                            alt={item.name}
                            className="mr-2"
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div className="search-item-details">
                            <div className="search-name font-weight-bold">{item.name}</div>
                            <div className="search-type text-muted small">Category</div>
                          </div>
                        </>
                      ) : (
                        <div className="search-item-details">
                          <div className="search-name font-weight-bold">{item.name}</div>
                          <div className="search-type text-muted small">
                            {item.type === 'product' ? 'Product' : 'Category'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="autocomplete-suggestion p-2 text-center text-muted">
                    No result found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default HeaderSearch;
