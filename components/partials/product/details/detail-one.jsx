import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import SlideToggle from "react-slide-toggle";
import ALink from "~/components/features/alink";
import Qty from "~/components/features/qty";
import { actions as wishlistAction } from "~/store/wishlist";
import { actions as cartAction } from "~/store/cart";
import { isInWishlist } from "~/utils";
import { getCurrencySymbol } from "~/utils";
import Cookies from "js-cookie";
import { checkPincode } from "~/api/homeService";

// Function to convert hex color codes to readable names
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
    '#696969': 'Dim Gray'
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

function DetailOne(props) {
  const router = useRouter();
  const ref = useRef(null);
  const { product, wishlist, onVariantChange } = props;
  // Get wholesale status and set initial quantity
  const isWholesale = Cookies.get("wholesale_status");
  const minQuantity = isWholesale === "approved" && product?.min_quantity 
    ? Number(product.min_quantity) 
    : 1;
  
  const [qty, setQty] = useState(minQuantity);
  const [qty2, setQty2] = useState(minQuantity);
  const [selectedVariant, setSelectedVariant] = useState([]);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const currency = Cookies.get("currency") || "INR";
  // Validate product data
  const productData = product && typeof product === "object" ? product : null;
  if (!productData || !productData.name || !productData.stock) {
    return (
      <div className="error-message" style={{ color: "red", padding: "20px" }}>
        Error: Invalid or missing product data
      </div>
    );
  }

  // Validate variant_json
  const variantOptions = Array.isArray(productData?.variant_json?.options)
    ? productData.variant_json.options
    : [];
  const variantCombinations = Array.isArray(
    productData?.variant_json?.combinations
  )
    ? productData.variant_json.combinations
    : [];
  const isGroupedByColor = variantCombinations.some(
    (c) => c.color && Array.isArray(c.variants) && c.variants.length > 0
  );

  // Auto-select single-value options
  useEffect(() => {
    const autoSelected = variantOptions
      .filter((opt) => opt.values.length === 1)
      .map((opt) => ({ option: opt.option, value: opt.values[0] }));
    if (autoSelected.length > 0) {
      setSelectedVariant((prev) => {
        const updated = [...prev];
        autoSelected.forEach((newVariant) => {
          const existingIndex = updated.findIndex(
            (v) => v.option.toLowerCase() === newVariant.option.toLowerCase()
          );
          if (existingIndex === -1) {
            updated.push(newVariant);
          }
        });
        return updated;
      });
    }
    updateAvailabilityMessage();
  }, [productData]);

  function selectVariant(option, value) {
    const optionData = variantOptions.find(
      (opt) => opt.option.toLowerCase() === option.toLowerCase()
    );
    if (!optionData || !optionData.values.includes(value)) {
      setErrorMessage(`Invalid ${option} selection ${value}`);
      return;
    }

    const updatedVariants = [...selectedVariant];
    const existingOptionIndex = updatedVariants.findIndex(
      (variant) => variant.option.toLowerCase() === option.toLowerCase()
    );

    if (existingOptionIndex !== -1) {
      updatedVariants[existingOptionIndex].value = value;
    } else {
      updatedVariants.push({ option, value });
    }

    setSelectedVariant(updatedVariants);
    setErrorMessage("");

     // Notify parent component about variant change for image update
    if (onVariantChange) {
      onVariantChange(updatedVariants);
    } else {
    }
  }

  function clearVariants() {
    const singleValueOptions = variantOptions
      .filter((opt) => opt.values.length === 1)
      .map((opt) => ({ option: opt.option, value: opt.values[0] }));
    setSelectedVariant(singleValueOptions);
    setAvailabilityMessage("");
    setErrorMessage("");
  }

  function getSelectedCombination() {
    const normalize = (str) => str?.toLowerCase()?.trim() || "";

    const primaryOptionName = variantOptions[0]?.option;
    const secondaryOptionName = variantOptions[1]?.option;

    const getSelectedValue = (optionName) => {
        if (!optionName) return null;
        const variant = selectedVariant.find(
            (v) => normalize(v.option) === normalize(optionName)
        );
        return variant ? variant.value : null;
    };

    const selectedPrimaryValue = getSelectedValue(primaryOptionName);
    const selectedSecondaryValue = getSelectedValue(secondaryOptionName);

    // Handle products with no variants
    if (variantOptions.length === 0) {
        return {
            available: Number(productData.stock) || 0,
            price: productData.price || "0",
            usd_price: productData.usd_price || "0",
            sale_price: productData.sale_price || null,
            usd_sale_price: productData.usd_sale_price || null,
            wholesale_price: productData.wholesale_price || null,
            wholesale_usd_price: productData.wholesale_usd_price || null,
        };
    }

    // Handle products with variants but no combinations defined
    if (variantCombinations.length === 0) {
        if (getMissingOptions().length === 0) {
            return {
                available: Number(productData.stock) || 0,
                price: productData.price || "0",
                usd_price: productData.usd_price || "0",
                sale_price: productData.sale_price || null,
                usd_sale_price: productData.usd_sale_price || null,
                wholesale_price: productData.wholesale_price || null,
                wholesale_usd_price: productData.wholesale_usd_price || null,
            };
        }
        return null;
    }

    // Handle single-option products
    if (variantOptions.length === 1 && selectedPrimaryValue) {
        const combination = variantCombinations.find(
            (c) => normalize(c[primaryOptionName]) === normalize(selectedPrimaryValue)
        );
        if (!combination) {
            return null;
        }

        if (Array.isArray(combination.variants) && combination.variants.length > 0) {
            const variant = combination.variants[0];
            return {
                available: Number(variant.available) || 0,
                price: variant.price || combination.price || productData.price || "0",
                usd_price: variant.usd_price || combination.usd_price || productData.usd_price || "0",
                sale_price: variant.sale_price || combination.sale_price || productData.sale_price || null,
                usd_sale_price: variant.usd_sale_price || combination.usd_sale_price || productData.usd_sale_price || null,
                wholesale_price: variant.wholesale_price || combination.wholesale_price || productData.wholesale_price || null,
                wholesale_usd_price: variant.wholesale_usd_price || combination.wholesale_usd_price || productData.wholesale_usd_price || null,
            };
        }

        return {
            available: Number(combination.available) || 0,
            price: combination.price || productData.price || "0",
            usd_price: combination.usd_price || productData.usd_price || "0",
            sale_price: combination.sale_price || productData.sale_price || null,
            usd_sale_price: combination.usd_sale_price || productData.usd_sale_price || null,
            wholesale_price: combination.wholesale_price || productData.wholesale_price || null,
            wholesale_usd_price: combination.wholesale_usd_price || productData.wholesale_usd_price || null,
        };
    }

    // Handle products with two variant options
    if (selectedPrimaryValue && selectedSecondaryValue && variantCombinations.length > 0) {
        const primaryCombination = variantCombinations.find(
            (c) => normalize(c[primaryOptionName]) === normalize(selectedPrimaryValue)
        );
        if (primaryCombination) {
            const variant = primaryCombination.variants?.find(
                (v) => normalize(v[secondaryOptionName]) === normalize(selectedSecondaryValue)
            );
            if (variant) {
                return {
                    available: Number(variant.available) || 0,
                    price: variant.price || primaryCombination.price || productData.price || "0",
                    usd_price: variant.usd_price || primaryCombination.usd_price || productData.usd_price || "0",
                    sale_price: variant.sale_price || primaryCombination.sale_price || productData.sale_price || null,
                    usd_sale_price: variant.usd_sale_price || primaryCombination.usd_sale_price || productData.usd_sale_price || null,
                    wholesale_price: variant.wholesale_price || primaryCombination.wholesale_price || productData.wholesale_price || null,
                    wholesale_usd_price: variant.wholesale_usd_price || primaryCombination.wholesale_usd_price || productData.wholesale_usd_price || null,
                };
            }
        }
    }

    // Return primary-level data if only primary option is selected
    if (selectedPrimaryValue && variantCombinations.length > 0) {
        const primaryCombination = variantCombinations.find(
            (c) => normalize(c[primaryOptionName]) === normalize(selectedPrimaryValue)
        );
        if (primaryCombination) {
            const totalStock = Array.isArray(primaryCombination.variants)
                ? primaryCombination.variants.reduce(
                    (sum, v) => sum + Number(v.available || 0), 0
                )
                : Number(primaryCombination.available || 0);
            return {
                available: totalStock,
                price: primaryCombination.price || productData.price || "0",
                usd_price: primaryCombination.usd_price || productData.usd_price || "0",
                sale_price: primaryCombination.sale_price || productData.sale_price || null,
                usd_sale_price: primaryCombination.usd_sale_price || productData.usd_sale_price || null,
                wholesale_price: primaryCombination.wholesale_price || productData.wholesale_price || null,
                wholesale_usd_price: primaryCombination.wholesale_usd_price || productData.wholesale_usd_price || null,
            };
        }
    }

    return null;
  }

  function updateAvailabilityMessage() {
    const missing = getMissingOptions();
    if (missing.length > 0) {
      setAvailabilityMessage("");
      return;
    }
    const selectedCombination = getSelectedCombination();
    const normalize = (str) => str?.toLowerCase()?.trim() || "";

    const primaryOptionName = variantOptions[0]?.option;
    const secondaryOptionName = variantOptions[1]?.option;
    
    const getSelectedValue = (optionName) => {
        if (!optionName) return null;
        const variant = selectedVariant.find(
          (v) => normalize(v.option) === normalize(optionName)
        );
        return variant ? variant.value : null;
    };

    const selectedPrimaryValue = getSelectedValue(primaryOptionName);
    const selectedSecondaryValue = getSelectedValue(secondaryOptionName);

    // Handle products with no variants
    if (variantOptions.length === 0) {
      const stock = Number(productData.stock) || 0;
      setAvailabilityMessage(stock > 0 ? "Available" : "Out of Stock");
      return;
    }

    // Handle single-option products
    if (variantOptions.length === 1 && selectedPrimaryValue) {
      if (!selectedCombination) {
        setAvailabilityMessage("Invalid selection");
        return;
      }
      const totalStock = Number(selectedCombination.available) || 0;
      setAvailabilityMessage(totalStock > 0 ? "Available" : "Out of Stock");
      return;
    }

    // Handle products with both options
    if (selectedPrimaryValue && selectedSecondaryValue) {
      if (!selectedCombination) {
        setAvailabilityMessage("Invalid selection");
        return;
      }
      const totalStock = Number(selectedCombination.available) || 0;
      setAvailabilityMessage(totalStock > 0 ? "Available" : "Out of Stock");
    } else if (selectedPrimaryValue) {
      if (!selectedCombination) {
        setAvailabilityMessage("Invalid selection");
        return;
      }
      const totalStock = Number(selectedCombination.available) || 0;
      setAvailabilityMessage(totalStock > 0 ? "Available" : "Out of Stock");
    } else {
      setAvailabilityMessage("");
    }
  }

  // Check if add to cart should be disabled
  const isAddToCartDisabled = () => {
    // Check stock availability
    if (!productData.variant_json || variantOptions.length === 0) {
      const stockAvailable = Number(productData.stock) > 0;
      if (!stockAvailable) return true;
    } else {
      const missing = getMissingOptions();
      if (missing.length > 0) return true;
      
      const selectedCombination = getSelectedCombination();
      const stockAvailable = selectedCombination && Number(selectedCombination.available) > 0;
      if (!stockAvailable) return true;
    }

    // Check wholesale minimum quantity
    if (isWholesale === "approved") {
      return qty < minQuantity;
    }

    return false;
  };

  function getDisplayPrices() {
    const selectedCombination = getSelectedCombination();
    
    // Determine which price fields to use based on wholesale status
    const priceField = isWholesale === "approved" ? "wholesale_price" : "price";
    const usdPriceField = isWholesale === "approved" ? "wholesale_usd_price" : "usd_price";
    const salePriceField = isWholesale === "approved" ? "sale_price" : "sale_price";
    const usdSalePriceField = isWholesale === "approved" ? "usd_sale_price" : "usd_sale_price";

    let displayPrice = Number(
      currency === "USD" 
        ? productData[usdPriceField] 
        : productData[priceField]
    ) || 0;

    let displaySalePrice = Number(
      currency === "USD" 
        ? productData[usdSalePriceField] 
        : productData[salePriceField]
    ) || 0;

    // Use default prices if no valid combination or no selection
    if (!selectedCombination) {
      return { displayPrice, displaySalePrice };
    }

    // Use variant prices if available
    if (selectedCombination) {
      const variantPrice = Number(
        currency === "USD"
          ? selectedCombination[usdPriceField]
          : selectedCombination[priceField]
      ) || displayPrice;

      const variantSalePrice = Number(
        currency === "USD"
          ? selectedCombination[usdSalePriceField]
          : selectedCombination[salePriceField]
      ) || 0;

      if (variantPrice > 0) {
        displayPrice = variantPrice;
      }
      if (variantSalePrice > 0) {
        displaySalePrice = variantSalePrice;
      } else if (variantPrice > 0) {
        displaySalePrice = 0;
      }
    }

    return { displayPrice, displaySalePrice };
  }

  function onCartClick(e, isSticky = false) {
    e.preventDefault();
    
    if (isAddToCartDisabled()) {
      if (isWholesale === "approved" && qty < minQuantity) {
        setErrorMessage(`Minimum quantity for wholesale is ${minQuantity}`);
      } else {
        setErrorMessage("Cannot add to cart. Please check your selection and quantity.");
      }
      return;
    }

    const missing = getMissingOptions();
    if (missing.length > 0) {
      setErrorMessage("Please select " + missing.join(", "));
      return;
    }
    // // Validate before adding to cart
    // if (!isAddToCartDisabled) {
    //   if (variantOptions.length > 0 && selectedVariant.length === 0) {
    //     setErrorMessage("Please select a variant");
    //   } else if (variantOptions.length === 2 && selectedVariant.length < 2) {
    //     setErrorMessage("Please select both color and size");
    //   } else {
    //     setErrorMessage("Product is out of stock");
    //   }
    //   return;
    // }

    const quantity = isSticky ? qty2 : qty;
    const selectedCombination = getSelectedCombination();

    // Validate quantity
    const availableStock = selectedCombination
      ? Number(selectedCombination.available)
      : Number(productData.stock);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setErrorMessage("Quantity must be a positive integer");
      return;
    }
    if (quantity > availableStock) {
      setErrorMessage(`Only ${availableStock} items available`);
      return;
    }

    const { displayPrice, displaySalePrice } = getDisplayPrices();
    const effectivePrice =
      displaySalePrice > 0 ? displaySalePrice : displayPrice;

    // Determine which price fields to use based on wholesale status
    const priceField = isWholesale === "approved" ? "wholesale_price" : "price";
    const usdPriceField = isWholesale === "approved" ? "wholesale_usd_price" : "usd_price";
    const salePriceField = isWholesale === "approved" ? "sale_price" : "sale_price";
    const usdSalePriceField = isWholesale === "approved" ? "usd_sale_price" : "usd_sale_price";

    const effectiveUsdPrice =
      selectedCombination?.[usdSalePriceField] &&
      Number(selectedCombination[usdSalePriceField]) > 0
        ? Number(selectedCombination[usdSalePriceField])
        : Number(selectedCombination?.[usdPriceField] || productData[usdPriceField]);


        const isWS = isWholesale === "approved";

const finalPrice = isWS
  ? (selectedCombination?.wholesale_price || productData.wholesale_price)
  : (selectedCombination?.price || productData.price);

const finalUsdPrice = isWS
  ? (selectedCombination?.wholesale_usd_price || productData.wholesale_usd_price)
  : (selectedCombination?.usd_price || productData.usd_price);

const finalSalePrice = isWS
  ? (selectedCombination?.wholesale_sale_price || productData.wholesale_sale_price)
  : (selectedCombination?.sale_price || productData.sale_price);

const finalUsdSalePrice = isWS
  ? (selectedCombination?.wholesale_usd_sale_price || productData.wholesale_usd_sale_price)
  : (selectedCombination?.usd_sale_price || productData.usd_sale_price);


    // const productToAdd = {
    //   ...productData,
    //   selectedVariant: selectedVariant,
    //   quantity,
    //   variantPrice: {
    //     price: effectivePrice,
    //     usd_price: effectiveUsdPrice,
    //   },
    //   price:
    //     currency === "USD"
    //       ? selectedCombination?.[usdPriceField] || productData[usdPriceField]
    //       : selectedCombination?.[priceField] || productData[priceField],
    //   usd_price: selectedCombination?.[usdPriceField] || productData[usdPriceField],
    //   sale_price:
    //     selectedCombination?.[salePriceField] &&
    //     Number(selectedCombination[salePriceField]) > 0
    //       ? selectedCombination[salePriceField]
    //       : selectedCombination?.[priceField] ||
    //         productData[salePriceField] ||
    //         productData[priceField],
    //   usd_sale_price:
    //     selectedCombination?.[usdSalePriceField] &&
    //     Number(selectedCombination[usdSalePriceField]) > 0
    //       ? selectedCombination[usdSalePriceField]
    //       : selectedCombination?.[usdPriceField] ||
    //         productData[usdSalePriceField] ||
    //         productData[usdPriceField],
    //   is_wholesale: isWholesale === "approved",
    //   min_quantity: minQuantity,
    // };
const productToAdd = {
  ...productData,
  selectedVariant,
  quantity,
  price: Number(finalPrice) || 0,
  usd_price: Number(finalUsdPrice) || 0,
  sale_price: Number(finalSalePrice) || 0,
  usd_sale_price: Number(finalUsdSalePrice) || 0,
  is_wholesale: isWS,
  min_quantity: minQuantity,
};

    props.addToCart(productToAdd, quantity);
    setErrorMessage("");
  }

  function onWishlistClick(e) {
    e.preventDefault();
    if (!isInWishlist(wishlist, product)) {
      props.addToWishlist(product);
    } else {
      router.push("/pages/wishlist");
    }
  }

  const handleApply = async () => {
    if (!pincode) {
      setPincodeMessage("Please enter a pincode");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeMessage("Pincode must be exactly 6 digits");
      return;
    }

    try {
      const response = await checkPincode(pincode);
      if (!response || typeof response !== "object") {
        setPincodeMessage("Invalid response from server");
        return;
      }
      if (response.success) {
        setPincodeMessage(
          response.deliveredDate
            ? `Delivery in ${response.data} days`
            : response.message || "Delivery available"
        );
      } else {
        setPincodeMessage(response.message || "Delivery not available");
      }
    } catch (error) {
      setPincodeMessage("Failed to check pincode. Please try again.");
      console.error("Pincode check error:", error);
    }
  };

  // Validate prices
  const { displayPrice, displaySalePrice } = getDisplayPrices();
  if (displayPrice < 0 || displaySalePrice < 0) {
    setErrorMessage("Invalid price data");
    return (
      <div className="error-message" style={{ color: "red", padding: "20px" }}>
        Error: Invalid price data
      </div>
    );
  }

  function getMissingOptions() {
    return variantOptions
      .filter(
        (opt) =>
          !selectedVariant.find(
            (v) => v.option.toLowerCase() === opt.option.toLowerCase()
          )
      )
      .map((opt) => opt.option);
  }

  // Check if quantity is valid for wholesale
  const isQuantityValid = isWholesale === "approved" ? qty >= minQuantity : true;
  const isButtonDisabled = isAddToCartDisabled();

  return (
    <div className="product-details" ref={ref}>
      <h1 className="product-title">{productData.name}</h1>
      <div className="ratings-container">
        <div className="ratings">
          <div
            className="ratings-val"
            style={{ width: (Number(productData.rating) || 0) * 20 + "%" }}
          ></div>
          <span className="tooltip-text">
            {(Number(productData.rating) || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="product-price">
        {isWholesale === "approved" ? (
          <>
            <span className="">
             {getCurrencySymbol(currency)}
              {displayPrice.toFixed(2)}
            </span>
            {displaySalePrice > 0 && displaySalePrice < displayPrice && (
              <span className="old-price" style={{ marginLeft: "10px", textDecoration: "line-through" }}>
                {getCurrencySymbol(currency)}
                {displaySalePrice.toFixed(2)}
              </span>
            )}
          </>
        ) : (
          <>
            {productData.is_sale_product && displaySalePrice > 0 ? (
              <>
                <span className="new-price">
                  {getCurrencySymbol(currency)}
                  {displaySalePrice.toFixed(2)}
                </span>
                <span className="old-price">
                  {getCurrencySymbol(currency)}
                  {displayPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span>
                {getCurrencySymbol(currency)}
                {displayPrice.toFixed(2)}
              </span>
            )}
          </>
        )}
      </div>

      

      <div className="product-content">
        {productData.description ? (
          <div dangerouslySetInnerHTML={{ __html: productData.description }} />
        ) : (
          <p>No description available</p>
        )}
      </div>

      {variantOptions.length > 0 ? (
        variantOptions.map((option, index) => (
          <div key={index} className="details-filter-row details-row-size">
            <label>
              {option.option.charAt(0).toUpperCase() + option.option.slice(1)}:
            </label>
            {option.values.length === 1 ? (
              <span className="variant-value">
                {option.values[0].charAt(0).toUpperCase() +
                  option.values[0].slice(1)}
              </span>
            ) : option.option.toLowerCase() === "color" ? (
              <div>
                <div className="product-nav product-nav-dots">
                  {option.values.map((color, i) => (
                    <a
                      key={i}
                      className={
                        selectedVariant.find(
                          (v) => v.option.toLowerCase() === "color"
                        )?.value === color
                          ? "active"
                          : ""
                      }
                      style={{ backgroundColor: color }}
                      onClick={() => selectVariant("color", color)}
                      title={getColorName(color)}
                    ></a>
                  ))}
                </div>
                {selectedVariant.find((v) => v.option.toLowerCase() === "color") && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                    Selected: {getColorName(selectedVariant.find((v) => v.option.toLowerCase() === "color")?.value)}
                  </div>
                )}
              </div>
            ) : (
              <div className="select-custom">
                <select
                  name={option.option}
                  className="form-control"
                  onChange={(e) => selectVariant(option.option, e.target.value)}
                  value={
                    selectedVariant.find(
                      (v) =>
                        v.option.toLowerCase() === option.option.toLowerCase()
                    )?.value || ""
                  }
                >
                  <option value="">Select a {option.option}</option>
                  {option.values.map((value, i) => (
                    <option key={i} value={value}>
                      {value.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="details-filter-row details-row-size">
          <label>Variants:</label>
          <span>No variants available</span>
        </div>
      )}

      <div className="details-filter-row details-row-size">
        <label htmlFor="qty">Qty:</label>
        <Qty
          changeQty={(value) => {
            const maxStock = getSelectedCombination()?.available
              ? Number(getSelectedCombination().available)
              : Number(productData.stock) || 1;
            if (!Number.isInteger(value) || value <= 0) {
              setErrorMessage("Quantity must be a positive integer");
              return;
            }
            if (value > maxStock) {
              setErrorMessage(`Maximum available quantity is ${maxStock}`);
              return;
            }
            setQty(value);
            setErrorMessage("");
          }}
          max={
            getSelectedCombination()?.available
              ? Number(getSelectedCombination().available)
              : Number(productData.stock) || 1
          }
          min={minQuantity}
          value={qty}
        />
        
       
      </div>

       {/* Quantity validation message */}
        {isWholesale === "approved" && !isQuantityValid && (
          <div style={{marginLeft:"66px", color: "red", fontSize: "12px" }}>
            Minimum {minQuantity} required
          </div>
        )}


        {/* Minimum Quantity Notice */}
      {isWholesale === "approved" && minQuantity > 1 && (
        <div className="wholesale-notice">
           <label>Min. Order:</label> {minQuantity} pieces
        </div>
      )}

      {availabilityMessage && (
        <div className="details-filter-row details-row-size">
          <label>Availability:</label>
          <span
            style={{
              color: availabilityMessage === "Available" ? "green" : "red",
              fontWeight: "semibold",
              marginLeft: "10px",
            }}
          >
            {availabilityMessage}
          </span>
        </div>
      )}

      {errorMessage && (
        <div
          className="error-message"
          style={{ color: "red", margin: "10px 0" }}
        >
          {errorMessage}
        </div>
      )}

      <div className="product-details-action">
        <button
          className={`btn-product btn-cart ${isButtonDisabled ? "btn-disabled" : ""}`}
          onClick={(e) => onCartClick(e)}
          disabled={isButtonDisabled}
        >
          <span>Add to Cart</span>
        </button>
        <div className="details-action-wrapper">
          {isInWishlist(wishlist, product) ? (
            <ALink
              href="/shop/wishlist"
              className="btn-product-icon btn-wishlist added-to-wishlist"
            >
              <span>Go to Wishlist</span>
            </ALink>
          ) : (
            <a
              href="#"
              className="btn-product-icon btn-wishlist"
              onClick={onWishlistClick}
            >
              <span>Add to Wishlist</span>
            </a>
          )}
        </div>
      </div>

    {productData.category_name && (
  <div className="product-cat">
    <span>Category:</span>
    <span>{productData.category_name}</span>
  </div>
)}

      <div className="pincode-container">
        <label htmlFor="pincode-input" className="visually-hidden">
          Enter your delivery pincode
        </label>
        <input
          id="pincode-input"
          type="text"
          value={pincode}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,6}$/.test(value)) {
              setPincode(value);
              setPincodeMessage("");
            } else {
              setPincodeMessage("Pincode must contain only digits");
            }
          }}
          placeholder="Enter delivery pincode"
          className="pincode-input"
          maxLength={6}
        />
        <button
          onClick={handleApply}
          className="apply-button"
          aria-label="Check delivery availability"
          disabled={pincode.length !== 6}
        >
          Check
        </button>
      </div>
      <hr className="divider" />

      {pincodeMessage && (
        <div
          className="message"
          style={{
            color: pincodeMessage.includes("Product available") ? "green" : "red",
            margin: "10px 0",
          }}
        >
          {pincodeMessage}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  cartlist: state.cartlist.data,
  wishlist: state.wishlist.data,
  state: state,
});

export default connect(mapStateToProps, {
  ...wishlistAction,
  ...cartAction,
})(DetailOne);
// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/router";
// import { connect } from "react-redux";
// import SlideToggle from "react-slide-toggle";
// import ALink from "~/components/features/alink";
// import Qty from "~/components/features/qty";
// import { actions as wishlistAction } from "~/store/wishlist";
// import { actions as cartAction } from "~/store/cart";
// import { isInWishlist } from "~/utils";
// import { getCurrencySymbol } from "~/utils";
// import Cookies from "js-cookie";
// import { checkPincode } from "~/api/homeService";

// function DetailOne(props) {
//   const router = useRouter();
//   const ref = useRef(null);
//   const { product, wishlist } = props;
//   const [qty, setQty] = useState(1);
//   const [qty2, setQty2] = useState(1);
//   const [selectedVariant, setSelectedVariant] = useState([]);
//   const [availabilityMessage, setAvailabilityMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [pincodeMessage, setPincodeMessage] = useState("");
//   const currency = Cookies.get("currency") || "INR";
//   // Validate product data
//   const productData = product && typeof product === "object" ? product : null;
//   if (!productData || !productData.name || !productData.stock) {
//     return (
//       <div className="error-message" style={{ color: "red", padding: "20px" }}>
//         Error: Invalid or missing product data
//       </div>
//     );
//   }

 
//   // Validate variant_json
//   const variantOptions = Array.isArray(productData?.variant_json?.options)
//     ? productData.variant_json.options
//     : [];
//   const variantCombinations = Array.isArray(productData?.variant_json?.combinations)
//     ? productData.variant_json.combinations
//     : [];
//   const isGroupedByColor = variantCombinations.some(
//     (c) => c.color && Array.isArray(c.variants) && c.variants.length > 0
//   );

//   // Auto-select single-value options
//   useEffect(() => {
//     const autoSelected = variantOptions
//       .filter((opt) => opt.values.length === 1)
//       .map((opt) => ({ option: opt.option, value: opt.values[0] }));
//     if (autoSelected.length > 0) {
//       setSelectedVariant((prev) => {
//         const updated = [...prev];
//         autoSelected.forEach((newVariant) => {
//           const existingIndex = updated.findIndex(
//             (v) => v.option.toLowerCase() === newVariant.option.toLowerCase()
//           );
//           if (existingIndex === -1) {
//             updated.push(newVariant);
//           }
//         });
//         return updated;
//       });
//     }
//     updateAvailabilityMessage();
//   }, [productData]);

//   function selectVariant(option, value) {
//     const optionData = variantOptions.find(
//       (opt) => opt.option.toLowerCase() === option.toLowerCase()
//     );
//     if (!optionData || !optionData.values.includes(value)) {
//       setErrorMessage(`Invalid ${option} selection ${value}`);
//       return;
//     }

//     const updatedVariants = [...selectedVariant];
//     const existingOptionIndex = updatedVariants.findIndex(
//       (variant) => variant.option.toLowerCase() === option.toLowerCase()
//     );

//     if (existingOptionIndex !== -1) {
//       updatedVariants[existingOptionIndex].value = value;
//     } else {
//       updatedVariants.push({ option, value });
//     }

//     setSelectedVariant(updatedVariants);
//     setErrorMessage("");
//   }

//   function clearVariants() {
//     const singleValueOptions = variantOptions
//       .filter((opt) => opt.values.length === 1)
//       .map((opt) => ({ option: opt.option, value: opt.values[0] }));
//     setSelectedVariant(singleValueOptions);
//     setAvailabilityMessage("");
//     setErrorMessage("");
//   }

//   function getSelectedCombination() {
//     const normalize = (str) => str?.toLowerCase()?.trim() || "";
//     const selectedColor = selectedVariant.find(
//       (v) => normalize(v.option) === "color"
//     );
//     const selectedSize = selectedVariant.find(
//       (v) => normalize(v.option) === "size"
//     );

//     // Handle products with no variants
//     if (variantOptions.length === 0) {
//       return {
//         available: Number(productData.stock) || 0,
//         price: productData.price || "0",
//         usd_price: productData.usd_price || "0",
//         sale_price: productData.sale_price || null,
//         usd_sale_price: productData.usd_sale_price || null,
//       };
//     }

//     // Handle single-option products (e.g., only color, with or without combinations)
//     if (variantOptions.length === 1 && selectedColor) {
//       // If no combinations, use base product data
//       if (variantCombinations.length === 0) {
//         return {
//           available: Number(productData.stock) || 0,
//           price: productData.price || "0",
//           usd_price: productData.usd_price || "0",
//           sale_price: productData.sale_price || null,
//           usd_sale_price: productData.usd_sale_price || null,
//         };
//       }

//       // Find matching color combination
//       const colorComb = variantCombinations.find(
//         (c) => normalize(c.color) === normalize(selectedColor.value)
//       );
//       if (!colorComb) {
//         return null;
//       }

//       // If combination has nested variants, use the first variant's data
//       if (Array.isArray(colorComb.variants) && colorComb.variants.length > 0) {
//         const variant = colorComb.variants[0];
//         return {
//           available: Number(variant.available) || 0,
//           price: variant.price || colorComb.price || productData.price || "0",
//           usd_price: variant.usd_price || colorComb.usd_price || productData.usd_price || "0",
//           sale_price: variant.sale_price || colorComb.sale_price || productData.sale_price || null,
//           usd_sale_price: variant.usd_sale_price || colorComb.usd_sale_price || productData.usd_sale_price || null,
//         };
//       }

//       // Use combination's data directly
//       return {
//         available: Number(colorComb.available) || 0,
//         price: colorComb.price || productData.price || "0",
//         usd_price: colorComb.usd_price || productData.usd_price || "0",
//         sale_price: colorComb.sale_price || productData.sale_price || null,
//         usd_sale_price: colorComb.usd_sale_price || productData.usd_sale_price || null,
//       };
//     }

//     // Handle products with color and size variants
//     if (selectedColor && selectedSize && variantCombinations.length > 0) {
//       const colorComb = variantCombinations.find(
//         (c) => normalize(c.color) === normalize(selectedColor.value)
//       );
//       if (colorComb) {
//         const variant = colorComb.variants?.find(
//           (v) => normalize(v.size) === normalize(selectedSize.value)
//         );
//         if (variant) {
//           return {
//             available: Number(variant.available) || 0,
//             price: variant.price || colorComb.price || productData.price || "0",
//             usd_price: variant.usd_price || colorComb.usd_price || productData.usd_price || "0",
//             sale_price: variant.sale_price || colorComb.sale_price || productData.sale_price || null,
//             usd_sale_price: variant.usd_sale_price || colorComb.usd_sale_price || productData.usd_sale_price || null,
//           };
//         }
//       }
//     }

//     // Return color-level data if only color is selected and combinations exist
//     if (selectedColor && variantCombinations.length > 0) {
//       const colorComb = variantCombinations.find(
//         (c) => normalize(c.color) === normalize(selectedColor.value)
//       );
//       if (colorComb) {
//         const totalStock = Array.isArray(colorComb.variants)
//           ? colorComb.variants.reduce((sum, v) => sum + Number(v.available || 0), 0)
//           : Number(colorComb.available || 0);
//         return {
//           available: totalStock,
//           price: colorComb.price || productData.price || "0",
//           usd_price: colorComb.usd_price || productData.usd_price || "0",
//           sale_price: colorComb.sale_price || productData.sale_price || null,
//           usd_sale_price: colorComb.usd_sale_price || productData.usd_sale_price || null,
//         };
//       }
//     }

//     return null;
//   }

//   function updateAvailabilityMessage() {
//     const missing = getMissingOptions();
//     if (missing.length > 0) {
//       setAvailabilityMessage("");
//       return;
//     }
//     const selectedCombination = getSelectedCombination();
//     const normalize = (str) => str?.toLowerCase()?.trim() || "";
//     const selectedColor = selectedVariant.find(
//       (v) => normalize(v.option) === "color"
//     );
//     const selectedSize = selectedVariant.find(
//       (v) => normalize(v.option) === "size"
//     );

//     // Handle products with no variants
//     if (variantOptions.length === 0) {
//       const stock = Number(productData.stock) || 0;
//       setAvailabilityMessage(stock > 0 ? "Available" : "Out of Stock");
//       return;
//     }

//     // Handle single-option products (e.g., only color)
//     if (variantOptions.length === 1 && selectedColor) {
//       if (!selectedCombination) {
//         setAvailabilityMessage("Invalid selection");
//         return;
//       }
//       const totalStock = Number(selectedCombination.available) || 0;
//       setAvailabilityMessage(totalStock > 0 ? "Available" : "Out of Stock");
//       return;
//     }

//     // Handle products with both color and size
//     if (selectedColor && selectedSize) {
//       if (!selectedCombination) {
//         setAvailabilityMessage("Invalid selection");
//         return;
//       }
//       const totalStock = Number(selectedCombination.available) || 0;
//       setAvailabilityMessage(totalStock > 0 ? "Available" : "Out of Stock");
//     } else if (selectedColor) {
//       if (!selectedCombination) {
//         setAvailabilityMessage("Invalid selection");
//         return;
//       }
//       const totalStock = Number(selectedCombination.available) || 0;
//       setAvailabilityMessage(totalStock > 0 ? "Available" : "Out of Stock");
//     } else {
//       setAvailabilityMessage("");
//     }
//   }

//   function canAddToCart() {
//     if (!productData.variant_json || variantOptions.length === 0) {
//       return Number(productData.stock) > 0;
//     }
//     const missing = getMissingOptions();
//     if (missing.length > 0) return false;
//     const selectedCombination = getSelectedCombination();
//     return selectedCombination && Number(selectedCombination.available) > 0;
//   }

//   function getDisplayPrices() {
//     const selectedCombination = getSelectedCombination();
//     let displayPrice = Number(currency === "USD" ? productData.usd_price : productData.price) || 0;
//     let displaySalePrice = Number(currency === "USD" ? productData.usd_sale_price : productData.sale_price) || 0;

//     // Use default prices if no valid combination or no selection
//     if (!selectedCombination) {
//       return { displayPrice, displaySalePrice };
//     }

//     // Use variant prices if available
//     if (selectedCombination) {
//       const variantPrice = Number(currency === "USD" ? selectedCombination.usd_price : selectedCombination.price) || displayPrice;
//       const variantSalePrice = Number(currency === "USD" ? selectedCombination.usd_sale_price : selectedCombination.sale_price) || 0;

//       if (variantPrice > 0) {
//         displayPrice = variantPrice;
//       }
//       if (variantSalePrice > 0) {
//         displaySalePrice = variantSalePrice;
//       } else if (variantPrice > 0) {
//         displaySalePrice = 0;
//       }
//     }

//     return { displayPrice, displaySalePrice };
//   }

//   function onCartClick(e, isSticky = false) {
//     e.preventDefault();
//     const missing = getMissingOptions();
//     if (missing.length > 0) {
//       setErrorMessage("Please select " + missing.join(", "));
//       return;
//     }
//     // Validate before adding to cart
//     if (!canAddToCart()) {
//       if (variantOptions.length > 0 && selectedVariant.length === 0) {
//         setErrorMessage("Please select a variant");
//       } else if (variantOptions.length === 2 && selectedVariant.length < 2) {
//         setErrorMessage("Please select both color and size");
//       } else {
//         setErrorMessage("Product is out of stock");
//       }
//       return;
//     }

//     const quantity = isSticky ? qty2 : qty;
//     const selectedCombination = getSelectedCombination();

//     // Validate quantity
//     const availableStock = selectedCombination
//       ? Number(selectedCombination.available)
//       : Number(productData.stock);
//     if (!Number.isInteger(quantity) || quantity <= 0) {
//       setErrorMessage("Quantity must be a positive integer");
//       return;
//     }
//     if (quantity > availableStock) {
//       setErrorMessage(`Only ${availableStock} items available`);
//       return;
//     }

//     const { displayPrice, displaySalePrice } = getDisplayPrices();
//     const effectivePrice = displaySalePrice > 0 ? displaySalePrice : displayPrice;
//     const effectiveUsdPrice = selectedCombination?.usd_sale_price && Number(selectedCombination.usd_sale_price) > 0
//       ? Number(selectedCombination.usd_sale_price)
//       : Number(selectedCombination?.usd_price || productData.usd_price);

//     const productToAdd = {
//       ...productData,
//       selectedVariant: selectedVariant,
//       quantity,
//       variantPrice: {
//         price: effectivePrice,
//         usd_price: effectiveUsdPrice,
//       },
//       price: currency === "USD" ? (selectedCombination?.usd_price || productData.usd_price) : (selectedCombination?.price || productData.price),
//       usd_price: selectedCombination?.usd_price || productData.usd_price,
//       sale_price: selectedCombination?.sale_price && Number(selectedCombination.sale_price) > 0
//         ? selectedCombination.sale_price
//         : (selectedCombination?.price || productData.sale_price || productData.price),
//       usd_sale_price: selectedCombination?.usd_sale_price && Number(selectedCombination.usd_sale_price) > 0
//         ? selectedCombination.usd_sale_price
//         : (selectedCombination?.usd_price || productData.usd_sale_price || productData.usd_price),
//     };

//     props.addToCart(productToAdd, quantity);
//     setErrorMessage("");
//   }

//   function onWishlistClick(e) {
//     e.preventDefault();
//     if (!isInWishlist(wishlist, product)) {
//       props.addToWishlist(product);
//     } else {
//       router.push("/pages/wishlist");
//     }
//   }

//   const handleApply = async () => {
//     if (!pincode) {
//       setPincodeMessage("Please enter a pincode");
//       return;
//     }
//     if (!/^\d{6}$/.test(pincode)) {
//       setPincodeMessage("Pincode must be exactly 6 digits");
//       return;
//     }

//     try {
//       const response = await checkPincode(pincode);
//       if (!response || typeof response !== "object") {
//         setPincodeMessage("Invalid response from server");
//         return;
//       }
//       if (response.success) {
//         setPincodeMessage(
//           response.deliveredDate
//             ? `Delivery in ${response.data} days`
//             : response.message || "Delivery available"
//         );
//       } else {
//         setPincodeMessage(response.message || "Delivery not available");
//       }
//     } catch (error) {
//       setPincodeMessage("Failed to check pincode. Please try again.");
//       console.error("Pincode check error:", error);
//     }
//   };

//   // Validate prices
//   const { displayPrice, displaySalePrice } = getDisplayPrices();
//   if (displayPrice < 0 || displaySalePrice < 0) {
//     setErrorMessage("Invalid price data");
//     return (
//       <div className="error-message" style={{ color: "red", padding: "20px" }}>
//         Error: Invalid price data
//       </div>
//     );
//   }

//   function getMissingOptions() {
//     return variantOptions
//       .filter(
//         (opt) =>
//           !selectedVariant.find(
//             (v) => v.option.toLowerCase() === opt.option.toLowerCase()
//           )
//       )
//       .map((opt) => opt.option);
//   }

//   return (
//     <div className="product-details" ref={ref}>
//       <h1 className="product-title">{productData.name}</h1>
//       <div className="ratings-container">
//         <div className="ratings">
//           <div
//             className="ratings-val"
//             style={{ width: (Number(productData.rating) || 0) * 20 + "%" }}
//           ></div>
//           <span className="tooltip-text">
//             {(Number(productData.rating) || 0).toFixed(2)}
//           </span>
//         </div>
//       </div>

//       <div className="product-price">
//         {productData.is_sale_product && displaySalePrice > 0 ? (
//           <>
//             <span className="new-price">
//               {getCurrencySymbol(currency)}
//               {displaySalePrice.toFixed(2)}
//             </span>
//             <span className="old-price">
//               {getCurrencySymbol(currency)}
//               {displayPrice.toFixed(2)}
//             </span>
//           </>
//         ) : (
//           <span>
//             {getCurrencySymbol(currency)}
//             {displayPrice.toFixed(2)}
//           </span>
//         )}
//       </div>



//       {/* <div className="product-content">
//         <p>
//           {productData.description
//             ? productData.description.replace(/<[^>]*>/g, "").trim()
//             : "No description available"}
//         </p>
//       </div> */}

//       <div className="product-content">
//   {productData.description ? (
//     <div
//       dangerouslySetInnerHTML={{ __html: productData.description }}
//     />
//   ) : (
//     <p>No description available</p>
//   )}
// </div>


//       {variantOptions.length > 0 ? (
//         variantOptions.map((option, index) => (
//           <div key={index} className="details-filter-row details-row-size">
//             <label>
//               {option.option.charAt(0).toUpperCase() + option.option.slice(1)}:
//             </label>
//             {option.values.length === 1 ? (
//               <span className="variant-value">
//                 {option.values[0].charAt(0).toUpperCase() + option.values[0].slice(1)}
//               </span>
//             ) : option.option.toLowerCase() === "color" ? (
//               <div className="product-nav product-nav-dots">
//                 {option.values.map((color, i) => (
//                   <a
//                     key={i}
//                     className={
//                       selectedVariant.find(
//                         (v) => v.option.toLowerCase() === "color"
//                       )?.value === color
//                         ? "active"
//                         : ""
//                     }
//                     style={{ backgroundColor: color }}
//                     onClick={() => selectVariant("color", color)}
//                     title={color}
//                   ></a>
//                 ))}
//               </div>
//             ) : (
//               <div className="select-custom">
//                 <select
//                   name={option.option}
//                   className="form-control"
//                   onChange={(e) => selectVariant(option.option, e.target.value)}
//                   value={
//                     selectedVariant.find(
//                       (v) => v.option.toLowerCase() === option.option.toLowerCase()
//                     )?.value || ""
//                   }
//                 >
//                   <option value="">Select a {option.option}</option>
//                   {option.values.map((value, i) => (
//                     <option key={i} value={value}>
//                       {value.toUpperCase()}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>
//         ))
//       ) : (
//         <div className="details-filter-row details-row-size">
//           <label>Variants:</label>
//           <span>No variants available</span>
//         </div>
//       )}

//       <div className="details-filter-row details-row-size">
//         <label htmlFor="qty">Qty:</label>
//         <Qty
//           changeQty={(value) => {
//             const maxStock = getSelectedCombination()?.available
//               ? Number(getSelectedCombination().available)
//               : Number(productData.stock) || 1;
//             if (!Number.isInteger(value) || value <= 0) {
//               setErrorMessage("Quantity must be a positive integer");
//               return;
//             }
//             if (value > maxStock) {
//               setErrorMessage(`Maximum available quantity is ${maxStock}`);
//               return;
//             }
//             setQty(value);
//             setErrorMessage("");
//           }}
//           max={
//             getSelectedCombination()?.available
//               ? Number(getSelectedCombination().available)
//               : Number(productData.stock) || 1
//           }
//           value={qty}
//         />
//       </div>

//       {availabilityMessage && (
//         <div className="details-filter-row details-row-size">
//           <label>Availability:</label>
//           <span
//             style={{
//               color: availabilityMessage === "Available" ? "green" : "red",
//               fontWeight: "semibold",
//               marginLeft: "10px",
//             }}
//           >
//             {availabilityMessage}
//           </span>
//         </div>
//       )}

//       {errorMessage && (
//         <div className="error-message" style={{ color: "red", margin: "10px 0" }}>
//           {errorMessage}
//         </div>
//       )}

//       <div className="product-details-action">
//         <a
//           href="#"
//           className={`btn-product btn-cart ${!canAddToCart() ? "btn-disabled" : ""}`}
//           onClick={(e) => onCartClick(e)}
//         >
//           <span>Add to Cart</span>
//         </a>
//         <div className="details-action-wrapper">
//           {isInWishlist(wishlist, product) ? (
//             <ALink
//               href="/shop/wishlist"
//               className="btn-product-icon btn-wishlist added-to-wishlist"
//             >
//               <span>Go to Wishlist</span>
//             </ALink>
//           ) : (
//             <a
//               href="#"
//               className="btn-product-icon btn-wishlist"
//               onClick={onWishlistClick}
//             >
//               <span>Add to Wishlist</span>
//             </a>
//           )}
//         </div>
//       </div>

//       <div className="product-cat">
//         <span>Category:</span>
//         <span>{productData.category_name || "Uncategorized"}</span>
//       </div>

//       <div className="pincode-container">
//         <label htmlFor="pincode-input" className="visually-hidden">
//           Enter your delivery pincode
//         </label>
//         <input
//           id="pincode-input"
//           type="text"
//           value={pincode}
//           onChange={(e) => {
//             const value = e.target.value;
//             if (/^\d{0,6}$/.test(value)) {
//               setPincode(value);
//               setPincodeMessage("");
//             } else {
//               setPincodeMessage("Pincode must contain only digits");
//             }
//           }}
//           placeholder="Enter delivery pincode"
//           className="pincode-input"
//           maxLength={6}
//         />
//         <button
//           onClick={handleApply}
//           className="apply-button"
//           aria-label="Check delivery availability"
//           disabled={pincode.length !== 6}
//         >
//           Check
//         </button>
//       </div>
//       <hr className="divider" />

//       {pincodeMessage && (
//         <div
//           className="message"
//           style={{
//             color: pincodeMessage.includes("Product available") ? "green" : "red",
//             margin: "10px 0",
//           }}
//         >
//           {pincodeMessage}
//         </div>
//       )}
//     </div>
//   );
// }

// const mapStateToProps = (state) => ({
//   cartlist: state.cartlist.data,
//   wishlist: state.wishlist.data,
//   state: state,
// });

// export default connect(mapStateToProps, {
//   ...wishlistAction,
//   ...cartAction,
// })(DetailOne);