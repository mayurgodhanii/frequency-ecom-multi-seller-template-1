import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";

import ALink from "~/components/features/alink";
import { actions as wishlistAction } from "~/store/wishlist";
import { actions as cartAction } from "~/store/cart";
import { actions as compareAction } from "~/store/compare";
import { actions as demoAction } from "~/store/demo";

import { isInWishlist, isInCompare } from "~/utils";
import { getCurrencySymbol } from "~/utils";
import Cookies from "js-cookie";

function ProductEleven(props) {
  const router = useRouter();
  const { product, wishlist } = props;

  const currency = Cookies.get("currency") || "INR";
  const isWholesale = Cookies.get("wholesale_status") === "approved";

  const [minPrice, setMinPrice] = useState(99999);
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    let min = 99999;
    let max = 0;

    const getPrice = (item) => {
      if (isWholesale) {
        return currency === "INR"
          ? parseFloat(item.wholesale_price || 0)
          : parseFloat(item.wholesale_usd_price || 0);
      }
      return currency === "INR"
        ? parseFloat(item.price || 0)
        : parseFloat(item.usd_price || 0);
    };

    // Variant-based Pricing
    if (
      product?.variant_json?.combinations &&
      product?.variant_json?.combinations?.length > 0
    ) {
      product.variant_json.combinations.forEach((combination) => {
        combination?.variants?.forEach((variant) => {
          const amount = getPrice(variant);
          if (amount > 0) {
            min = Math.min(min, amount);
            max = Math.max(max, amount);
          }
        });
      });
    } else {
      // Simple Product Pricing
      const price = getPrice(product);
      min = price;
      max = price;
    }

    setMinPrice(min);
    setMaxPrice(max);
  }, [product, currency, isWholesale]);

  const symbol = getCurrencySymbol(currency);

  const onCartClick = (e) => {
    e.preventDefault();
    props.addToCart(product);
  };

  const onWishlistClick = (e) => {
    e.preventDefault();
    if (!isInWishlist(props.wishlist, product)) {
      props.addToWishlist(product);
    } else {
      router.push("/shop/wishlist");
    }
  };

  // Final Display Price (Simple Product)
  const finalPrice = isWholesale
    ? currency === "INR"
      ? product.wholesale_price
      : product.wholesale_usd_price
    : currency === "INR"
    ? product.price
    : product.usd_price;

  const salePrice =
    !isWholesale &&
    (currency === "INR"
      ? product.sale_price
      : product.usd_sale_price);

  return (
    <div className="product product-7 text-center w-100">
      <figure className="product-media">
        {product.isWish && <span className="product-label label-new">New</span>}

        {/* ❌ Hide sale badge for wholesale users */}
        {!isWholesale && salePrice > 0 && (
          <span className="product-label label-sale">Sale</span>
        )}

        <ALink href={`/product/${product.slug}`}>
          <LazyLoadImage
            alt="product"
            src={product.image[0]}
            threshold={500}
            effect="black and white"
            wrapperClassName="product-image"
          />
          {product.image.length >= 2 && (
            <LazyLoadImage
              alt="product"
              src={product.image[1]}
              threshold={500}
              effect="black and white"
              wrapperClassName="product-image-hover"
            />
          )}
        </ALink>

        <div className="product-action-vertical">
          {isInWishlist(wishlist, product) ? (
            <ALink
              href="/shop/wishlist"
              className="btn-product-icon btn-wishlist btn-expandable added-to-wishlist"
            >
              <span>go to wishlist</span>
            </ALink>
          ) : (
            <a
              href="#"
              className="btn-product-icon btn-wishlist btn-expandable"
              onClick={onWishlistClick}
            >
              <span>add to wishlist</span>
            </a>
          )}
        </div>

        {product.stock > 0 && (
          <div className="product-action">
            {product?.variant_json?.combinations?.length > 0 ? (
              <ALink
                href={`/product/${product.slug}`}
                className="btn-product btn-cart btn-select"
              >
                <span>Select Options</span>
              </ALink>
            ) : (
              <button className="btn-product btn-cart" onClick={onCartClick}>
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        )}
      </figure>

      <div className="product-body">
        <div className="product-cat">
          {product.category_name && (
            <ALink href={`/product/${product.slug}`}>
              Category : {product.category_name}
            </ALink>
          )}
        </div>

        <h3 className="product-title">
          <ALink href={`/product/${product.slug}`}>{product.name}</ALink>
        </h3>

        {/* ==========================  
             PRICE DISPLAY  
        =========================== */}

        {product.stock > 0 ? (
          // 🔥 WHOLESALE — NO SALE PRICE EVER
          isWholesale ? (
            <div className="product-price">
              {symbol}
              {maxPrice.toFixed(2)}
            </div>
          ) : salePrice > 0 ? (
            <div className="product-price">
              <span className="new-price">
                {symbol}
                {salePrice}
              </span>
              <span className="old-price">
                {symbol}
                {finalPrice}
              </span>
            </div>
          ) : (
            <div className="product-price">
              {symbol}
              {finalPrice}
            </div>
          )
        ) : (
          // Out of stock
          <div className="product-price">
            {symbol}
            {finalPrice}
          </div>
        )}

        <div className="ratings-container">
          <div className="ratings">
            <div
              className="ratings-val"
              style={{ width: product.rating * 20 + "%" }}
            ></div>
            <span className="tooltip-text">{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  wishlist: state.wishlist.data,
  comparelist: state.comparelist.data,
});

export default connect(mapStateToProps, {
  ...wishlistAction,
  ...cartAction,
  ...compareAction,
  ...demoAction,
})(ProductEleven);
