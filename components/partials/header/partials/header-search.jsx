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
          const auth = JSON.parse(localStorage.getItem("frequency-auth"));
          const token = auth?.token ? auth.token.replace(/"/g, "") : null;

          if (!token || token === "null") {
            await fetchFallbackApi(searchTerm);
            setLoading(false);
            return;
          }

          const response = await apirequest(
            "GET",
            `/user/globel_search-product-list`,
            null,
            { page: 0, size: 100, search: searchTerm }
          );

          if (response.success) {
            const allItems = [];
            if (
              response.data.categories &&
              response.data.categories.length > 0
            ) {
              allItems.push(...response.data.categories);
            }
            if (response.data.products && response.data.products.length > 0) {
              allItems.push(...response.data.products);
            }
            setItems(allItems);
          } else {
            setItems([]);
            console.error("Error in response:", response.message);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          await fetchFallbackApi(searchTerm);
        }
        setLoading(false);
        setTimer(timerId);
      }, 300);
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchFallbackApi = async (searchTerm) => {
    try {
      const response = await apirequest(
        "GET",
        `/user/globel_search-products-list`,
        null,
        { page: 0, size: 100, search: searchTerm}
      );

      if (response.success) {
        const allItems = [];
        if (response.data.categories && response.data.categories.length > 0) {
          allItems.push(...response.data.categories);
        }
        if (response.data.products && response.data.products.length > 0) {
          allItems.push(...response.data.products);
        }
        setItems(allItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      setItems([]);
      console.error("Error fetching from fallback API:", error);
    }
  };

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
      query: { searchTerm },
    });
  }

  // function handleItemClick(item) {
  //   // If it's a product, redirect to the product page
  //   if (item.image && Array.isArray(item.image) && item.image.length > 0) {
  //     router.push(`/product/${item.slug}`);
  //   } else {
  //     // If it's a category, redirect to the category page
  //     router.push(`/shop/${item.slug}`);
  //   }
  // }

  function handleItemClick(item) {
    if (item.image && Array.isArray(item.image) && item.image.length > 0) {
      router.push(`/product/${item.slug}`);
    } else {
      router.push(`/shop/${item.slug}`);
    }

    setItems([]);
    setSearchTerm(item.name); 
  }

  function clearSearch() {
    setSearchTerm("");
    setItems([]); 
  }

  return (
     <div className="header-one">
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
                 <div className="header-one">
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
                      {item.image ? (
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
                          />
                          <div className="search-name">{item.name}</div>
                        </>
                      ) : (
                        <div className="search-name">{item.name}</div>
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
            </div>
          )}
        </div>
      </form>
    </div>
    </div>
  );
}

export default HeaderSearch;
