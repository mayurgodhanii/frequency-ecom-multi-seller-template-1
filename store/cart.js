
// import { persistReducer } from "redux-persist";
// import storage from 'redux-persist/lib/storage';
// import { takeEvery } from "redux-saga/effects";
// import { toast } from 'react-toastify';

// export const actionTypes = {
//     addToCart: "ADD_TO_CART",
//     removeFromCart: "REMOVE_FROM_CART",
//     refreshStore: "REFRESH_STORE",
//     updateCart: "UPDATE_CART",
// };

// const initialState = {
//     data: []
// }

// const cartReducer = ( state = initialState, action ) => {
//     switch ( action.type ) {
//         case actionTypes.addToCart:
//             var findIndex = state.data.findIndex( item => item.id == action.payload.product.id );
//             let qty = action.payload.qty ? action.payload.qty : 1;
//             if ( findIndex !== -1 && action.payload.product.variants.length > 0 ) {
//                 findIndex = state.data.findIndex( item => item.name == action.payload.product.name );
//             }

//             if ( findIndex !== -1 ) {
//                 return {
//                     data: [
//                         ...state.data.reduce( ( acc, product, index ) => {
//                             if ( findIndex == index ) {
//                                 acc.push( {
//                                     ...product,
//                                     qty: product.qty + qty,
//                                     sum: ( action.payload.product.sale_price ? action.payload.product.sale_price : action.payload.product.price ) * ( product.qty + qty )
//                                 } );
//                             } else {
//                                 acc.push( product );
//                             }

//                             return acc;
//                         }, [] )
//                     ]
//                 }
//             } else {
//                 return {
//                     data: [
//                         ...state.data,
//                         {
//                             ...action.payload.product,
//                             qty: qty,
//                             price: action.payload.product.sale_price ? action.payload.product.sale_price : action.payload.product.price,
//                             sum: qty * ( action.payload.product.sale_price ? action.payload.product.sale_price : action.payload.product.price )
//                         }
//                     ]
//                 };
//             }
//         case actionTypes.removeFromCart:
//             return {
//                 data: [
//                     ...state.data.filter( item => {
//                         if ( item.id !== action.payload.product.id ) return true;
//                         if ( item.name !== action.payload.product.name ) return true;
//                         return false;
//                     } )
//                 ]
//             }

//         case actionTypes.updateCart:
//             return {
//                 data: [
//                     ...action.payload.cartItems
//                 ]
//             };
//         case actionTypes.refreshStore:
//             return initialState;

//         default:
//             return state;
//     }
// }

// export const actions = {
//     addToCart: ( product, qty = 1 ) => ( {
//         type: actionTypes.addToCart,
//         payload: {
//             product: product,
//             qty: qty
//         }
//     } ),

//     removeFromCart: ( product ) => ( {
//         type: actionTypes.removeFromCart,
//         payload: {
//             product: product
//         }
//     } ),

//     updateCart: ( cartItems ) => ( {
//         type: actionTypes.updateCart,
//         payload: {
//             cartItems: cartItems
//         }
//     } )
// }

// export function* cartSaga () {
//     yield takeEvery( actionTypes.addToCart, function* saga ( e ) {
//         toast.success( "Product added to Cart" );
//     } );

//     yield takeEvery( actionTypes.removeFromCart, function* saga ( e ) {
//         toast.success( "Product removed from Cart" );
//     } );

//     yield takeEvery( actionTypes.updateCart, function* saga ( e ) {
//         toast.success( "Cart updated successfully" );
//     } );
// }

// const persistConfig = {
//     keyPrefix: "frequency-",
//     key: "cart",
//     storage
// }

// export default persistReducer( persistConfig, cartReducer );

// import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import { takeEvery, call, put } from "redux-saga/effects";
// import { toast } from "react-toastify";
// import axios from "axios";

// export const actionTypes = {
//   addToCart: "ADD_TO_CART",
//   removeFromCart: "REMOVE_FROM_CART",
//   refreshStore: "REFRESH_STORE",
//   updateCart: "UPDATE_CART",
// };

// const initialState = {
//   data: [],
// };

// // Reducer for handling the cart state
// const cartReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case actionTypes.addToCart: {
//       const { product, qty = 1 } = action.payload;
//       if (!product) {
//         console.error("Invalid product in addToCart action.");
//         return state;
//       }

//       const existingIndex = state.data.findIndex(
//         (item) => item.id === product.id
//       );

//       if (existingIndex !== -1) {
//         return {
//           ...state,
//           data: state.data.map((item, index) =>
//             index === existingIndex
//               ? {
//                   ...item,
//                   qty: item.qty + qty,
//                   sum: (product.sale_price || product.price) * (item.qty + qty),
//                 }
//               : item
//           ),
//         };
//       }

//       return {
//         ...state,
//         data: [
//           ...state.data,
//           {
//             ...product,
//             qty,
//             price: product.sale_price || product.price,
//             sum: qty * (product.sale_price || product.price),
//           },
//         ],
//       };
//     }

//     case actionTypes.removeFromCart:
//       return {
//         ...state,
//         data: state.data.filter((item) => item.id !== action.payload.product.id),
//       };

//     case actionTypes.updateCart:
//       return {
//         ...state,
//         data: [...action.payload.cartItems],
//       };

//     case actionTypes.refreshStore:
//       return initialState;

//     default:
//       return state;
//   }
// };

// export const actions = {
//   addToCart: (product, qty = 1) => ({
//     type: actionTypes.addToCart,
//     payload: {
//       product: product,
//       qty: qty,
//     },
//   }),

//   removeFromCart: (product) => {
//     if (!product || !product.id) {
//       console.error("Invalid product for removal");
//       return { type: "INVALID_ACTION" };
//     }

//     return {
//       type: actionTypes.removeFromCart,
//       payload: {
//         product,
//       },
//     };
//   },

//   updateCart: (cartItems) => ({
//     type: actionTypes.updateCart,
//     payload: {
//       cartItems: cartItems,
//     },
//   }),
// };
// const API_URL = process.env.NEXT_PUBLIC_API_URL

// // API call functions
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI5LCJlbWFpbCI6InRlc3QuYW5xdWVzQGdtYWlsLmNvbSIsInJvbGVfaWQiOjIsInNpdGVfaWQiOiJPb2p2OUpCNEU2IiwiaWF0IjoxNzM1MDE1ODA4LCJleHAiOjE3MzUxMDIyMDh9.U85UJkRDqhtm8X3hE_jf4qgsNNnzl1a4rAUfRPpC1ho";
// // Add to cart API
// const addToCartAPI = async (product, qty) => {
//   const response = await axios.post(
//     `http://192.168.29.75:7997/user/cart-add`,
//     {
//       product_id: product.id,
//       quantity: qty,
//       variant: product.variants || [],
//     },
//     {
//       headers: {
//         "x-access-token": token,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// // Remove from cart API
// const removeFromCartAPI = async (id) => {
//   if (!id) {
//     throw new Error("Product ID is required for removal.");
//   }

//   const response = await axios.post(
//     `http://192.168.29.75:7997/user/cart-delete/${id}`,
//     {},
//     {
//       headers: {
//         "x-access-token": token,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// const updateCartAPI = async (cartItems) => {
//   // const token = localStorage.getItem('x-access-token'); // Fetch token from localStorage or other source
//   const response = await axios.post(
//     `${API_URL}/user/cart-edit`,
//     { cartItems },
//     {
//       headers: {
//         "x-access-token": token,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// export function* cartSaga() {
//   yield takeEvery(actionTypes.addToCart, function* saga(e) {
//     // debugger;
//     try {

//       const result = yield call(addToCartAPI, e.payload.product, e.payload.qty);

//       console.log(
//         "----------------------------------------------------",
//         result
//       );
//       toast.success("Product added to Cart");

//       // Optionally update the store based on the API response
//       yield put(actions.updateCart(result.cartItems));
//     } catch (error) {
//       toast.error("Failed to add product to cart");
//     }
//   });

//   yield takeEvery(actionTypes.removeFromCart, function* saga(e) {
//     try {

//       const result = yield call(removeFromCartAPI, e.payload.product.id);


//       toast.success("Product removed from Cart");
//       yield put(actions.updateCart(result.cartItems));
//     } catch (error) {
//       console.error("Remove from cart error:", error.response || error.message);
//       toast.error("Failed to remove product from cart");
//     }
//   });

//   yield takeEvery(actionTypes.updateCart, function* (action) {
//     try {
//       const result = yield call(updateCartAPI, action.payload.cartItems);
//       toast.success("Cart updated successfully");
//       yield put(actions.updateCart(result.cartItems));
//     } catch (error) {
//       toast.error("Failed to update cart");
//     }
//   });
// }

// const persistConfig = {
//   keyPrefix: "frequency-",
//   key: "cart",
//   storage,
// };

// export default persistReducer(persistConfig, cartReducer);

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { takeEvery, call, put } from "redux-saga/effects";
import { toast } from "react-toastify";
import axios from "axios";
import { apirequest, getToken } from "~/utils/api";

export const actionTypes = {
  addToCart: "ADD_TO_CART",
  removeFromCart: "REMOVE_FROM_CART",
  refreshStore: "REFRESH_STORE",
  updateCart: "UPDATE_CART",
  clearCart: "CLEAR_CART", // Add this line
};

const initialState = {
  data: [],
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.addToCart: {
      const { product, qty = 1 } = action.payload;
      if (!Array.isArray(state.data)) {
        console.error("Invalid state data, resetting to empty array.");
        return { ...state, data: [] };
      }

      if (!product) {
        console.error("Invalid product in addToCart action.");
        return state;
      }

      const existingIndex = state.data.findIndex(
        (item) => item.id === product.id
      );

      const price = product?.is_sale_product
        ? product?.sale_price
        : product?.price;
      const totalPrice = price * qty;

      if (existingIndex !== -1) {
        return {
          ...state,
          data: state.data.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  qty: item.qty + qty,
                  sum: price * (item.qty + qty),
                }
              : item
          ),
        };
      }

      return {
        ...state,
        data: [
          ...state.data,
          {
            ...product,
            qty,
            price,
            sum: totalPrice,
          },
        ],
      };
    }

    case actionTypes.removeFromCart: {
      return {
        ...state,
        data: state.data.filter(
          (item) => item.id !== action.payload.product.id
        ),
      };
    }

    case actionTypes.updateCart: {
      return {
        ...state,
        data: Array.isArray(action.payload.cartItems)
          ? action.payload.cartItems
          : [],
      };
    }

    case actionTypes.clearCart: {
      return initialState;
    }

    case actionTypes.refreshStore: {
      return initialState;
    }

    default:
      return state;
  }
};

export const actions = {
  addToCart: (product, qty = 1) => ({
    type: actionTypes.addToCart,
    payload: {
      product,
      qty,
    },
  }),

  removeFromCart: (product) => {
    if (!product || !product.id) {
      console.error("Invalid product for removal");
      return { type: "INVALID_ACTION" };
    }

    return {
      type: actionTypes.removeFromCart,
      payload: {
        product,
      },
    };
  },

  updateCart: (cartItems) => ({
    type: actionTypes.updateCart,
    payload: {
      cartItems,
    },
  }),

  clearCart: () => ({
    type: actionTypes.clearCart,
  }),
};

let auth;
if (typeof window !== "undefined") {
  auth = JSON.parse(localStorage.getItem("frequency-auth"));
} else {
  auth = null;
}

// const addToCartAPI = async (product, qty) => {
//   const data = {
//     product_id: product.id,
//     quantity: qty,
//     variant: product.selectedVariant || [],
//   };

//   try {
//     const response = await apirequest('POST', '/user/cart-add', data);

//     return response;
//   } catch (error) {
//     console.error("Add to cart API error:", error.message || error);
//     throw error;
//   }
// };

const addToCartAPI = async (product, qty) => {


  // Check if user is logged in
  const token = getToken();
  
  if (!token || token === "null") {
    // Redirect to login page for multivendor - no guest checkout
    if (typeof window !== "undefined") {
      toast.info("Please login to add items to cart");
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }

  // Handle both product types
  const selectedVariant = product.selectedVariant || product.variant_json || {};
  
  // If variantPrice exists, use it; else, fallback to sale_price/price
  const variantPrice = product.variantPrice || {
    price: product.is_sale_product
      ? Number(product.sale_price || product.price)
      : Number(product.price),
    usd_price: product.usd_sale_price
      ? Number(product.usd_sale_price)
      : Number(product.usd_price),
  };

  const data = {
    product_id: product.id,
    quantity: qty,
    variant: selectedVariant,
    selected_variant_price: variantPrice.price,
    selected_variant_usd_price: variantPrice.usd_price  };

  try {
    const response = await apirequest("POST", "/cart/add", data);
    return response;
  } catch (error) {
    console.error("Add to cart API error:", error.message || error);
    throw error;
  }
};

// const removeFromCartAPI = async (id) => {
//   if (!id) throw new Error("Product ID is required for removal.");



//   try {
//     const response = await apirequest('DELETE', `/user/cart-delete/${id}`);
//     return response;
//   } catch (error) {
//     console.error("Remove from cart API error:", error.message || error);
//     throw error;
//   }
// };

// const updateCartAPI = async (cartItems) => {
//   try {
//     const response = await apirequest('POST', '/user/cart-edit', { cartItems });

//     return response;
//   } catch (error) {
//     console.error("Update cart API error:", error.message || error);
//     throw error;
//   }
// };

const removeFromCartAPI = async (cartId) => {
  console.log(cartId, "cartIdcartId")
  if (!cartId) throw new Error("Cart ID is required for removal.");

  const token = getToken();
  
  if (!token || token === "null") {
    // Redirect to login page for multivendor - no guest checkout
    if (typeof window !== "undefined") {
      toast.info("Please login to manage your cart");
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }
console.log(cartId, "cartIdcartIdcartIdcartIdcartId")
  const data = {
    cart_id: cartId,
  };

  try {
    const response = await apirequest("DELETE", "/cart/remove", data);
    return response;
  } catch (error) {
    console.error("Remove from cart API error:", error.message || error);
    throw error;
  }
};

const updateCartAPI = async (cartItem) => {
  const token = getToken();
  
  if (!token || token === "null") {
    if (typeof window !== "undefined") {
      toast.info("Please login to update your cart");
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }

  const data = {
    cart_id: cartItem.cart_id || cartItem.id,
    quantity: cartItem.qty || cartItem.quantity,
    variant: cartItem.variant || cartItem.variant_json || {},
    selected_variant_price: cartItem.selected_variant_price || cartItem.price,
    selected_variant_usd_price: cartItem.selected_variant_usd_price || cartItem.usd_price
  };

  try {
    const response = await apirequest("PUT", "/cart/update-quantity", data);
    return response;
  } catch (error) {
    console.error("Update cart API error:", error.message || error);
    throw error;
  }
};

export function* cartSaga() {
  yield takeEvery(actionTypes.addToCart, function* saga(e) {
    try {
      const result = yield call(addToCartAPI, e.payload.product, e.payload.qty);

      if (result?.success) {
        const updatedCart = result.data || [];

        if (!Array.isArray(updatedCart)) {
          console.warn(
            "Invalid cart format in API response, using fallback."
          );
        }

        if (updatedCart.length > 0) {
          yield put(actions.updateCart(updatedCart));
        } else {
          console.warn("Cart update skipped: No items in updatedCart.");
        }

        toast.success("Product added to cart");
      } else {
        toast.error(result.message || "Failed to add product to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error.message !== "Authentication required") {
        toast.error("Failed to add product to cart");
      }
    }
  });

  yield takeEvery(actionTypes.removeFromCart, function* (action) {
    try {
      // Use cart ID (item.id) instead of product ID
      const cartId = action.payload.product.id;
      const result = yield call(removeFromCartAPI, cartId);

      if (result?.success) {
        toast.success("Product removed from cart");
        // Optionally update cart from response
        if (result.data && Array.isArray(result.data)) {
          yield put(actions.updateCart(result.data));
        }
      } else {
        console.warn(
          "Remove from cart failed:",
          result.message || "Unknown error"
        );
        toast.error(result.message || "Failed to remove product from cart");
      }
    } catch (error) {
      console.error("Remove from cart error:", error.response || error.message);

      if (error.message !== "Authentication required") {
        if (error.response?.status === 404) {
          toast.error("Product not found in cart.");
        } else {
          toast.error("Failed to remove product from cart");
        }
      }
    }
  });

  yield takeEvery(actionTypes.updateCart, function* (action) {
    try {
      if (
        !Array.isArray(action.payload.cartItems) ||
        action.payload.cartItems.length === 0
      ) {
        console.warn("No cart items provided for updateCart.");
        return;
      }

      // Update each cart item individually
      for (const item of action.payload.cartItems) {
        yield call(updateCartAPI, item);
      }

      toast.success("Cart updated successfully");
    } catch (error) {
      console.error("Update cart error:", error);
      if (error.message !== "Authentication required") {
        toast.error("Failed to update cart");
      }
    }
  });
}

const persistConfig = {
  keyPrefix: "frequency-",
  key: "cart",
  storage,
};

export default persistReducer(persistConfig, cartReducer);
// export default cartReducer;





// import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import { takeEvery, call, put } from "redux-saga/effects";
// import { toast } from "react-toastify";
// import { apirequest, getToken } from "~/utils/api";

// export const actionTypes = {
//   addToCart: "ADD_TO_CART",
//   removeFromCart: "REMOVE_FROM_CART",
//   refreshStore: "REFRESH_STORE",
//   updateCart: "UPDATE_CART",
//   clearCart: "CLEAR_CART",
// };

// const initialState = {
//   data: [],
// };

// const cartReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case actionTypes.addToCart: {
//       const { product, qty = 1 } = action.payload;
//       if (!Array.isArray(state.data)) {
//         console.error("Invalid state data, resetting to empty array.");
//         return { ...state, data: [] };
//       }

//       if (!product) {
//         console.error("Invalid product in addToCart action.");
//         return state;
//       }

//       const existingIndex = state.data.findIndex(
//         (item) => item.id === product.id
//       );

//       const price = product.is_sale_product
//         ? product.sale_price
//         : product.price;
//       const totalPrice = price * qty;

//       if (existingIndex !== -1) {
//         return {
//           ...state,
//           data: state.data.map((item, index) =>
//             index === existingIndex
//               ? {
//                   ...item,
//                   qty: item.qty + qty,
//                   sum: price * (item.qty + qty),
//                 }
//               : item
//           ),
//         };
//       }

//       return {
//         ...state,
//         data: [
//           ...state.data,
//           {
//             ...product,
//             qty,
//             price,
//             sum: totalPrice,
//           },
//         ],
//       };
//     }

//     case actionTypes.removeFromCart: {
//       return {
//         ...state,
//         data: state.data.filter(
//           (item) => item.id !== action.payload.product.id
//         ),
//       };
//     }

//     case actionTypes.updateCart: {
//       return {
//         ...state,
//         data: Array.isArray(action.payload.cartItems)
//           ? action.payload.cartItems
//           : [],
//       };
//     }

//     case actionTypes.clearCart: {
//       return initialState;
//     }

//     case actionTypes.refreshStore: {
//       return initialState;
//     }

//     default:
//       return state;
//   }
// };

// export const actions = {
//   addToCart: (product, qty = 1) => ({
//     type: actionTypes.addToCart,
//     payload: {
//       product,
//       qty,
//     },
//   }),

//   removeFromCart: (product) => {
//     if (!product || !product.id) {
//       console.error("Invalid product for removal");
//       return { type: "INVALID_ACTION" };
//     }

//     return {
//       type: actionTypes.removeFromCart,
//       payload: {
//         product,
//       },
//     };
//   },

//   updateCart: (cartItems) => ({
//     type: actionTypes.updateCart,
//     payload: {
//       cartItems,
//     },
//   }),

//   clearCart: () => ({
//     type: actionTypes.clearCart,
//   }),
// };

// let auth;
// if (typeof window !== "undefined") {
//   auth = JSON.parse(localStorage.getItem("frequency-auth"));
// } else {
//   auth = null;
// }

// const addToCartAPI = async (product, qty) => {
//   const data = {
//     product_id: product.id,
//     quantity: qty,
//     variant: product.selectedVariant || [],
    
//   };

//   const token = getToken();
//   if (!token || token === "null") {
//     const cartUniId = localStorage.getItem("cart_uni_id") || "";
//     data.cart_uni_id = cartUniId;

//     try {
//       const response = await apirequest("POST", "/user/carts-add", data);

//       if (response?.data?.cart_uni_id) {
//         localStorage.setItem("cart_uni_id", response?.data?.cart_uni_id);
//       }

//       return response;
//     } catch (error) {
//       console.error(
//         "Add to cart API (no token) error:",
//         error.message || error
//       );
//       throw error;
//     }
//   } else {
//     try {
//       const response = await apirequest("POST", "/user/cart-add", data);
//       return response;
//     } catch (error) {
//       console.error("Add to cart API error:", error.message || error);
//       throw error;
//     }
//   }
// };


// const removeFromCartAPI = async (id) => {
//   if (!id) throw new Error("Product ID is required for removal.");

//   const token = getToken();
//   const cartUniId = localStorage.getItem("cart_uni_id");

//   if (!cartUniId) {
//     console.error("Cart unique ID not found in localStorage.");
//     throw new Error("Cart unique ID is required.");
//   }

//   try {
//     if (!token || token === "null") {
//       const alternativeResponse = await apirequest(
//         "DELETE",
//         `/user/carts-delete/${id}`,
//         {
//           body: JSON.stringify({
//             cart_uni_id: cartUniId,
//           }),
//         }
//       );
//       return alternativeResponse;
//     } else {
//       const response = await apirequest(
//         "DELETE",
//         `/user/cart-delete/${id}`
//       );
//       return response;
//     }
//   } catch (error) {
//     console.error("Remove from cart API error:", error.message || error);
//     throw error;
//   }
// };

// const updateCartAPI = async (cartItems) => {
//   const token = getToken();

//   try {
//     let url = "";
//     let data = { cartItems };

//     if (!token || token === "null") {
//       url = "/user/carts-edit";
//     } else {
//       url = "/user/cart-edit";
//     }

//     const response = await apirequest("POST", url, data);
//     return response;
//   } catch (error) {
//     console.error("Update cart API error:", error.message || error);
//     throw error;
//   }
// };

// export function* cartSaga() {
//   yield takeEvery(actionTypes.addToCart, function* saga(e) {
//     try {
//       const result = yield call(addToCartAPI, e.payload.product, e.payload.qty);

//       if (result?.success) {
//         const updatedCart = result.data.cartItems || [];

//         if (!Array.isArray(updatedCart)) {
//           console.warn(
//             "Invalid cartItems format in API response, using fallback."
//           );
//         }

//         if (updatedCart.length > 0) {
//           yield put(actions.updateCart(updatedCart));
//         } else {
//           console.warn("Cart update skipped: No items in updatedCart.");
//         }

//         toast.success("Product added to cart");
//       } else {
//         toast.error(result.message || "Failed to add product to cart");
//       }
//     } catch (error) {
//       console.error("Add to cart error:", error);
//       toast.error("Failed to add product to cart");
//     }
//   });

//   yield takeEvery(actionTypes.removeFromCart, function* (action) {
//     try {
//       const result = yield call(removeFromCartAPI, action.payload.product.id);

//       if (result?.success) {
//         toast.success("Product removed from Cart");
//       } else {
//         console.warn(
//           "Remove from cart failed:",
//           result.message || "Unknown error"
//         );
//         toast.error(result.message || "Failed to remove product from cart");
//       }
//     } catch (error) {
//       console.error("Remove from cart error:", error.response || error.message);

//       if (error.response?.status === 404) {
//         toast.error("Product not found on the server.");
//       } else {
//         toast.error("Failed to remove product from cart");
//       }
//     }
//   });

//   yield takeEvery(actionTypes.updateCart, function* (action) {
//     try {
      

//       if (
//         !Array.isArray(action.payload.cartItems) ||
//         action.payload.cartItems.length === 0
//       ) {
//         console.warn("No cart items provided for updateCart.");
//         return;
//       }

//       const result = yield call(updateCartAPI, action.payload.cartItems);

//       if (result?.success) {
        
//         // toast.success("Cart updated successfully");
//       } else {
//         // toast.error(result.message || "Failed to update cart");
//       }
//     } catch (error) {
//       console.error("Update cart error:", error);
//       // toast.error("Failed to update cart");
//     }
//   });
// }

// const persistConfig = {
//   keyPrefix: "frequency-",
//   key: "cart",
//   storage,
// };

// export default persistReducer(persistConfig, cartReducer);





// // import { persistReducer } from "redux-persist";
// // import storage from 'redux-persist/lib/storage';
// // import { takeEvery } from "redux-saga/effects";
// // import { toast } from 'react-toastify';

// // export const actionTypes = {
// //     addToCart: "ADD_TO_CART",
// //     removeFromCart: "REMOVE_FROM_CART",
// //     refreshStore: "REFRESH_STORE",
// //     updateCart: "UPDATE_CART",
// // };

// // const initialState = {
// //     data: []
// // }

// // const cartReducer = ( state = initialState, action ) => {
// //     switch ( action.type ) {
// //         case actionTypes.addToCart:
// //             var findIndex = state.data.findIndex( item => item.id == action.payload.product.id );
// //             let qty = action.payload.qty ? action.payload.qty : 1;
// //             if ( findIndex !== -1 && action.payload.product.variants.length > 0 ) {
// //                 findIndex = state.data.findIndex( item => item.name == action.payload.product.name );
// //             }

// //             if ( findIndex !== -1 ) {
// //                 return {
// //                     data: [
// //                         ...state.data.reduce( ( acc, product, index ) => {
// //                             if ( findIndex == index ) {
// //                                 acc.push( {
// //                                     ...product,
// //                                     qty: product.qty + qty,
// //                                     sum: ( action.payload.product.sale_price ? action.payload.product.sale_price : action.payload.product.price ) * ( product.qty + qty )
// //                                 } );
// //                             } else {
// //                                 acc.push( product );
// //                             }

// //                             return acc;
// //                         }, [] )
// //                     ]
// //                 }
// //             } else {
// //                 return {
// //                     data: [
// //                         ...state.data,
// //                         {
// //                             ...action.payload.product,
// //                             qty: qty,
// //                             price: action.payload.product.sale_price ? action.payload.product.sale_price : action.payload.product.price,
// //                             sum: qty * ( action.payload.product.sale_price ? action.payload.product.sale_price : action.payload.product.price )
// //                         }
// //                     ]
// //                 };
// //             }
// //         case actionTypes.removeFromCart:
// //             return {
// //                 data: [
// //                     ...state.data.filter( item => {
// //                         if ( item.id !== action.payload.product.id ) return true;
// //                         if ( item.name !== action.payload.product.name ) return true;
// //                         return false;
// //                     } )
// //                 ]
// //             }

// //         case actionTypes.updateCart:
// //             return {
// //                 data: [
// //                     ...action.payload.cartItems
// //                 ]
// //             };
// //         case actionTypes.refreshStore:
// //             return initialState;

// //         default:
// //             return state;
// //     }
// // }

// // export const actions = {
// //     addToCart: ( product, qty = 1 ) => ( {
// //         type: actionTypes.addToCart,
// //         payload: {
// //             product: product,
// //             qty: qty
// //         }
// //     } ),

// //     removeFromCart: ( product ) => ( {
// //         type: actionTypes.removeFromCart,
// //         payload: {
// //             product: product
// //         }
// //     } ),

// //     updateCart: ( cartItems ) => ( {
// //         type: actionTypes.updateCart,
// //         payload: {
// //             cartItems: cartItems
// //         }
// //     } )
// // }

// // export function* cartSaga () {
// //     yield takeEvery( actionTypes.addToCart, function* saga ( e ) {
// //         toast.success( "Product added to Cart" );
// //     } );

// //     yield takeEvery( actionTypes.removeFromCart, function* saga ( e ) {
// //         toast.success( "Product removed from Cart" );
// //     } );

// //     yield takeEvery( actionTypes.updateCart, function* saga ( e ) {
// //         toast.success( "Cart updated successfully" );
// //     } );
// // }

// // const persistConfig = {
// //     keyPrefix: "frequency-",
// //     key: "cart",
// //     storage
// // }

// // export default persistReducer( persistConfig, cartReducer );
