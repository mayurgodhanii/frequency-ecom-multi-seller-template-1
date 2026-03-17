import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Reveal from 'react-awesome-reveal';
import { fetchCategoriesRequest } from '~/store/query';
import ALink from '~/components/features/alink';
import { fadeIn } from '~/utils/data';

function Categories({ content, categories, loading, error, fetchCategories }) {
    const [displayLimit] = useState(12); // Show up to 12 categories

    useEffect(() => {
        // Fetch categories when component mounts
        fetchCategories({ page: 0, size: displayLimit });
    }, [fetchCategories, displayLimit]);

    if (error) {
        console.error('Categories error:', error);
        return null; // Don't render anything if there's an error
    }

    // Get unique categories (remove duplicates based on id)
    const uniqueCategories = categories?.data ? 
        categories.data.filter((category, index, self) => 
            index === self.findIndex(c => c.id === category.id)
        ).slice(0, displayLimit) : [];

    return (
        <section className="categories-section" id={content?.id}>
            <div className="container-fluid">
                <Reveal keyframes={fadeIn} delay={200} duration={1000} triggerOnce>
                    <div className="categories-container">
                        {loading && uniqueCategories.length === 0 ? (
                            // Loading skeleton
                            <div className="categories-grid">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="category-item skeleton">
                                        <div className="category-image-wrapper">
                                            <div className="skeleton-image"></div>
                                        </div>
                                        <div className="category-name skeleton-text"></div>
                                    </div>
                                ))}
                            </div>
                        ) : uniqueCategories.length > 0 ? (
                            <div className="categories-grid">
                                {uniqueCategories.map((category, index) => (
                                    <Reveal 
                                        key={category.id} 
                                        keyframes={fadeIn} 
                                        delay={100 + (index * 50)} 
                                        duration={800} 
                                        triggerOnce
                                    >
                                        <div className="category-item">
                                            <ALink href={`/shop/${category.slug}`} className="category-link">
                                                <div className="category-image-wrapper">
                                                    <LazyLoadImage
                                                        src={category.image}
                                                        alt={category.name}
                                                        width="80"
                                                        height="80"
                                                        effect="blur"
                                                        className="category-image"
                                                    />
                                                </div>
                                                <h3 className="category-name">{category.name}</h3>
                                            </ALink>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <div className="no-categories">
                                <p>No categories available</p>
                            </div>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
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

export default connect(mapStateToProps, mapDispatchToProps)(Categories);