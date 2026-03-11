import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";

import ALink from "~/components/features/alink";

import { actions as wishlistAction } from "~/store/wishlist";
import { actions as cartAction } from "~/store/cart";
import { actions as compareAction } from "~/store/compare";
import { actions as demoAction } from "~/store/demo";

import { isInWishlist, isInCompare, getCurrencySymbol } from "~/utils";
import Cookies from "js-cookie";

function ProductSix(props) {
  const router = useRouter();
  const { product, wishlist } = props;
  const currency = Cookies.get("currency") || "USD";

  const getPrice = (key) =>
    currency === "USD" ? product[`usd_${key}`] : product[key];

  const [minPrice, setMinPrice] = useState(
    parseFloat(getPrice("sale_price")) || parseFloat(getPrice("price"))
  );
  const [maxPrice, setMaxPrice] = useState(
    parseFloat(getPrice("price")) || parseFloat(getPrice("sale_price"))
  );

  useEffect(() => {
      let min = parseFloat(getPrice("sale_price")) || parseFloat(getPrice("price"));
      let max = parseFloat(getPrice("price")) || parseFloat(getPrice("sale_price"));
  
      if (product?.variant_json?.combinations) {
        product?.variant_json?.combinations.forEach((combination) => {
          combination?.variants?.forEach((variant) => {
            const variantPrice = parseFloat(
              currency === "USD" ? variant?.usd_price : variant?.price
            );
            if (!isNaN(variantPrice)) {
              min = Math.min(min, variantPrice);
              max = Math.max(max, variantPrice);
            }
          });
        });
      }
  
      setMinPrice(min);
      setMaxPrice(max);
    }, [product, currency]);
    
  function onCartClick(e) {
    e.preventDefault();
    props.addToCart(product);
  }

  function onWishlistClick(e) {
    e.preventDefault();
    if (!isInWishlist(wishlist, product)) {
      props.addToWishlist(product);
    } else {
      router.push("/pages/wishlist");
    }
  }

  const symbol = getCurrencySymbol(currency);
  const hasSale = !!getPrice("sale_price") && parseFloat(getPrice("sale_price")) > 0;

  return (
    <div className="product product-5 text-center">
      <figure className="product-media">
        {product.new && <span className="product-label label-new">New</span>}
        {hasSale && <span className="product-label label-sale">Sale</span>}
        {product.top && <span className="product-label label-top">Top</span>}
        {!product.stock && <span className="product-label label-out">Out of Stock</span>}

        <ALink href={`/product/${product.slug}`}>
          <LazyLoadImage
            alt="product"
            src={product.image[0]}
            threshold={500}
            effect="black and white"
            wrapperClassName="product-image"
          />
          {product.image.length > 1 && (
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
              <span>Go to wishlist</span>
            </ALink>
          ) : (
            <a
              href="#"
              className="btn-product-icon btn-wishlist btn-expandable"
              onClick={onWishlistClick}
            >
              <span>Add to wishlist</span>
            </a>
          )}
        </div>

        {product.stock > 0 && (
          <div className="product-action">
            {product?.variant_json?.options?.length > 0 ? (
              <ALink
                href={`/product/${product.slug}`}
                className="btn-product btn-cart btn-select"
              >
                <span>Select options</span>
              </ALink>
            ) : (
              <button className="btn-product btn-cart" onClick={onCartClick}>
                <span>Add to cart</span>
              </button>
            )}
          </div>
        )}
      </figure>

      <div className="product-body">
        <h3 className="product-title">
          <ALink href={`/product/${product.slug}`}>{product.name}</ALink>
        </h3>

        <div className="product-price">
          {hasSale ? (
            <>
              <span className="new-price">
                {symbol}
                {parseFloat(getPrice("sale_price")).toFixed(2)}
              </span>
              <span className="old-price">
                {symbol}
                {parseFloat(getPrice("price")).toFixed(2)}
              </span>
            </>
          ) : (
            <span>
              {symbol}
              {parseFloat(getPrice("price")).toFixed(2)}
            </span>
          )}
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
})(ProductSix);
