import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import "react-image-lightbox/style.css";
import Header from "./partials/header/header";
import Footer from "./partials/footer/footer";
import VideoModal from "./features/modals/video-modal";
import QuickViewModal from "./features/modals/quickview-modal";
import MobileMenu from "./features/mobile-menu";

import { actions } from "../store/demo";
import { isSafariBrowser, isEdgeBrowser } from "~/utils";
import Footer_second from "./partials/footer_second/footer";
import Footer_third from "./partials/footer_third/footer";
import Footer_forth from "./partials/footer_forth/footer";

function Layout({ children, hideQuick, hideVideo, footerContent, logo, whiteLogo }) {
  const router = useRouter("");
  const [headerId, setHeaderId] = useState(8);
  const [footerId, setFooterId] = useState(4);

  useEffect(() => {
  const headerParam = router.query.header;
  const footerParam = router.query.footer;

  let decodedHeader = null;
  let decodedFooter = null;

  try {
    if (headerParam) {
      decodedHeader = parseInt(atob(decodeURIComponent(headerParam)));
    }
    if (footerParam) {
      decodedFooter = parseInt(atob(decodeURIComponent(footerParam)));
    }
  } catch (err) {
    console.error("Decoding error:", err);
  }



  if (decodedHeader && decodedFooter) {
    setHeaderId(decodedHeader);
    setFooterId(decodedFooter);
  } else {
    const fetchCustomData = async () => {
      try {
        const url = `/user/custom-data-list`;
        const response = await apirequest("GET", url);
        const data = response?.data || {};

        setHeaderId(parseInt(data.header?.id));
        setFooterId(parseInt(data.footer?.id));
      } catch (error) {
        setHeaderId(8);
        setFooterId(1);
      }
    };
    fetchCustomData();
  }
}, [router.query.header, router.query.footer]);

  let scrollTop;

  useEffect(() => {
    if (router.pathname.includes("pages/coming-soon")) {
      document.querySelector("header").classList.add("d-none");
      document.querySelector("footer").classList.add("d-none");
    } else {
      document.querySelector("header").classList.remove("d-none");
      document.querySelector("footer").classList.remove("d-none");
    }
  }, [router.pathname]);

  useEffect(() => {
    hideQuick();
    hideVideo();
    scrollTop = document.querySelector("#scroll-top");
    window.addEventListener("scroll", scrollHandler, false);
  }, []);

  function toScrollTop() {
    if (isSafariBrowser() || isEdgeBrowser()) {
      let pos = window.pageYOffset;
      let timerId = setInterval(() => {
        if (pos <= 0) clearInterval(timerId);
        window.scrollBy(0, -120);
        pos -= 120;
      }, 1);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function scrollHandler() {
    if (window.pageYOffset >= 400) {
      scrollTop.classList.add("show");
    } else {
      scrollTop.classList.remove("show");
    }
  }

  function hideMobileMenu() {
    document.querySelector("body").classList.remove("mmenu-active");
 
  }

     const renderFooter = () => {
    if (headerId === null || footerId === null) {
      return <div>Loading...</div>;
    }
    switch (footerId) {

      case 2: return <Footer footerContent={footerContent} logo={logo} />;
      case 3: return <Footer footerContent={footerContent} logo={logo} />;
      case 4: return <Footer footerContent={footerContent} logo={logo} />;
      case 1: return <Footer footerContent={footerContent} logo={logo} />;
      default: return <Footer footerContent={footerContent} logo={logo} />;
    }
  };

    const renderHeader = () => {
    if (headerId === null || footerId === null) {
      return <div>Loading...</div>;
    }
    switch (headerId) {
      case 6:
        return <Header logo={logo} />;
      case 7:
        return <Header logo={logo} />;
      case 8:
        return <Header logo={logo} />;
      case 9:
        return <Header logo={logo} />;
      case 5:
        return <Header logo={logo} />;
      default:
        return <Header logo={logo} />;
    }
  };

  return (
    <>
      <div className="page-wrapper">
        {/* <Header logo={logo} />
        {children}
        <Footer footerContent={footerContent} logo={logo}  whiteLogo={whiteLogo}/> */}
          {renderHeader()}
        {/* {headerType === null ? <div>Loading...</div> : renderHeader()} */}
        {/* <Header logo={logo} />
        <HeaderSecound logo={logo}  /> */}
        {/* <Headerthird logo={logo} /> */}
        {/* <Header_forth logo={logo} /> */}
        {/* <Header_five logo={logo} /> */}
        {children}
        {/* <Footer footerContent={footerContent} logo={logo}/> */}
        {/* <Footer_second footerContent={footerContent} logo={logo}  whiteLogo={whiteLogo}/> */}
        {/* <Footer_third footerContent={footerContent} logo={logo}  whiteLogo={whiteLogo}/> */}
        {/* <Footer_forth footerContent={footerContent} logo={logo}  whiteLogo={whiteLogo}/> */}
        {renderFooter()}
      </div>
         
      <div className="mobile-menu-overlay" onClick={hideMobileMenu}></div>

      <button id="scroll-top" title="Back to top" onClick={toScrollTop}>
        <i className="icon-arrow-up"></i>
      </button>
      
      <MobileMenu />
      <QuickViewModal />
      <VideoModal />
    </>
  );
}

export default connect(null, { ...actions })(Layout);
