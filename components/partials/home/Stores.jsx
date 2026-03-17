import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ALink from "~/components/features/alink";
import { apirequest } from "~/utils/api";
import { useQuery } from "@tanstack/react-query";

function Stores({ content }) {
  const wrapperId = content.id;

  // Fetch stores from API
  const { data: storesData, isLoading } = useQuery({
    queryKey: ["home-stores"],
    queryFn: async () => {
      const response = await apirequest("GET", "/store/list", null, {
      });
      return response;
    },
    staleTime: 300000,
    retry: 1,
    onError: (error) => {
      console.error("Error fetching stores:", error);
    },
  });

  const stores = storesData?.success ? storesData.data.slice(0, 8).filter(store => 
    store && 
    store.id && 
    store.store_name && 
    (store.slug || store.id)
  ) : []; // Show only first 8 stores and filter out invalid ones

  if (isLoading) {
    return (
      <div className="stores-section pt-6 pb-6" id={wrapperId}>
        <div className="container-fluid">
          <div className="heading-wrapper">
            <h2 className="title stores-title">Stores</h2>
            <ALink href="/stores" className="view-all-link">View All</ALink>
          </div>
          <div className="text-center">Loading stores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stores-section pt-6 pb-6" id={wrapperId}>
      <div className="container-fluid">
        <div className="heading-wrapper">
          <h2 className="title stores-title">Stores</h2>
          <ALink href="/stores" className="view-all-link">View All</ALink>
        </div>

        <div className="stores-grid">
          {stores.filter(store => store && (store.slug || store.id)).map((store) => (
            <ALink
              href={`/store/${store.slug || store.id}`}
              key={store.id}
              className="store-card"
            >
              <div className="store-card-inner">
                {/* <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>
                  <i className="icon-heart-o"></i>
                </button> */}

                <div className="store-image-wrapper">
                  <LazyLoadImage
                    alt={store.store_name || 'Store'}
                    src={store.store_image || '/images/placeholder-store.jpg'}
                    threshold={200}
                    effect="blur"
                    className="store-image"
                  />
                </div>

                <div className="store-info">
                  <div className="store-header">
                    <h3 className="store-name">{store.store_name || 'Unknown Store'}</h3>
                    <div className="store-rating">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M3.61821 3.16898L0.428209 3.63148L0.371709 3.64298C0.286179 3.66569 0.208207 3.71069 0.145755 3.77339C0.0833039 3.83608 0.0386109 3.91423 0.0162402 3.99985C-0.00613047 4.08547 -0.00537724 4.17549 0.0184229 4.26072C0.0422231 4.34595 0.0882174 4.42334 0.151709 4.48498L2.46271 6.73448L1.91771 9.91198L1.91121 9.96698C1.90597 10.0554 1.92434 10.1437 1.96443 10.2227C2.00453 10.3018 2.0649 10.3687 2.13938 10.4167C2.21385 10.4648 2.29975 10.4921 2.38828 10.496C2.47681 10.4999 2.56479 10.4803 2.64321 10.439L5.49621 8.93898L8.34271 10.439L8.39271 10.462C8.47524 10.4945 8.56493 10.5045 8.65259 10.4909C8.74024 10.4773 8.8227 10.4406 8.89151 10.3846C8.96031 10.3286 9.01299 10.2554 9.04413 10.1723C9.07527 10.0892 9.08375 9.9994 9.06871 9.91198L8.52321 6.73448L10.8352 4.48448L10.8742 4.44198C10.9299 4.37337 10.9664 4.29121 10.9801 4.20388C10.9937 4.11655 10.9839 4.02717 10.9518 3.94485C10.9196 3.86253 10.8662 3.7902 10.797 3.73524C10.7277 3.68028 10.6452 3.64465 10.5577 3.63198L7.36771 3.16898L5.94171 0.278985C5.90045 0.195252 5.83657 0.124742 5.7573 0.0754369C5.67804 0.0261317 5.58656 0 5.49321 0C5.39986 0 5.30838 0.0261317 5.22912 0.0754369C5.14985 0.124742 5.08597 0.195252 5.04471 0.278985L3.61821 3.16898Z" fill="#FFC107" />
                      </svg>
                      <span>{store.store_average_rating || "0.0"}</span>
                    </div>
                  </div>

                  <div className="store-location">
                    <i className="icon-map-marker"></i>
                    <span>{store.store_location || 'Location not available'}</span>
                  </div>

                  <div className="store-delivery">
                    <i className="icon-clock-o"></i>
<span>{store.delivery_days ? `${store.delivery_days} Days` : 'Delivery info not available'}</span>                  </div>
                </div>
              </div>
            </ALink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stores;
