import { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { useStore } from "react-redux";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { wrapper } from "../store/index.js";
import Layout from "../components/layout";
import { actions as demoAction } from "../store/demo";
import "~/public/scss/plugins/owl-carousel/owl.carousel.scss";
import "~/public/scss/style.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import {
  fetchGoogleCredentials,
  decryptGoogleCredentials,
} from "~/utils/google-credentials.js";
import { fetchPageData } from "~/api/fetchPageData";
import "react-toastify/dist/ReactToastify.css";
import usePrimaryColor from "../hook/usePrimaryColor.jsx";
import { apirequest } from "~/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/router.js";
import Router from "next/router";

let preservedHeader = null;
let preservedFooter = null;

const WrappedApp = ({ Component, pageProps }) => {
  usePrimaryColor();

  const store = useStore();
  const [googleClientId, setGoogleClientId] = useState(null);
  const [footerContent, setFooterContent] = useState(null);
  const [metaData, setMetaData] = useState({
    title: "",
    description: "",
    faviconUrl: "",
    logo: "",
    w_logo: ""
  });

  const [homeData, setHomeData] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  
    const router = useRouter();


  useEffect(() => {
    if (metaData?.title) {
      Cookies.set("spaceName", metaData.title);
    }
  }, [metaData?.title]);


  
    useEffect(() => {
    if (!preservedHeader && router.query.header) {
      preservedHeader = router.query.header;
    }

    if (!preservedFooter && router.query.footer) {
      preservedFooter = router.query.footer;
    }
  }, [router.query]);


  useEffect(() => {
  const handleRouteChangeStart = (url) => {
    const [path, rawQuery] = url.split("?");
    const newQuery = new URLSearchParams(rawQuery || "");

    if (preservedHeader && !newQuery.has("header")) {
      newQuery.set("header", preservedHeader);
    }

    if (preservedFooter && !newQuery.has("footer")) {
      newQuery.set("footer", preservedFooter);
    }

    const finalUrl =
      newQuery.toString().length > 0
        ? `${path}?${newQuery.toString()}`
        : path;

    if (url !== finalUrl) {
      Router.replace(finalUrl, undefined, { shallow: true });
      throw "Skip original route change";
    }
  };

  Router.events.on("routeChangeStart", handleRouteChangeStart);

  return () => {
    Router.events.off("routeChangeStart", handleRouteChangeStart);
  };
}, []);


  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  });

  useEffect(() => {
    const getGoogleCredentials = async () => {
      try {
        const response = await fetchGoogleCredentials();
        const encryptedData = response;
        const decryptedData = await decryptGoogleCredentials(
          encryptedData,
          process.env.NEXT_PUBLIC_ENCRYPT_SECRET_KEY
        );

        const credentialsJson = JSON.parse(decryptedData);
        setGoogleClientId(credentialsJson.google_key);
      } catch (error) {
        console.error("Error getting Google credentials:", error);
      }
    };

    getGoogleCredentials();
  }, []);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const theme_id = process.env.THEMEID;
        const pageData = await fetchPageData("Footer", theme_id);
        let footer = null;
        if (
          pageData &&
          Array.isArray(pageData) &&
          pageData[0]?.web_json?.page_data
        ) {
          const pageDataArray = pageData[0].web_json.page_data;
          footer = pageDataArray.find(
            (section) => section.component.name === "footer"
          );
        }

        setFooterContent(footer || null);
      } catch (error) {
        console.error("Error fetching footer data:", error);
        setFooterContent(null);
      }
    };

    fetchFooter();
  }, []);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await apirequest(
          "GET",
          `/user/space-meta`,
          null,
          null
        );

        if (response && response.success && response.data) {
           const { title, description, faviconUrl, logo, is_wholesale } = response.data;
          setMetaData({
            title: title || " ",
            description: description || " ",
            faviconUrl: faviconUrl || "",
            logo: logo || "",
            is_wholesale: is_wholesale || false,
          });
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetaData();
  }, []);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        const theme_id = process.env.THEMEID;
        const pageData = await fetchPageData("Home", theme_id);
        if (
          pageData &&
          Array.isArray(pageData) &&
          pageData[0]?.web_json
        ) {
          setHomeData(pageData[0].web_json);
        } else {
          setHomeData(null);
        }
      } catch (error) {
        console.error("Error fetching home page data:", error);
        setHomeData(null);
      }
    };

    fetchHomePageData();
  }, []);

  useEffect(() => {
    const checkExpiry = async () => {
      try {
        const response = await apirequest(
          "GET",
          `/user/space-web-expiry`,
          null,
          null
        );
        if (response && response.isExpired) {
          setIsExpired(true);
        }
      } catch (error) {
        console.error("Error fetching expiry status:", error);
      }
    };
    checkExpiry();
  }, []);

 useEffect(() => {
     let previouslyHighlighted = null;
     let overlayDiv = null;
     let observer = null;
 
     const handleMessage = (event) => {
       if (event.origin !== "https://app.frequency.co.in") return;
 
       const { action, selector, data } = event.data;
 
       if (action === "highlight" && selector) {
         const newElement = document.querySelector(selector);
 
         if (previouslyHighlighted && previouslyHighlighted !== newElement) {
           previouslyHighlighted.style.border = "";
           previouslyHighlighted.style.position = "";
           previouslyHighlighted.style.zIndex = "";
           if (overlayDiv) {
             overlayDiv.remove();
             overlayDiv = null;
           }
         }
 
         if (newElement) {
           newElement.style.border = "1px solid #1A73EB";
           newElement.style.position = "relative";
           newElement.style.zIndex = "9999";
           previouslyHighlighted = newElement;
 
           overlayDiv = document.createElement("div");
           overlayDiv.style.position = "absolute";
           overlayDiv.style.top = "0";
           overlayDiv.style.left = "0";
           overlayDiv.style.width = "100%";
           overlayDiv.style.height = "100%";
           overlayDiv.style.backgroundColor = "rgba(26, 115, 235, 0.1)";
           overlayDiv.style.pointerEvents = "none";
           overlayDiv.style.zIndex = "10000";
           overlayDiv.style.borderRadius =
             getComputedStyle(newElement).borderRadius || "0";
 
           newElement.appendChild(overlayDiv);
         }
       } else if (action === "update_json" && data) {
         setHomeData(data); // Update homeData if JSON is updated
       }
     };
 
     const sendHeight = () => {
       const nextElement = document.getElementById("__next");
 
       if (nextElement) {
         const body = document.body;
         const html = document.documentElement;
 
         const fullHeight = Math.max(
           body.scrollHeight,
           body.offsetHeight,
           html.clientHeight,
           html.scrollHeight,
           html.offsetHeight
         );
 
         window.parent.postMessage(
           { action: "update_height", height: fullHeight },
           "https://app.frequency.co.in"
         );
       }
     };
     sendHeight();
 
     const nextElement = document.getElementById("__next");
     if (nextElement) {
       observer = new MutationObserver(() => {
         sendHeight();
       });
       observer.observe(nextElement, {
         childList: true,
         subtree: true,
         attributes: true,
       });
     }
 
     window.addEventListener("message", handleMessage);
 
     return () => {
       window.removeEventListener("message", handleMessage);
       if (observer) observer.disconnect();
       if (overlayDiv) overlayDiv.remove();
     };
   }, []);

  if (isExpired) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff"
      }}>
        <h1>404 - Space Expired</h1>
        <p>Your access to this space has expired.</p>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate
        persistor={store.__persistor}
        loading={
          <div className="loading-overlay">
            <div className="bounce-loader">
              <div className="bounce1"></div>
              <div className="bounce2"></div>
              <div className="bounce3"></div>
            </div>
          </div>
        }
      >
        <Helmet>
          <meta
            name="description"
            content={homeData?.description || "template"}
          />
          <title>
            {homeData?.page_title && metaData?.title
              ? `${homeData.page_title} | ${metaData.title}`
              : metaData?.title || "Template"}
          </title>
          <meta name="keywords" content={homeData?.keyword || "keyword"} />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={metaData?.logo || metaData?.faviconUrl || "/img/LOGO_Default.svg"}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={metaData?.logo || metaData?.faviconUrl || "/img/LOGO_Default.svg"}
          />
          <link
            rel="icon"
            href={metaData?.logo || metaData?.faviconUrl || "/img/LOGO_Default.svg"}
          />
        </Helmet>

        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={googleClientId}>
            <Layout
              footerContent={footerContent}
              logo={metaData?.faviconUrl || "/img/LOGO_Default.svg"}
              whiteLogo={metaData?.w_logo || "/img/LOGO_Default.svg"}
              metaData={metaData}
            >
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
              <Component {...pageProps} metaData={metaData} />
            </Layout>
          </GoogleOAuthProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

WrappedApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return { pageProps };
};

export default wrapper.withRedux(WrappedApp);