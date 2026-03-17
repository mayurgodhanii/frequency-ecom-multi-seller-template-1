import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  loginRequest,
  registerRequest,
  logout,
} from "~/store/authReducer";
import ALink from "~/components/features/alink";
import { useRouter } from "next/router";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import {
  fetchGoogleCredentials,
  decryptGoogleCredentials,
} from "~/utils/google-credentials.js";
import { toast } from "react-toastify";


import { apirequest } from "~/utils/api";
import { Helmet } from "react-helmet";

function Login({
  loginRequest,
  registerRequest,
  logout,
  token,
  loading,
  error,
  metaData
}) {
  const initialFormData = {
    email: "",
    password: "",
    name: "",
    is_wholesale_enable: false,
    companyName: "",
    phone: "",
    address: "",
    gstNumber: "",
  };
   const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [gstDocument, setGstDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [selectedTab, setSelectedTab] = useState(0); // 0: Login, 1: Register
  const [isForgotPassword, setIsForgotPassword] = useState(false);


    const [submittedRegister, setSubmittedRegister] = useState(false);
  const [submittedAsWholesale, setSubmittedAsWholesale] = useState(false);


  useEffect(() => {
    // Debug log
     if (token && !loading) {
      setIsRegister(false); // Switch to login tab if registered
      window.location.href = "/";
    }
  }, [token, loading]);

  useEffect(() => {
    if (token) {
      // Log the token in localStorage
       localStorage.setItem('frequency-auth', JSON.stringify({ token }));
     }
  }, [token]);

  const validateForm = () => {
    const validationErrors = {};
    const {
      email,
      password,
      name,
      is_wholesale_enable,
      companyName,
      phone,
      address,
    } = formData;

    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = "Email is invalid.";
    }

    // Password validation for both login and register
    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (isRegister && password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters.";
    }

    if (isRegister) {
      if (!name) {
        validationErrors.name = "Name is required.";
      }

      if (is_wholesale_enable) {
        if (!companyName) {
          validationErrors.companyName = "Company name is required.";
        }
        if (!phone) {
          validationErrors.phone = "phone is required.";
        }

        if (!address) {
          validationErrors.address = "Address is required.";
        }
        // if (!formData.gstNumber) {
        //   validationErrors.gstNumber = "GST number is required.";
        // }
        
        // else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
        //   validationErrors.gstNumber = "Enter a valid character GSTIN.";
        // }

        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(formData.gstNumber)) {
  validationErrors.gstNumber = "Enter a valid GSTIN.";
}

        // if (!gstDocument) {
        //   validationErrors.gstDocument = "GST document is required.";
        // }
      }
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: updatedValue };

      if (name === "is_wholesale_enable" && !checked) {
        updatedFormData.companyName = "";
        updatedFormData.phone = "";

        updatedFormData.address = "";
        setGstDocument(null);
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors.companyName;
          delete newErrors.phone;

          delete newErrors.address;
          delete newErrors.gstDocument;
          return newErrors;
        });
      }

      return updatedFormData;
    });
  };


  useEffect(() => {
    if (!submittedRegister) return;

    // finished request
    if (!loading) {
      // If no token was returned (wholesale pending path) and the user had submitted as wholesaler
      // and there is no error, reset the register form fields.
      if (!token && submittedAsWholesale && !error) {
        setFormData(initialFormData);
        setGstDocument(null);
        setErrors({});
        setServerError("");
        // keep selectedTab at Register or switch as you prefer:
        setSelectedTab(1);
        setIsRegister(true);
      }

      // clear submit-tracking so effect won't run again
      setSubmittedRegister(false);
      setSubmittedAsWholesale(false);
    }
  }, [loading, token, error, submittedRegister, submittedAsWholesale]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setGstDocument(file);
    setErrors((prevErrors) => {
      if (!prevErrors.gstDocument) return prevErrors;
      const newErrors = { ...prevErrors };
      delete newErrors.gstDocument;
      return newErrors;
    });
  };

const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const {
        name,
        email,
        password,
        is_wholesale_enable,
        companyName,
        address,
        phone,
        gstNumber
      } = formData;

      const basePayload = {
        name,
        email,
        password,
      };

      if (is_wholesale_enable) {
        basePayload.is_wholesale_enable=is_wholesale_enable
        basePayload.company_name = companyName;
        basePayload.address = address;
        basePayload.phone = phone;
        basePayload.gst_document = gstNumber;
      }

      let payload = basePayload;

      if (is_wholesale_enable && gstDocument) {
        const formPayload = new FormData();
        Object.entries(basePayload).forEach(([key, value]) => {
          if (typeof value === "boolean") {
            formPayload.append(key, value ? "true" : "false");
          } else if (value !== undefined && value !== null) {
            formPayload.append(key, value);
          }
        });
        formPayload.append("gst_document", gstDocument);
        payload = formPayload;
      }

      // remember that we submitted and whether it was as wholesaler
      setSubmittedRegister(true);
      setSubmittedAsWholesale(!!formData.is_wholesale_enable);

      registerRequest(payload);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    if (validateForm()) {
      const { email, password } = formData;
      const cartUniId = localStorage.getItem("cart_uni_id") || "";
      const wishUniId = localStorage.getItem("wish_uni_id") || "";
      loginRequest({ email, password, cartUniId, wishUniId });

      if (error) {
        setServerError(error);
      }
    }
  };

  const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);

  useEffect(() => {
    const getGoogleCredentials = async () => {
      try {
        const response = await fetchGoogleCredentials();
        
        // Check if response is null or invalid
        if (!response) {
          console.log("Google credentials not configured");
          setIsGoogleEnabled(false);
          return;
        }

        const encryptedData = response;
        const decryptedData = await decryptGoogleCredentials(
          encryptedData,
          process.env.NEXT_PUBLIC_ENCRYPT_SECRET_KEY
        );
        
        // Check if decryption was successful
        if (!decryptedData) {
          console.log("Failed to decrypt Google credentials");
          setIsGoogleEnabled(false);
          return;
        }

        const credentialsJson = JSON.parse(decryptedData);
        setIsGoogleEnabled(credentialsJson.google_key || false);
      } catch (error) {
        console.error("Error getting Google credentials:", error);
        setIsGoogleEnabled(false);
      }
    };

    getGoogleCredentials();
  }, []);

  const [user, setUser] = useState(null);

  const handleLogin = async (response) => {
    if (!response.credential) {
      console.error("No credential provided by Google");
      alert("Google authentication failed: No credential found!");
      return;
    }

    try {
      const token = response.credential;
      const decoded = jwtDecode(token);

      await loginRequest({
        email: decoded.email,
        password: "",
        type: "google",
      });

      setUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
    } catch (error) {
      console.error("Google Login Error:", error.message, error);
      alert(`Google authentication failed: ${error.message}`);
    }
  };

  const handleForgotPasswordClick = async () => {
    const email = formData.email;

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // console.log(email , 'emailemail')

    try {
      const response = await apirequest(
        "POST",
        `/user/forget-password`,
        { email },
        null
      );

      // console.log(response , "responsefeew")

      if (response && response.success) {
        toast.success(response.message);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="main">
      <Helmet>
        <meta name="description" content="Login" />
        <title>Login</title>
      </Helmet>
      <nav className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="#">Pages</ALink>
            </li>
            <li className="breadcrumb-item active">
              {isRegister ? "Register" : isForgotPassword ? "Forgot Password" : "Login"}
            </li>
          </ol>
        </div>
      </nav>

      <div
        className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17"
      >
        <div className="container">
          <div className="form-box">
            <div className="form-tab">
              <Tabs selectedTabClassName="show" selectedIndex={selectedTab} onSelect={setSelectedTab}>
                <TabList className="nav nav-pills nav-fill">
                  <Tab className="nav-item">
                    <span
                      className="nav-link"
                      onClick={() => {
                        setIsRegister(false);
                        setIsForgotPassword(false);
                        setErrors({});
                        setServerError("");
                        setSelectedTab(0);
                      }}
                    >
                      Sign In
                    </span>
                  </Tab>
                  <Tab className="nav-item">
                    <span
                      className="nav-link"
                      onClick={() => {
                        setIsRegister(true);
                        setIsForgotPassword(false);
                        setErrors({});
                        setServerError("");
                        setSelectedTab(1);
                      }}
                    >
                      Register
                    </span>
                  </Tab>
                </TabList>

                <div className="tab-content">
                  {/* Login Form */}
                  <TabPanel>
                    {!isForgotPassword ? (
                      <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                          <div htmlFor="login-email">
                            Email Address <span style={{ color: 'red' }}>*</span>
                          </div>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            id="login-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <div htmlFor="login-password">
                            Password <span style={{ color: 'red' }}>*</span>
                          </div>
                          <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            id="login-password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                          )}
                        </div>

                        {/* {serverError && (
                          <div className="alert alert-danger" role="alert">
                            {serverError}
                          </div>
                        )} */}

                        <div className="form-group d-flex justify-content-between">
                          <button
                            type="submit"
                            className="btn btn-outline-primary-2"
                            disabled={loading}
                          >
                            {loading ? "Logging in..." : "LOG IN"}
                            <i className="icon-long-arrow-right"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-primary-2"
                            onClick={() => setIsForgotPassword(true)}
                          >
                            Forgot Your Password?
                          </button>
                        </div>

                        {isGoogleEnabled && (
                          <>
                            <div className="form-choice">
                              <p className="text-center">or sign up with</p>
                            </div>
                            <div>
                              <GoogleLogin
                                onSuccess={handleLogin}
                                onError={() => console.error("Login Failed")}
                              />
                            </div>
                          </>
                        )}
                      </form>
                    ) : (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleForgotPasswordClick();
                        }}
                      >
                        <div className="form-group">
                          <div htmlFor="forgot-email">
                            Email Address <span style={{ color: 'red' }}>*</span>
                          </div>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            id="forgot-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                        <div className="form-group d-flex justify-content-between">
                          <button
                            type="submit"
                            className="btn btn-outline-primary-2"
                          >
                            <span>Send Reset Password Link</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary-2"
                            onClick={() => setIsForgotPassword(false)}
                          >
                            Back to Login
                          </button>
                        </div>
                      </form>
                    )}
                  </TabPanel>

                  {/* Register Form */}
                  <TabPanel>
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-group">
                        <div htmlFor="register-name">
                          Your Name <span style={{ color: 'red' }}>*</span>
                        </div>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? "is-invalid" : ""}`}
                          id="register-name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <div htmlFor="register-email">
                          Your Email <span style={{ color: 'red' }}>*</span>
                        </div>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          id="register-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <div htmlFor="register-password">
                          Password <span style={{ color: 'red' }}>*</span>
                        </div>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? "is-invalid" : ""}`}
                          id="register-password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>
                      {metaData?.is_wholesale === "true" && (
                        <div className="form-group form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{ marginTop: '7px' }}
                            id="register-wholesale"
                            name="is_wholesale_enable"
                            checked={formData.is_wholesale_enable}
                            onChange={handleInputChange}
                          />
 
                          <label
                            className="form-check-label"
                            htmlFor="register-wholesale"
                            style={{ marginLeft: "10px" }}
                          >
                            Register as wholesaler
                          </label>


                        </div>
                      )}
                      {formData.is_wholesale_enable && (
                        <>
                          <div className="form-group">
                            <div htmlFor="register-company">
                              Company Name <span style={{ color: 'red' }}>*</span>
                            </div>
                            <input
                              type="text"
                              className={`form-control ${errors.companyName ? "is-invalid" : ""}`}
                              id="register-company"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                            />
                            {errors.companyName && (
                              <div className="invalid-feedback">{errors.companyName}</div>
                            )}
                          </div>


                          <div className="form-group">
                            <div htmlFor="register-phone">
                              Phone <span style={{ color: 'red' }}>*</span>
                            </div>
                            <input
                              type="text"
                              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                              id="register-phone"
                              name="phone"
                              value={formData.phone}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 15);
                                handleInputChange({ target: { name: "phone", value: onlyNumbers } });
                              }}
                              placeholder=""
                              maxLength={15}
                              inputMode="numeric"
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                          </div>


                          <div className="form-group">
                            <div htmlFor="register-address">
                              Address <span style={{ color: 'red' }}>*</span>
                            </div>
                            <textarea
                              className={`form-control ${errors.address ? "is-invalid" : ""}`}
                              id="register-address"
                              name="address"
                              rows="3"
                              value={formData.address}
                              onChange={handleInputChange}
                            />
                            {errors.address && (
                              <div className="invalid-feedback">{errors.address}</div>
                            )}
                          </div>

                          <div className="form-group">
                            <div htmlFor="register-gst">
                              GST Number <span style={{ color: 'red' }}>*</span>
                            </div>
                            <input
                              type="text"
                              className={`form-control ${errors.gstNumber ? "is-invalid" : ""}`}
                              id="register-gst"
                              name="gstNumber"
                              placeholder="GSTIN"
                              value={formData.gstNumber || ""}
                              onChange={handleInputChange}
                              maxLength={15}
                            />
                            {errors.gstNumber && (
                              <div className="invalid-feedback">{errors.gstNumber}</div>
                            )}
                          </div>
                        </>
                      )}

                      <div className="form-footer">
                        <button
                          type="submit"
                          className="btn btn-outline-primary-2"
                        >
                          <span>SIGN UP</span>
                          <i className="icon-long-arrow-right"></i>
                        </button>
                      </div>
                    </form>

                    {isGoogleEnabled && (
                      <>
                        <div className="form-choice">
                          <p className="text-center">or sign up with</p>
                        </div>
                        <div>
                          <GoogleLogin
                            onSuccess={handleLogin}
                            onError={() => console.error("Login Failed")}
                          />
                        </div>
                      </>
                    )}
                  </TabPanel>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  token: state.auth.token,
  loading: state.auth.loading,
  error: state.auth.error,
});

export default connect(mapStateToProps, {
  loginRequest,
  registerRequest,
  logout,
})(Login);




// import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
// import React, { useState, useEffect } from "react";
// import { connect } from "react-redux";
// import {
//   loginRequest,
//   registerRequest,
//   logout,
// } from "~/store/authReducer";
// import ALink from "~/components/features/alink";
// import { useRouter } from "next/router";
// import { GoogleLogin } from "@react-oauth/google";
// import jwt_decode from "jwt-decode";
// import {
//   fetchGoogleCredentials,
//   decryptGoogleCredentials,
// } from "~/utils/google-credentials.js";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";


// import { apirequest } from "~/utils/api";
// import { Helmet } from "react-helmet";

// function Login({
//   loginRequest,
//   registerRequest,
//   logout,
//   token,
//   loading,
//   error,
// }) {
//   const [isRegister, setIsRegister] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//   });
//   const [errors, setErrors] = useState({});
//   const router = useRouter();
//   const [serverError, setServerError] = useState("");
//   const [selectedTab, setSelectedTab] = useState(0); // 0: Login, 1: Register
//   const [isForgotPassword, setIsForgotPassword] = useState(false);

//   useEffect(() => {
//     // Debug log
//      if (token && !loading) {
//       setIsRegister(false); // Switch to login tab if registered
//       window.location.href = "/";
//     }
//   }, [token, loading]);

//   useEffect(() => {
//     if (token) {
//       // Log the token in localStorage
//        localStorage.setItem('frequency-auth', JSON.stringify({ token }));
//      }
//   }, [token]);

//   const validateForm = () => {
//     const validationErrors = {};
//     const { email, password, name } = formData;

//     if (!email) {
//       validationErrors.email = "Email is required.";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       validationErrors.email = "Email is invalid.";
//     }

//     // Password validation for both login and register
//     if (!password) {
//       validationErrors.password = "Password is required.";
//     } else if (isRegister && password.length < 6) {
//       validationErrors.password = "Password must be at least 6 characters.";
//     }

//     if (isRegister && !name) {
//       validationErrors.name = "Name is required.";
//     }

//     setErrors(validationErrors);

//     return Object.keys(validationErrors).length === 0;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleRegisterSubmit = (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       const { name, email, password } = formData;
//       registerRequest({ name, email, password });
//     }
//   };

//   const handleLoginSubmit = (e) => {
//     e.preventDefault();
//     setErrors({});
//     setServerError("");
//     if (validateForm()) {
//       const { email, password } = formData;
//       const cartUniId = localStorage.getItem("cart_uni_id") || "";
//       const wishUniId = localStorage.getItem("wish_uni_id") || "";
//       loginRequest({ email, password, cartUniId, wishUniId });

//       if (error) {
//         setServerError(error);
//       }
//     }
//   };

//   const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);

//   useEffect(() => {
//     const getGoogleCredentials = async () => {
//       try {
//         const response = await fetchGoogleCredentials();
//         const encryptedData = response;
//         const decryptedData = await decryptGoogleCredentials(
//           encryptedData,
//           process.env.NEXT_PUBLIC_ENCRYPT_SECRET_KEY
//         );
        
//         const credentialsJson = JSON.parse(decryptedData);
//         setIsGoogleEnabled(credentialsJson.google_key);
//       } catch (error) {
//         console.error("Error getting Google credentials:", error);
//       }
//     };

//     getGoogleCredentials();
//   }, []);

//   const [user, setUser] = useState(null);

//   const handleLogin = async (response) => {
//     if (!response.credential) {
//       console.error("No credential provided by Google");
//       alert("Google authentication failed: No credential found!");
//       return;
//     }

//     try {
//       const token = response.credential;
//       const decoded = jwt_decode(token);

//       await loginRequest({
//         email: decoded.email,
//         password: "",
//         type: "google",
//       });

//       setUser({
//         name: decoded.name,
//         email: decoded.email,
//         picture: decoded.picture,
//       });
//     } catch (error) {
//       console.error("Google Login Error:", error.message, error);
//       alert(`Google authentication failed: ${error.message}`);
//     }
//   };

//   const handleForgotPasswordClick = async () => {
//     const email = formData.email;

//     if (!email) {
//       toast.error("Please enter your email address");
//       return;
//     }

//     // console.log(email , 'emailemail')

//     try {
//       const response = await apirequest(
//         "POST",
//         `/user/forget-password`,
//         { email },
//         null
//       );

//       // console.log(response , "responsefeew")

//       if (response && response.success) {
//         toast.success(response.message);
//       } else {
//         toast.error(response?.message );
//       }
//     } catch (error) {
//       toast.error("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="main">
//       <Helmet>
//         <meta name="description" content="Login" />
//         <title>Login</title>
//       </Helmet>
//       <nav className="breadcrumb-nav border-0 mb-0">
//         <div className="container">
//           <ol className="breadcrumb">
//             <li className="breadcrumb-item">
//               <ALink href="/">Home</ALink>
//             </li>
//             <li className="breadcrumb-item">
//               <ALink href="#">Pages</ALink>
//             </li>
//             <li className="breadcrumb-item active">
//               {isRegister ? "Register" : isForgotPassword ? "Forgot Password" : "Login"}
//             </li>
//           </ol>
//         </div>
//       </nav>

//       <div
//         className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17"
//       >
//         <div className="container">
//           <div className="form-box">
//             <div className="form-tab">
//               <Tabs selectedTabClassName="show" selectedIndex={selectedTab} onSelect={setSelectedTab}>
//                 <TabList className="nav nav-pills nav-fill">
//                   <Tab className="nav-item">
//                     <span
//                       className="nav-link"
//                       onClick={() => {
//                         setIsRegister(false);
//                         setIsForgotPassword(false);
//                         setErrors({});
//                         setServerError("");
//                         setSelectedTab(0);
//                       }}
//                     >
//                       Sign In
//                     </span>
//                   </Tab>
//                   <Tab className="nav-item">
//                     <span
//                       className="nav-link"
//                       onClick={() => {
//                         setIsRegister(true);
//                         setIsForgotPassword(false);
//                         setErrors({});
//                         setServerError("");
//                         setSelectedTab(1);
//                       }}
//                     >
//                       Register
//                     </span>
//                   </Tab>
//                 </TabList>

//                 <div className="tab-content">
//                   {/* Login Form */}
//                   <TabPanel>
//                     {!isForgotPassword ? (
//                       <form onSubmit={handleLoginSubmit}>
//                         <div className="form-group">
//                           <div htmlFor="login-email">
//                             Email Address <span style={{ color: 'red' }}>*</span>
//                           </div>
//                           <input
//                             type="email"
//                             className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                             id="login-email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                           />
//                           {errors.email && (
//                             <div className="invalid-feedback">{errors.email}</div>
//                           )}
//                         </div>

//                         <div className="form-group">
//                           <div htmlFor="login-password">
//                             Password <span style={{ color: 'red' }}>*</span>
//                           </div>
//                           <input
//                             type="password"
//                             className={`form-control ${errors.password ? "is-invalid" : ""}`}
//                             id="login-password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleInputChange}
//                           />
//                           {errors.password && (
//                             <div className="invalid-feedback">{errors.password}</div>
//                           )}
//                         </div>

//                         {/* {serverError && (
//                           <div className="alert alert-danger" role="alert">
//                             {serverError}
//                           </div>
//                         )} */}

//                         <div className="form-group d-flex justify-content-between">
//                           <button
//                             type="submit"
//                             className="btn btn-outline-primary-2"
//                             disabled={loading}
//                           >
//                             {loading ? "Logging in..." : "LOG IN"}
//                             <i className="icon-long-arrow-right"></i>
//                           </button>

//                           <button
//                             type="button"
//                             className="btn btn-outline-primary-2"
//                             onClick={() => setIsForgotPassword(true)}
//                           >
//                             Forgot Your Password?
//                           </button>
//                         </div>

//                         {isGoogleEnabled && (
//                           <>
//                             <div className="form-choice">
//                               <p className="text-center">or sign up with</p>
//                             </div>
//                             <div>
//                               <GoogleLogin
//                                 onSuccess={handleLogin}
//                                 onError={() => console.error("Login Failed")}
//                               />
//                             </div>
//                           </>
//                         )}
//                       </form>
//                     ) : (
//                       <form
//                         onSubmit={e => {
//                           e.preventDefault();
//                           handleForgotPasswordClick();
//                         }}
//                       >
//                         <div className="form-group">
//                           <div htmlFor="forgot-email">
//                             Email Address <span style={{ color: 'red' }}>*</span>
//                           </div>
//                           <input
//                             type="email"
//                             className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                             id="forgot-email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                           />
//                           {errors.email && (
//                             <div className="invalid-feedback">{errors.email}</div>
//                           )}
//                         </div>
//                         <div className="form-group d-flex justify-content-between">
//                           <button
//                             type="submit"
//                             className="btn btn-outline-primary-2"
//                           >
//                             <span>Send Reset Password Link</span>
//                             <i className="icon-long-arrow-right"></i>
//                           </button>
//                           <button
//                             type="button"
//                             className="btn btn-outline-primary-2"
//                             onClick={() => setIsForgotPassword(false)}
//                           >
//                             Back to Login
//                           </button>
//                         </div>
//                       </form>
//                     )}
//                   </TabPanel>

//                   {/* Register Form */}
//                   <TabPanel>
//                     <form onSubmit={handleRegisterSubmit}>
//                       <div className="form-group">
//                         <div htmlFor="register-name">
//                           Your Name <span style={{ color: 'red' }}>*</span>
//                         </div>
//                         <input
//                           type="text"
//                           className={`form-control ${errors.name ? "is-invalid" : ""}`}
//                           id="register-name"
//                           name="name"
//                           value={formData.name}
//                           onChange={handleInputChange}
//                         />
//                         {errors.name && (
//                           <div className="invalid-feedback">{errors.name}</div>
//                         )}
//                       </div>

//                       <div className="form-group">
//                         <div htmlFor="register-email">
//                           Your Email <span style={{ color: 'red' }}>*</span>
//                         </div>
//                         <input
//                           type="email"
//                           className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                           id="register-email"
//                           name="email"
//                           value={formData.email}
//                           onChange={handleInputChange}
//                         />
//                         {errors.email && (
//                           <div className="invalid-feedback">{errors.email}</div>
//                         )}
//                       </div>

//                       <div className="form-group">
//                         <div htmlFor="register-password">
//                           Password <span style={{ color: 'red' }}>*</span>
//                         </div>
//                         <input
//                           type="password"
//                           className={`form-control ${errors.password ? "is-invalid" : ""}`}
//                           id="register-password"
//                           name="password"
//                           value={formData.password}
//                           onChange={handleInputChange}
//                         />
//                         {errors.password && (
//                           <div className="invalid-feedback">{errors.password}</div>
//                         )}
//                       </div>

//                       <div className="form-footer">
//                         <button
//                           type="submit"
//                           className="btn btn-outline-primary-2"
//                         >
//                           <span>SIGN UP</span>
//                           <i className="icon-long-arrow-right"></i>
//                         </button>
//                       </div>
//                     </form>

//                     {isGoogleEnabled && (
//                       <>
//                         <div className="form-choice">
//                           <p className="text-center">or sign up with</p>
//                         </div>
//                         <div>
//                           <GoogleLogin
//                             onSuccess={handleLogin}
//                             onError={() => console.error("Login Failed")}
//                           />
//                         </div>
//                       </>
//                     )}
//                   </TabPanel>
//                 </div>
//               </Tabs>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const mapStateToProps = (state) => ({
//   user: state.auth.user,
//   token: state.auth.token,
//   loading: state.auth.loading,
//   error: state.auth.error,
// });

// export default connect(mapStateToProps, {
//   loginRequest,
//   registerRequest,
//   logout,
// })(Login);
