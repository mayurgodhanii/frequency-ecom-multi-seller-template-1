
import React, { useEffect } from "react";
import { connect } from "react-redux";

import ALink from "~/components/features/alink";
import PageHeader from "~/components/features/page-header";

import { actions as wishlistActions } from "~/store/wishlist";
import { actions as cartActions } from "~/store/cart";

import { apirequest } from "~/utils/api";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet";

function Wishlist({
  wishlist,
  setWishlist,
  removeFromWishlist,
  addToCart,
}) {
  useEffect(() => {
    fetchWishlist();
  }, []);

  const currency = Cookies.get("currency") || "INR";


  const spaceName = Cookies.get("spaceName");

  async function fetchWishlist() {
    try {
      const isBrowser = typeof window !== "undefined";
      const token = isBrowser
        ? JSON.parse(localStorage.getItem("frequency-auth"))?.token
        : null;

      if (!token || token === "null") {
        // For multivendor, authentication is required for wishlist
        console.log("Authentication required for wishlist");
        return;
      }

      const params = {
        page: 1,
        size: 10,
        search: "",
      };

      const response = await apirequest("GET", "/wishlist/list", null, params);
      
      if (response.success) {
        const wishlistItems = response.data.data.map((item) => {
          const product = item.product;
          let price;

          if (currency === "INR") {
            price = product.sale_price || product.price;
          } else if (currency === "USD") {
            price = product.usd_sale_price || product.usd_price;
          }

          return {
            id: item.id,
            product_id: item.product_id,
            name: product.name,
            price: price,
            rate: product.average_rating || product.rate,
            slug: product.slug,
            category: product.category,
            image: product.image?.[0] || "",
            currency: currency === "INR" ? "₹" : "$",
          };
        });

        setWishlist(wishlistItems);
      } else {
        console.error("Failed to fetch wishlist:", response.message);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }

  function moveToCart(product) {
    removeFromWishlist(product);
    addToCart(product);
  }

  return (
    <main className="main">
      <Helmet>
        <title>Wishlist | {spaceName}</title>

        <meta name="description" content="Wishlist" />
      </Helmet>
      <PageHeader title="Wishlist" subTitle="Shop" />
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <ALink href="/">Home</ALink>
            </li>
            <li className="breadcrumb-item">
              <ALink href="/shop/list">Shop</ALink>
            </li>
            <li className="breadcrumb-item active">Wishlist</li>
          </ol>
        </div>
      </nav>

      <div className="page-content pb-5">
        {wishlist.length > 0 ? (
          <div className="container">
            <table className="table table-wishlist table-mobile">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {wishlist.map((item) => (
                  <tr key={item.id}>
                    <td className="product-col">
                      <div className="product">
                        <figure className="product-media">
                          <ALink
                            href={`/product/${item.slug}`}
                            className="product-image"
                          >
                            <img src={item.image} alt={item.name} />
                          </ALink>
                        </figure>

                        <h4 className="product-title">
                          <ALink href={`/product/${item.slug}`}>
                            {item.name}
                          </ALink>
                        </h4>
                      </div>
                    </td>

                    <td className="price-col">
                      {item.currency} {item.price}
                    </td>

                    <td className="action-col">
                      <div className="dropdown">
                        <ALink
                          href={`/product/${item.slug}`}
                          className="btn btn-block btn-outline-primary-2 btn-select"
                        >
                          <i className="icon-list-alt"></i>
                          Select
                        </ALink>
                      </div>
                    </td>

                    <td className="remove-col">
                      <button
                        className="btn-remove"
                        onClick={() => removeFromWishlist(item)}
                      >
                        <i className="icon-close"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="container">
            <div className="text-center">
              <i
                className="icon-heart-o wishlist-empty d-block"
                style={{ fontSize: "15rem", lineHeight: "1" }}
              ></i>
              <span className="d-block mt-2">No products added to wishlist</span>
              <ALink href="/" className="btn btn-primary mt-2">
                Go Shop
              </ALink>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const mapStateToProps = (state) => ({
  wishlist: state.wishlist.data,
});

const mapDispatchToProps = {
  setWishlist: wishlistActions.setWishlist,
  removeFromWishlist: wishlistActions.removeFromWishlist,
  addToCart: cartActions.addToCart,
};

export default connect(mapStateToProps, mapDispatchToProps)(Wishlist);
