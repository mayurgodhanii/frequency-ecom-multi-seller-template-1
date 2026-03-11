import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apirequest } from "~/utils/api";
import Loader from "~/components/Loader";
import { fetchPageData } from "~/api/fetchPageData";
import DynamicComponent from "~/components/DynamicComponent";
import Cookies from "js-cookie";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import { Helmet } from "react-helmet";

export default function DynamicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!slug) return;
    const theme_id = process.env.THEMEID;
    setLoading(true);
    apirequest("GET", "/user/newpage-list", null, { theme_id })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const found = data.data.find((page) => page.slug === slug);
          if (found) {
            setPageData(found);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!pageData) return;
    
    const fetchData = async () => {
      try {
        const theme_id = process.env.THEMEID;
        const pageDataResponse = await fetchPageData(pageData.page_name, theme_id);
        if (pageDataResponse && Array.isArray(pageDataResponse) && pageDataResponse[0]?.web_json) {
          setData(pageDataResponse[0].web_json);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
        setData(null);
      }
    };

    fetchData();
  }, [pageData]);

  useEffect(() => {
    if (notFound && !loading) {
      router.replace("/404");
    }
  }, [notFound, loading, router]);

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <Loader />
      </div>
    );
  }
  if (notFound || !pageData) {
    return null;
  }

  const jsonData = data;
  const pageJson = data || {};
  const contents =
    Array.isArray(pageJson.page_data?.[0]?.component?.options?.contents)
      ? pageJson.page_data[0].component.options.contents
      : [];
  const pageTitle = pageJson.page_title || pageData?.page_name || '';

  const spaceName = Cookies.get("spaceName");

  return (
    <main
      className="main shop"
      id={pageData?.page_name}
    >
      <Helmet>
        <meta
          name="keywords"
          content={jsonData?.data?.[0]?.web_json?.keyword || pageData.page_name}
        />
        <meta
          name="description"
          content={jsonData?.data?.[0]?.web_json?.description || pageData.page_name}
        />
        <title>{`${pageTitle} | ${spaceName}` || "template"}</title>
      </Helmet>

      <PageHeader title={pageTitle} />
      <nav className="breadcrumb-nav mb-2">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item active">{pageTitle}</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          {contents.length > 0 ? (
            contents.map((section, idx) => {
              const comp = section.component;
              const sectionId = comp?.options?.id || `section-${idx}`;
              const titleComp = comp?.components?.find((c) => c.name === "title");
              const contentComp = comp?.components?.find((c) => c.name === "content");

              // Track used IDs
              const usedIds = new Set(
                [titleComp?.options?.id, contentComp?.options?.id].filter(
                  (id) => id
                )
              );

              // Filter dynamic components for this section
              const dynamicComponents =
                comp?.components?.filter(
                  (item) => !usedIds.has(item.options?.id)
                ) || [];

              return (
                <section key={sectionId} id={sectionId} className="mb-5">
                  {titleComp && (
                    <h2 id={titleComp.options.id} style={{ color: "#333" }}>
                      {titleComp.options.text}
                    </h2>
                  )}
                  {contentComp && (
                    <div
                      id={contentComp.options.id}
                      style={{ color: "#666", lineHeight: "1.6" }}
                    >
                      {contentComp.options.text}
                    </div>
                  )}
                  {/* Render dynamic components for this section */}
                  {dynamicComponents.length > 0 && (
                    <div className="dynamic-components">
                      {dynamicComponents.map((item, idx) => (
                        <DynamicComponent
                          key={item.options?.id || `dynamic-${idx}`}
                          component={item}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            <p>No content available.</p>
          )}
        </div>
      </div>
    </main>
  );
}
