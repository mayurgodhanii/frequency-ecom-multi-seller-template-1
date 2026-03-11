
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/react-hooks";
import { LazyLoadImage } from "react-lazy-load-image-component";

import withApollo from "~/api/apollo";
import { safeContent } from "~/utils";
import { apirequest } from "~/utils/api";

function HeaderSearch() {
  

  function matchEmphasize(name) {
    let regExp = new RegExp(searchTerm, "i");
    return name.replace(regExp, (match) => "<strong>" + match + "</strong>");
  }

   
  function onCatSelect(e) {
    setCat(e.target.value);
  }

  

  function showSearchForm(e) {
    document.querySelector(".header .header-search").classList.add("show");
  }

  

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(null);
  const [searchCompleted, setSearchCompleted] = useState(false);

  useEffect(() => {
    const handleBodyClick = (e) => {
      if (!e.target.closest(".header-search-wrapper")) {
        closeSearchForm();
      }
    };

    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setSearchCompleted(false);
      if (timer) clearTimeout(timer);

      const timerId = setTimeout(async () => {
        try {
          const auth = JSON.parse(localStorage.getItem("frequency-auth"));
          const token = auth?.token ? auth.token.replace(/"/g, "") : null;

          if (!token || token === "null") {
            fetchFallbackApi(searchTerm);
            return;
          }

          const response = await apirequest(
            "GET",
            `/user/globel_search-product-list`,
            null,
            { page: 0, size: 100, search: searchTerm }
          );

          if (response.success) {
            const allItems = [];
            if (
              response.data.categories &&
              response.data.categories.length > 0
            ) {
              allItems.push(...response.data.categories);
            }
            if (response.data.products && response.data.products.length > 0) {
              allItems.push(...response.data.products);
            }
            setItems(allItems);
          } else {
            setItems([]);
            console.error("Error in response:", response.message);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          fetchFallbackApi(searchTerm);
        } finally {
          setSearchCompleted(true);
        }
        setTimer(timerId);
      }, 300);
    } else {
      setItems([]);
      setSearchCompleted(false);
    }
  }, [searchTerm]);

  const fetchFallbackApi = async (searchTerm) => {
    try {
      const response = await apirequest(
        "GET",
        `/user/globel_search-products-list`,
        null,
        { page: 0, size: 100, search: searchTerm}
      );

      if (response.success) {
        const allItems = [];
        if (response.data.categories && response.data.categories.length > 0) {
          allItems.push(...response.data.categories);
        }
        if (response.data.products && response.data.products.length > 0) {
          allItems.push(...response.data.products);
        }
        setItems(allItems);
      }
    } catch (error) {
      console.error("Error fetching from fallback API:", error);
    }
  };

  function closeSearchForm() {
    document.querySelector(".header .header-search").classList.remove("show");
  }

  function onSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function onSubmitSearchForm(e) {
    e.preventDefault();
    router.push({
      pathname: "/shop/list",
      query: { searchTerm },
    });
  }

  // function handleItemClick(item) {
  //   // If it's a product, redirect to the product page
  //   if (item.image && Array.isArray(item.image) && item.image.length > 0) {
  //     router.push(`/product/${item.slug}`);
  //   } else {
  //     // If it's a category, redirect to the category page
  //     router.push(`/shop/${item.slug}`);
  //   }
  // }

  function handleItemClick(item) {
    if (item.image && Array.isArray(item.image) && item.image.length > 0) {
      router.push(`/product/${item.slug}`);
    } else {
      router.push(`/shop/${item.slug}`);
    }

    setItems([]);
    setSearchTerm(item.name);
  }

  function clearSearch() {
    setSearchTerm("");
    setItems([]);
  }

  return (
     
<div className="header-second">
    <div className="header-search header-search-extended header-search-visible header-search-no-radius d-none d-lg-block">
      <button className="search-toggle">
        <i className="icon-search"></i>
      </button>

      <form
        action="#"
        method="get"
        onSubmit={onSubmitSearchForm}
        onClick={() =>
          document.querySelector(".header .header-search").classList.add("show")
        }
      >
        <div className="header-search-wrapper search-wrapper-wide position-relative">
          <button className="btn btn-primary" type="submit">
            <i className="icon-search"></i>
          </button>
          <input
            type="text"
            onChange={onSearchChange}
            value={searchTerm}
            className="form-control"
            placeholder="Search product ..."
            required
          />

          {searchTerm.length > 0 && (
            <div className="header-second">
            <div
              className="live-search-list position-absolute w-100"
              style={{ top: "100%", left: 0, zIndex: 10 }}
            >
              <div className="autocomplete-suggestions border border-gray-300 bg-white shadow-sm">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={`search-suggestion-${index}`}
                      className="autocomplete-suggestion d-flex align-items-center p-2"
                      onClick={() => handleItemClick(item)}
                    >
                      {item.image ? (
                        <>
                          <LazyLoadImage
                            src={
                              Array.isArray(item.image)
                                ? item.image[0]
                                : item.image
                            }
                            width={40}
                            height={40}
                            alt={item.name}
                            className="mr-2"
                          />
                          <div className="search-name">{item.name}</div>
                        </>
                      ) : (
                        <div className="search-name">{item.name}</div>
                      )}
                    </div>
                  ))
                ) : (
                  searchCompleted && (
                    <div className="autocomplete-suggestion p-2 text-center text-muted">
                      No results found
                    </div>
                  )
                )}
              </div>
            </div>
            </div>
          )}

          {/* Clear (cross) button */}
          {searchTerm.length > 0 && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: "50px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
    </div>
  );
}

export default withApollo({ ssr: typeof window === "undefined" })(HeaderSearch);




// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { useLazyQuery } from "@apollo/react-hooks";
// import { LazyLoadImage } from "react-lazy-load-image-component";

// import ALink from "~/components/features/alink";

// import { GET_PRODUCTS } from "~/server/queries";
// import withApollo from "~/server/apollo";
// import { safeContent } from "~/utils";
// import { apirequest } from "~/utils/api";

// function HeaderSearch() {
//   // const router = useRouter( "" );
//   // const [ cat, setCat ] = useState( "" );
//   // const [ searchTerm, setSearchTerm ] = useState( "" );
//   // const [ products, setProducts ] = useState( [] );
//   // const [ searchProducts, { data } ] = useLazyQuery( GET_PRODUCTS );
//   // const result = data && data.products.data;
//   // const [ timer, setTimer ] = useState( null );

//   // useEffect( () => {
//   //     document.querySelector( "body" ).addEventListener( 'click', closeSearchForm );

//   //     return ( () => {
//   //         document.querySelector( "body" ).removeEventListener( 'click', closeSearchForm );
//   //     } )
//   // }, [] );

//   // useEffect( () => {
//   //     if ( result && searchTerm.length > 2 )
//   //         setProducts( result.reduce( ( acc, product ) => {
//   //             let max = 0;
//   //             let min = 999999;
//   //             product.variants.map( item => {
//   //                 if ( min > item.price ) min = item.price;
//   //                 if ( max < item.price ) max = item.price;
//   //             }, [] );

//   //             if ( product.variants.length == 0 ) {
//   //                 min = product.sale_price
//   //                     ? product.sale_price
//   //                     : product.price;
//   //                 max = product.price;
//   //             }

//   //             return [
//   //                 ...acc,
//   //                 {
//   //                     ...product,
//   //                     minPrice: min,
//   //                     maxPrice: max
//   //                 }
//   //             ];
//   //         }, [] ) )
//   // }, [ result, searchTerm ] )

//   // useEffect( () => {
//   //     if ( searchTerm.length > 2 ) {
//   //         if ( timer ) clearTimeout( timer );
//   //         let timerId = setTimeout( () => {
//   //             searchProducts( {
//   //                 variables: {
//   //                     searchTerm: searchTerm,
//   //                     category: cat
//   //                 }
//   //             } );
//   //         }, 500 );
//   //         setTimer( timerId );
//   //     }
//   // }, [ searchTerm, cat ] );

//   // useEffect( () => {
//   //     document.querySelector( '.header-search.show-results' ) && document.querySelector( '.header-search.show-results' ).classList.remove( 'show-results' );
//   // }, [ router.pathname ] );

//   function matchEmphasize(name) {
//     let regExp = new RegExp(searchTerm, "i");
//     return name.replace(regExp, (match) => "<strong>" + match + "</strong>");
//   }

//   // function closeSearchForm ( e ) {
//   //     document
//   //         .querySelector( '.header .header-search' )
//   //         .classList.remove( 'show' );
//   // }

//   function onCatSelect(e) {
//     setCat(e.target.value);
//   }

//   // function onSearchChange ( e ) {
//   //     setSearchTerm( e.target.value );
//   // }

//   function showSearchForm(e) {
//     document.querySelector(".header .header-search").classList.add("show");
//   }

//   // function onSubmitSearchForm ( e ) {
//   //     e.preventDefault();
//   //     router.push( {
//   //         pathname: '/shop/sidebar/list',
//   //         query: {
//   //             searchTerm: searchTerm,
//   //             category: cat
//   //         }
//   //     } );
//   // }

//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [items, setItems] = useState([]);
//   const [timer, setTimer] = useState(null);

//   useEffect(() => {
//     const handleBodyClick = (e) => {
//       if (!e.target.closest(".header-search-wrapper")) {
//         closeSearchForm();
//       }
//     };

//     document.body.addEventListener("click", handleBodyClick);

//     return () => {
//       document.body.removeEventListener("click", handleBodyClick);
//     };
//   }, []);

//   useEffect(() => {
//     if (searchTerm.length > 0) {
//       if (timer) clearTimeout(timer);

//       const timerId = setTimeout(async () => {
//         try {
//           const auth = JSON.parse(localStorage.getItem("frequency-auth"));
//           const token = auth?.token ? auth.token.replace(/"/g, "") : null;

//           if (!token || token === "null") {
//             fetchFallbackApi(searchTerm);
//             return;
//           }

//           const response = await apirequest(
//             "GET",
//             `/user/globel_search-product-list`,
//             null,
//             { page: 0, size: 100, search: searchTerm }
//           );

//           if (response.success) {
//             const allItems = [];
//             if (
//               response.data.categories &&
//               response.data.categories.length > 0
//             ) {
//               allItems.push(...response.data.categories);
//             }
//             if (response.data.products && response.data.products.length > 0) {
//               allItems.push(...response.data.products);
//             }
//             setItems(allItems);
//           } else {
//             setItems([]);
//             console.error("Error in response:", response.message);
//           }
//         } catch (error) {
//           console.error("Error fetching categories:", error);
//           fetchFallbackApi(searchTerm);
//         }

//         setTimer(timerId);
//       }, 300);
//     } else {
//       setItems([]);
//     }
//   }, [searchTerm]);

//   const fetchFallbackApi = async (searchTerm) => {
//     try {
//       const response = await apirequest(
//         "GET",
//         `/user/globel_search-products-list`,
//         null,
//         { page: 0, size: 100, search: searchTerm}
//       );

//       if (response.success) {
//         const allItems = [];
//         if (response.data.categories && response.data.categories.length > 0) {
//           allItems.push(...response.data.categories);
//         }
//         if (response.data.products && response.data.products.length > 0) {
//           allItems.push(...response.data.products);
//         }
//         setItems(allItems);
//       }
//     } catch (error) {
//       console.error("Error fetching from fallback API:", error);
//     }
//   };

//   function closeSearchForm() {
//     document.querySelector(".header .header-search").classList.remove("show");
//   }

//   function onSearchChange(e) {
//     setSearchTerm(e.target.value);
//   }

//   function onSubmitSearchForm(e) {
//     e.preventDefault();
//     router.push({
//       pathname: "/shop/list",
//       query: { searchTerm },
//     });
//   }

//   // function handleItemClick(item) {
//   //   // If it's a product, redirect to the product page
//   //   if (item.image && Array.isArray(item.image) && item.image.length > 0) {
//   //     router.push(`/product/${item.slug}`);
//   //   } else {
//   //     // If it's a category, redirect to the category page
//   //     router.push(`/shop/${item.slug}`);
//   //   }
//   // }

//   function handleItemClick(item) {
//     if (item.image && Array.isArray(item.image) && item.image.length > 0) {
//       router.push(`/product/${item.slug}`);
//     } else {
//       router.push(`/shop/${item.slug}`);
//     }

//     setItems([]);
//     setSearchTerm(item.name);
//   }

//   function clearSearch() {
//     setSearchTerm("");
//     setItems([]);
//   }

//   return (
//     // <div className="header-search header-search-extended header-search-visible d-none d-lg-block">
//     //     <a href="#" className="search-toggle"><i className="icon-search"></i></a>

//     //     <form action="#" method="get" onSubmit={ onSubmitSearchForm } onClick={ showSearchForm }>
//     //         <div className="header-search-wrapper search-wrapper-wide">
//     //             <button className="btn btn-primary" type="submit"><i className="icon-search"></i></button>
//     //             <label htmlFor="q" className="sr-only" value={ searchTerm } required>Search</label>
//     //             <input type="text" onChange={ onSearchChange } value={ searchTerm } className="form-control" name="q" placeholder="Search product ..." required />
//     //         </div>
//     //         <div className="live-search-list" onClick={ goProductPage }>
//     //             {
//     //                 searchTerm.length > 2 && products.map( ( product, index ) => (
//     //                     <ALink href={ `/product/default/${product.slug}` } className="autocomplete-suggestion" key={ `search-result-${index}` }>
//     //                         <LazyLoadImage src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 0 ].url } width={ 40 } height={ 40 } alt="product" />
//     //                         <div className="search-name" dangerouslySetInnerHTML={ safeContent( matchEmphasize( product.name ) ) }></div>
//     //                         <span className="search-price">
//     //                             {
//     //                                 product.stock == 0 ?
//     //                                     <div className="product-price mb-0">
//     //                                         <span className="out-price">${ product.price.toFixed( 2 ) }</span>
//     //                                     </div>
//     //                                     :
//     //                                     product.minPrice == product.maxPrice ?
//     //                                         <div className="product-price mb-0">${ product.minPrice.toFixed( 2 ) }</div>
//     //                                         :
//     //                                         product.variants.length == 0 ?
//     //                                             <div className="product-price mb-0">
//     //                                                 <span className="new-price">${ product.minPrice.toFixed( 2 ) }</span>
//     //                                                 <span className="old-price">${ product.maxPrice.toFixed( 2 ) }</span>
//     //                                             </div>
//     //                                             :
//     //                                             <div className="product-price mb-0">${ product.minPrice.toFixed( 2 ) }&ndash;${ product.maxPrice.toFixed( 2 ) }</div>
//     //                             }
//     //                         </span>
//     //                     </ALink>
//     //                 ) )
//     //             }
//     //         </div>
//     //     </form>
//     // </div>

//     <div className="header-search header-search-extended header-search-visible header-search-no-radius d-none d-lg-block">
//       <button className="search-toggle">
//         <i className="icon-search"></i>
//       </button>

//       <form
//         action="#"
//         method="get"
//         onSubmit={onSubmitSearchForm}
//         onClick={() =>
//           document.querySelector(".header .header-search").classList.add("show")
//         }
//       >
//         <div className="header-search-wrapper search-wrapper-wide position-relative">
//           <button className="btn btn-primary" type="submit">
//             <i className="icon-search"></i>
//           </button>
//           <input
//             type="text"
//             onChange={onSearchChange}
//             value={searchTerm}
//             className="form-control"
//             placeholder="Search product ..."
//             required
//           />

//           {items.length > 0 && searchTerm.length > 0 && (
//             <div
//               className="live-search-list position-absolute w-100"
//               style={{ top: "100%", left: 0, zIndex: 10 }}
//             >
//               <div className="autocomplete-suggestions border border-gray-300 bg-white shadow-sm">
//                 {items.map((item, index) => (
//                   <div
//                     key={`search-suggestion-${index}`}
//                     className="autocomplete-suggestion d-flex align-items-center p-2"
//                     onClick={() => handleItemClick(item)}
//                   >
//                     {item.image ? (
//                       <>
//                         <LazyLoadImage
//                           src={
//                             Array.isArray(item.image)
//                               ? item.image[0]
//                               : item.image
//                           }
//                           width={40}
//                           height={40}
//                           alt={item.name}
//                           className="mr-2"
//                         />
//                         <div className="search-name">{item.name}</div>
//                       </>
//                     ) : (
//                       <div className="search-name">{item.name}</div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Clear (cross) button */}
//           {searchTerm.length > 0 && (
//             <button
//               type="button"
//               className="clear-search-btn"
//               onClick={clearSearch}
//               style={{
//                 position: "absolute",
//                 right: "50px",
//                 top: "50%",
//                 transform: "translateY(-50%)",
//                 background: "none",
//                 border: "none",
//                 cursor: "pointer",
//                 fontSize: "12px",
//               }}
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }

// export default withApollo({ ssr: typeof window === "undefined" })(HeaderSearch);
