import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";

import ALink from "~/components/features/alink";
import LoginModal from "~/components/features/modals/login-modal";
import HeaderSearch from "~/components/partials/header_forth/partials/header-search";
import WishlistMenu from "~/components/partials/header_forth/partials/wishlist-menu";
import CartMenu from "~/components/partials/header_forth/partials/cart-menu";
import CompareMenu from "./partials/compare-menu";
import CategoryMenu from "~/components/partials/header/partials/category-menu";
import MainMenu from "~/components/partials/header_forth/partials/main-menu";
import StickyHeader from "~/components/features/sticky-header";
import Cookies from 'js-cookie';
import { apirequest } from "~/utils/api";
import { fetchPageData } from "~/api/fetchPageData";

function Header_five({ logo }) {
  const router = useRouter();
  const [containerClass, setContainerClass] = useState("container");

  function openMobileMenu() {
    document.querySelector("body").classList.add("mmenu-active");
  }
  const [pageData, setPageData] = useState(null);
  const [headerContent, setHeaderContent] = useState(null);

  const [currency, setCurrency] = useState(["INR"]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await apirequest("GET", `/user/payment-method-list`);
        if (response.success) {
          const activeCurrencies = response.dataweb.settings
            .filter(setting =>
              (setting.key === "INR" || setting.key === "USD") &&
              (setting.value === true || setting.value === "true")
            )
            .map(setting => setting.key);

          setCurrency(activeCurrencies);

          const savedCurrency = Cookies.get('currency');
          const defaultCurrency = activeCurrencies[0] || 'INR';

          if (savedCurrency && activeCurrencies.includes(savedCurrency)) {
            setSelectedCurrency(savedCurrency);
          } else {
            setSelectedCurrency(defaultCurrency);
            Cookies.set('currency', defaultCurrency, {
              expires: 7,
              path: '/'
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
    Cookies.set('currency', newCurrency, {
      expires: 7,
      path: '/'
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const fetchHeader = async () => {
      const theme_id = process.env.THEMEID;
      const pageData = await fetchPageData("Header", theme_id);
      setPageData(pageData[0]?.web_json || []);
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


  useEffect(() => {
    setContainerClass(
      router.asPath.includes("fullwidth") ? "container-fluid" : "container-fluid"
    );
  }, [router.asPath]);
  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token ? auth.token.replace(/"/g, "") : null;
  return (
     <div className="header-five">
    <header className="header header-7" >
      <div className="header-top">
        <div className="container-fluid">
          <div className="header-left">

            <div className="header-dropdown" ref={dropdownRef}>
              <div className="currency-display">
                <span>
                  {selectedCurrency || (currency.length > 0 ? currency[0] : "Currency")}
                </span>
                <span
                  className="dropdown-toggle"
                  onClick={toggleDropdown}
                ></span>
              </div>
              {isOpen && currency.length > 0 && (
                   <div className="header-five">
                <div className="header-menu">
                  <ul>
                    {currency.map((curr, index) => (
                      <li key={index}>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            handleCurrencyChange(curr);
                          }}
                          className={curr === selectedCurrency ? 'active' : ''}
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

          </div>

          <div className="header-right">
            <ul className="top-menu">
              <li>
                <ALink href="#">Links</ALink>
                <ul>
                  {/* <li><a href="tel:#"><i className="icon-phone"></i>Call: +0123 456 789</a></li> */}
                  <WishlistMenu />
                  <li>
                    <ALink href="/about">About Us</ALink>
                  </li>
                  <li>
                    <ALink href="/contact">Contact Us</ALink>
                  </li>
                  <LoginModal />
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <StickyHeader>
        <div className="header-middle sticky-header">
          <div className="container-fluid">
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
                  style={{ maxWidth: "200px", maxHeight: "80px", }}
                />
              </ALink>

              <MainMenu />
            </div>

            <div className="header-right">
              <HeaderSearch />
              {token !== null && token !== "null" ? (
                <div className="account">
                  <ALink href="/shop/dashboard" title="My account">
                    <div className="icon">
                      <i className="icon-user"></i>
                    </div>
                  </ALink>
                </div>
              ) : null}
              <CartMenu />
            </div>
          </div>
        </div>
      </StickyHeader>
    </header>
    </div>
  );
}

export default Header_five;
