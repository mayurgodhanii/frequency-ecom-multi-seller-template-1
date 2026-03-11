import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import ALink from "~/components/features/alink";
import { actions } from "~/store/cart";
import { apirequest, getToken } from "~/utils/api";
import { getCurrencySymbol } from "~/utils/index";
import Cookies from 'js-cookie';

function CartMenu(props) {
  const [cartList, setCartList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currency = Cookies.get('currency');

  useEffect(() => {
    setCartList(props.cartlist); // Sync Redux cart to local state
  }, [props.cartlist]);

  const fetchCartList = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      let url = "";
      const params = {};

      if (!token || token === "null") {
        const cartUniId = localStorage.getItem("cart_uni_id") || "";
        url = `/user/carts-list`;
        params.cart_uni_id = cartUniId;
      } else {
        url = `/user/cart-list`;
        params.couponId = "";
      }

      const response = await apirequest("GET", url, null, params);

      if (response.success) {
        setCartList(response.data || []);
      } else {
        throw new Error("Failed to fetch cart list");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      props.updateCart(cartList);
    }, 400);

    return () => clearTimeout(timer);
  }, [cartList]);

  const handleMouseEnter = () => {
    if (!loading) {
      fetchCartList();
    }
  };

  // Calculate total based on selected currency
  const getCartTotal = () => {
    return cartList.reduce((acc, item) => {
      const price =
        currency === "USD"
          ? parseFloat(item.selected_variant_usd_price || 0)
          : parseFloat(item.selected_variant_price || 0);
      return acc + item.quantity * price;
    }, 0);
  };

  return (
         <div className="header-forth">
    <div className="dropdown cart-dropdown" onMouseEnter={handleMouseEnter}>
      <ALink
        href="/shop/cart"
        className="dropdown-toggle"
        role="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        data-display="static"
      >
        <i className="icon-shopping-cart"></i>
        <span className="cart-count">{cartList.length}</span>
      </ALink>

      <div
        className={`dropdown-menu dropdown-menu-right ${cartList.length === 0 ? "text-center" : ""
          }`}
      >
        {loading ? (
          <p>Loading cart...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : cartList.length === 0 ? (
          <p>No products in the cart.</p>
        ) : (
          <>
            <div className="dropdown-cart-products">
              {cartList.map((item, index) => {
                const isUSD = currency === "USD";
                const price = isUSD
                  ? item.selected_variant_usd_price || item.total_usd_price || 0
                  : item.selected_variant_price || item.total_price || 0;

                return (
                  <div className="product justify-content-between" key={index}>
                    <div className="product-cart-details">
                      <h4 className="product-title">
                        <ALink href={`/product/${item.product_id}`}>
                          {item?.productDetails?.name || item?.name}
                        </ALink>
                      </h4>

                      <span className="cart-product-info">
                        <span className="cart-product-qty">
                          {item.quantity} x {getCurrencySymbol(currency)}
                          {parseFloat(price).toFixed(2)}
                        </span>
                      </span>
                    </div>

                    <figure className="product-image-container ml-2">
                      <ALink
                        href={`/product/${item.product_id}`}
                        className="product-image"
                      >
                        <img
                          src={
                            item?.productDetails?.image?.[0] ||
                            item?.image?.[0]
                          }
                          alt="product"
                        />
                      </ALink>
                    </figure>

                    <button
                      className="btn-remove"
                      title="Remove Product"
                      onClick={() => props.removeFromCart(item)}
                    >
                      <i className="icon-close"></i>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="dropdown-cart-total">
              <span>Total</span>
              <span className="cart-total-price">
                {getCurrencySymbol(currency)}
                {getCartTotal().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="dropdown-cart-action">
              <ALink href="/shop/cart" className="btn btn-primary">
                View Cart
              </ALink>
              <ALink
                href="/shop/checkout"
                className="btn btn-outline-primary-2"
              >
                <span>Checkout</span>
                <i className="icon-long-arrow-right"></i>
              </ALink>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    cartlist: state.cartlist.data,
  };
}

export default connect(mapStateToProps, { ...actions })(CartMenu);
