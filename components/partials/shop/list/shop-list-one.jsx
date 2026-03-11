
import React, { useState, useEffect } from "react";
import ProductEleven from "~/components/features/products/product-eleven";

function ShopListOne(props) {
  const { loading, products = [], perPage } = props;
  const [fakeArray, setFakeArray] = useState([]);
  const gridClass = "col-6 col-md-4 col-lg-4";

  useEffect(() => {
    let temp = [];
    for (let i = 0; i < perPage; i++) {
      temp.push(i);
    }
    setFakeArray(temp);
  }, [perPage]);

  return (
    <div className="products mb-3">
      {products.length === 0 && !loading ? (
        <p className="no-results">No products matching your selection.</p>
      ) : (
        <>
          {loading ? (
            fakeArray.map((item, index) => (
              <div className={gridClass} key={index}>
                <div className="skel-pro"></div>
              </div>
            ))
          ) : (
            <div className="row">
              {products.map((product, index) => (
                <div className={gridClass} key={index}>
                  <ProductEleven product={product} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default React.memo(ShopListOne);