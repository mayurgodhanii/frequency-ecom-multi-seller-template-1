
// export default React.memo( InfoOne );
import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Pagination from "~/components/features/pagination";
import ALink from "~/components/features/alink";
import { useRouter } from "next/router";
import { apirequest } from "~/utils/api";
import { getCurrencySymbol } from "~/utils";
import Cookies from 'js-cookie';


// Function to get the best price (sale price first, then regular price)
const getBestPrice = (variant, combination, product, currency) => {
  // Priority order: variant sale_price > variant price > combination sale_price > combination price > product sale_price > product price
  
  const isWholesale = Cookies.get("wholesale_status") === "approved";
  
  // Determine which price fields to use based on wholesale status
  const priceField = isWholesale ? "wholesale_price" : "price";
  const usdPriceField = isWholesale ? "wholesale_usd_price" : "usd_price";
  const salePriceField = "sale_price"; // Sale price is same for both wholesale and retail
  const usdSalePriceField = "usd_sale_price";
  
  // Get the appropriate currency fields
  const currencyPriceField = currency === "USD" ? usdPriceField : priceField;
  const currencySalePriceField = currency === "USD" ? usdSalePriceField : salePriceField;
  
  // Check variant prices first
  if (variant) {
    const variantSalePrice = Number(variant[currencySalePriceField]) || 0;
    const variantPrice = Number(variant[currencyPriceField]) || 0;
    
    if (variantSalePrice > 0) return variantSalePrice;
    if (variantPrice > 0) return variantPrice;
  }
  
  // Check combination prices
  if (combination) {
    const combinationSalePrice = Number(combination[currencySalePriceField]) || 0;
    const combinationPrice = Number(combination[currencyPriceField]) || 0;
    
    if (combinationSalePrice > 0) return combinationSalePrice;
    if (combinationPrice > 0) return combinationPrice;
  }
  
  // Fall back to product prices
  const productSalePrice = Number(product?.[currencySalePriceField]) || 0;
  const productPrice = Number(product?.[currencyPriceField]) || 0;
  
  if (productSalePrice > 0) return productSalePrice;
  return productPrice || 0;
};
const getColorName = (hexCode) => {
  const colorMap = {
    '#4B3621': 'Dark Brown',
    '#4B0000': 'Dark Red',
    '#5C4033': 'Brown',
    '#808080': 'Gray',
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#FFC0CB': 'Pink',
    '#A52A2A': 'Brown',
    '#8B4513': 'Saddle Brown',
    '#D2691E': 'Chocolate',
    '#CD853F': 'Peru',
    '#F4A460': 'Sandy Brown',
    '#DEB887': 'Burlywood',
    '#D3D3D3': 'Light Gray',
    '#A9A9A9': 'Dark Gray',
    '#696969': 'Dim Gray',
    '#2F4F4F': 'Dark Slate Gray',
    '#708090': 'Slate Gray',
    '#778899': 'Light Slate Gray',
    '#B0C4DE': 'Light Steel Blue',
    '#4682B4': 'Steel Blue',
    '#5F9EA0': 'Cadet Blue',
    '#6495ED': 'Cornflower Blue',
    '#7B68EE': 'Medium Slate Blue',
    '#9370DB': 'Medium Purple',
    '#8A2BE2': 'Blue Violet',
    '#9400D3': 'Violet',
    '#9932CC': 'Dark Orchid',
    '#BA55D3': 'Medium Orchid',
    '#DA70D6': 'Orchid',
    '#EE82EE': 'Violet',
    '#DDA0DD': 'Plum',
    '#C71585': 'Medium Violet Red',
    '#DB7093': 'Pale Violet Red',
    '#FF1493': 'Deep Pink',
    '#FF69B4': 'Hot Pink',
    '#FFB6C1': 'Light Pink',
    '#FFA07A': 'Light Salmon',
    '#FA8072': 'Salmon',
    '#E9967A': 'Dark Salmon',
    '#F08080': 'Light Coral',
    '#CD5C5C': 'Indian Red',
    '#DC143C': 'Crimson',
    '#B22222': 'Fire Brick',
    '#8B0000': 'Dark Red',
    '#FF6347': 'Tomato',
    '#FF4500': 'Orange Red',
    '#FF8C00': 'Dark Orange',
    '#FFD700': 'Gold',
    '#FFFFE0': 'Light Yellow',
    '#FFFACD': 'Lemon Chiffon',
    '#FFEFD5': 'Papaya Whip',
    '#FFE4B5': 'Moccasin',
    '#FFDEAD': 'Navajo White',
    '#F5DEB3': 'Wheat',
    '#DEB887': 'Burlywood',
    '#D2B48C': 'Tan',
    '#BC8F8F': 'Rosy Brown',
    '#F0E68C': 'Khaki',
    '#BDB76B': 'Dark Khaki',
    '#9ACD32': 'Yellow Green',
    '#32CD32': 'Lime Green',
    '#00FF32': 'Lime',
    '#ADFF2F': 'Green Yellow',
    '#7FFF00': 'Chartreuse',
    '#7CFC00': 'Lawn Green',
    '#00FF7F': 'Spring Green',
    '#00FA9A': 'Medium Spring Green',
    '#90EE90': 'Light Green',
    '#98FB98': 'Pale Green',
    '#8FBC8F': 'Dark Sea Green',
    '#20B2AA': 'Light Sea Green',
    '#48D1CC': 'Medium Turquoise',
    '#40E0D0': 'Turquoise',
    '#00CED1': 'Dark Turquoise',
    '#5F9EA0': 'Cadet Blue',
    '#B0E0E6': 'Powder Blue',
    '#87CEEB': 'Sky Blue',
    '#87CEFA': 'Light Sky Blue',
    '#00BFFF': 'Deep Sky Blue',
    '#1E90FF': 'Dodger Blue',
    '#6495ED': 'Cornflower Blue',
    '#4169E1': 'Royal Blue',
    '#0000CD': 'Medium Blue',
    '#00008B': 'Dark Blue',
    '#000080': 'Navy',
    '#191970': 'Midnight Blue',
    '#8B008B': 'Dark Magenta',
    '#4B0082': 'Indigo'
  };

  // If exact match found, return it
  if (colorMap[hexCode?.toUpperCase()]) {
    return colorMap[hexCode.toUpperCase()];
  }

  // If it's a hex code but not in our map, try to give a generic name based on RGB values
  if (hexCode && hexCode.startsWith('#') && hexCode.length === 7) {
    const r = parseInt(hexCode.slice(1, 3), 16);
    const g = parseInt(hexCode.slice(3, 5), 16);
    const b = parseInt(hexCode.slice(5, 7), 16);
    
    // Simple color detection based on RGB values
    if (r > 200 && g > 200 && b > 200) return 'Light Color';
    if (r < 50 && g < 50 && b < 50) return 'Dark Color';
    if (r > g && r > b) return 'Reddish';
    if (g > r && g > b) return 'Greenish';
    if (b > r && b > g) return 'Bluish';
    if (r > 150 && g > 150 && b < 100) return 'Yellowish';
    if (r > 150 && g < 100 && b > 150) return 'Purplish';
    if (r < 100 && g > 150 && b > 150) return 'Cyanish';
    
    return 'Custom Color';
  }

  // If it's not a hex code, return as is (probably already a color name)
  return hexCode;
};


function InfoOne(props) {
  const { product } = props;
  const setRating = (e) => {
    e.preventDefault();
    if (e.currentTarget.parentNode.querySelector(".active")) {
      e.currentTarget.parentNode
        .querySelector(".active")
        .classList.remove("active");
    }

    e.currentTarget.classList.add("active");
  };

  const [formData, setFormData] = useState({
    rating: "",
    description: "",
    image: null,
  });
  const [reviews, setReviews] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token ? auth.token.replace(/"/g, "") : null;
  const perPage = 10;
  const [selectedImage, setSelectedImage] = useState(null);
  const [shippingReturnsContent, setShippingReturnsContent] = useState(
    `<h3>Delivery & Returns</h3>
              <p>We deliver to over Many countries around the world.</p>
              <p>
                If you ever need to return an item, you can do so within a month
                of receipt.
              </p>`
  );
  const currency = Cookies.get('currency');

  const router = useRouter();
  const { page } = router.query;

  const currentPage = page ? parseInt(page) : 1;

  useEffect(() => {
    const url =
      token === "null" || !token
        ? "/user/order-products-review"
        : "/user/order-product-review";

    const params = {
      product_id: product?.id,
      page: currentPage,
      size: perPage,
      ...(token === "null" || !token ? {} : {}),
    };

    const fetchReviews = async () => {
      try {
        const response = await apirequest("GET", url, null, params);

        if (response.success) {
          setReviews(response.data?.data ?? []);
          setTotalItems(response.data?.totalItems ?? 0);
        } else {
          console.error("Failed to fetch reviews:", response.message);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [currentPage, perPage, token, product?.id]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (token) {
        try {
          const response = await apirequest("GET", "/user/setting");
          if (response.success) {
            const shippingContent = response.data.find(
              (item) => item.key === "shipping_returns_content"
            );
            if (shippingContent) {
              setShippingReturnsContent(shippingContent.value);
            }
          }
        } catch (error) {
          console.error("Settings fetch error:", error);
        }
      }
    };
    fetchSettings();
  }, [token]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await apirequest(
        "POST",
        "/user/upload-image",
        formData,
        {
          // isMultipart: true 

        }
      );

      if (response?.success) {
        setFormData((prev) => ({
          ...prev,
          image: response.imageUrl,
          previewImageUrl: response.imageUrl,
        }));
      } else {
        console.error("Upload failed:", response?.message);
      }
    } catch (error) {
      console.error("Error during upload:", error.message);
    }
  };


  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const reviewData = {
      rating: formData.rating,
      product_id: product?.id,
      description: formData.description,
      image: formData.previewImageUrl,
      name: userData?.name || "Anonymous",
      order_id: formData.order_id,
    };
    // console.log(reviewData)
    try {
      const response = await apirequest(
        "POST",
        "/user/order-review",
        reviewData
      );

      if (response.success) {
        setFormData({
          rating: "",
          description: "",
          image: null,
          previewImageUrl: null,
        });
        setReviews((prevReviews) => [...prevReviews, response.data]);
      } else {
        console.error("Failed to submit review:", response.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  if (!product) {
    return <div></div>;
  }

  return (
    <Tabs selectedTabClassName="show" selectedTabPanelClassName="active show">
      <div className="product-details-tab">
        <TabList className="nav nav-pills justify-content-center">
          <Tab className="nav-item">
            <span className="nav-link">Description</span>
          </Tab>

          <Tab className="nav-item">
            <span className="nav-link">Additional Information</span>
          </Tab>

          <Tab className="nav-item">
            <span className="nav-link">Shipping & Returns</span>
          </Tab>

          <Tab className="nav-item">
            <span className="nav-link">Reviews ({totalItems})</span>
          </Tab>
        </TabList>

        <div className="tab-content">
          <TabPanel className="tab-pane">
            <div className="product-desc-content">
              <h3>Product Information</h3>
              {/* <p >{
                product?.description.replace(/<[^>]*>/g, '').trim()
              }</p> */}
               <div
      dangerouslySetInnerHTML={{ __html: product?.description }}
    />
              <ul>
                {product?.variant_json?.options?.map((variant, index) => (
                  <li key={index}>{`${variant.option}: ${variant.values.join(
                    ", "
                  )}`}</li>
                ))}
              </ul>
            </div>
          </TabPanel>

          {/* <TabPanel className="tab-pane">
            <div className="product-desc-content">
              <h3>Information</h3>
              <p>
                Price: {getCurrencySymbol(currency)}
                {product?.is_sale_product && product?.sale_price
                  ? product?.sale_price
                  : product?.price}
              </p>
              <p>
                Stock:{" "}
                {product?.stock > 0 ? `${product?.stock} available` : "Out of stock"}
              </p>

              {product?.variant_json?.combinations?.length > 0 && (
                <>
                  <h4>Variants:</h4>
                  {product?.variant_json?.combinations?.map((combination, index) => (
                    <div key={index}>
                      <p>Color: {combination?.color}</p>
                      <ul>
                        {combination?.variants?.map((variant, vIndex) => (
                          <li key={vIndex}>
                            Size: {variant?.size}, Price:{" "}
                            {getCurrencySymbol(currency)}
                            {variant?.price}, Stock:{" "}
                            {variant?.available > 0
                              ? `${variant?.available} available`
                              : "Out of stock"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </div>
          </TabPanel> */}



          <TabPanel className="tab-pane">
            <div className="product-desc-content">
              <h3>Information</h3>
              <p>
                <strong>Price:</strong> {getCurrencySymbol(currency)}
                {getBestPrice(null, null, product, currency)}
              </p>

              {product?.variant_json?.combinations?.length > 0 && (
                <>
                  <h4>Variants:</h4>
                  {product.variant_json.combinations.map((combination, index) => {
                    // Check if this combination has color as the main key
                    if (combination.color || combination.colors) {
                      const colorValue = combination.color || combination.colors;
                      const displayColorName = getColorName(colorValue);
                      
                      return (
                        <div className="variant-block" key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee' }}>
                          <h5 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Color: 
                            <span style={{ fontWeight: 'normal' }}>{displayColorName}</span>
                            {colorValue && colorValue.startsWith('#') && (
                              <span 
                                style={{ 
                                  display: 'inline-block', 
                                  width: '20px', 
                                  height: '20px', 
                                  backgroundColor: colorValue, 
                                  border: '1px solid #ccc',
                                  borderRadius: '3px'
                                }}
                                title={colorValue}
                              ></span>
                            )}
                          </h5>
                          {combination.variants && combination.variants.length > 0 ? (
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                              {combination.variants.map((variant, vIdx) => (
                                <li key={vIdx} style={{ marginBottom: '5px' }}>
                                  {variant.size && <span>Size: <strong>{variant.size}</strong>, </span>}
                                  Price: {getCurrencySymbol(currency)}{getBestPrice(variant, combination, product, currency)}
                                  {variant.available && <span>, Stock: {variant.available} available</span>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                              Price: {getCurrencySymbol(currency)}{getBestPrice(null, combination, product, currency)}
                              {combination.available && <span>, Stock: {combination.available} available</span>}
                            </p>
                          )}
                        </div>
                      );
                    }
                    
                    // Check if this combination has size as the main key
                    if (combination.size) {
                      return (
                        <div className="variant-block" key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee' }}>
                          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>
                            Size: <span style={{ fontWeight: 'normal' }}>{combination.size}</span>
                          </h5>
                          {combination.variants && combination.variants.length > 0 ? (
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                              {combination.variants.map((variant, vIdx) => (
                                <li key={vIdx} style={{ marginBottom: '5px' }}>
                                  {variant.color && <span>Color: <strong>{getColorName(variant.color)}</strong>, </span>}
                                  Price: {getCurrencySymbol(currency)}{getBestPrice(variant, combination, product, currency)}
                                  {variant.available && <span>, Stock: {variant.available} available</span>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                              Price: {getCurrencySymbol(currency)}{getBestPrice(null, combination, product, currency)}
                              {combination.available && <span>, Stock: {combination.available} available</span>}
                            </p>
                          )}
                        </div>
                      );
                    }
                    
                    // Fallback for other structures
                    return (
                      <div className="variant-block" key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee' }}>
                        <p style={{ margin: '0', fontSize: '14px' }}>
                          Variant {index + 1}: Price {getCurrencySymbol(currency)}{getBestPrice(null, combination, product, currency)}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </TabPanel>



          <TabPanel className="tab-pane">
            <div
              className="product-desc-content"
              dangerouslySetInnerHTML={{ __html: shippingReturnsContent }}
            />
          </TabPanel>

          <TabPanel className="tab-pane">
            <div className="reviews">
              <h3>Reviews</h3>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review?.id} className="review">
                    <h4>{review?.name || "Anonymous"}</h4>
                    <div className="ratings-container">
                      <div className="ratings">
                        <div
                          className="ratings-val"
                          style={{ width: review?.rating * 20 + "%" }}
                        ></div>
                        <span className="tooltip-text">{review?.rating}</span>
                      </div>
                      <span className="ratings-text">
                        ({review?.rating} Rating)
                      </span>
                    </div>
                    <p>{review?.description || "No details provided."}</p>
                    {/* {review?.image && (
                      <img
                        src={review?.image}
                        alt="Review"
                        className="review-image"
                      />
                    )} */}

                    {review?.image && (
                      <img
                        src={review.image}
                        alt="Review"
                        className="review-image"
                        onClick={() => setSelectedImage(review.image)}
                      />
                    )}

                    {/* Modal */}
                    {selectedImage && (
                      <div
                        className="modal-overlay"
                        onClick={() => setSelectedImage(null)}
                      >
                        <div
                          className="modal-content"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={selectedImage}
                            alt="Full Review"
                            className="full-image"
                          />
                          <button
                            className="close-btn"
                            onClick={() => setSelectedImage(null)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="review-date">
                      Reviewed on {formatDate(review?.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p>No reviews yet for this product.</p>
              )}

              {/* Pagination Component */}
              {totalItems > perPage && (
                <Pagination
                  perPage={perPage}
                  total={totalItems}
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

            {token &&
              token !== "null" &&
              token !== undefined &&
              product?.is_order &&
              !product?.is_review ? (
              <div className="reply">
                <h3 className="title">Add a Review</h3>
                <form onSubmit={handleReviewSubmit} encType="multipart/form-data">
                  <div className="form-group mb-3">
                    <label htmlFor="rating">Overall Rating</label>
                    <div id="rating" className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${star <= formData?.rating ? "selected" : ""}`}
                          onClick={() => setFormData({ ...formData, rating: star })}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                    <style>
                      {`
            .star-rating {
              display: flex;
              gap: 5px;
            }
            .star {
              cursor: pointer;
              font-size: 24px;
              color: #ccc;
            }
            .star:hover,
            .star.selected {
              color: #ffd700;
            }
            `}
                    </style>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="description">Detailed Review</label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows="4"
                      placeholder="Write your detailed review..."
                      value={formData?.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="image">Add Photo</label>
                    <input
                      type="file"
                      id="image"
                      className="form-control"
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    />
                    {formData?.previewImageUrl && (
                      <img
                        src={formData?.previewImageUrl}
                        alt="Preview"
                        style={{ marginTop: "10px", maxWidth: "100px" }}
                      />
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            ) : (
              // <p>
              //   {!product?.is_order
              //     ? "You must purchase this product to create a review."
              //     : "Please log in to add a review."}
              // </p>
              <></>
            )
            }
          </TabPanel>
        </div>
      </div>
    </Tabs>
  );
}

export default React.memo(InfoOne);