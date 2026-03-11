import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { takeEvery, call, put } from "redux-saga/effects";
import { toast } from "react-toastify";
import { apirequest } from "~/utils/api";

export const actionTypes = {
  addToWishlist: "ADD_TO_WISHLIST",
  removeFromWishlist: "REMOVE_FROM_WISHLIST",
  removeFromWishlistSuccess: "REMOVE_FROM_WISHLIST_SUCCESS",
  refreshStore: "REFRESH_STORE",
  fetchWishlist: "FETCH_WISHLIST",
  setWishlist: "SET_WISHLIST",
};

const initialState = {
  data: [],
};

const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.addToWishlist:
      const findIndex = state.data.findIndex(
        (item) => item.id === action.payload.product.id
      );
      if (findIndex === -1) {
        return {
          data: [...state.data, action.payload.product],
        };
      }
      return state;

    case actionTypes.removeFromWishlistSuccess:
      return {
        data: state.data.filter(
          (item) => item.id !== action.payload.product.id
        ),
      };

    case actionTypes.refreshStore:
      return initialState;

    case actionTypes.setWishlist:
      return {
        data: action.payload,
      };

    default:
      return state;
  }
};

export const actions = {
  addToWishlist: (product) => ({
    type: actionTypes.addToWishlist,
    payload: { product },
  }),

  removeFromWishlist: (product) => ({
    type: actionTypes.removeFromWishlist,
    payload: { product },
  }),

  removeFromWishlistSuccess: (product) => ({
    type: actionTypes.removeFromWishlistSuccess,
    payload: { product },
  }),

  fetchWishlist: () => ({
    type: actionTypes.fetchWishlist,
  }),

  setWishlist: (data) => ({
    type: actionTypes.setWishlist,
    payload: data,
  }),
};

function* handleFetchWishlist() {
  try {
    const isBrowser = typeof window !== "undefined";
    const token = isBrowser
      ? JSON.parse(localStorage.getItem("frequency-auth"))?.token
      : null;
    const wishUniId = isBrowser ? localStorage.getItem("wish_uni_id") : null;

    const headers = {
      "Content-Type": "application/json",
    };

    let endpoint = "";
    let params = {};

    if (!token || token === "null") {
      // Without token
      endpoint = "/user/products-wish";
      params = {
        page: 1,
        size: 10,
        wish_uni_id: wishUniId,
        search: "",
        category: "",
      };
    } else {
      // With token
      endpoint = "/user/product-wish";
      headers["x-access-token"] = token;
      params = {
        page: 1,
        size: 10,
        search: "",
        category: "",
      };
    }

    const response = yield call(apirequest, "GET", endpoint, null, params, headers);

    if (response.success) {
      const wishlist = response.data.data.map((item) => item.product);
      yield put(actions.setWishlist(wishlist));
    } else {
      console.error("Failed to fetch wishlist.");
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error);
  }
}

function* handleWishlistAction(action) {
  try {
    const isBrowser = typeof window !== "undefined";
    const token = isBrowser
      ? JSON.parse(localStorage.getItem("frequency-auth"))?.token
      : null;
    const wishUniId = isBrowser ? localStorage.getItem("wish_uni_id") : null;

    const isAdding = action.type === actionTypes.addToWishlist;
    const product = action.payload.product;
    const productId = isAdding ? product.id : product.product_id;

    const headers = {
      "Content-Type": "application/json",
    };

    let endpoint = "";
    let payload = {};

    if (!token || token === "null") {  // Already handles string "null"
      endpoint = "/user/products-wish";
      payload = {
        product_id: productId,
        wish_uni_id: wishUniId || "",
      };
    } else {
      endpoint = "/user/product-wish";
      headers["x-access-token"] = token;
      payload = {
        product_id: productId,
      };
    }

    const response = yield call(apirequest, "POST", endpoint, payload, headers);
    

    const success = response.status === (isAdding ? 201 : 200) && response.success;
    

    if (success) {
      toast.success(response.message);

      
      if ((!token || token === "null") && isAdding && response.wish_uni_id) {
        
        localStorage.setItem("wish_uni_id", response.wish_uni_id);
      }

      if (!isAdding) {
        yield put(actions.removeFromWishlistSuccess(product));
      }
    } else {
      console.error(
        `Failed to ${isAdding ? "add to" : "remove from"} wishlist.`
      );
    }
  } catch (error) {
    console.error(
      `Error ${
        action.type === actionTypes.addToWishlist
          ? "adding to"
          : "removing from"
      } wishlist:`,
      error
    );
  }
}

export function* wishlistSaga() {
  yield takeEvery(actionTypes.addToWishlist, handleWishlistAction);
  yield takeEvery(actionTypes.removeFromWishlist, handleWishlistAction);
  yield takeEvery(actionTypes.fetchWishlist, handleFetchWishlist);
}

const persistConfig = {
  keyPrefix: "frequency-",
  key: "wishlist",
  storage,
};

export default persistReducer(persistConfig, wishlistReducer);



// import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import { takeEvery, call, put } from "redux-saga/effects";
// import { toast } from "react-toastify";
// import { apirequest } from "~/utils/api";

// export const actionTypes = {
//   addToWishlist: "ADD_TO_WISHLIST",
//   removeFromWishlist: "REMOVE_FROM_WISHLIST",
//   refreshStore: "REFRESH_STORE",
//   fetchWishlist: "FETCH_WISHLIST",
//   setWishlist: "SET_WISHLIST",
// };

// const initialState = {
//   data: [],
// };

// const wishlistReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case actionTypes.addToWishlist:
//       const findIndex = state.data.findIndex(
//         (item) => item.id === action.payload.product.id
//       );
//       if (findIndex === -1) {
//         return {
//           data: [...state.data, action.payload.product],
//         };
//       }
//       return state;

//     case actionTypes.removeFromWishlist:
//       return {
//         data: state.data.filter(
//           (item) => item.id !== action.payload.product.id
//         ),
//       };

//     case actionTypes.refreshStore:
//       return initialState;

//     case actionTypes.setWishlist:
//       return {
//         data: action.payload,
//       };

//     default:
//       return state;
//   }
// };

// export const actions = {
//   addToWishlist: (product) => ({
//     type: actionTypes.addToWishlist,
//     payload: { product },
//   }),

//   removeFromWishlist: (product) => ({
//     type: actionTypes.removeFromWishlist,
//     payload: { product },
//   }),

//   fetchWishlist: () => ({
//     type: actionTypes.fetchWishlist,
//   }),

//   setWishlist: (data) => ({
//     type: actionTypes.setWishlist,
//     payload: data,
//   }),
// };

// function* handleFetchWishlist() {
//   try {
//     const isBrowser = typeof window !== "undefined";
//     const token = isBrowser
//       ? JSON.parse(localStorage.getItem("frequency-auth"))?.token
//       : null;
//     const wishUniId = isBrowser ? localStorage.getItem("wish_uni_id") : null;

//     const headers = {
//       "Content-Type": "application/json",
//     };

//     let endpoint = "";
//     let params = {};

//     if (!token || token === "null") {
//       // Without token
//       endpoint = "/user/products-wish";
//       params = {
//         page: 1,
//         size: 10,
//         wish_uni_id: wishUniId,
//         search: "",
//         category: "",
//       };
//     } else {
//       // With token
//       endpoint = "/user/product-wish";
//       headers["x-access-token"] = token;
//       params = {
//         page: 1,
//         size: 10,
//         search: "",
//         category: "",
//       };
//     }

//     const response = yield call(apirequest, "GET", endpoint, null, params, headers);

//     if (response.success) {
//       const wishlist = response.data.data.map((item) => item.product);
//       yield put(actions.setWishlist(wishlist));
//     } else {
//       console.error("Failed to fetch wishlist.");
//     }
//   } catch (error) {
//     console.error("Error fetching wishlist:", error);
//   }
// }


// // function* handleWishlistAction(action) {
// //   try {
// //     const isBrowser = typeof window !== "undefined";
// //     const token = isBrowser
// //       ? JSON.parse(localStorage.getItem("frequency-auth"))?.token
// //       : null;
// //     const wishUniId = isBrowser ? localStorage.getItem("wish_uni_id") : null;

// //     const isAdding = action.type === actionTypes.addToWishlist;
// //     const product = action.payload.product;
// //     const productId = isAdding ? product.id : product.product_id;

// //     const headers = {
// //       "Content-Type": "application/json",
// //     };

// //     let endpoint = "";
// //     let payload = {};

// //     if (!token || token === "null") {
// //       // Without token
// //       endpoint = "/user/products-wish";
// //       payload = {
// //         product_id: productId,
// //         wish_uni_id: wishUniId || "",
// //       };
// //     } else {
// //       // With token
// //       endpoint = "/user/product-wish";
// //       headers["x-access-token"] = token;
// //       payload = {
// //         product_id: productId,
// //       };
// //     }

// //     const response = yield call(apirequest, "POST", endpoint, payload, headers);

// //     const success =
// //       response.status === (isAdding ? 201 : 200) && response.data.success;

// //     if (success) {
// //       toast.success(response.data.message);

// //       if (!token && isAdding && response.data.wish_uni_id) {
// //         // Save wish_uni_id for future tokenless requests
// //         localStorage.setItem("wish_uni_id", response.data.wish_uni_id);
// //       }

// //       if (!isAdding) {
// //         yield put(actions.removeFromWishlist(product));
// //       }
// //     } else {
// //       console.error(
// //         `Failed to ${isAdding ? "add to" : "remove from"} wishlist.`
// //       );
// //     }
// //   } catch (error) {
// //     console.error(
// //       `Error ${
// //         action.type === actionTypes.addToWishlist
// //           ? "adding to"
// //           : "removing from"
// //       } wishlist:`,
// //       error
// //     );
// //   }
// // }


// function* handleWishlistAction(action) {
//   try {
//     const isBrowser = typeof window !== "undefined";
//     const token = isBrowser
//       ? JSON.parse(localStorage.getItem("frequency-auth"))?.token
//       : null;
//     const wishUniId = isBrowser ? localStorage.getItem("wish_uni_id") : null;

//     const isAdding = action.type === actionTypes.addToWishlist;
//     const product = action.payload.product;
//     const productId = isAdding ? product.id : product.product_id;

//     const headers = {
//       "Content-Type": "application/json",
//     };

//     let endpoint = "";
//     let payload = {};

//     if (!token || token === "null") {  // Already handles string "null"
//       endpoint = "/user/products-wish";
//       payload = {
//         product_id: productId,
//         wish_uni_id: wishUniId || "",
//       };
//     } else {
//       endpoint = "/user/product-wish";
//       headers["x-access-token"] = token;
//       payload = {
//         product_id: productId,
//       };
//     }

//     const response = yield call(apirequest, "POST", endpoint, payload, headers);
    

//     const success = response.status === (isAdding ? 201 : 200) && response.success;
    

//     if (success) {
//       toast.success(response.message);

      
//       if ((!token || token === "null") && isAdding && response.wish_uni_id) {
        
//         localStorage.setItem("wish_uni_id", response.wish_uni_id);
//       }

//       if (!isAdding) {
//         yield put(actions.removeFromWishlist(product));
//       }
//     } else {
//       console.error(
//         `Failed to ${isAdding ? "add to" : "remove from"} wishlist.`
//       );
//     }
//   } catch (error) {
//     console.error(
//       `Error ${
//         action.type === actionTypes.addToWishlist
//           ? "adding to"
//           : "removing from"
//       } wishlist:`,
//       error
//     );
//   }
// }

// export function* wishlistSaga() {
//   yield takeEvery(actionTypes.addToWishlist, handleWishlistAction);
//   yield takeEvery(actionTypes.removeFromWishlist, handleWishlistAction);
//   yield takeEvery(actionTypes.fetchWishlist, handleFetchWishlist);
// }

// const persistConfig = {
//   keyPrefix: "frequency-",
//   key: "wishlist",
//   storage,
// };

// export default persistReducer(persistConfig, wishlistReducer);
