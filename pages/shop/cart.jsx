import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ALink from "~/components/features/alink";
import Qty from "~/components/features/qty";
import PageHeader from "~/components/features/page-header";

import { actions as cartAction } from "~/store/cart";
import { cartPriceTotal, getCurrencySymbol } from "~/utils/index";
import { apirequest } from "~/utils/api";
import Helmet from "react-helmet";
import Cookies from 'js-cookie';
import Loader from "~/components/Loader";

function Cart(props) {
  const [cartList, setCartList] = useState([]);
const spaceName = Cookies.get("spaceName");
  const [response, setResponse] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currency = Cookies.get('currency');
  useEffect(() => {
    setCartList(props.cartItems);
  }, [props.cartItems]);
  const couponId = "";

  useEffect(() => {
    const fetchCartList = async () => {
      try {
        const token = props.token;

        // Redirect to login if no token (multivendor requires authentication)
        if (!token || token === "null") {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }

        const url = `/cart/list`;
        const params = {
          couponId: ""        };

        const response = await apirequest("GET", url, null, params);

        if (response.success) {
          // Extract cart items from nested data structure
          const cartItems = response.data?.data || [];
          setCartList(cartItems);
          setResponse(response.data || {});
        } else {
          throw new Error("Failed to fetch cart list");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCartList();
  }, [props.token]);

  function onChangeShipping(value) {
    setShippingCost(value);
  }

  function changeQty(value, index) {
    const updatedItem = {
      cart_id: cartList[index].id,
      quantity: value,
      variant: cartList[index].variant || {},
      selected_variant_price: cartList[index].selected_variant_price,
      selected_variant_usd_price: cartList[index].selected_variant_usd_price
    };

    setCartList(
      cartList.map((item, ind) => {
        if (ind === index) {
          return {
            ...item,
            quantity: value,
            total_price: (item.selected_variant_price || 0) * value,
          };
        }
        return item;
      })
    );

    updateCartAPI(updatedItem)
      .then((response) => {
      })
      .catch((err) => {
        console.error("Error updating cart:", err);
      });
  }

  const updateCartAPI = async (cartItem) => {
    const token = props.token;

    if (!token || token === "null") {
      throw new Error("Authentication required");
    }

    try {
      const response = await apirequest("PUT", "/cart/update-quantity", cartItem);
      return response;
    } catch (error) {
      console.error("Update cart API error:", error.message || error);
      throw error;
    }
  };
  //.

  function updateCart(e) {
    let button = e.currentTarget;
    button.querySelector(".icon-refresh").classList.add("load-more-rotating");

    setTimeout(() => {
      props.updateCart(cartList);
      button
        .querySelector(".icon-refresh")
        .classList.remove("load-more-rotating");
    }, 400);
  }

  // Remove automatic cart updates - only update when user explicitly changes quantities
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     props.updateCart(cartList);
  //   }, 400);

  //   return () => clearTimeout(timer);
  // }, [cartList]);

  if (loading) {
    return <div><Loader /></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="main">
      <Helmet>
        <title>Cart | {spaceName}</title>

        <meta name="description" content="Cart" />
      </Helmet>

      <PageHeader title="Shopping Cart" subTitle="Shop" />
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/shop/list">Shop</ALink>
            </li>
            <li className="breadcrumb-item active">Shopping Cart</li>
          </ol>
        </div>
      </nav>

      <div className="page-content pb-5">
        <div className="cart">
          <div className="container">
            {cartList.length > 0 ? (
              <div className="row">
                <div className="col-lg-9">
                  <table className="table table-cart table-mobile">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {cartList.length > 0 ? (
                        cartList.map((item, index) => (
                          <tr key={index}>
                            <td className="product-col">
                              <div className="product">
                                <figure className="product-media">
                                  <div className="product-image">
                                    <img
                                      src={
                                        item?.product?.image?.[0] ||
                                        item?.images?.[0] ||
                                        '/images/placeholder.jpg'
                                      }
                                      alt="product"
                                    />
                                  </div>
                                </figure>

                                <div className="product-info">
                                  <h4 className="product-title">
                                    <div>{item?.product?.name || item?.name || 'Product'}</div>
                                  </h4>

                                  {/* <h4 className="product-variant">
                                    <div>
                                      {item?.variant?.find(
                                        (v) => v.option === "color"
                                      )?.value &&
                                        item?.variant?.find(
                                          (v) => v.option === "size"
                                        )?.value
                                        ? `${item?.variant.find(
                                          (v) => v.option === "color"
                                        )?.value
                                        } / ${item?.variant.find(
                                          (v) => v.option === "size"
                                        )?.value
                                        }`
                                        : "Default"}
                                    </div>
                                  </h4> */}


                                   <h4 className="product-variant">
  <div className="text-sm text-gray-700">
    {item?.variant && item.variant.length > 0 ? (
      item.variant.map((v, index) => (
        <span key={index} className="mr-2 capitalize">
          {v.option}: {v.value}
        </span>
      ))
    ) : (
      "Default"
    )}
  </div>
</h4>
                                </div>
                              </div>
                            </td>

                            {/* <td className="price-col">
                              {getCurrencySymbol(currency)}
                              {item?.sale_price
                                ? item.sale_price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : item.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                            </td> */}

                            <td className="price-col">
                              {(() => {
                                const isUSD = currency === "USD";
                                const price = isUSD ? item.selected_variant_usd_price : item.selected_variant_price;
                                const salePrice = isUSD ? item.usd_sale_price : item.sale_price;

                                const hasValidSalePrice = Number(salePrice) > 0;
                                const hasValidPrice = Number(price) > 0;

                                if (hasValidSalePrice && hasValidPrice) {
                                  return (
                                    <>
                                      <span className="new-price">
                                        {getCurrencySymbol(currency)}
                                        {Number(salePrice).toFixed(2)}
                                      </span>
                                      <br />
                                      <span className="old-price text-muted" style={{ textDecoration: "line-through", fontSize: "0.9rem" }}>
                                        {getCurrencySymbol(currency)}
                                        {Number(price).toFixed(2)}
                                      </span>
                                    </>
                                  );
                                } else {
                                  return (
                                    <span>
                                      {getCurrencySymbol(currency)}
                                      {(Number(price || salePrice) || 0).toFixed(2)}
                                    </span>
                                  );
                                }
                              })()}
                            </td>


                            <td className="quantity-col">
                              <Qty
                                value={item.quantity}
                                changeQty={(current) =>
                                  changeQty(current, index)
                                }
                                adClass="cart-product-quantity"
                                max={item?.stock || 10000}
                              />
                            </td>

                            {/* <td className="total-col">
                              {getCurrencySymbol(currency)}
                              {(
                                item.total_price || item.price * item.quantity
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td> */}

                            <td className="total-col">
                              {(() => {
                                const isUSD = currency === "USD";
                                const price = isUSD ? item.selected_variant_usd_price : item.selected_variant_price;
                                const salePrice = isUSD ? item.usd_sale_price : item.sale_price;

                                const finalPrice =
                                  Number(salePrice) > 0 && Number(price) > 0
                                    ? Number(salePrice)
                                    : Number(price || salePrice) || 0;

                                return (
                                  <>
                                    {getCurrencySymbol(currency)}
                                    {(finalPrice * item.quantity).toFixed(2)}
                                  </>
                                );
                              })()}
                            </td>


                            <td className="remove-col">
                              <button
                                className="btn-remove"
                                onClick={() => props.removeFromCart(item)}
                              >
                                <i className="icon-close"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No Products in Cart
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="cart-bottom">


                    <button
                      className="btn btn-outline-dark-2"
                      onClick={updateCart}
                    >
                      <span>UPDATE CART</span>
                      <i className="icon-refresh"></i>
                    </button>
                  </div>
                </div>
                <aside className="col-lg-3">
                  <div className="summary summary-cart">
                    <h3 className="summary-title">Cart Total</h3>

                    <table className="table table-summary">
                      <tbody>
                        <tr className="summary-subtotal">
                          <td>Subtotal:</td>
                          <td>
                            {getCurrencySymbol(currency)}
                            {(() => {
                              const subtotal = cartList.reduce((acc, item) => {
                                const isUSD = currency === 'USD';
                                const price = isUSD 
                                  ? (item.selected_variant_usd_price || item.usd_price || 0)
                                  : (item.selected_variant_price || item.price || 0);
                                return acc + (price * item.quantity);
                              }, 0);
                              return subtotal.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              });
                            })()}
                          </td>
                        </tr>
                        <tr className="summary-shipping">
                        <td>Shipping:</td> <td>{response.delivery}</td>
                        {/* <td>&nbsp;</td> */}
                        </tr>


                        <tr className="summary-total">
                          <td>Total:</td>
                          <td>
                            {getCurrencySymbol(currency)}
                            {(() => {
                              const subtotal = cartList.reduce((acc, item) => {
                                const isUSD = currency === 'USD';
                                const price = isUSD 
                                  ? (item.selected_variant_usd_price || item.usd_price || 0)
                                  : (item.selected_variant_price || item.price || 0);
                                return acc + (price * item.quantity);
                              }, 0);
                              const total = subtotal + shippingCost;
                              return total.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              });
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <ALink
                      href="/shop/checkout"
                      className="btn btn-outline-primary-2 btn-order btn-block"
                    >
                      PROCEED TO CHECKOUT
                      <i className="icon-long-arrow-right"></i>
                    </ALink>
                  </div>
                  <ALink
                    href="/"
                    className="btn btn-outline-dark-2 btn-block mb-3"
                  >
                    <span>CONTINUE SHOPPING</span>
                    <i className="icon-refresh"></i>
                  </ALink>
                </aside>
              </div>
            ) : (
              <div className="row">
                <div className="col-12">
                  <div className="cart-empty-page text-center">
                    <i
                      className="cart-empty icon-shopping-cart"
                      style={{ lineHeight: 1, fontSize: "15rem" }}
                    ></i>
                    <p className="px-3 py-2 cart-empty mb-3">
                      No products added to the cart
                    </p>
                    <p className="return-to-shop mb-0">
                      <ALink href="/shop/list" className="btn btn-primary">
                        RETURN TO SHOP
                      </ALink>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  cartItems: state.cartlist.data,
  token: state.auth.token,
});

export default connect(mapStateToProps, { ...cartAction })(Cart);
