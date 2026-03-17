import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";

import ALink from "~/components/features/alink";
import { actions as wishlistAction } from "~/store/wishlist";
import { actions as cartAction } from "~/store/cart";
import { actions as compareAction } from "~/store/compare";
import { actions as demoAction } from "~/store/demo";

import { getCurrencySymbol } from "~/utils";
import Cookies from "js-cookie";

import { isInWishlist, isInCompare } from "~/utils";

function ProductTwelve(props) {
  const {
    product,
    wishlist,
    comparelist,
    addToCart,
    addToWishlist,
    addToCompare,
    showQuickView,
  } = props;

  const router = useRouter();

  const currency = Cookies.get("currency") || "INR";
  const isWholesale = Cookies.get("wholesale_status") === "approved";

  const [minPrice, setMinPrice] = useState(99999);
  const [maxPrice, setMaxPrice] = useState(0);

  /** ============================
   *  WHOLESALE-AWARE PRICE FUNCTION
   *  ============================ */
  const getPrice = (item) => {
    if (isWholesale) {
      return currency === "INR"
        ? parseFloat(item.wholesale_price || 0)
        : parseFloat(item.wholesale_usd_price || 0);
    }
    return currency === "INR"
      ? parseFloat(item.price || 0)
      : parseFloat(item.usd_price || 0);
  };

  /** ============================
   *  MIN/MAX VARIANT PRICE (WHOLESALE INCLUDED)
   *  ============================ */
  useEffect(() => {
    let min = 99999;
    let max = 0;

    if (
      product?.variant_json?.combinations &&
      product?.variant_json?.combinations.length > 0
    ) {
      product.variant_json.combinations.forEach((combination) => {
        const vPrice = isWholesale
          ? currency === "INR"
            ? parseFloat(combination.wholesale_price || combination.price || 0)
            : parseFloat(combination.wholesale_usd_price || combination.usd_price || 0)
          : currency === "INR"
          ? parseFloat(combination.price || 0)
          : parseFloat(combination.usd_price || 0);
        
        if (vPrice > 0) {
          min = Math.min(min, vPrice);
          max = Math.max(max, vPrice);
        }
      });
    } else {
      // Simple product
      const basePrice = getPrice(product);
      min = basePrice;
      max = basePrice;
    }

    setMinPrice(min);
    setMaxPrice(max);
  }, [product, currency, isWholesale]);

  /** ============================
   *  BUTTON HANDLERS
   *  ============================ */
  const onCartClick = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const onWishlistClick = (e) => {
    e.preventDefault();
    if (!isInWishlist(wishlist, product)) {
      addToWishlist(product);
    } else {
      router.push("/shop/wishlist");
    }
  };

  const onCompareClick = (e) => {
    e.preventDefault();
    if (!isInCompare(comparelist, product)) {
      addToCompare(product);
    }
  };

  const onQuickView = (e) => {
    e.preventDefault();
    showQuickView(product.slug);
  };

  /** ============================
   *  FINAL DISPLAY PRICE (NO SALE FOR WHOLESALE)
   *  ============================ */
  const symbol = getCurrencySymbol(currency);

  const retailRegular =
    currency === "USD"
      ? parseFloat(product.usd_price || product.price || 0)
      : parseFloat(product.price || 0);

  const retailSale =
    currency === "USD"
      ? parseFloat(product.usd_sale_price || 0)
      : parseFloat(product.sale_price || 0);

  const finalPrice = isWholesale ? maxPrice : retailRegular;
  const hasSale = !isWholesale && retailSale > 0;

  return (
    <div className="product product-11 text-center">
      <figure className="product-media">
        {/* ❌ Remove sale badge for wholesale */}
        {!isWholesale && hasSale && (
          <span className="product-label label-circle label-sale">Sale</span>
        )}

        {!product.stock || product.stock === 0 ? (
          <span className="product-label label-circle label-out">
            Out of Stock
          </span>
        ) : null}

        <ALink href={`/product/${product.slug}`}>
          <LazyLoadImage
            alt="product"
            src={product.image[0]}
            threshold={500}
            effect="black and white"
            wrapperClassName="product-image"
          />
          {product.image.length >= 2 && (
            <LazyLoadImage
              alt="product"
              src={product.image[1]}
              threshold={500}
              effect="black and white"
              wrapperClassName="product-image-hover"
            />
          )}
        </ALink>

        <div className="product-action-vertical">
          {isInWishlist(wishlist, product) ? (
            <ALink
              href="/shop/wishlist"
              className="btn-product-icon btn-wishlist btn-expandable added-to-wishlist"
            >
              <span>go to wishlist</span>
            </ALink>
          ) : (
            <a
              href="#"
              className="btn-product-icon btn-wishlist btn-expandable"
              onClick={onWishlistClick}
            >
              <span>add to wishlist</span>
            </a>
          )}
        </div>
      </figure>

      <div className="product-body">
        <h3 className="product-title">
          <ALink href={`/product/${product.slug}`}>{product.name}</ALink>
        </h3>

        {/* PRICE DISPLAY */}
        <div className="product-price">
          {isWholesale ? (
            <span>
              {symbol}
              {maxPrice.toFixed(2)}
            </span>
          ) : hasSale ? (
            <span>
              <span className="new-price">
                {symbol}
                {retailSale.toFixed(2)}
              </span>
              <span className="old-price">
                {symbol}
                {retailRegular.toFixed(2)}
              </span>
            </span>
          ) : (
            <span>
              {symbol}
              {retailRegular.toFixed(2)}
            </span>
          )}
        </div>

        <div className="ratings-container">
          <div className="ratings">
            <div
              className="ratings-val"
              style={{ width: `${(product.average_rating || product.rating || 0) * 20}%` }}
            ></div>
            <span className="tooltip-text">{product.average_rating || product.rating || 0}</span>
          </div>
          <span className="ratings-text">({product.rating_count || 0})</span>
        </div>
      </div>

      {product.stock > 0 && (
        <div className="product-action">
          {product?.variant_json?.options?.length > 0 ? (
            <ALink
              href={`/product/${product.slug}`}
              className="btn-product btn-cart btn-select"
            >
              <span>Select options</span>
            </ALink>
          ) : (
            <button className="btn-product btn-cart" onClick={onCartClick}>
              <span>Add to cart</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  wishlist: state.wishlist.data,
  comparelist: state.comparelist.data,
});

export default connect(mapStateToProps, {
  ...wishlistAction,
  ...cartAction,
  ...compareAction,
  ...demoAction,
})(ProductTwelve);










// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { connect } from "react-redux";
// import { LazyLoadImage } from "react-lazy-load-image-component";

// import ALink from "~/components/features/alink";

// import { actions as wishlistAction } from "~/store/wishlist";
// import { actions as cartAction } from "~/store/cart";
// import { actions as compareAction } from "~/store/compare";
// import { actions as demoAction } from "~/store/demo";
// import { getCurrencySymbol } from "~/utils";
// import Cookies from 'js-cookie';

// import { isInWishlist, isInCompare } from "~/utils";

// function ProductTwelve(props) {
//   const {
//     product,
//     wishlist,
//     addToCart,
//     addToWishlist,
//     showQuickView,
//     comparelist,
//   } = props;
//   const router = useRouter();
//   const currency = Cookies.get('currency');

//   function onCartClick(e) {
//     e.preventDefault();
//     addToCart(product);
//   }

//   function onWishlistClick(e) {
//     e.preventDefault();
//     if (!isInWishlist(wishlist, product)) {
//       addToWishlist(product);
//     } else {
//       router.push("/pages/wishlist");
//     }
//   }

//   function onCompareClick(e) {
//     e.preventDefault();
//     if (!isInCompare(comparelist, product)) {
//       addToCompare(product);
//     }
//   }

//   function onQuickView(e) {
//     e.preventDefault();
//     showQuickView(product.slug);
//   }

//   const priceDisplay =
//     product.sale_price > 0 ? (
//       <span>
//         <span className="new-price">
//           {getCurrencySymbol(currency)}
//           {product.sale_price}
//         </span>
//         <span className="old-price">
//           {getCurrencySymbol(currency)}
//           {product.price}
//         </span>
//       </span>
//     ) : (
//       <span>
//         {getCurrencySymbol(currency)}
//         {product.price}
//       </span>
//     );

//   return (
//     <div className="product product-11 text-center">
//       <figure className="product-media">
//         {product.sale_price > 0 && (
//           <span className="product-label label-circle label-sale">Sale</span>
//         )}

//         {!product.stock || product.stock === 0 ? (
//           <span className="product-label label-circle label-out">
//             Out of Stock
//           </span>
//         ) : null}

//         <ALink href={`/product/${product.slug}`}>
//           <LazyLoadImage
//             alt="product"
//             src={product.image[0]}
//             threshold={500}
//             effect="black and white"
//             wrapperClassName="product-image"
//           />
//           {product.image.length >= 2 && (
//             <LazyLoadImage
//               alt="product"
//               src={product.image[1]}
//               threshold={500}
//               effect="black and white"
//               wrapperClassName="product-image-hover"
//             />
//           )}
//         </ALink>

//         <div className="product-action-vertical">
//           {isInWishlist(wishlist, product) ? (
//             <ALink
//               href="/shop/wishlist"
//               className="btn-product-icon btn-wishlist btn-expandable added-to-wishlist"
//             >
//               <span>go to wishlist</span>
//             </ALink>
//           ) : (
//             <a
//               href="#"
//               className="btn-product-icon btn-wishlist btn-expandable"
//               onClick={onWishlistClick}
//             >
//               <span>add to wishlist</span>
//             </a>
//           )}
//           {/* <a href="#" className="btn-product-icon btn-quickview" title="Quick View" onClick={onQuickView}>
//               <span>quick view</span>
//             </a> */}
//         </div>
//       </figure>

//       <div className="product-body">
//         <h3 className="product-title">
//           <ALink href={`/product/${product.slug}`}>{product.name}</ALink>
//         </h3>

//         <div>{priceDisplay}</div>

//         <div className="ratings-container">
//           <div className="ratings">
//             <div
//               className="ratings-val"
//               style={{ width: `${product.rating * 20}%` }}
//             ></div>
//             <span className="tooltip-text">{product.rating}</span>
//           </div>
//           <span className="ratings-text">({product.rating})</span>
//         </div>
//       </div>

//       {/* {product.stock > 0 && (
//         <div className="product-action">
//           <button className="btn-product btn-cart" onClick={onCartClick}>
//             <span>add to cart</span>
//           </button>
//         </div>
//       )} */}
//       {product.stock > 0 && (
//         <div className="product-action">
//           {product?.variant_json && product?.variant_json?.options?.length > 0 ? (
//             <ALink
//               href={`/product/${product.slug}`}
//               className="btn-product btn-cart btn-select"
//             >
//               <span>Select options</span>
//             </ALink>
//           ) : (
//             <button className="btn-product btn-cart" onClick={onCartClick}>
//               <span>Add to cart</span>
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const mapStateToProps = (state) => {
//   return {
//     wishlist: state.wishlist.data,
//     comparelist: state.comparelist.data,
//   };
// };

// export default connect(mapStateToProps, {
//   ...wishlistAction,
//   ...cartAction,
//   ...compareAction,
//   ...demoAction,
// })(ProductTwelve);











// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { connect } from 'react-redux';
// import { LazyLoadImage } from 'react-lazy-load-image-component';

// import ALink from '~/components/features/alink';

// import { actions as wishlistAction } from '~/store/wishlist';
// import { actions as cartAction } from '~/store/cart';
// import { actions as compareAction } from '~/store/compare';
// import { actions as demoAction } from '~/store/demo';

// import { isInWishlist, isInCompare } from '~/utils';

// function ProductTwelve ( props ) {
//     const router = useRouter();
//     const { product, wishlist } = props;
//     const [ maxPrice, setMaxPrice ] = useState( 0 );
//     const [ minPrice, setMinPrice ] = useState( 99999 );

//     useEffect( () => {
//         let min = minPrice;
//         let max = maxPrice;
//         product.variants.map( item => {
//             if ( min > item.price ) min = item.price;
//             if ( max < item.price ) max = item.price;
//         }, [] );

//         if ( product.variants.length == 0 ) {
//             min = product.sale_price
//                 ? product.sale_price
//                 : product.price;
//             max = product.price;
//         }

//         setMinPrice( min );
//         setMaxPrice( max );
//     }, [] )

//     function onCartClick ( e ) {
//         e.preventDefault();
//         props.addToCart( product );
//     }

//     function onWishlistClick ( e ) {
//         e.preventDefault();
//         if ( !isInWishlist( props.wishlist, product ) ) {
//             props.addToWishlist( product );
//         } else {
//             router.push( '/pages/wishlist' );
//         }
//     }

//     function onCompareClick ( e ) {
//         e.preventDefault();
//         if ( !isInCompare( props.comparelist, product ) ) {
//             props.addToCompare( product );
//         }
//     }

//     function onQuickView ( e ) {
//         e.preventDefault();
//         props.showQuickView( product.slug );
//     }

//     return (
//         <div className="product product-7 text-center">
//             <figure className="product-media">
//                 {
//                     product.new ?
//                         <span className="product-label label-circle label-new">New</span>
//                         : ""
//                 }

//                 {
//                     product.sale_price ?
//                         <span className="product-label label-circle label-sale">Sale</span>
//                         : ""
//                 }

//                 {
//                     product.top ?
//                         <span className="product-label label-circle label-top">Top</span>
//                         : ""
//                 }

//                 {
//                     !product.stock || product.stock == 0 ?
//                         <span className="product-label label-circle label-out">Out of Stock</span>
//                         : ""
//                 }

//                 <ALink href={ `/product/default/${product.slug}` }>
//                     <LazyLoadImage
//                         alt="product"
//                         src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 0 ].url }
//                         threshold={ 500 }
//                         effect="black and white"
//                         wrapperClassName="product-image"
//                     />
//                     {
//                         product.sm_pictures.length >= 2 ?
//                             <LazyLoadImage
//                                 alt="product"
//                                 src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 1 ].url }
//                                 threshold={ 500 }
//                                 effect="black and white"
//                                 wrapperClassName="product-image-hover"
//                             />
//                             : ""
//                     }
//                 </ALink>


//                 <div className="product-action-vertical">
//                     {
//                         isInWishlist( wishlist, product ) ?
//                             <ALink href="/shop/wishlist" className="btn-product-icon btn-wishlist btn-expandable added-to-wishlist"><span>go to wishlist</span></ALink>
//                             :
//                             <a href="#" className="btn-product-icon btn-wishlist btn-expandable" onClick={ onWishlistClick }><span>add to wishlist</span></a>

//                     }
//                     <a href="#" className="btn-product-icon btn-quickview" title="Quick View" onClick={ onQuickView }><span>quick view</span></a>
//                 </div>

//                 {
//                     product.stock && product.stock !== 0 ?
//                         <div className="product-action product-action-transparent">
//                             {
//                                 product.variants.length > 0 ?
//                                     <ALink href={ `/product/default/${product.slug}` } className="btn-product btn-cart btn-select">
//                                         <span>select options</span>
//                                     </ALink>
//                                     :
//                                     <button className="btn-product btn-cart" onClick={ onCartClick }>
//                                         <span>add to cart</span>
//                                     </button>
//                             }
//                         </div>
//                         : ""
//                 }
//             </figure>

//             <div className="product-body">
//                 <div className="product-cat">
//                     {
//                         product.category.map( ( item, index ) => (
//                             <React.Fragment key={ item.slug + '-' + index }>
//                                 <ALink href={ { pathname: '/shop/sidebar/list', query: { category: item.slug } } }>
//                                     { item.name }
//                                 </ALink>
//                                 { index < product.category.length - 1 ? ', ' : "" }
//                             </React.Fragment>
//                         ) )
//                     }
//                 </div>

//                 <h3 className="product-title">
//                     <ALink href={ `/product/default/${product.slug}` }>{ product.name }</ALink>
//                 </h3>

//                 {
//                     !product.stock || product.stock == 0 ?
//                         <div className="product-price">
//                             <span className="out-price">${ product.price.toFixed( 2 ) }</span>
//                         </div>
//                         :
//                         minPrice == maxPrice ?
//                             <div className="product-price">${ minPrice.toFixed( 2 ) }</div>
//                             :
//                             product.variants.length == 0 ?
//                                 <div className="product-price">
//                                     <span className="new-price">${ minPrice.toFixed( 2 ) }</span>
//                                     <span className="old-price">${ maxPrice.toFixed( 2 ) }</span>
//                                 </div>
//                                 :
//                                 <div className="product-price">${ minPrice.toFixed( 2 ) }&ndash;${ maxPrice.toFixed( 2 ) }</div>
//                 }

//                 <div className="ratings-container">
//                     <div className="ratings">
//                         <div className="ratings-val" style={ { width: product.ratings * 20 + '%' } }></div>
//                         <span className="tooltip-text">{ product.ratings.toFixed( 2 ) }</span>
//                     </div>
//                     <span className="ratings-text">( { product.review } Reviews )</span>
//                 </div>

//                 {
//                     product.variants.length > 0 ?
//                         <div className="product-nav product-nav-dots">
//                             <div className="row no-gutters">
//                                 {
//                                     product.variants.map( ( item, index ) => (
//                                         <ALink href="#" style={ { backgroundColor: item.color } } key={ index }><span className="sr-only">Color Name</span></ALink>
//                                     ) )
//                                 }
//                             </div>
//                         </div>
//                         : ""
//                 }
//             </div>
//         </div>
//     )
// }

// const mapStateToProps = ( state ) => {
//     return {
//         wishlist: state.wishlist.data,
//         comparelist: state.comparelist.data
//     }
// }

// export default connect( mapStateToProps, { ...wishlistAction, ...cartAction, ...compareAction, ...demoAction } )( ProductTwelve );
