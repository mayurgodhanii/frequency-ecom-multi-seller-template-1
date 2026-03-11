
// import React, { useEffect } from 'react';
// import { connect } from 'react-redux';
// import { fetchCategoriesRequest } from '~/store/query';
// import ALink from '~/components/features/alink';

// function CategoryMenu({ categories, loading, error, category, fetchCategories }) {
//     useEffect(() => {
//         fetchCategories({ category }); // Trigger fetching categories
//     }, [category, fetchCategories]);

//     if (loading) return <div>Loading categories...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div className="dropdown category-dropdown">
//             <ALink href="/shop/list" className="dropdown-toggle" title="Browse Categories">
//                 Browse Categories
//             </ALink>

//             <div className="dropdown-menu">
//                 <nav className="side-nav">
//                     <ul className="menu-vertical sf-arrows">
//                         {categories?.data?.length > 0 ? (
//                             categories.data.map((cat) => (
//                                 <li key={cat.id}>
//                                     <ALink
//                                         href={`/shop/${cat.slug}`}
//                                         scroll={false}
//                                     >
//                                         {cat.name}
//                                     </ALink>
//                                 </li>
//                             ))
//                         ) : (
//                             <li>No categories found</li>
//                         )}
//                     </ul>
//                 </nav>
//             </div>
//         </div>
//     );
// }

// const mapStateToProps = (state) => ({
//     categories: state.query.categories,
//     loading: state.query.loading,
//     error: state.query.error,
//     category: state.query.category,
// });

// const mapDispatchToProps = (dispatch) => ({
//     fetchCategories: (payload) => dispatch(fetchCategoriesRequest(payload)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(CategoryMenu);






import React, { useEffect, useCallback, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCategoriesRequest } from '~/store/query';
import ALink from '~/components/features/alink';

function CategoryMenu({ categories, loading, error, fetchCategories }) {
    const [page, setPage] = useState(0);
    const perPage = 8; 
    const hasMore = categories.totalItems > (categories.data?.length || 0);

    const loader = useRef(null);

    useEffect(() => {
        fetchCategories({ page, size: perPage }); 
    }, [fetchCategories, page]);

    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loading) {
                setPage((prevPage) => prevPage + 1); 
            }
        },
        [hasMore, loading]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
        if (loader.current) observer.observe(loader.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    if (error) return <div>Error: {error}</div>;

    return (
         <div className="header-one">
        <div className="dropdown category-dropdown">
            <ALink href="/shop/list" className="dropdown-toggle" title="Browse Categories">
                Browse Categories
            </ALink>

            <div className="dropdown-menu">
                <nav className="side-nav">
                    <ul className="menu-vertical sf-arrows">
                        {categories?.data?.length > 0 ? (
                            categories.data.map((cat, index) => (
                                <li key={index}>
                                    <ALink href={`/shop/${cat.slug}`} scroll={false}>
                                        {cat.name}
                                    </ALink>
                                </li>
                            ))
                        ) : (
                            <li>No categories found</li>
                        )}
                    </ul>
                </nav>
                {loading && <div>Loading more categories...</div>}
                {hasMore && <div ref={loader} style={{ height: '20px', visibility: 'hidden' }} />}
            </div>
        </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    categories: state.query.categories,
    loading: state.query.loading,
    error: state.query.error,
});

const mapDispatchToProps = (dispatch) => ({
    fetchCategories: (payload) => dispatch(fetchCategoriesRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CategoryMenu);





// import { useRouter } from 'next/router';

// import ALink from '~/components/features/alink';

// function CategoryMenu () {
//     const query = useRouter().query;

//     return (
//         <div className="dropdown category-dropdown">
//             <ALink href="/shop/sidebar/list" className="dropdown-toggle" title="Browse Categories">
//                 Browse Categories
//             </ALink>

//             <div className="dropdown-menu">
//                 <nav className="side-nav">
//                     <ul className="menu-vertical sf-arrows">
//                         <li className={ query.category == 'electronics' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=electronics" scroll={ false }>Electronics</ALink></li>
//                         <li className={ query.category == 'gift-idea' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=gift-idea" scroll={ false }>Gift Ideas</ALink></li>
//                         <li className={ query.category == 'beds' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=beds" scroll={ false }>Beds</ALink></li>
//                         <li className={ query.category == 'lighting' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=lighting" scroll={ false }>Lighting</ALink></li>
//                         <li className={ query.category == 'sofas-and-sleeper-sofas' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=sofas-and-sleeper-sofas" scroll={ false }>Sofas & Sleeper sofas</ALink></li>
//                         <li className={ query.category == 'storage' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=storage" scroll={ false }>Storage</ALink></li>
//                         <li className={ query.category == 'armchairs-and-chaises' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=armchairs-and-chaises" scroll={ false }>Armchairs & Chaises</ALink></li>
//                         <li className={ query.category == 'decoration' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=decoration" scroll={ false }>Decoration </ALink></li>
//                         <li className={ query.category == 'kitchen-cabinets' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=kitchen-cabinets" scroll={ false }>Kitchen Cabinets</ALink></li>
//                         <li className={ query.category == 'coffee-and-tables' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=coffee-and-tables" scroll={ false }>Coffee & Tables</ALink></li>
//                         <li className={ query.category == 'furniture' ? 'active' : '' }><ALink href="/shop/sidebar/3cols?category=furniture" scroll={ false }>Outdoor Furniture </ALink></li>
//                     </ul>
//                 </nav>
//             </div>
//         </div>
//     );
// }

// export default CategoryMenu; 



// import { useQuery } from 'react-query'; 
// import { useRouter } from 'next/router';
// import ALink from '~/components/features/alink';

// function fetchCategories() {
//     return fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/category-list`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//         .then((res) => res.json())
//         .then((data) => data.data);
// }

// function CategoryMenu() {
//     const query = useRouter().query;

//     const { data: categories, isLoading, isError, error } = useQuery('categories', fetchCategories, {
//         staleTime: 600000, 
//         refetchOnWindowFocus: false,
//     });

//     if (isLoading) return <div>Loading categories...</div>;
//     if (isError) return <div>Error fetching categories: {error.message}</div>;

//     return (
//         <div
//             className="dropdown category-dropdown"
//             onMouseEnter={() => {
//                 if (!categories.data) {
//                     fetchCategories();
//                 }
//             }}
//             onMouseLeave={() => {}}
//         >
//             <ALink href="/shop/sidebar/list" className="dropdown-toggle" title="Browse Categories">
//                 Browse Categories
//             </ALink>

//             <div className="dropdown-menu">
//                 <nav className="side-nav">
//                     <ul className="menu-vertical sf-arrows">
//                         {categories.data && categories.data.length > 0 ? (
//                             categories.data.map((category) => (
//                                 <li
//                                     key={category.id}
//                                     className={query.category === category.name.toLowerCase() ? 'active' : ''}
//                                 >
//                                     <ALink
//                                         href={`/shop/sidebar/3cols?category=${category.id}&totalItems=${categories.totalItems}&totalPages=${categories.totalPages}`}
//                                         scroll={false}
//                                     >
//                                         {category.name}
//                                     </ALink>
//                                 </li>
//                             ))
//                         ) : (
//                             <li>No categories found</li>
//                         )}
//                     </ul>
//                 </nav>
//             </div>
//         </div>
//     );
// }

// export default CategoryMenu;




