import React, { useState, useEffect } from "react";
import { Tabs, TabList, TabPanel, Tab } from "react-tabs";
import { useRouter } from "next/router";
import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";
import { logout } from "~/store/authReducer";
import { connect } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import Pagination from "~/components/features/pagination";
import { apirequest } from "~/utils/api";
import { toast } from "react-toastify";
import { getCurrencySymbol } from "~/utils";
import Loader from "~/components/Loader";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet";

function DashBoard(logout) {
  const router = useRouter();
  const [address, setAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    id: null,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currency = Cookies.get("currency");

  const auth = JSON.parse(localStorage.getItem("frequency-auth"));
  const token = auth?.token ? auth.token.replace(/"/g, "") : null;
  const handleLogout = () => {
    localStorage.removeItem("frequency-auth");
        Cookies.remove("wholesale_status");

    router.push("/login");
  };

  function toOrder(e) {
    e.preventDefault();
    document
      .querySelector(
        ".nav-dashboard .react-tabs__tab-list .nav-item:nth-child(2)"
      )
      .click();
  }

  function toAddress(e) {
    e.preventDefault();
    document
      .querySelector(
        ".nav-dashboard .react-tabs__tab-list .nav-item:nth-child(4)"
      )
      .click();
  }

  function toAccount(e) {
    e.preventDefault();
    document
      .querySelector(
        ".nav-dashboard .react-tabs__tab-list .nav-item:nth-child(5)"
      )
      .click();
  }

  useEffect(() => {
    const savedAddress = JSON.parse(localStorage.getItem("userAddress"));
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      if (token) {
        try {
          const response = await apirequest(
            "GET",
            "/user/address-list",
            null,
            null
          );
          if (response.success && response.data.length > 0) {
            setAddress(response.data[0]);
            localStorage.setItem(
              "userAddress",
              JSON.stringify(response.data[0])
            );
          } else {
            setAddress(null);
            localStorage.removeItem("userAddress");
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      } else {
        setAddress(null);
        localStorage.removeItem("userAddress");
      }
    };

    fetchAddress();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAddress = {
      name: e.target.name.value,
      address: e.target.address.value,
      city: e.target.city.value,
      state: e.target.state.value,
      zipcode: e.target.zipcode.value,
      country: e.target.country.value,
    };

    try {
      let response;
      if (isEditing) {
        response = await apirequest(
          "PUT",
          `/user/address-edit/${address.id}`,
          newAddress
        );
      } else {
        response = await apirequest("POST", "/user/address-add", newAddress);
      }

      if (response.success) {
        localStorage.setItem("userAddress", JSON.stringify(response.data));
        setAddress(response.data);
        setShowPopup(false);
        setIsEditing(false);
      } else {
        alert("Failed to save address");
      }
    } catch (error) {
      console.error("Error adding/editing address:", error);
    }
  };

  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] =
    useState(false);
  const handleDelete = async () => {
    try {
      const response = await apirequest(
        "DELETE",
        `/user/address-delete/${address.id}`
      );
      if (response.success) {
        localStorage.removeItem("userAddress");
        setAddress(null);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    } finally {
      setIsDeleteAddressModalOpen(false);
    }
  };

  const openPopup = (editing = false) => {
    setIsEditing(editing);
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apirequest("GET", "/user/profile", null, null);

        if (response.success) {
          const userData = {
            name: response.data.name || "",
            email: response.data.email || "",
            date_of_birth: response.data.date_of_birth || "",
            gender: response.data.gender || "",
            phone: response.data.phone || "",
          };

          localStorage.setItem("userData", JSON.stringify(userData));
          setUserData(userData);
        } else {
          setError("Failed to load profile data");
        }
      } catch (error) {
        setError("Error occurred while fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apirequest("PUT", "/user/profile", {
        name: userData.name,
        date_of_birth: userData.date_of_birth,
        phone: userData.phone,
        gender: userData.gender,
        notification: true,
      });

      if (response.success) {
        toast.success("update profile successfully");
      } else {
        setError("Failed to update profile");
      }
    } catch (error) {
      setError("Error occurred while updating profile");
    }
  };

  const [settings, setSettings] = useState({
    is_return: false,
    return_days: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({
    orderId: null,
    productId: null,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 5;
  const { page = 1 } = router.query;

  const CancelOrderModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Are you sure you want to cancel this order?</p>
          <div className="modal-actions">
            <button onClick={onConfirm} className="confirm-btn">
              Confirm
            </button>
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReturnOrderModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Are you sure you want to return this order?</p>
          <div className="modal-actions">
            <button onClick={onConfirm} className="confirm-btn">
              Confirm
            </button>
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (token) {
        try {
          const response = await apirequest("GET", "/user/setting");
          if (response.success) {
            const settingsData = response.data.reduce(
              (acc, setting) => {
                if (setting.key === "is_return")
                  acc.is_return = setting.value === "true";
                if (setting.key === "return_days")
                  acc.return_days = parseInt(setting.value);
                return acc;
              },
              { is_return: false, return_days: 0 }
            );
            setSettings(settingsData);
          }
        } catch (error) {
          console.error("Settings fetch error:", error);
        }
      }
    };
    fetchSettings();
  }, [token]);

  const fetchOrders = async ({ queryKey }) => {
    const page = queryKey[1];
    const response = await apirequest("GET", "/user/order-product-list", null, {
      size: perPage,
      page,
      status: "active",
      search: "",
      type: "web",
    });
    return response;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", parseInt(page)],
    queryFn: fetchOrders,
    keepPreviousData: true,
  });

  const formatOrderStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const calculateDaysRemaining = (updatedAt) => {
    if (!updatedAt || !settings.return_days) return 0;
    const deliveryDate = new Date(updatedAt);
    const currentDate = new Date();
    const diffDays = Math.floor(
      (currentDate - deliveryDate) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = settings.return_days - diffDays;
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const handleCancelOrder = async (orderId, productId) => {
    try {
      const response = await apirequest(
        "POST",
        `/user/cancel-order/${orderId}/${productId}`
      );
      if (response?.success) {
        toast.success(response?.message || "Order canceled successfully");
        refetch();
      } else {
        throw new Error(response?.message || "Failed to cancel the order.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReturnOrder = async (orderId) => {
    try {
      const response = await apirequest(
        "POST",
        `/user/return-order/${orderId}`
      );
      if (response?.success) {
        toast.success(response?.message || "Return requested successfully");
        refetch();
      } else {
        throw new Error(response?.message || "Failed to request return.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openModal = (orderId, productId) => {
    setSelectedOrder({ orderId, productId });
    setIsModalOpen(true);
  };

  const openReturnModal = (orderId) => {
    setSelectedOrder({ orderId, productId: null });
    setIsReturnModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsReturnModalOpen(false);
  };

  const confirmCancelOrder = () => {
    handleCancelOrder(selectedOrder.orderId, selectedOrder.productId);
    closeModal();
  };

  const confirmReturnOrder = () => {
    handleReturnOrder(selectedOrder.orderId);
    closeModal();
  };
  const spaceName = Cookies.get("spaceName");

  if (isLoading) return <Loader />;
  if (isError) return <div>Error fetching orders.</div>;

  const totalItems = data?.data?.totalItems || 0;
  return (
    <div className="main">
      <Helmet>
        <title>My Account | {spaceName}</title>
        <meta name="description" content="My Account" />
      </Helmet>
      <PageHeader title="My Account" />
      <nav className="breadcrumb-nav mb-3">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/shop/list">Shop</ALink>
            </li>
            <li className="breadcrumb-item active">My Account</li>
          </ol>
        </div>
      </nav>

      {/* Address Delete Confirmation Modal */}
      {isDeleteAddressModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to delete this address?</p>
            <div className="modal-actions">
              <button
                onClick={handleDelete}
                className="confirm-btn"
                style={{ background: "red", color: "white" }}
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteAddressModalOpen(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-content">
        <div className="dashboard">
          <div className="container">
            <ul
              className="nav nav-dashboard flex-column mb-3 mb-md-0"
              role="tablist"
            >
              <Tabs selectedTabClassName="active show">
                <div className="row">
                  <aside className="col-md-4 col-lg-3 mb-md-0 mb-2">
                    <TabList>
                      {/* <Tab className="nav-item">
                        <span className="nav-link">Dashboard</span>
                      </Tab> */}

                      <Tab className="nav-item">
                        <span className="nav-link">My Orders</span>
                      </Tab>

                      <Tab className="nav-item">
                        <span className="nav-link">Addresses</span>
                      </Tab>

                      <Tab className="nav-item">
                        <span className="nav-link">Account Details</span>
                      </Tab>
                      <Tab className="nav-item">
                        {token ? (
                          <span onClick={handleLogout} className="nav-link">
                            Logout
                          </span>
                        ) : (
                          <span
                            onClick={() => router.push("/login")}
                            className="nav-link"
                          >
                            Sign in / Sign up
                          </span>
                        )}
                      </Tab>
                    </TabList>
                  </aside>

                  <div
                    className="col-md-8 col-lg-9"
                    style={{ marginTop: "1rem" }}
                  >
                    <div className="tab-pane">
                      <TabPanel>
                        <div className="order-container">
                          <h2>Your Orders</h2>
                          {data?.data?.data.length === 0 ? (
                            <p>No orders yet.</p>
                          ) : (
                            <ul className="order-list">
                              {data.data.data.map((order) => {
                                const daysRemaining = calculateDaysRemaining(
                                  order.updatedAt
                                );
                                const isReturnStatus = [
                                  "return_pending",
                                  "return_process",
                                  "return_complete",
                                  "return_cancle",
                                ].includes(order.order_status);

                                const canReturn =
                                  settings.is_return &&
                                  daysRemaining > 0 &&
                                  order.order_status === "delivered";

                                const canCancel =
                                  !isReturnStatus &&
                                  order.order_status !== "delivered" &&
                                  order.order_status !== "canceled";

                                const buttonText = canCancel
                                  ? "Cancel Order"
                                  : canReturn
                                  ? "Return Order"
                                  : formatOrderStatus(order.order_status);
                                const buttonAction = canCancel
                                  ? () =>
                                      openModal(
                                        order.order_id,
                                        order.product_id
                                      )
                                  : canReturn
                                  ? () => openReturnModal(order.order_id)
                                  : null;
                                const isButtonDisabled =
                                  !canCancel && !canReturn;

                                return (
                                  <li key={order.id} className="order-item">
                                    <div className="order-item-content">
                                      <img
                                        src={order.product.image[0]}
                                        alt={order.product.name}
                                        className="order-product-image"
                                      />
                                      <div className="order-details">
                                        <h3 className="order-product-name">
                                          {order.product.name}
                                        </h3>
                                        {/* <p className="order-description">
                                          {order.product.description.replace(/<[^>]*>/g, '').trim()}
                                        </p> */}
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              order?.product?.description
                                                ?.description,
                                          }}
                                        />
                                        <p className="order-price">
                                          Price: {getCurrencySymbol(currency)}
                                          {currency === "USD"
                                            ? order.usd_price
                                            : order.price}
                                        </p>
                                        <p className="order-price">
                                         Total Price: {getCurrencySymbol(currency)}
                                          {currency === "USD"
                                            ? `${(order.usd_price * order.quantity).toFixed(2)}`
                                            : `${(order.price * order.quantity).toFixed(2)}`}
                                        </p>
                                        <p className="order-quantity">
                                          Quantity: {order.quantity}
                                        </p>
                                        <p className="order-status">
                                          Status:{" "}
                                          {formatOrderStatus(
                                            order.order_status
                                          )}
                                        </p>
                                        <p className="order-review">
                                          Review:{" "}
                                          {order.is_review
                                            ? "Reviewed"
                                            : "No Review Yet"}
                                        </p>
                                        {canReturn && (
                                          <p>
                                            Return: {daysRemaining} days left
                                          </p>
                                        )}
                                        {isReturnStatus && (
                                          <p>
                                            Return Status:{" "}
                                            {formatOrderStatus(
                                              order.order_status
                                            )}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        className="manage-order-btn"
                                        onClick={buttonAction}
                                        disabled={isButtonDisabled}
                                      >
                                        {buttonText}
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                          {totalItems > perPage && (
                            <Pagination
                              perPage={perPage}
                              total={totalItems}
                              currentPage={currentPage}
                              onPageChange={(page) => setCurrentPage(page)}
                            />
                          )}

                          <CancelOrderModal
                            isOpen={isModalOpen}
                            onClose={closeModal}
                            onConfirm={confirmCancelOrder}
                          />
                          <ReturnOrderModal
                            isOpen={isReturnModalOpen}
                            onClose={closeModal}
                            onConfirm={confirmReturnOrder}
                          />
                        </div>
                      </TabPanel>

                      <TabPanel>
                        <p>
                          The following addresses will be used on the checkout
                          page by default.
                        </p>
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="card card-dashboard">
                              <div className="card-body">
                                <h3 className="card-title">Billing Address</h3>
                                {address ? (
                                  <p>
                                    {address.name} <br />
                                    {address.address} <br />
                                    {address.city} <br />
                                    {address.state} <br />
                                    {address.zipcode} <br />
                                    {address.country} <br />
                                    <button
                                      type="button"
                                      onClick={() => openPopup(true)}
                                    >
                                      Edit <i className="icon-edit"></i>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setIsDeleteAddressModalOpen(true)
                                      }
                                      style={{
                                        marginLeft: "10px",
                                        color: "red",
                                      }}
                                    >
                                      Delete <i className="icon-trash"></i>
                                    </button>
                                  </p>
                                ) : (
                                  <p>
                                    No billing address set <br />
                                    <button
                                      type="button"
                                      onClick={() => openPopup(false)}
                                    >
                                      Add Address <i className="icon-edit"></i>
                                    </button>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabPanel>

                      {showPopup && (
                        <div className="popup-overlay">
                          <div className="popup-form">
                            <div className="popup-content">
                              <h3>
                                {isEditing ? "Edit Address" : "Add Address"}
                              </h3>
                              <form onSubmit={handleSubmit}>
                                <input
                                  type="text"
                                  name="name"
                                  placeholder="Name"
                                  defaultValue={isEditing ? address?.name : ""}
                                  required
                                />
                                <input
                                  type="text"
                                  name="address"
                                  placeholder="Address"
                                  defaultValue={
                                    isEditing ? address?.address : ""
                                  }
                                  required
                                />
                                <input
                                  type="text"
                                  name="city"
                                  placeholder="City"
                                  defaultValue={isEditing ? address?.city : ""}
                                  required
                                />
                                <input
                                  type="text"
                                  name="state"
                                  placeholder="State"
                                  defaultValue={isEditing ? address?.state : ""}
                                  required
                                />
                                <input
                                  type="text"
                                  name="zipcode"
                                  placeholder="Zipcode"
                                  defaultValue={
                                    isEditing ? address?.zipcode : ""
                                  }
                                  required
                                />
                                <input
                                  type="text"
                                  name="country"
                                  placeholder="Country"
                                  defaultValue={
                                    isEditing ? address?.country : ""
                                  }
                                  required
                                />
                                <button type="submit">
                                  {isEditing ? "Save Changes" : "Save Address"}
                                </button>
                                <button type="button" onClick={closePopup}>
                                  Cancel
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      )}

                      <TabPanel>
                        <form onSubmit={handleProfileSubmit}>
                          <label>
                            Display Name <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={userData.name}
                            onChange={(e) =>
                              setUserData({ ...userData, name: e.target.value })
                            }
                            required
                          />
                          <small className="form-text">
                            This will be how your name will be displayed in the
                            account section and in reviews
                          </small>

                          <label>
                            Email address{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={userData.email}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                email: e.target.value,
                              })
                            }
                            required
                            readOnly
                          />

                          <label>
                            Date of Birth{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={
                              userData.date_of_birth
                                ? userData.date_of_birth.split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                date_of_birth: e.target.value,
                              })
                            }
                            required
                          />

                          <label>
                            Gender <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            className="form-control"
                            value={userData.gender}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                gender: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>

                          <label>
                            Phone Number <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            value={userData.phone}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only digits and limit to 10 characters
                              if (/^\d{0,10}$/.test(value)) {
                                setUserData({ ...userData, phone: value });
                              }
                            }}
                            maxLength={10}
                            required
                          />

                          <button
                            type="submit"
                            className="btn btn-outline-primary-2"
                          >
                            <span>SAVE CHANGES</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>

                          {/* {error && <div className="error">{error}</div>} */}
                        </form>
                      </TabPanel>

                      <TabPanel>
                        <div></div>
                      </TabPanel>
                    </div>
                  </div>
                </div>
              </Tabs>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default React.memo(DashBoard);

const mapStateToProps = (state) => ({
  token: state.auth.token,
});

export default connect(mapStateToProps, { logout })(DashBoard);
