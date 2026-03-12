
import React, { useState, useEffect, Suspense } from 'react';
import LightBox from 'react-image-lightbox';

// React 19 compatible wrapper for Magnifier
const MagnifierWrapper = React.memo(({ imageSrc, imageAlt, largeImageSrc, ...props }) => {
    const [MagnifierComponent, setMagnifierComponent] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Dynamically import and handle potential React 19 compatibility issues
        const loadMagnifier = async () => {
            try {
                const { Magnifier } = await import('react-image-magnifiers');
                setMagnifierComponent(() => Magnifier);
            } catch (err) {
                console.warn('Failed to load Magnifier component:', err);
                setError(true);
            }
        };

        loadMagnifier();
    }, []);

    if (error || !MagnifierComponent) {
        // Fallback to regular image if Magnifier fails to load
        return (
            <div className="magnifier-fallback" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                    src={imageSrc} 
                    alt={imageAlt}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        cursor: 'zoom-in'
                    }}
                />
            </div>
        );
    }

    try {
        return (
            <MagnifierComponent
                imageSrc={imageSrc}
                imageAlt={imageAlt}
                largeImageSrc={largeImageSrc}
                {...props}
            />
        );
    } catch (err) {
        console.warn('Magnifier component error:', err);
        // Fallback to regular image
        return (
            <div className="magnifier-fallback" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                    src={imageSrc} 
                    alt={imageAlt}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        cursor: 'zoom-in'
                    }}
                />
            </div>
        );
    }
});

function GalleryDefault({ product, adClass = "product-gallery-vertical" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    useEffect(() => {
        if (product && product.image && product.image.length > 0) {
            setIsOpen(false);
            setPhotoIndex(0);
            
            // Reset active state on first thumbnail when images change
            setTimeout(() => {
                const activeThumb = document.querySelector('.product-image-gallery .active');
                if (activeThumb) {
                    activeThumb.classList.remove('active');
                }
                const firstThumb = document.querySelector('.product-image-gallery .product-gallery-item');
                if (firstThumb) {
                    firstThumb.classList.add('active');
                }
            }, 0);
        }
    }, [product, product?.image]);

    function moveNextPhoto() {
        if (product?.image?.length) {
            setPhotoIndex((photoIndex + 1) % product.image.length);
        }
    }

    function movePrevPhoto() {
        if (product?.image?.length) {
            setPhotoIndex((photoIndex + product.image.length - 1) % product.image.length);
        }
    }

    function openLightBox() {
        const index = parseInt(document.querySelector(".product-main-image")?.getAttribute("index")) || 0;
        setIsOpen(true);
        setPhotoIndex(index);
    }

    function closeLightBox() {
        setIsOpen(false);
    }

    function changeBgImage(e, image, index) {
        const imgs = document.querySelectorAll('.product-main-image img');
        imgs.forEach(img => img.src = image);

        document.querySelector('.product-image-gallery .active')?.classList.remove('active');
        document.querySelector('.product-main-image')?.setAttribute('index', index);

        e.currentTarget.classList.add('active');
    }

    if (!product || !product.image || !Array.isArray(product.image) || product.image.length === 0) {
        return <div className="product-gallery-placeholder">No images available</div>;
    }

    return (
        <>
            <div className={`product-gallery ${adClass}`}>
                <div className="row m-0">
                    <figure className="product-main-image" index="0">
                        {product.is_sale_product && <span className="product-label label-sale">Sale</span>}
                        {product.stock === 0 && <span className="product-label label-out">Out of Stock</span>}

                        <MagnifierWrapper
                            imageSrc={product.image[0]}
                            imageAlt="product"
                            largeImageSrc={product.image[0]}
                            dragToMove={false}
                            mouseActivation="hover"
                            cursorStyleActive="crosshair"
                            id="product-zoom"
                            className="zoom-image position-relative overflow-hidden"
                            style={{ paddingTop: '100%' }}
                        />

                        <button id="btn-product-gallery" className="btn-product-gallery" onClick={openLightBox}>
                            <i className="icon-arrows"></i>
                        </button>
                    </figure>

                    <div id="product-zoom-gallery" className="product-image-gallery">
                        {product.image.map((item, index) => (
                            <button
                                className={`product-gallery-item ${index === 0 ? 'active' : ''}`}
                                key={`gallery-item-${index}`}
                                onClick={(e) => changeBgImage(e, item, index)}
                            >
                               <div className="img-wrapper" style={{ height: '100px' , objectFit: 'cover'}}>
                                    <img src={item} alt={`Gallery Thumbnail ${index + 1}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isOpen && product?.image?.length > 0 && (
                <LightBox
                    mainSrc={product.image[photoIndex]}
                    nextSrc={product.image[(photoIndex + 1) % product.image.length]}
                    prevSrc={product.image[(photoIndex + product.image.length - 1) % product.image.length]}
                    onCloseRequest={closeLightBox}
                    onMovePrevRequest={movePrevPhoto}
                    onMoveNextRequest={moveNextPhoto}
                    reactModalStyle={{
                        overlay: {
                            zIndex: 1041,
                        },
                    }}
                />
            )}
        </>
    );
}

export default React.memo(GalleryDefault);
