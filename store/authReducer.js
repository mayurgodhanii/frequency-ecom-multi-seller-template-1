import { call, put, takeLatest } from "redux-saga/effects";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { apirequest } from "~/utils/api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

// Action Types
export const REGISTER_REQUEST = "REGISTER_REQUEST";
export const REGISTER_SUCCESS = "REGISTER_SUCCESS";
export const REGISTER_FAILURE = "REGISTER_FAILURE";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const LOGOUT = "LOGOUT";

// Auth Actions
export const registerRequest = (data) => ({
  type: REGISTER_REQUEST,
  payload: data,
});

export const registerSuccess = (user) => ({
  type: REGISTER_SUCCESS,
  payload: user,
});

export const registerFailure = (error) => ({
  type: REGISTER_FAILURE,
  payload: error,
});

export const loginRequest = (data) => ({
  type: LOGIN_REQUEST,
  payload: data,
});

export const loginSuccess = (data) => ({
  type: LOGIN_SUCCESS,
  payload: data,
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const logout = () => ({
  type: LOGOUT,
});

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isRegistering: false,
  isLoggingIn: false,
  isLoggedOut: false,
};

// Auth Reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_REQUEST:
      return { ...state, loading: true, isRegistering: true, error: null };

    case LOGIN_REQUEST:
      return { ...state, loading: true, isLoggingIn: true, error: null };

    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isRegistering: false,
        user: action.payload.user,
        token: action.payload.token,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isLoggingIn: false,
        user: action.payload.user,
        token: action.payload.token,
      };

    case REGISTER_FAILURE:
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isRegistering: false,
        isLoggingIn: false,
      };

    case LOGOUT:
      return { ...state, user: null, token: null, isLoggedOut: true };

    default:
      return state;
  }
};

// API Functions
const registerApi = async (data) => {
  try {
    const response = await apirequest("POST", `/user/register`, data, null);
    return response;
  } catch (error) {
    console.error("Error in register API:", error);
    throw error;
  }
};

const loginApi = async (data) => {
  try {
    const response = await apirequest("POST", `/user/login`, data, null);
    return response;
  } catch (error) {
    console.error("Error in login API:", error);
    throw error;
  }
};

const logoutApi = async (token) => {
  try {
      const response = await apirequest("POST", `/user/logout`, null, null, {
        headers: { "x-access-token": token },
      });
    return response;
  } catch (error) {
    console.error("Error in logout API:", error);
    throw error;
  }
};

// Sagas
// function* registerSaga(action) {
//   try {
//     const data = yield call(registerApi, action.payload);

//     if (data.status === 200 && data.success) {
//       yield put({ type: REGISTER_SUCCESS, payload: { user: data.user, token: data.token } });
//       toast.success(data?.message || "Registration successful!");
//     } else {
//       yield put({
//         type: REGISTER_FAILURE,
//         payload: data.message || "Registration failed",
//       });
//       toast.error(data?.message || "Registration failed");
//     }
//   } catch (error) {
//     console.error("Register error:", error);
//     yield put({ type: REGISTER_FAILURE, payload: error.message });
//     toast.error(error.message || "Something went wrong during registration");
//   }
// }

// function* registerSaga(action) {
//   try {
//     const data = yield call(registerApi, action.payload);
// console.log("first1")

//     // -------------------------------------------------
//     // 1. SUCCESS RESPONSE
//     // -------------------------------------------------
//     if (data.status === 200 && data.success) {
//       // ---- WHOLESALE PENDING ----
//       if (
//         data.wholesale_status === "pending" &&          // <-- key from backend
//         action.payload.is_wholesale_enable === true    // <-- we sent true
//       ) {

// console.log("first1")

//         // Show toast, **DO NOT** dispatch success → no token, no redirect
//         yield call(
//           toast.success,
//           data.message ||
//             "Your wholesale account is under review. You will be notified once approved."
//         );
//         return;                     // stop the saga here
//       }
// console.log("first")
//       // ---- NORMAL SUCCESS (retail or approved wholesale) ----
//       yield put({
//         type: REGISTER_SUCCESS,
//         payload: { user: data.user, token: data.token },
//       });
//       yield call(toast.success, data?.message || "Registration successful!");
//     }
//     // -------------------------------------------------
//     // 2. FAILURE RESPONSE
//     // -------------------------------------------------
//     else {
//       yield put({
//         type: REGISTER_FAILURE,
//         payload: data.message || "Registration failed",
//       });
//       yield call(toast.error, data?.message || "Registration failed");
//     }
//   } catch (error) {
//     console.error("Register error:", error);
//     yield put({ type: REGISTER_FAILURE, payload: error.message });
//     yield call(
//       toast.error,
//       error.message || "Something went wrong during registration"
//     );
//   }
// }



function* registerSaga(action) {
  try {
    const data = yield call(registerApi, action.payload);

    // -------------------------------------------------
    // 1. SUCCESS RESPONSE
    // -------------------------------------------------
    if (data.status === 200 && data.success) {
      // ---- WHOLESALE PENDING ----
      if (
        data.wholesale_status === "pending" &&          // <-- key from backend
        action.payload.is_wholesale_enable === true    // <-- we sent true
      ) {
        // Show toast, do not log in — but clear loading so UI is not stuck
        yield call(
          toast.success,
          data.message ||
            "Your wholesale account is under review. You will be notified once approved."
        );

        // Clear loading / stop spinner in UI
        yield put({ type: REGISTER_FAILURE, payload: null });
        return; // stop the saga here
      }

      // ---- NORMAL SUCCESS (retail or approved wholesale) ----
      // Accept either accessToken or token (backend inconsistent naming)
      const tokenValue = data.accessToken || data.token || null;

      yield put({
        type: REGISTER_SUCCESS,
        payload: { user: data.user, token: tokenValue },
      });
      yield call(toast.success, data?.message || "Registration successful!");
    }
    // -------------------------------------------------
    // 2. FAILURE RESPONSE
    // -------------------------------------------------
    else {
      yield put({
        type: REGISTER_FAILURE,
        payload: data.message || "Registration failed",
      });
      yield call(toast.error, data?.message || "Registration failed");
    }
  } catch (error) {
    console.error("Register error:", error);
    yield put({ type: REGISTER_FAILURE, payload: error.message });
    yield call(
      toast.error,
      error.message || "Something went wrong during registration"
    );
  }
}

// function* loginSaga(action) {
//   try {
//     const data = yield call(loginApi, action.payload);
//     if (data.status === 200 && data.success) {
//       yield put({
//         type: LOGIN_SUCCESS,
//         payload: { token: data.accessToken, user: data.user },
//       });
//       toast.success(data?.message );
//     } else {
//       yield put({
//         type: LOGIN_FAILURE,
//         payload: data.message || "Invalid email or password",
//       });
//       toast.error(data?.message );
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     yield put({
//       type: LOGIN_FAILURE,
//       payload: error.message || "Something went wrong. Please try again.",
//     });
//     toast.error(error.message || "Something went wrong during registration"); 
//   }
// }

function* loginSaga(action) {
  try {
    const data = yield call(loginApi, action.payload);

    // -------------------------------------------------
    // 1. SUCCESS RESPONSE
    // -------------------------------------------------
    if (data.status === 200 && data.success) {
      // ---- WHOLESALE PENDING (even on login) ----
      if (data.wholesale_status === "pending" || data.wholesale_status === "rejected") {
        yield call(
          toast.warn,
          data.message ||
            "Your wholesale account is still under review. Please wait for approval."
        );
        return;                     // stop saga – no token, no login
      }

      // ---- NORMAL LOGIN (retail or approved wholesale) ----
      yield put({
        type: LOGIN_SUCCESS,
        payload: { token: data.accessToken, user: data.user },
      });
      yield call(toast.success, data?.message || "Login successful!");
        Cookies.set("wholesale_status", data?.wholesale_status);

    }
    // -------------------------------------------------
    // 2. FAILURE RESPONSE
    // -------------------------------------------------
    else {
      yield put({
        type: LOGIN_FAILURE,
        payload: data.message || "Invalid email or password",
      });
      yield call(toast.error, data?.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    yield put({
      type: LOGIN_FAILURE,
      payload: error.message || "Something went wrong. Please try again.",
    });
    yield call(
      toast.error,
      error.message || "Something went wrong during login"
    );
  }
}

function* logoutSaga() {
  try {
    const auth = JSON.parse(localStorage.getItem("frequency-auth"));
    const token = auth?.token ? auth.token.replace(/"/g, "") : null;

    if (token) {
      const response = yield call(logoutApi, token);
      if (response.status === 200 || response.success === true) {
        localStorage.removeItem("frequency-auth");
        Cookies.remove("wholesale_status");
      } else {
         toast.success(response?.message );
      }
    } else {
      console.error("No token found for logout");
    }
  } catch (error) {
     toast.error(error?.message );
  }
}

export function* authSaga() {
  yield takeLatest(REGISTER_REQUEST, registerSaga);
  yield takeLatest(LOGIN_REQUEST, loginSaga);
  yield takeLatest(LOGOUT, logoutSaga);
}

// Redux Persist configuration
const persistConfig = {
  keyPrefix: "frequency-",
  key: "auth",
  storage,
};

export default persistReducer(persistConfig, authReducer);