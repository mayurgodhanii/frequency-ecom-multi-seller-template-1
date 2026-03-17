import { useEffect, useState } from "react";
import { connect } from "react-redux";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import { cartPriceTotal, getCurrencySymbol } from "~/utils/index";
import { useRouter } from "next/router";
import { actions } from "~/store/cart";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { apirequest, getToken } from "~/utils/api";
import Helmet from "react-helmet";
import Cookies from "js-cookie";
import Select from "react-select";

function Checkout(props) {
  const { cartlist, clearCart } = props;
  const router = useRouter();
  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token ? auth.token.replace(/"/g, "") : null;

  const [address, setAddress] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartList, setCartList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const spaceName = Cookies.get("spaceName");
  const [error, setError] = useState(null);
  const [appliedCouponId, setAppliedCouponId] = useState(null);
  const [couponError, setCouponError] = useState("");
  const currency = Cookies.get("currency");
  useEffect(() => {
    const fetchCartList = async () => {
      try {
        const token = getToken();

        // Redirect to login if no token (multivendor requires authentication)
        if (!token || token === "null") {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }

        const url = `/cart/list`;
        const params = {
          couponId: appliedCouponId || ""
        };

        const response = await apirequest("GET", url, null, params);

        if (response.success) {
          // Extract cart data from nested structure
          setCartList(response.data || {});
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
  }, [token, appliedCouponId]);


  useEffect(() => {
    const fetchCountryList = async () => {
      try {
        let url = "";
        const params = {};

        url = `/user/country-list`;

        const response = await apirequest("GET", url, null, params);
        if (response.success) {
          setCountryList(response || []);
        } else {
          throw new Error("Failed to fetch cart list");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCountryList();
  }, []);

  //coupon
  const [couponCode, setCouponCode] = useState("");
  const [isCouponVisible, setIsCouponVisible] = useState(false);
  const [couponList, setCouponList] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});

  // useEffect(() => {
  //   const fetchCouponList = async () => {
  //     if (token) {
  //       try {
  //         const response = await apirequest("GET", "/user/coupon-list");
  //         if (response.success && response.data.data.length > 0) {
  //           setCouponList(response.data.data);
  //           localStorage.setItem("couponList", JSON.stringify(response.data.data));
  //         } else {
  //           setCouponList([]);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching coupon list:", error);
  //         setCouponList([]);
  //       }
  //     } else {
  //       setCouponList([]);
  //     }
  //   };
  //   fetchCouponList();
  // }, [token]);

  useEffect(() => {
    const fetchCouponList = async () => {
      try {
        const response = await apirequest("GET", "/user/coupon-list");
        if (response.success && response.data.data.length > 0) {
          setCouponList(response.data.data);
          localStorage.setItem(
            "couponList",
            JSON.stringify(response.data.data)
          );
        } else {
          setCouponList([]);
        }
      } catch (error) {
        console.error("Error fetching coupon list:", error);
        setCouponList([]);
      }
    };

    if (token !== "null" && token !== undefined) {
      fetchCouponList();
    } else {
      setCouponList([]);
    }
  }, [token]);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();

    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const selectedCoupon = couponList.find(
      (coupon) => coupon.code === couponCode
    );

    if (selectedCoupon) {
      setAppliedCouponId(selectedCoupon.id);
      setCouponCode("");
      setCouponError("");
      toast.success("Coupon applied successfully!");
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  // const copyToClipboard = (code, id) => {
  //   navigator.clipboard.writeText(code);
  //   setCouponCode(code);
  //   setCopiedStates(prev => ({ ...prev, [id]: true }));
  //   setTimeout(() => {
  //     setCopiedStates(prev => ({ ...prev, [id]: false }));
  //   }, 1000);
  // };

  const copyToClipboard = (code, id) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => handleCopySuccess(code, id))
        .catch(() => fallbackCopy(code, id));
    } else {
      fallbackCopy(code, id);
    }
  };

  const getCouponLimits = (coupon, currency) => {
    if (currency === "USD") {
      return {
        min: coupon.usd_min_order_amount,
        maxDiscount: coupon.usd_max_discount_amount,
      };
    }
    return {
      min: coupon.min_order_amount,
      maxDiscount: coupon.max_discount_amount,
    };
  };

  const applyCoupon = (code) => {
    const selectedCoupon = couponList.find((coupon) => coupon.code === code);
    if (!selectedCoupon) return;

    const totalAmount =
      currency === "USD" ? cartList?.totalUsdPriceSum : cartList?.totalPriceSum;

    const { min } = getCouponLimits(selectedCoupon, currency);

    if (totalAmount < min) {
      toast.error("This coupon is not applicable for your order total.");
      return;
    }

    setCouponCode(code);
  };

  const handleCopySuccess = (code, id) => {
    const selectedCoupon = couponList.find((coupon) => coupon.code === code);
    if (!selectedCoupon) return;

    const totalAmount =
      currency === "USD" ? cartList?.totalUsdPriceSum : cartList?.totalPriceSum;

    const { min } = getCouponLimits(selectedCoupon, currency);

    if (totalAmount < min) {
      toast.error("This coupon is not applicable for your order total.");
      return;
    }

    setCouponCode(code);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 1000);
  };

  // const handleCopySuccess = (code, id) => {

  //   setCouponCode(code);
  //   setCopiedStates(prev => ({ ...prev, [id]: true }));

  //   setTimeout(() => {
  //     setCopiedStates(prev => ({ ...prev, [id]: false }));
  //   }, 1000);
  // };

  const fallbackCopy = (code, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        handleCopySuccess(code, id);
      } else {
        throw new Error("execCommand failed");
      }
    } catch (err) {
      // alert("Copying is not supported in this browser. Please copy manually.");
    }

    document.body.removeChild(textArea);
  };

  // const applyCoupon = (code) => {
  //   console.log(code , "")
  //   setCouponCode(code);
  // };

  // Fetch payment methods and settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await apirequest("GET", `/user/payment-method-list`);
        if (response.success) {
          setPayment(response);
        } else {
          console.error("Failed to fetch payment methods:", response.message);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchPaymentSettings();
  }, []);

  // Load Razorpay SDK
  useEffect(() => {
    const razorpayScript = document.createElement("script");
    razorpayScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    razorpayScript.async = true;
    razorpayScript.onload = () => console.log("Razorpay SDK loaded");
    document.body.appendChild(razorpayScript);

    return () => {
      document.body.removeChild(razorpayScript);
    };
  }, []);

  // Load PayPal SDK based on sandbox/live mode
  useEffect(() => {
    if (!payment?.dataweb?.settings) return;

    const settings = payment.dataweb.settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    const paypalClientId =
      settings.sandbox_paypal_switch === "on" && settings.sandbox_paypal
        ? settings.sandbox_paypal_key
        : settings.paypal_key;

    if (!paypalClientId) return;

    const paypalScript = document.createElement("script");
    paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&components=buttons`;
    paypalScript.async = true;
    paypalScript.setAttribute("data-namespace", "paypal_sdk");

    paypalScript.onload = () => setPaypalSdkLoaded(true);
    paypalScript.onerror = (error) => {
      console.error("PayPal SDK failed to load", error);
      toast.error("Failed to load PayPal SDK.");
    };

    document.body.appendChild(paypalScript);

    return () => {
      document.body.removeChild(paypalScript);
    };
  }, [payment]);

  // Helper function to get Razorpay key based on sandbox mode
  const getRazorpayKey = (settings) => {
    return settings.sandbox_razorpay_switch && settings.sandbox_razorpay
      ? settings.sandbox_razorpay_key
      : settings.razorpay_key;
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async (data) => {
    setLoading(true);
    const userAddress = `${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}, ${data.email}, ${data.firstName} ${data.lastName}, ${data.phone}, Notes: ${data.notes}`;
    const settings = payment.dataweb.settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    try {
      const orderResponse =
        token && token !== "null"
          ? await apirequest("POST", "/user/create-order", {
              type: "razorPay",
              name: `${data.firstName} ${data.lastName}`,
              // dial_code: "+91", // Default to +91, you may want to make this dynamic based on country
              phone: data.phone,
              amount: cartList?.finalPriceSum,
              usd_amount: cartList?.finalUsdPriceSum,
              couponId: appliedCouponId,
              address: userAddress,
              currency: currency || "INR",
              country: data.country,
              pincode: data.zip,
              charges: {
                shipping: cartList?.delivery || 0,
                tax: cartList?.inr_tax || 0,
                discount: cartList?.discount || 0,
              },
              product_details: cartList?.data.map((item) => ({
                product_id: item.product_id || item.product?.id,
                name: item.product?.name || item.name || 'Product',
                quantity: item.quantity,
                price: item.selected_variant_price || item.price,
                variant: item.variant || null,
              })),
            })
          : await apirequest("POST", "/user/create-order", {
              type: "razorPay",
              name: `${data.firstName} ${data.lastName}`,
              // dial_code: "+91", // Default to +91, you may want to make this dynamic based on country
              phone: data.phone,
              amount: cartList?.finalPriceSum,
              usd_amount: cartList?.finalUsdPriceSum,
              address: userAddress,
              couponId: appliedCouponId,
              currency: currency || "INR",
              country: data.country,
              pincode: data.zip,
              email: data.email,
              cart_uni_id: localStorage.getItem("cart_uni_id") || "",
              charges: {
                shipping: cartList?.delivery || 0,
                tax: cartList?.inr_tax || 0,
                discount: cartList?.discount || 0,
              },
              product_details: cartList?.data.map((item) => ({
                product_id: item.product_id || item.product?.id,
                name: item.product?.name || item.name || 'Product',
                quantity: item.quantity,
                price: item.selected_variant_price || item.price,
                variant: item.variant || null,
              })),
            });

      if (
        orderResponse?.message === "Delivery is not availble in this pincode"
      ) {
        toast.warn("Delivery is not available in this pincode");
        setLoading(false);
        return;
      }
      if (!orderResponse.success)
        throw new Error("Failed to create order");
      const { order_id } = orderResponse;
      setOrderId(order_id);

      const options = {
        key: getRazorpayKey(settings),
        amount: cartList?.finalPriceSum * 100,
        usd_amount: cartList?.finalUsdPriceSum,
        currency: "INR",
        name: "Your Business Name",
        description: "Payment for order",
        order_id,
        handler: async (response) => {
          const paymentData = {
            type: "razorPay",
            order_id,
            payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            cart_uni_id: localStorage.getItem("cart_uni_id") || "",
          };

          const verificationResult = await apirequest(
            "POST",
            "/user/verify-payment",
            paymentData
          );

          if (verificationResult.success) {
            toast.success(verificationResult.message);
            clearCart();
            router.push(token && token !== "null" ? "/shop/dashboard" : "/");
          } else {
            toast.error("Payment verification failed. Please try again.");
          }
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error during Razorpay payment:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // PayPal Payment Handler
  const handlePayPalPayment = async (data) => {
    setLoading(true);
    const userAddress = `${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}, ${data.email}, ${data.firstName} ${data.lastName}, ${data.phone}, Notes: ${data.notes}`;

    try {
      const orderData = {
        type: "payPal",
        name: `${data.firstName} ${data.lastName}`,
        // dial_code: "+91", // Default to +91, you may want to make this dynamic based on country
        phone: data.phone,
        amount: cartList?.finalPriceSum,
        usd_amount: cartList?.finalUsdPriceSum,
        address: userAddress,
        couponId: appliedCouponId,
        currency: currency || "INR",
        product_details: cartList?.data.map((item) => ({
          product_id: item.product_id || item.product?.id,
          name: item.product?.name || item.name || 'Product',
          quantity: item.quantity,
          price: item.selected_variant_price || item.price,
          variant: item.variant || null,
        })),
      };

      const orderResponse =
        token && token !== "null"
          ? await apirequest("POST", "/user/create-order", {
              ...orderData,
              country: data.country,
              pincode: data.zip,
              charges: {
                shipping: cartList?.delivery || 0,
                tax: cartList?.inr_tax || 0,
                discount: cartList?.discount || 0,
              },
            })
          : await apirequest("POST", "/user/create-order", {
              ...orderData,
              email: data.email,
              country: data.country,
              pincode: data.zip,
              cart_uni_id: localStorage.getItem("cart_uni_id") || "",
              charges: {
                shipping: cartList?.delivery || 0,
                tax: cartList?.inr_tax || 0,
                discount: cartList?.discount || 0,
              },
            });

      if (
        orderResponse?.message === "Delivery is not availble in this pincode"
      ) {
        toast.warn("Delivery is not available in this pincode");
        setLoading(false);
        return;
      }

      if (!orderResponse.success)
        throw new Error("Failed to create order");
      const orderID = orderResponse.order_id;

      if (paypalSdkLoaded) {
        window.paypal_sdk
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  { amount: { value: cartList?.finalPriceSum } },
                ],
              });
            },
            onApprove: async (data, actions) => {
              const details = await actions.order.capture();
              const paymentData = {
                type: "payPal",
                paypal_order_id: data.orderID,
                order_id: orderID,
                payment_id: data.payerID,
                cart_uni_id: localStorage.getItem("cart_uni_id") || "",
              };

              const result = await apirequest(
                "POST",
                "/user/verify-payment",
                paymentData
              );

              if (result.success) {
                toast.success("Payment captured successfully!");
                clearCart();
                router.push(
                  token && token !== "null" ? "/shop/dashboard" : "/"
                );
              } else {
                toast.error("Failed to capture payment. Please try again.");
              }
            },
            onError: (err) => {
              console.error("PayPal Error: ", err);
              toast.error("Payment error. Please try again.");
            },
          })
          .render("#paypal-button-container");
      }
    } catch (error) {
      console.error("Error during PayPal payment:", error);
      toast.error("Payment creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCODPayment = async (data) => {
    setLoading(true);
    const userAddress = `${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}, ${data.email}, ${data.firstName} ${data.lastName}, ${data.phone}, Notes: ${data.notes}`;
    const token = getToken();

    try {
      const orderData = {
        type: "cod",
        name: `${data.firstName} ${data.lastName}`,
        // dial_code: "+91", // Default to +91, you may want to make this dynamic based on country
        phone: data.phone,
        amount: cartList?.finalPriceSum,
        usd_amount: cartList?.finalUsdPriceSum,
        currency: currency,
        address: userAddress,
        couponId: appliedCouponId,
        product_details: cartList?.data.map((item) => ({
          product_id: item.product_id || item.product?.id,
          name: item.product?.name || item.name || 'Product',
          quantity: item.quantity,
          price: item.selected_variant_price || item.price,
          variant: item.variant || null,
        })),
      };

      let response;
      if (!token || token === "null") {
        response = await apirequest("POST", "/user/create-order", {
          ...orderData,
          email: data.email,
          country: data.country,
          pincode: data.zip,
          charges: {
            shipping: cartList?.delivery || 0,
            tax: cartList?.inr_tax || 0,
            discount: cartList?.discount || 0,
          },
          cart_uni_id: localStorage.getItem("cart_uni_id") || "",
        });
      } else {
        response = await apirequest("POST", "/user/create-order", {
          ...orderData,
          country: data.country,
          pincode: data.zip,
          charges: {
            shipping: cartList?.delivery || 0,
            tax: cartList?.inr_tax || 0,
            discount: cartList?.discount || 0,
          },
        });
      }

      if (response?.message === "Delivery is not availble in this pincode") {
        toast.warn("Delivery is not available in this pincode");
        setLoading(false);
        return;
      }

      // Check if response is valid
      if (!response || typeof response !== "object" || !("data" in response)) {
        throw new Error("Invalid API response");
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to create order");
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push(token && token !== "null" ? "/shop/dashboard" : "/");
    } catch (error) {
      console.error("Error during COD payment:", error);
      toast.error(
        error.message || "An error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const addOrUpdateAddress = async (data) => {
    const addressData = {
      name: `${data.firstName} ${data.lastName}`,
      address: data.addressLine1,
      city: data.city,
      state: data.state,
      zipcode: data.zip,
      country: data.country,
    };

    try {
      let response;
      
      // If address exists, update it; otherwise, create new one
      if (address && address.id) {
        response = await apirequest(
          "PUT",
          `/user/address-edit/${address.id}`,
          addressData
        );
      } else {
        response = await apirequest(
          "POST",
          "/user/address-add",
          addressData
        );
      }
      
      if (response.success) {
        localStorage.setItem("userAddress", JSON.stringify(response.data));
        setAddress(response.data);
        return true;
      } else {
        toast.error("Failed to save address");
        return false;
      }
    } catch (error) {
      console.error("Error adding/updating address:", error);
      return false;
    }
  };

  const onSubmit = async (data) => {
    if (!paymentMethod) {
      toast.warning("Please select a payment method");
      return;
    }

    try {
      if (paymentMethod === "razorPay") {
        await handleRazorpayPayment(data);
      } else if (paymentMethod === "payPal") {
        await handlePayPalPayment(data);
      } else if (paymentMethod === "cod") {
        await handleCODPayment(data);
      }
      // Only create address if user is authenticated and has no existing addresses
      if (token !== "null" && token !== undefined) {
        // Check if user has any addresses
        try {
          const addressResponse = await apirequest("GET", "/user/address-list");
          if (addressResponse.success && addressResponse.data.length === 0) {
            // Only create address if user has no addresses at all
            addOrUpdateAddress(data);
          }
        } catch (error) {
          console.error("Error checking addresses:", error);
        }
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await apirequest("GET", "/user/address-list");
        if (response.success && response.data.length > 0) {
          setAddress(response.data[0]);
          localStorage.setItem("userAddress", JSON.stringify(response.data[0]));
        } else {
          setAddress(null);
          localStorage.removeItem("userAddress");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setAddress(null);
        localStorage.removeItem("userAddress");
      }
    };

    if (token !== "null" && token !== undefined) {
      fetchAddress();
    } else {
      setAddress(null);
      localStorage.removeItem("userAddress");
    }
  }, [token]);

  useEffect(() => {
    if (address) {
      setValue("firstName", address.name.split(" ")[0] || "");
      setValue("lastName", address.name.split(" ")[1] || "");
      setValue("addressLine1", address.address || "");
      setValue("city", address.city || "");
      setValue("state", address.state || "");
      setValue("country", address.country || "");
      setValue("zip", address.zipcode || "");
    }
  }, [address, setValue]);

  // Derive available payment methods from settings
  const getAvailablePaymentMethods = () => {
    if (!payment?.dataweb?.settings) return [];
    const settings = payment.dataweb.settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    const methods = [];
    if (settings.sandbox_razorpay || settings.razorpay_key) {
      methods.push({ type: "razorPay", name: "Razorpay" });
    }
    if (settings.sandbox_paypal || settings.paypal_key) {
      methods.push({ type: "payPal", name: "PayPal" });
    }
    if (settings.cod_switch) {
      methods.push({ type: "cod", name: "Cash on Delivery" });
    }
    return methods;
  };

  return (
    <div className="main">
      <Helmet>
        <title>Checkout | {spaceName}</title>
        <meta name="description" content="Checkout" />
      </Helmet>
      <PageHeader title="Checkout" subTitle="Shop" />
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/shop/list">Shop</ALink>
            </li>
            <li className="breadcrumb-item active">Checkout</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="checkout">
          <div className="container">
            <div className="checkout-discount-container">
              <div className="coupon-prompt">
                <span
                  className="coupon-link"
                  onClick={() => setIsCouponVisible(!isCouponVisible)}
                >
                  Have a coupon? Click here to enter your code
                </span>
              </div>
              {/* {console.log(couponList , 'dsfsdggd')} */}

              {isCouponVisible && (
                <form className="coupon-form" onSubmit={handleCouponSubmit}>
                  <p>If you have a coupon code, please apply it below.</p>

                  {couponList.length > 0 && (
                    <div className="coupon-chips-container">
                      {couponList.map((coupon) => (
                        <div key={coupon.id} className="coupon-chip">
                          <div
                            className="coupon-chip-content"
                            onClick={() => applyCoupon(coupon.code)}
                          >
                            <span className="coupon-chip-code">
                              {coupon.code}
                            </span>
                            <span className="coupon-chip-description">
                              Maximum Discount :{" "}
                              {getCurrencySymbol(currency || "USD")}
                              {currency === "USD"
                                ? coupon.usd_max_discount_amount
                                : coupon.max_discount_amount}
                            </span>
                            <span className="coupon-chip-description">
                              Minimum Amount :{" "}
                              {getCurrencySymbol(currency || "USD")}
                              {currency === "USD"
                                ? coupon.usd_min_order_amount
                                : coupon.min_order_amount}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`coupon-copy-button ${
                              copiedStates[coupon.id] ? "copied" : ""
                            }`}
                            onClick={() =>
                              copyToClipboard(coupon.code, coupon.id)
                            }
                          >
                            <svg
                              className="copy-icon"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                className={`copy-path ${
                                  copiedStates[coupon.id] ? "hidden" : ""
                                }`}
                                d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                                fill="gray"
                              />
                              <path
                                className={`check-path ${
                                  copiedStates[coupon.id] ? "" : "hidden"
                                }`}
                                d="M9 18L4.5 13.5L6.5 11.5L9 14L16.5 6.5L18.5 8.5L9 18Z"
                                fill="green"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="coupon-input-group">
                    <input
                      type="text"
                      className={`coupon-input ${couponError ? "error" : ""}`}
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                    />

                    <button type="submit" className="coupon-apply-button">
                      →
                    </button>
                  </div>

                  {couponError && (
                    <div className="coupon-error-message">{couponError}.</div>
                  )}
                </form>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-lg-9">
                  <h2 className="checkout-title">Billing Details</h2>
                  <div className="row">
                    <div className="col-sm-6">
                      <label>
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.firstName ? "is-invalid" : ""
                        }`}
                        {...register("firstName", {
                          required: "First Name is required",
                        })}
                      />
                      {errors.firstName && (
                        <div className="invalid-feedback">
                          {errors.firstName.message}
                        </div>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label>
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.lastName ? "is-invalid" : ""
                        }`}
                        {...register("lastName", {
                          required: "Last Name is required",
                        })}
                      />
                      {errors.lastName && (
                        <div className="invalid-feedback">
                          {errors.lastName.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <label>
                    Country <span className="required">*</span>
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    options={countryList?.data?.map((country) => ({
                      value: country.name,
                      label: country.name,
                    }))}
                    placeholder="Select a country"
                    onChange={(selected) =>
                      setValue("country", selected ? selected.value : "", {
                        shouldValidate: true,
                      })
                    }
                    onBlur={() =>
                      setValue("country", getValues("country"), {
                        shouldValidate: true,
                      })
                    }
                    value={
                      countryList?.data
                        ?.map((country) => ({
                          value: country.name,
                          label: country.name,
                        }))
                        .find(
                          (option) =>
                            option.value === (getValues("country") || "")
                        ) || null
                    }
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        backgroundColor: "#fafbfc", // lighter than before
                        borderColor: "#e0e0e0",
                        color: "#424242",
                        boxShadow: "none",
                        minHeight: "38px",
                        cursor: "pointer",
                        outline: "none",
                        ":hover": {
                          borderColor: "#e0e0e0",
                          boxShadow: "none",
                        },
                        ":focus": {
                          borderColor: "#e0e0e0",
                          boxShadow: "none",
                          outline: "none",
                        },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? "#e9ecef" // lighter selected
                          : "#fff",
                        color: "#424242",
                        cursor: "pointer",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#424242",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#bdbdbd",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: "#fafbfc", // lighter menu
                      }),
                    }}
                  />
                  <input
                    type="hidden"
                    {...register("country", {
                      required: "Country is required",
                    })}
                  />
                  {errors.country && (
                    <div className="invalid-feedback">
                      {errors.country.message}
                    </div>
                  )}
                  <label>
                    Street Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.addressLine1 ? "is-invalid" : ""
                    }`}
                    {...register("addressLine1", {
                      required: "Address is required",
                    })}
                  />
                  {errors.addressLine1 && (
                    <div className="invalid-feedback">
                      {errors.addressLine1.message}
                    </div>
                  )}
                  <input
                    type="text"
                    className="form-control"
                    {...register("addressLine2")}
                    placeholder="Apartment, suite, unit, etc."
                  />
                  <div className="row">
                    <div className="col-sm-6">
                      <label>
                        Town / City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.city ? "is-invalid" : ""
                        }`}
                        {...register("city", { required: "City is required" })}
                      />
                      {errors.city && (
                        <div className="invalid-feedback">
                          {errors.city.message}
                        </div>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label>
                        State / Country <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.state ? "is-invalid" : ""
                        }`}
                        {...register("state", {
                          required: "State is required",
                        })}
                      />
                      {errors.state && (
                        <div className="invalid-feedback">
                          {errors.state.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <label>
                        Postcode / ZIP <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.zip ? "is-invalid" : ""
                        }`}
                        maxLength={6}
                        {...register("zip", {
                          required: "Postcode/ZIP is required",
                          pattern: {
                            value: /^\d{5,6}$/,
                            message: "ZIP must be 5 or 6 digits",
                          },
                        })}
                      />
                      {errors.zip && (
                        <div className="invalid-feedback">
                          {errors.zip.message}
                        </div>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label>
                        Phone <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        maxLength={10}
                        {...register("phone", {
                          required: "Phone is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Phone must be 10 digits",
                          },
                        })}
                        onInput={(e) =>
                          (e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10))
                        }
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">
                          {errors.phone.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <label>
                    Email address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Email is invalid",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
                  )}
                  <label>Order notes (optional)</label>
                  <textarea
                    className="form-control"
                    {...register("notes")}
                  ></textarea>
                </div>

                {/* <aside className="col-lg-3">
                  <div className="summary">
                    <h3 className="summary-title">Your Order</h3>


                    <table className="table table-summary">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartList?.data?.map((item, index) => (
                          <tr key={index}>

                            <td>{item?.product?.name || item?.name || 'Product'}</td>
                            <td>
                              {getCurrencySymbol(currency || 'USD')}
                              {item.total_price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                        <tr className="summary-subtotal">
                          <td>Subtotal:</td>
                          <td>

                            {getCurrencySymbol(currency || 'USD')}
                            {cartList?.totalPriceSum}
                          </td>
                        </tr>
                        {cartList?.discount > 0 && (
                          <tr className="">
                            <td>Discount:</td>
                            <td>{cartList.discount}</td>
                          </tr>
                        )}

                        <tr className="summary-total">
                          <td>Total:</td>
                          <td>

                            {getCurrencySymbol(currency || 'USD')}{cartList?.finalPriceSum}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div id="paypal-button-container"></div>

                


                    <div className="payment-methods">
                      {getAvailablePaymentMethods()
                        .filter(
                          (method) =>
                            method.type === "cod" || (currency === "INR" ? method.type === "razorPay" : method.type === "payPal")
                        )
                        .map((method) => (
                          <div className="radio-btn" key={method.type}>
                            <input
                              type="radio"
                              id={method.type}
                              name="paymentMethod"
                              value={method.type}
                              checked={paymentMethod === method.type}
                              onChange={handlePaymentMethodChange}
                            />
                            <label htmlFor={method.type}>{method.name}</label>
                            {paymentMethod === method.type && (
                              <div className="payment-message fade-in">
                                <p>
                                  {method.type === "razorPay"
                                    ? 'After clicking "Pay now", you will be redirected to Razorpay Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.'
                                    : method.type === "payPal"
                                      ? 'After clicking "Pay now", you will be redirected to PayPal to complete your purchase securely.'
                                      : "Cash on Delivery selected. Pay in cash upon Delivery."}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-outline-primary-2 btn-order btn-block"
                      disabled={loading}
                    >
                      <span className="btn-text">Place Order</span>
                      <span className="btn-hover-text">Proceed to Checkout</span>
                    </button>
                  </div>
                </aside> */}

                {/* {console.log(cartList , 'safsdfsdgdfh')} */}

                <aside className="col-lg-3">
                  <div className="summary">
                    <h3 className="summary-title">Your Order</h3>

                    <table className="table table-summary">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                         {cartList?.data?.map((item, index) => {
                          const price =
                            currency === "USD"
                              ? item.selected_variant_usd_price
                              : item.selected_variant_price;
                          return (
                            <tr key={index}>
                              <td>{item?.productDetails?.name}</td> 
                              {/* <td>{item?.quantity ?? 1}</td> */}
                              <td>
                                {getCurrencySymbol(currency || "USD")}
                                {Number(price).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}x{item?.quantity ?? 1}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Subtotal */}
                        <tr className="summary-subtotal">
                          <td>Subtotal:</td>
                          <td>
                            {getCurrencySymbol(currency || "USD")}
                            {currency === "USD"
                              ? cartList?.totalUsdPriceSum
                              : cartList?.totalPriceSum}
                          </td>
                        </tr>

                        {/* Discount */}
                        {(currency === "USD"
                          ? cartList?.usd_discount
                          : cartList?.discount) > 0 && (
                          <tr>
                            <td>Discount:</td>
                            <td>
                              - {getCurrencySymbol(currency || "USD")}
                              {currency === "USD"
                                ? cartList?.usd_discount
                                : cartList?.discount}
                            </td>
                          </tr>
                        )}

                        {/* Delivery */}
                        <tr>
                          <td>Delivery:</td>
                          <td>
                            {getCurrencySymbol(currency || "USD")}
                            {currency === "USD"
                              ? cartList?.usd_delivery || "Free"
                              : cartList?.delivery || "Free"}
                          </td>
                        </tr>

                        {/* Taxation */}
                        {(() => {
                          let tax = cartList?.taxation;
                          if (typeof tax === "string") {
                            try {
                              tax = JSON.parse(tax);
                            } catch {
                              tax = {};
                            }
                          }
                          if (tax && tax.tax_switch) {
                            return (
                              <tr>
                                <td>{tax.key || "Tax"}:</td>
                                <td>
                                  {getCurrencySymbol(currency || "USD")}
                                  {currency === "USD"
                                    ? cartList?.usd_tax
                                    : cartList?.inr_tax}
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })()}

                        {/* Total */}
                        <tr className="summary-total">
                          <td>Total:</td>
                          <td>
                            {getCurrencySymbol(currency || "USD")}
                            {currency === "USD"
                              ? cartList?.finalUsdPriceSum
                              : cartList?.finalPriceSum}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div id="paypal-button-container"></div>
                    <div className="payment-methods">
                      {getAvailablePaymentMethods()
                        .filter(
                          (method) =>
                            method.type === "cod" ||
                            (currency === "INR"
                              ? method.type === "razorPay"
                              : method.type === "payPal")
                        )
                        .map((method) => (
                          <div className="radio-btn" key={method.type}>
                            <input
                              type="radio"
                              id={method.type}
                              name="paymentMethod"
                              value={method.type}
                              checked={paymentMethod === method.type}
                              onChange={handlePaymentMethodChange}
                            />
                            <label htmlFor={method.type}>{method.name}</label>
                            {paymentMethod === method.type && (
                              <div className="payment-message fade-in">
                                <p>
                                  {method.type === "razorPay"
                                    ? 'After clicking "Pay now", you will be redirected to Razorpay Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.'
                                    : method.type === "payPal"
                                    ? 'After clicking "Pay now", you will be redirected to PayPal to complete your purchase securely.'
                                    : "Cash on Delivery selected. Pay in cash upon Delivery."}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-outline-primary-2 btn-order btn-block"
                      disabled={loading}
                    >
                      <span className="btn-text">Place Order</span>
                      <span className="btn-hover-text">
                        Proceed to Checkout
                      </span>
                    </button>
                  </div>
                </aside>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export const mapStateToProps = (state) => ({
  cartlist: state.cartlist.data,
});

export const mapDispatchToProps = {
  clearCart: actions.clearCart,
};

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);




// import { useEffect, useState } from "react";
// import { connect } from "react-redux";
// import ALink from "~/components/features/alink";
// import PageHeader from "~/components/features/page-header";
// import { cartPriceTotal, getCurrencySymbol } from "~/utils/index";
// import { useRouter } from "next/router";
// import { actions } from "~/store/cart";
// import { toast } from "react-toastify";
// import { useForm } from "react-hook-form";
// import { apirequest, getToken } from "~/utils/api";
// import Helmet from "react-helmet";
// import Cookies from 'js-cookie';

// function Checkout(props) {
//   const { cartlist, clearCart } = props;
//   const router = useRouter();
//   const auth = JSON.parse(localStorage.getItem("frequency-auth"));
//   const token = auth?.token ? auth.token.replace(/"/g, "") : null;

//   const [address, setAddress] = useState(null);
//   const [orderId, setOrderId] = useState(null);
//   const [payment, setPayment] = useState(null);
//   const [paypalSdkLoaded, setPaypalSdkLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [cartList, setCartList] = useState([]);
// const spaceName = Cookies.get("spaceName");
//   const [error, setError] = useState(null);
//   const [appliedCouponId, setAppliedCouponId] = useState(null);
//   const [couponError, setCouponError] = useState('')
//   const currency = Cookies.get('currency');
//   useEffect(() => {
//     const fetchCartList = async () => {
//       try {
//         const token = getToken();

//         let url = "";
//         const params = {};

//         if (!token || token === "null") {
//           const cartUniId = localStorage.getItem("cart_uni_id") || "";
//           url = `/user/carts-list`;
//           params.cart_uni_id = cartUniId;
//           params.couponId = appliedCouponId || "";
//         } else {
//           url = `/user/cart-list`;
//           params.couponId = appliedCouponId || "";
//         }

//         const response = await apirequest("GET", url, null, params);

//         if (response.success) {
//           setCartList(response || []);
//         } else {
//           throw new Error("Failed to fetch cart list");
//         }
//       } catch (err) {
//         setError(err.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCartList();
//   }, [token, appliedCouponId])



//   //coupon 
//   const [couponCode, setCouponCode] = useState('');
//   const [isCouponVisible, setIsCouponVisible] = useState(false);
//   const [couponList, setCouponList] = useState([]);
//   const [copiedStates, setCopiedStates] = useState({});

//   // useEffect(() => {
//   //   const fetchCouponList = async () => {
//   //     if (token) {
//   //       try {
//   //         const response = await apirequest("GET", "/user/coupon-list");
//   //         if (response.success && response.data.data.length > 0) {
//   //           setCouponList(response.data.data);
//   //           localStorage.setItem("couponList", JSON.stringify(response.data.data));
//   //         } else {
//   //           setCouponList([]);
//   //         }
//   //       } catch (error) {
//   //         console.error("Error fetching coupon list:", error);
//   //         setCouponList([]);
//   //       }
//   //     } else {
//   //       setCouponList([]);
//   //     }
//   //   };
//   //   fetchCouponList();
//   // }, [token]);


//   useEffect(() => {
//     const fetchCouponList = async () => {
//       try {
//         const response = await apirequest("GET", "/user/coupon-list");
//         if (response.success && response.data.data.length > 0) {
//           setCouponList(response.data.data);
//           localStorage.setItem("couponList", JSON.stringify(response.data.data));
//         } else {
//           setCouponList([]);
//         }
//       } catch (error) {
//         console.error("Error fetching coupon list:", error);
//         setCouponList([]);
//       }
//     };
  
//     if (token !== "null" && token !== undefined) {
//       fetchCouponList();
//     } else {
//       setCouponList([]);
//     }
//   }, [token]);



//   const handleCouponSubmit = async (e) => {
//     e.preventDefault();

//     setCouponError('');

//     if (!couponCode.trim()) {
//       setCouponError('Please enter a coupon code');
//       return;
//     }

//     const selectedCoupon = couponList.find(coupon => coupon.code === couponCode);

//     if (selectedCoupon) {
//       setAppliedCouponId(selectedCoupon.id);
//       setCouponCode('');
//       setCouponError('');
//       toast.success('Coupon applied successfully!');
//     } else {
//       setCouponError('Invalid coupon code');
//     }
//   };

//   // const copyToClipboard = (code, id) => {
//   //   navigator.clipboard.writeText(code);
//   //   setCouponCode(code);
//   //   setCopiedStates(prev => ({ ...prev, [id]: true }));
//   //   setTimeout(() => {
//   //     setCopiedStates(prev => ({ ...prev, [id]: false }));
//   //   }, 1000);
//   // };


//   const copyToClipboard = (code, id) => {
//     if (navigator.clipboard && navigator.clipboard.writeText) {
//       navigator.clipboard.writeText(code)
//         .then(() => handleCopySuccess(code, id))
//         .catch(() => fallbackCopy(code, id));
//     } else {
//       fallbackCopy(code, id);
//     }
//   };

//   const getCouponLimits = (coupon, currency) => {
//     if (currency === "USD") {
//       return {
//         min: coupon.usd_min_order_amount,
//         maxDiscount: coupon.usd_max_discount_amount
//       };
//     }
//     return {
//       min: coupon.min_order_amount,
//       maxDiscount: coupon.max_discount_amount
//     };
//   };

//   const applyCoupon = (code) => {
//     const selectedCoupon = couponList.find(coupon => coupon.code === code);
//     if (!selectedCoupon) return;

//     const totalAmount = currency === "USD"
//       ? cartList?.totalUsdPriceSum
//       : cartList?.totalPriceSum;

//     const { min } = getCouponLimits(selectedCoupon, currency);

//     if (totalAmount < min) {
//       toast.error("This coupon is not applicable for your order total.");
//       return;
//     }

//     setCouponCode(code);
//   };

//   const handleCopySuccess = (code, id) => {
//     const selectedCoupon = couponList.find(coupon => coupon.code === code);
//     if (!selectedCoupon) return;

//     const totalAmount = currency === "USD"
//       ? cartList?.totalUsdPriceSum
//       : cartList?.totalPriceSum;

//     const { min } = getCouponLimits(selectedCoupon, currency);

//     if (totalAmount < min) {
//       toast.error("This coupon is not applicable for your order total.");
//       return;
//     }

//     setCouponCode(code);
//     setCopiedStates(prev => ({ ...prev, [id]: true }));
//     setTimeout(() => {
//       setCopiedStates(prev => ({ ...prev, [id]: false }));
//     }, 1000);
//   };

//   // const handleCopySuccess = (code, id) => {
     
//   //   setCouponCode(code);
//   //   setCopiedStates(prev => ({ ...prev, [id]: true }));

//   //   setTimeout(() => {
//   //     setCopiedStates(prev => ({ ...prev, [id]: false }));
//   //   }, 1000);
//   // };

//   const fallbackCopy = (code, id) => {

//     const textArea = document.createElement("textarea");
//     textArea.value = code;
//     document.body.appendChild(textArea);
//     textArea.select();

//     try {
//       const successful = document.execCommand("copy");
//       if (successful) {
//         handleCopySuccess(code, id);
//       } else {
//         throw new Error("execCommand failed");
//       }
//     } catch (err) {
//       // alert("Copying is not supported in this browser. Please copy manually.");
//     }

//     document.body.removeChild(textArea);
//   };

//   // const applyCoupon = (code) => {
//   //   console.log(code , "")
//   //   setCouponCode(code);
//   // };

//   // Fetch payment methods and settings
//   useEffect(() => {
//     const fetchPaymentSettings = async () => {
//       try {
//         const response = await apirequest("GET", `/user/payment-method-list`);
//         if (response.success) {
//           setPayment(response);
//         } else {
//           console.error("Failed to fetch payment methods:", response.message);
//         }
//       } catch (error) {
//         console.error("Error fetching payment methods:", error);
//       }
//     };
//     fetchPaymentSettings();
//   }, []);

//   // Load Razorpay SDK
//   useEffect(() => {
//     const razorpayScript = document.createElement("script");
//     razorpayScript.src = "https://checkout.razorpay.com/v1/checkout.js";
//     razorpayScript.async = true;
//     razorpayScript.onload = () => console.log("Razorpay SDK loaded");
//     document.body.appendChild(razorpayScript);

//     return () => {
//       document.body.removeChild(razorpayScript);
//     };
//   }, []);

//   // Load PayPal SDK based on sandbox/live mode
//   useEffect(() => {
//     if (!payment?.dataweb?.settings) return;

//     const settings = payment.dataweb.settings.reduce((acc, setting) => {
//       acc[setting.key] = setting.value;
//       return acc;
//     }, {});

//     const paypalClientId = settings.sandbox_paypal_switch === "on" && settings.sandbox_paypal
//       ? settings.sandbox_paypal_key
//       : settings.paypal_key;

//     if (!paypalClientId) return;

//     const paypalScript = document.createElement("script");
//     paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&components=buttons`;
//     paypalScript.async = true;
//     paypalScript.setAttribute("data-namespace", "paypal_sdk");

//     paypalScript.onload = () => setPaypalSdkLoaded(true);
//     paypalScript.onerror = (error) => {
//       console.error("PayPal SDK failed to load", error);
//       toast.error("Failed to load PayPal SDK.");
//     };

//     document.body.appendChild(paypalScript);

//     return () => {
//       document.body.removeChild(paypalScript);
//     };
//   }, [payment]);



//   // Helper function to get Razorpay key based on sandbox mode
//   const getRazorpayKey = (settings) => {
//     return settings.sandbox_razorpay_switch && settings.sandbox_razorpay
//       ? settings.sandbox_razorpay_key
//       : settings.razorpay_key;
//   };

//   // Razorpay Payment Handler
//   const handleRazorpayPayment = async (data) => {
//     setLoading(true);
//     const userAddress = `${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}, ${data.email}, ${data.firstName} ${data.lastName}, ${data.phone}, Notes: ${data.notes}`;
//     const settings = payment.dataweb.settings.reduce((acc, setting) => {
//       acc[setting.key] = setting.value;
//       return acc;
//     }, {});
//     try {
//       const orderResponse = token && token !== "null"
//         ? await apirequest("POST", "/user/create-order", {
//           amount: cartList?.finalPriceSum,
//           usd_amount: cartList?.finalUsdPriceSum,
//           type: "razorPay",
//           address: userAddress,
//           phone: data.phone,
//           couponId: appliedCouponId,
//           country: data.country,
//               pincode: data.zip,
//           product_details: cartList?.data.map((item) => (
//             {
//             product_id: item.product_id,
//             quantity: item.quantity,
//             variant: item.variant,
//             price: item.selected_variant_price,
//             usd_price: item.selected_variant_usd_price,
//           })),
//         })
//         : await apirequest("POST", `/user/create-orders`, {
//           type: "razorPay",
//           amount: cartList?.finalPriceSum,
//           usd_amount: cartList?.finalUsdPriceSum,
//           address: userAddress,
//           couponId: appliedCouponId,
//           cart_uni_id : localStorage.getItem("cart_uni_id") || "",
//           email: data.email,
//           name: `${data.firstName} ${data.lastName}`,
//           phone: data.phone,
//           country: data.country,
//               pincode: data.zip,
//           product_details: cartList?.data.map((item) => ({
//             product_id: item.product_id,
//             quantity: item.quantity,
//             variant: item.variant,
//             price: item.selected_variant_price,
//           usd_price: item.selected_variant_usd_price,

//           })),
//         });

//       if (!orderResponse.data.success) throw new Error("Failed to create order");
//       const { order_id } = orderResponse.data;
//       setOrderId(order_id);

//       const options = {
//         key: getRazorpayKey(settings),
//         amount: cartList?.finalPriceSum * 100,
//         usd_amount: cartList?.finalUsdPriceSum,
//         currency: "INR",
//         name: "Your Business Name",
//         description: "Payment for order",
//         order_id,
//         handler: async (response) => {
//           const paymentData = {
//             type: "razorPay",
//             order_id,
//             payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             cart_uni_id : localStorage.getItem("cart_uni_id") || ""
//           };

//           const verificationResult = await apirequest(
//             "POST",
//             token && token !== "null" ? "/user/verify-payment" : "/user/verify-payments",
//             paymentData
//           );

//           if (verificationResult.success) {
//             toast.success(verificationResult.message);
//             clearCart();
//             router.push(token && token !== "null" ? "/shop/dashboard" : "/");
//           } else {
//             toast.error("Payment verification failed. Please try again.");
//           }
//         },
//         theme: { color: "#3399cc" },
//       };

//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();
//     } catch (error) {
//       console.error("Error during Razorpay payment:", error);
//       toast.error("An error occurred. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // PayPal Payment Handler
//   const handlePayPalPayment = async (data) => {
//     setLoading(true);
//     const userAddress = `${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}, ${data.email}, ${data.firstName} ${data.lastName}, ${data.phone}, Notes: ${data.notes}`;

//     try {
//       const orderData = {
//         type: "payPal",
//         amount: cartList?.finalPriceSum,
//         usd_amount: cartList?.finalUsdPriceSum,
//         address: userAddress,
//         couponId: appliedCouponId,
//         product_details: cartList?.data.map((item) => ({
//           product_id: item.product_id,
//           quantity: item.quantity,
//           variant: item.variant,
//           price: item.selected_variant_price,
//           usd_price: item.selected_variant_usd_price,
//         })),
//       };

//       const orderResponse = token && token !== "null"
//         ? await apirequest("POST", "/user/create-order", { ...orderData, phone: data.phone })
//         : await apirequest("POST", "/user/create-orders", {
//           ...orderData,
//           email: data.email,
//           name: `${data.firstName} ${data.lastName}`,
//           phone: data.phone,
//           country: data.country,
//               pincode: data.zip,
//           cart_uni_id : localStorage.getItem("cart_uni_id") || ""
//         });

//       if (!orderResponse.data.success) throw new Error("Failed to create order");
//       const orderID = orderResponse.data.order_id;

//       if (paypalSdkLoaded) {
//         window.paypal_sdk
//           .Buttons({
//             createOrder: (data, actions) => {
//               return actions.order.create({
//                 purchase_units: [{ amount: { value: cartList?.finalPriceSum } }],
//               });
//             },
//             onApprove: async (data, actions) => {
//               const details = await actions.order.capture();
//               const paymentData = {
//                 type: "payPal",
//                 paypal_order_id: data.orderID,
//                 order_id: orderID,
//                 payment_id: data.payerID,
//                 cart_uni_id : localStorage.getItem("cart_uni_id") || ""
//               };

//               const result = await apirequest(
//                 "POST",
//                 token && token !== "null" ? "/user/verify-payment" : "/user/verify-payments",
//                 paymentData
//               );

//               if (result.success) {
//                 toast.success("Payment captured successfully!");
//                 clearCart();
//                 router.push(token && token !== "null" ? "/shop/dashboard" : "/");
//               } else {
//                 toast.error("Failed to capture payment. Please try again.");
//               }
//             },
//             onError: (err) => {
//               console.error("PayPal Error: ", err);
//               toast.error("Payment error. Please try again.");
//             },
//           })
//           .render("#paypal-button-container");
//       }
//     } catch (error) {
//       console.error("Error during PayPal payment:", error);
//       toast.error("Payment creation failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleCODPayment = async (data) => {
//     setLoading(true);
//     const userAddress = `${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.country}, ${data.zip}, ${data.email}, ${data.firstName} ${data.lastName}, ${data.phone}, Notes: ${data.notes}`;
//     const token = getToken();

//     try {
//       const orderData = {
//         amount: cartList?.finalPriceSum,
//         usd_amount: cartList?.finalUsdPriceSum,
//         type: "cod",
//         currency: currency,
//         address: userAddress,
//         couponId: appliedCouponId,
//         product_details: cartList?.data.map((item) => ({
//           product_id: item.product_id,
//           quantity: item.quantity,
//           variant: item.variant,
//           price: item.selected_variant_price,
//           usd_price: item.selected_variant_usd_price
//         })),
//       };

//       let response;
//       if (!token || token === "null") {
//         response = await apirequest("POST", "/user/create-orders", {
//           ...orderData,
//           email: data.email,
//           name: `${data.firstName} ${data.lastName}`,
//           phone: data.phone,
//           country: data.country,
//               pincode: data.zip,
//           cart_uni_id : localStorage.getItem("cart_uni_id") || ""
//         });

        
//       } else {
//         response = await apirequest("POST", "/user/create-order", {
//           ...orderData,
//           phone: data.phone,
//           country: data.country,
//               pincode: data.zip
//         });
//       }

//       // Check if response is valid
//       if (!response || typeof response !== "object" || !("data" in response)) {
//         throw new Error("Invalid API response");
//       }

//       if (!response.data.success) {
//         throw new Error(response.data.message || "Failed to create order");
//       }

//       toast.success("Order placed successfully!");
//       clearCart();
//       router.push(token && token !== "null" ? "/shop/dashboard" : "/");
//     } catch (error) {
//       console.error("Error during COD payment:", error);
//       toast.error(error.message || "An error occurred. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const [paymentMethod, setPaymentMethod] = useState("");
//   const { register, handleSubmit, setValue, formState: { errors } } = useForm();

//   const addAddress = async (data) => {
//     const newAddress = {
//       name: `${data.firstName} ${data.lastName}`,
//       address: data.addressLine1,
//       city: data.city,
//       state: data.state,
//       zipcode: data.zip,
//       country: data.country,
//     };

//     try {
//       const response = await apirequest("POST", "/user/address-add", newAddress);
//       if (response.success) {
//         localStorage.setItem("userAddress", JSON.stringify(response.data));
//         setAddress(response.data);
//       } else {
//         toast.error("Failed to save address");
//         return false;
//       }
//     } catch (error) {
//       console.error("Error adding address:", error);
//       return false;
//     }
//     return true;
//   };

//   const onSubmit = async (data) => {
//     if (!paymentMethod) {
//       toast.warning("Please select a payment method");
//       return;
//     }

//     try {
//       if (paymentMethod === "razorPay") {
//         await handleRazorpayPayment(data);
//       } else if (paymentMethod === "payPal") {
//         await handlePayPalPayment(data);
//       } else if (paymentMethod === "cod") {
//         await handleCODPayment(data);
//       }
//       // addAddress(data);
//       if (token !== "null" && token !== undefined) {
//         addAddress(data);
//       }
//     } catch (error) {
//       console.error("Payment processing failed:", error);
//     }
//   };

//   const handlePaymentMethodChange = (e) => {
//     setPaymentMethod(e.target.value);
//   };

//   useEffect(() => {
//     const fetchAddress = async () => {
//       try {
//         const response = await apirequest("GET", "/user/address-list");
//         if (response.success && response.data.length > 0) {
//           setAddress(response.data[0]);
//           localStorage.setItem("userAddress", JSON.stringify(response.data[0]));
//         } else {
//           setAddress(null);
//           localStorage.removeItem("userAddress");
//         }
//       } catch (error) {
//         console.error("Error fetching address:", error);
//         setAddress(null);
//         localStorage.removeItem("userAddress");
//       }
//     };

//     if (token !== "null" && token !== undefined) {
//       fetchAddress();
//     } else {
//       setAddress(null);
//       localStorage.removeItem("userAddress");
//     }
//   }, [token]);


//   useEffect(() => {
//     if (address) {
//       setValue("firstName", address.name.split(" ")[0] || "");
//       setValue("lastName", address.name.split(" ")[1] || "");
//       setValue("addressLine1", address.address || "");
//       setValue("city", address.city || "");
//       setValue("state", address.state || "");
//       setValue("country", address.country || "");
//       setValue("zip", address.zipcode || "");
//     }
//   }, [address, setValue]);

//   // Derive available payment methods from settings
//   const getAvailablePaymentMethods = () => {
//     if (!payment?.dataweb?.settings) return [];
//     const settings = payment.dataweb.settings.reduce((acc, setting) => {
//       acc[setting.key] = setting.value;
//       return acc;
//     }, {});

//     const methods = [];
//     if (settings.sandbox_razorpay || settings.razorpay_key) {
//       methods.push({ type: "razorPay", name: "Razorpay" });
//     }
//     if (settings.sandbox_paypal || settings.paypal_key) {
//       methods.push({ type: "payPal", name: "PayPal" });
//     }
//     if (settings.cod_switch) {
//       methods.push({ type: "cod", name: "Cash on Delivery" });
//     }
//     return methods;
//   };




//   return (
//     <div className="main">
//       <Helmet>
//         <title>Checkout | {spaceName}</title>
//         <meta name="description" content="Checkout" />
//       </Helmet>
//       <PageHeader title="Checkout" subTitle="Shop" />
//       <nav className="breadcrumb-nav">
//         <div className="container">
//           <ol className="breadcrumb">
//             <li className="breadcrumb-item">
//               <ALink href="/">Home</ALink>
//             </li>
//             <li className="breadcrumb-item">
//               <ALink href="/shop/list">Shop</ALink>
//             </li>
//             <li className="breadcrumb-item active">Checkout</li>
//           </ol>
//         </div>
//       </nav>

//       <div className="page-content">
//         <div className="checkout">
//           <div className="container">


//             <div className="checkout-discount-container">
//               <div className="coupon-prompt">
//                 <span
//                   className="coupon-link"
//                   onClick={() => setIsCouponVisible(!isCouponVisible)}
//                 >
//                   Have a coupon? Click here to enter your code
//                 </span>
//               </div>
//               {/* {console.log(couponList , 'dsfsdggd')} */}

//               {isCouponVisible && (
//                 <form className="coupon-form" onSubmit={handleCouponSubmit}>
//                   <p>If you have a coupon code, please apply it below.</p>

//                   {couponList.length > 0 && (
//                     <div className="coupon-chips-container">
//                       {couponList.map((coupon) => (
//                         <div key={coupon.id} className="coupon-chip">
//                           <div
//                             className="coupon-chip-content"
//                             onClick={() => applyCoupon(coupon.code)}
//                           >
//                             <span className="coupon-chip-code">{coupon.code}</span>
//                             <span className="coupon-chip-description">
//                               Maximum Discount : {getCurrencySymbol(currency || "USD")}
//                               {currency === "USD" ? coupon.usd_max_discount_amount : coupon.max_discount_amount}
//                             </span>
//                             <span className="coupon-chip-description">
//                               Minimum Amount : {getCurrencySymbol(currency || "USD")}
//                               {currency === "USD" ? coupon.usd_min_order_amount : coupon.min_order_amount}
//                             </span>
//                           </div>
//                           <button
//                             type="button"
//                             className={`coupon-copy-button ${copiedStates[coupon.id] ? 'copied' : ''}`}
//                             onClick={() => copyToClipboard(coupon.code, coupon.id)}
//                           >
//                             <svg
//                               className="copy-icon"
//                               width="24"
//                               height="24"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               xmlns="http://www.w3.org/2000/svg"
//                             >
//                               <path
//                                 className={`copy-path ${copiedStates[coupon.id] ? 'hidden' : ''}`}
//                                 d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
//                                 fill="gray"
//                               />
//                               <path
//                                 className={`check-path ${copiedStates[coupon.id] ? '' : 'hidden'}`}
//                                 d="M9 18L4.5 13.5L6.5 11.5L9 14L16.5 6.5L18.5 8.5L9 18Z"
//                                 fill="green"
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}



//                   <div className="coupon-input-group">
//                     <input
//                       type="text"
//                       className={`coupon-input ${couponError ? 'error' : ''}`}
//                       placeholder="Coupon code"
//                       value={couponCode}
//                       onChange={(e) => {
//                         setCouponCode(e.target.value);
//                         setCouponError('');
//                       }}
//                     />

//                     <button type="submit" className="coupon-apply-button">
//                       →
//                     </button>
//                   </div>

//                   {couponError && (
//                     <div className="coupon-error-message">{couponError}.</div>
//                   )}
//                 </form>
//               )}
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)}>
//               <div className="row">
//                 <div className="col-lg-9">
//                   <h2 className="checkout-title">Billing Details</h2>
//                   <div className="row">
//                     <div className="col-sm-6">
//                       <label>First Name <span className="required">*</span></label>
//                       <input
//                         type="text"
//                         className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
//                         {...register("firstName", { required: "First Name is required" })}
//                       />
//                       {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
//                     </div>
//                     <div className="col-sm-6">
//                       <label>Last Name <span className="required">*</span></label>
//                       <input
//                         type="text"
//                         className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
//                         {...register("lastName", { required: "Last Name is required" })}
//                       />
//                       {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
//                     </div>
//                   </div>
//                   <label>Country <span className="required">*</span></label>
//                   <input
//                     type="text"
//                     className={`form-control ${errors.country ? "is-invalid" : ""}`}
//                     {...register("country", { required: "Country is required" })}
//                   />
//                   {errors.country && <div className="invalid-feedback">{errors.country.message}</div>}
//                   <label>Street Address <span className="required">*</span></label>
//                   <input
//                     type="text"
//                     className={`form-control ${errors.addressLine1 ? "is-invalid" : ""}`}
//                     {...register("addressLine1", { required: "Address is required" })}
//                   />
//                   {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1.message}</div>}
//                   <input type="text" className="form-control" {...register("addressLine2")} placeholder="Apartment, suite, unit, etc." />
//                   <div className="row">
//                     <div className="col-sm-6">
//                       <label>Town / City <span className="required">*</span></label>
//                       <input
//                         type="text"
//                         className={`form-control ${errors.city ? "is-invalid" : ""}`}
//                         {...register("city", { required: "City is required" })}
//                       />
//                       {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
//                     </div>
//                     <div className="col-sm-6">
//                       <label>State / Country <span className="required">*</span></label>
//                       <input
//                         type="text"
//                         className={`form-control ${errors.state ? "is-invalid" : ""}`}
//                         {...register("state", { required: "State is required" })}
//                       />
//                       {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
//                     </div>
//                   </div>
//                   <div className="row">
//                     <div className="col-sm-6">
//                       <label>Postcode / ZIP <span className="required">*</span></label>
//                       <input
//                         type="text"
//                         className={`form-control ${errors.zip ? "is-invalid" : ""}`}
//                         maxLength={6}
//                         {...register("zip", {
//                           required: "Postcode/ZIP is required",
//                           pattern: {
//                             value: /^\d{5,6}$/,
//                             message: "ZIP must be 5 or 6 digits"
//                           }
//                         })}
//                       />
//                       {errors.zip && <div className="invalid-feedback">{errors.zip.message}</div>}
//                     </div>
//                     <div className="col-sm-6">
//                       <label>Phone <span className="required">*</span></label>
//                       <input
//                         type="tel"
//                         className={`form-control ${errors.phone ? "is-invalid" : ""}`}
//                         maxLength={10}
//                         {...register("phone", {
//                           required: "Phone is required",
//                           pattern: {
//                             value: /^\d{10}$/,
//                             message: "Phone must be 10 digits"
//                           }
//                         })}
//                         onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)}
//                       />
//                       {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
//                     </div>
//                   </div>
//                   <label>Email address <span className="required">*</span></label>
//                   <input
//                     type="email"
//                     className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                     {...register("email", {
//                       required: "Email is required",
//                       pattern: { value: /\S+@\S+\.\S+/, message: "Email is invalid" },
//                     })}
//                   />
//                   {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
//                   <label>Order notes (optional)</label>
//                   <textarea className="form-control" {...register("notes")}></textarea>
//                 </div>

//                 {/* <aside className="col-lg-3">
//                   <div className="summary">
//                     <h3 className="summary-title">Your Order</h3>


//                     <table className="table table-summary">
//                       <thead>
//                         <tr>
//                           <th>Product</th>
//                           <th>Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {cartList?.data?.map((item, index) => (
//                           <tr key={index}>

//                             <td>{item?.productDetails?.name}</td>
//                             <td>
//                               {getCurrencySymbol(currency || 'USD')}
//                               {item.total_price.toLocaleString(undefined, {
//                                 minimumFractionDigits: 2,
//                                 maximumFractionDigits: 2,
//                               })}
//                             </td>
//                           </tr>
//                         ))}
//                         <tr className="summary-subtotal">
//                           <td>Subtotal:</td>
//                           <td>

//                             {getCurrencySymbol(currency || 'USD')}
//                             {cartList?.totalPriceSum}
//                           </td>
//                         </tr>
//                         {cartList?.discount > 0 && (
//                           <tr className="">
//                             <td>Discount:</td>
//                             <td>{cartList.discount}</td>
//                           </tr>
//                         )}

//                         <tr className="summary-total">
//                           <td>Total:</td>
//                           <td>

//                             {getCurrencySymbol(currency || 'USD')}{cartList?.finalPriceSum}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>

//                     <div id="paypal-button-container"></div>

                


//                     <div className="payment-methods">
//                       {getAvailablePaymentMethods()
//                         .filter(
//                           (method) =>
//                             method.type === "cod" || (currency === "INR" ? method.type === "razorPay" : method.type === "payPal")
//                         )
//                         .map((method) => (
//                           <div className="radio-btn" key={method.type}>
//                             <input
//                               type="radio"
//                               id={method.type}
//                               name="paymentMethod"
//                               value={method.type}
//                               checked={paymentMethod === method.type}
//                               onChange={handlePaymentMethodChange}
//                             />
//                             <label htmlFor={method.type}>{method.name}</label>
//                             {paymentMethod === method.type && (
//                               <div className="payment-message fade-in">
//                                 <p>
//                                   {method.type === "razorPay"
//                                     ? 'After clicking "Pay now", you will be redirected to Razorpay Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.'
//                                     : method.type === "payPal"
//                                       ? 'After clicking "Pay now", you will be redirected to PayPal to complete your purchase securely.'
//                                       : "Cash on Delivery selected. Pay in cash upon Delivery."}
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                     </div>

//                     <button
//                       type="submit"
//                       className="btn btn-outline-primary-2 btn-order btn-block"
//                       disabled={loading}
//                     >
//                       <span className="btn-text">Place Order</span>
//                       <span className="btn-hover-text">Proceed to Checkout</span>
//                     </button>
//                   </div>
//                 </aside> */}

//                 {/* {console.log(cartList , 'safsdfsdgdfh')} */}

//                 <aside className="col-lg-3">
//                   <div className="summary">
//                     <h3 className="summary-title">Your Order</h3>

//                     <table className="table table-summary">
//                       <thead>
//                         <tr>
//                           <th>Product</th>
//                           <th>Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {cartList?.data?.map((item, index) => {
//                           const price = currency === "USD" ? item.total_usd_price : item.total_price;
//                           return (
//                             <tr key={index}>
//                               <td>{item?.productDetails?.name}</td>
//                               <td>
//                                 {getCurrencySymbol(currency || "USD")}
//                                 {Number(price).toLocaleString(undefined, {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 })}
//                               </td>
//                             </tr>
//                           );
//                         })}

//                         {/* Subtotal */}
//                         <tr className="summary-subtotal">
//                           <td>Subtotal:</td>
//                           <td>
//                             {getCurrencySymbol(currency || "USD")}
//                             {(currency === "USD"
//                               ? cartList?.totalUsdPriceSum
//                               : cartList?.totalPriceSum
//                             )

//                             }
//                           </td>
//                         </tr>


//                         {/* Discount */}
//                         {(currency === "USD" ? cartList?.usd_discount : cartList?.discount) > 0 && (
//                           <tr>
//                             <td>Discount:</td>
//                             <td>
//                               - {getCurrencySymbol(currency || "USD")}
//                               {(currency === "USD" ? cartList?.usd_discount : cartList?.discount)}
//                             </td>
//                           </tr>
//                         )}

//                         {/* Delivery */}
//                         <tr>
//                           <td>Delivery:</td>
//                           <td>{cartList?.delivery || "Free"}</td>
//                         </tr>

//                         {/* Total */}
//                         <tr className="summary-total">
//                           <td>Total:</td>
//                           <td>
//                             {getCurrencySymbol(currency || "USD")}
//                             {(currency === "USD"
//                               ? cartList?.finalUsdPriceSum
//                               : cartList?.finalPriceSum
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                     <div id="paypal-button-container"></div>
//                     <div className="payment-methods">
//                       {getAvailablePaymentMethods()
//                         .filter(
//                           (method) =>
//                             method.type === "cod" ||
//                             (currency === "INR" ? method.type === "razorPay" : method.type === "payPal")
//                         )
//                         .map((method) => (
//                           <div className="radio-btn" key={method.type}>
//                             <input
//                               type="radio"
//                               id={method.type}
//                               name="paymentMethod"
//                               value={method.type}
//                               checked={paymentMethod === method.type}
//                               onChange={handlePaymentMethodChange}
//                             />
//                             <label htmlFor={method.type}>{method.name}</label>
//                             {paymentMethod === method.type && (
//                               <div className="payment-message fade-in">
//                                 <p>
//                                   {method.type === "razorPay"
//                                     ? 'After clicking "Pay now", you will be redirected to Razorpay Secure (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.'
//                                     : method.type === "payPal"
//                                       ? 'After clicking "Pay now", you will be redirected to PayPal to complete your purchase securely.'
//                                       : "Cash on Delivery selected. Pay in cash upon Delivery."}
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                     </div>

//                     <button
//                       type="submit"
//                       className="btn btn-outline-primary-2 btn-order btn-block"
//                       disabled={loading}
//                     >
//                       <span className="btn-text">Place Order</span>
//                       <span className="btn-hover-text">Proceed to Checkout</span>
//                     </button>
//                   </div>
//                 </aside>

//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export const mapStateToProps = (state) => ({
//   cartlist: state.cartlist.data,
// });

// export const mapDispatchToProps = {
//   clearCart: actions.clearCart,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Checkout);






