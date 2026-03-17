import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import ALink from "~/components/features/alink";
import LoginModal from "~/components/features/modals/login-modal";
import HeaderSearch from "~/components/partials/header/partials/header-search";
import WishlistMenu from "~/components/partials/header/partials/wishlist-menu";
import CartMenu from "~/components/partials/header/partials/cart-menu";
import CategoryMenu from "~/components/partials/header/partials/category-menu";
import MainMenu from "~/components/partials/header/partials/main-menu";
import StickyHeader from "~/components/features/sticky-header";
import { fetchPageData } from "~/api/fetchPageData";
import { apirequest } from "~/utils/api";

// import '@/public/scss/base/header_second/_header.scss';

import Cookies from "js-cookie";
function Header({ logo}) {
  const router = useRouter();
  const [containerClass, setContainerClass] = useState("container");

  function openMobileMenu() {
    document.querySelector("body").classList.add("mmenu-active");
  }

  const [pageData, setPageData] = useState(null);
  const [headerContent, setHeaderContent] = useState(null);
  const [currency, setCurrency] = useState(["INR"]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
  const dropdownRef = useRef(null); // Ref to handle outside clicks

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await apirequest("GET", `/user/payment-method-list`);
        if (response.success) {
          const activeCurrencies = response.dataweb.settings
            .filter(
              (setting) =>
                (setting.key === "INR" || setting.key === "USD") &&
                (setting.value === true || setting.value === "true")
            )
            .map((setting) => setting.key);

          setCurrency(activeCurrencies);

          const savedCurrency = Cookies.get("currency");
          const defaultCurrency = activeCurrencies[0] || "INR";

          if (savedCurrency && activeCurrencies.includes(savedCurrency)) {
            setSelectedCurrency(savedCurrency);
          } else {
            setSelectedCurrency(defaultCurrency);
            Cookies.set("currency", defaultCurrency, {
              expires: 7,
              path: "/",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchCurrency();
  }, []);

  const handleCurrencyChange = (newCurrency) => {
    setSelectedCurrency(newCurrency);
    Cookies.set("currency", newCurrency, {
      expires: 7,
      path: "/",
    });
    setIsOpen(false);
    // Refresh the page
    window.location.reload();
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHeader = async () => {
      const theme_id = process.env.THEMEID;
      const pageData = await fetchPageData("Header", theme_id);
      let header = null;

      if (
        pageData &&
        Array.isArray(pageData) &&
        pageData[0]?.web_json?.page_data
      ) {
        const pageDataArray = pageData[0].web_json.page_data;
        header = pageDataArray.find(
          (section) => section.component.name === "header"
        );
      }

      if (header && header.component && header.component.options) {
        setHeaderContent(header.component.options.contents);
      } else {
        setHeaderContent(null);
      }
    };

    fetchHeader();
  }, []);

  // Extract header ID
  const headerId = headerContent
    ? headerContent[0]?.component?.options?.id || "id_header123"
    : "id_header_default";
  const titleId = headerContent
    ? headerContent.find((item) => item.component.name === "title")?.component
        ?.options?.id || "id_title_default"
    : "id_title_default";
  useEffect(() => {
    setContainerClass(
      router.asPath.includes("fullwidth") ? "container-fluid" : "container-fluid"
    );
  }, [router.asPath]);
  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token ? auth.token.replace(/"/g, "") : null;

  return (
    // <header className="header header-2 header-intro-clearance">
    <div className="header-one">
      <header className={` header header-2 header-intro-clearance`}>
        <div className="header-top">
          <div className={containerClass}>
            <div
              className="header-left overflow-hidden mr-3 mr-sm-0"
              id={headerId}
            >
              <div className="welcome-msg d-flex flex-nowrap" id={titleId}>
                {headerContent && headerContent.length > 0 ? (
                  headerContent.map((item, index) =>
                    item.component.name === "title" && item.component.components
                      ? item.component.components.map((subItem, subIndex) =>
                          subItem.name === "text" && subItem.options?.text ? (
                            <p
                              key={`${index}-${subIndex}`}
                              id={subItem.options.id}
                            >
                              {subItem.options.text}
                            </p>
                          ) : null
                        )
                      : null
                  )
                ) : (
                  <p id="id_text_default">
                    Special collection already available.
                  </p>
                )}
              </div>
            </div>

            <div className="header-right">
              <ul className="top-menu">
                <li>
                  <ul>
                    <LoginModal />

                    <li ref={dropdownRef}>
                      <div className="header-dropdown">
                        <div className="currency-display">
                          <span>
                            {selectedCurrency ||
                              (currency.length > 0 ? currency[0] : "Currency")}
                          </span>
                          <span
                            className="dropdown-toggle"
                            onClick={toggleDropdown}
                          ></span>
                        </div>
                        {isOpen && currency.length > 0 && (
                            <div className="header-one">
                          <div className="header-menu">
                            <ul>
                              {currency.map((curr, index) => (
                                <li key={index}>
                                  <div
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleCurrencyChange(curr);
                                    }}
                                    className={
                                      curr === selectedCurrency ? "active" : ""
                                    }
                                  >
                                    {curr}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          </div>
                        )}
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="header-middle">
          <div className={containerClass}>
            <div className="header-left">
              <button className="mobile-menu-toggler" onClick={openMobileMenu}>
                <span className="sr-only">Toggle mobile menu</span>
                <i className="icon-bars"></i>
              </button>

              <ALink href="/" className="logo">
                <img
                  src={logo}
                  alt="Logo"
                  className="bg-transparent"
                  style={{ maxWidth: "200px", maxHeight: "80px" }}
                />
              </ALink>
            </div>

            <div className="header-center">
              <HeaderSearch />
            </div>

            <div className="header-right">
              <div className="become-seller-btn">
                <ALink href="/store-registration" className="btn btn-seller">
                  <span>Become a Seller</span>
                </ALink>
              </div>

              {token !== null && token !== "null" ? (
                <div className="account">
                  <ALink href="/shop/dashboard" title="My account">
                    <div className="icon">
                      <i className="icon-user"></i>
                    </div>
                    <p>Account</p>
                  </ALink>
                </div>
              ) : null}

              <WishlistMenu />
              <CartMenu />
            </div>
          </div>
        </div>

        <StickyHeader>
          <div className="header-bottom sticky-header">
            <div className={containerClass}>
              <div className="header-left">
                <CategoryMenu />
              </div>

              <div className="header-center">
                <MainMenu />
              </div>
            </div>
          </div>
        </StickyHeader>
      </header>
    </div>
  );
}

export default Header;
