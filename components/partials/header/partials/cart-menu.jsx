import { connect } from "react-redux";
import ALink from "~/components/features/alink";
import { actions } from "~/store/cart";
import { apirequest } from "~/utils/api";
import React, { useState, useEffect } from "react";
import { getToken } from "~/utils/api";
import { getCurrencySymbol } from "~/utils/index";
import Cookies from "js-cookie";

function CartMenu(props) {
  const [cartList, setCartList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currency = Cookies.get("currency");

  useEffect(() => {
    setCartList(props.cartlist); // Sync with Redux store
  }, [props.cartlist]);

  const fetchCartList = async () => {
    const token = getToken();
    
    // Don't call API if no token (user not logged in)
    if (!token || token === "null") {
      setCartList([]);
      return;
    }
    
    setLo
    ;
    setError(null);
    try {
      const url = `/cart/list`;
      const params = {
        couponId: "",
      };

      const response = await apirequest("GET", url, null, params);

      if (response.success) {
        // Extract the actual cart items from the nested data structure
        const cartItems = response.data?.data || [];
        setCartList(cartItems);
      } else {
        throw new Error("Failed to fetch cart list");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic cart updates - only update when user explicitly changes quantities
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     props.updateCart(cartList);
  //   }, 400);
  //   return () => clearTimeout(timer);
  // }, [cartList]);

  const handleMouseEnter = () => {
    const token = getToken();
    
    // Only fetch cart if user is logged in
    if (token && token !== "null" && !loading) {
      fetchCartList();
    }
  };

  const getItemPrice = (item) => {
    if (currency === "USD") {
      return item.selected_variant_usd_price || item.usd_price || item.price || 0;
    }
    return item.selected_variant_price || item.price || 0;
  };

  const getTotalPrice = () => {
    return cartList.reduce((acc, item) => {
      const price = getItemPrice(item);
      return acc + (item.quantity * price);
    }, 0);
  };

  return (
     <div className="header-one">
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
        <div className="icon">
          <i className="icon-shopping-cart"></i>
          <span className="cart-count">{cartList.length}</span>
        </div>
        <p>Cart</p>
      </ALink>

      <div
        className={`dropdown-menu dropdown-menu-right ${cartList.length === 0 ? "text-center" : ""}`}
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
              {cartList.map((item, index) => (
                <div className="product justify-content-between" key={index}>
                  <div className="product-cart-details">
                    <h4 className="product-title">
                      <ALink href={`/product/${item.product?.slug || item.product_id}`}>
                        {item?.product?.name || item?.name || 'Product'}
                      </ALink>
                    </h4>
                    <span className="cart-product-info">
                      <span className="cart-product-qty">
                        {item.quantity} x {getCurrencySymbol(currency)}
                        {parseFloat(getItemPrice(item)).toFixed(2)}
                      </span>
                    </span>
                  </div>

                  <figure className="product-image-container ml-2">
                    <ALink
                      href={`/product/${item.product?.slug || item.product_id}`}
                      className="product-image"
                    >
                      <img
                        src={item?.product?.image?.[0] || item?.image?.[0] || '/images/placeholder.jpg'}
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
              ))}
            </div>

            <div className="dropdown-cart-total">
              <span>Total</span>
              <span className="cart-total-price">
                {getCurrencySymbol(currency)}
                {getTotalPrice().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="dropdown-cart-action">
              <ALink href="/shop/cart" className="btn btn-primary">
                View Cart
              </ALink>
              <ALink href="/shop/checkout" className="btn btn-outline-primary-2">
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










// import { connect } from "react-redux";
// import ALink from "~/components/features/alink";
// import { actions } from "~/store/cart";
// import { cartQtyTotal, cartPriceTotal } from "~/utils/index";
// import { apirequest } from "~/utils/api";
// import React, { useState, useEffect } from "react";
// import { getToken } from "~/utils/api";
// import { getCurrencySymbol } from "~/utils/index";
// import Cookies from 'js-cookie';


// function CartMenu(props) {
//   const [cartList, setCartList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const currency = Cookies.get('currency');

//   useEffect(() => {
//     setCartList(props.cartlist); // Sync with Redux store
//   }, [props.cartlist]);

//   const fetchCartList = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const token = getToken();
//       let url = "";
//       const params = {};

//       if (!token || token === "null") {
//         const cartUniId = localStorage.getItem("cart_uni_id") || "";

//         url = `/user/carts-list`;
//         params.cart_uni_id = cartUniId;
//       } else {
//         url = `/user/cart-list`;
//         params.couponId = "";
//       }

//       const response = await apirequest("GET", url, null, params);

//       if (response.success) {
//         setCartList(response.data || []);
//       } else {
//         throw new Error("Failed to fetch cart list");
//       }
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       props.updateCart(cartList);
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [cartList]);

//   const handleMouseEnter = () => {
//     if (!loading) {
//       fetchCartList();
//     }
//   };

//   return (
//     <div className="dropdown cart-dropdown" onMouseEnter={handleMouseEnter}>
//       <ALink
//         href="/shop/cart"
//         className="dropdown-toggle"
//         role="button"
//         data-toggle="dropdown"
//         aria-haspopup="true"
//         aria-expanded="false"
//         data-display="static"
//       >
//         <div className="icon">
//           <i className="icon-shopping-cart"></i>
//           <span className="cart-count">{cartList.length}</span>
//         </div>
//         <p>Cart</p>
//       </ALink>

//       <div
//         className={`dropdown-menu dropdown-menu-right ${cartList.length === 0 ? "text-center" : ""}`}
//       >
//         {loading ? (
//           <p>Loading cart...</p>
//         ) : error ? (
//           <p>Error: {error}</p>
//         ) : cartList.length === 0 ? (
//           <p>No products in the cart.</p>
//         ) : (
//           <>
//             <div className="dropdown-cart-products">
//               {cartList.map((item, index) => (
//                 <div className="product justify-content-between" key={index}>
//                   <div className="product-cart-details">
//                     <h4 className="product-title">
//                       <ALink href={`/product/${item.product_id}`}>
//                         {item?.productDetails?.name || item?.name}
//                       </ALink>
//                     </h4>

//                     <span className="cart-product-info">
//                       <span className="cart-product-qty">
//                         {item.quantity} x {getCurrencySymbol(currency)}
//                         {parseFloat(
//                           item.is_sale_product === true
//                             ? item.sale_price
//                             : item.price
//                         ).toFixed(2)}
//                       </span>
//                     </span>
//                   </div>

//                   <figure className="product-image-container ml-2">
//                     <ALink
//                       href={`/product/${item.product_id}`}
//                       className="product-image"
//                     >
//                       <img
//                         src={item?.productDetails?.image?.[0] || item?.image?.[0]}
//                         alt="product"
//                       />
//                     </ALink>
//                   </figure>
//                   <button
//                     className="btn-remove"
//                     title="Remove Product"
//                     onClick={() => props.removeFromCart(item)}
//                   >
//                     <i className="icon-close"></i>
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <div className="dropdown-cart-total">
//               <span>Total</span>
//               <span className="cart-total-price">
//               {getCurrencySymbol(currency)}
//                 {cartList
//                   .reduce((acc, item) => acc + item.quantity * item.price, 0)
//                   .toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//               </span>
//             </div>

//             {/* <div className="dropdown-cart-action">
//               <ALink href="/shop/cart" className="btn btn-primary">
//                 View Cart
//               </ALink>
//             </div> */}
//                 <div className="dropdown-cart-action">
//               <ALink href="/shop/cart" className="btn btn-primary">
//                 View Cart
//               </ALink>
//               <ALink
//                 href="/shop/checkout"
//                 className="btn btn-outline-primary-2"
//               >
//                 <span>Checkout</span>
//                 <i className="icon-long-arrow-right"></i>
//               </ALink>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// function mapStateToProps(state) {
//   return {
//     cartlist: state.cartlist.data,
//   };
// }

// export default connect(mapStateToProps, { ...actions })(CartMenu);
