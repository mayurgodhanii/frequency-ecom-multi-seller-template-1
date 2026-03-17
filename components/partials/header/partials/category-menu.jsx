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