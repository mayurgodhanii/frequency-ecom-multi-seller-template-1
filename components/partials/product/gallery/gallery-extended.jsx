import React, { useState, useEffect } from 'react';

import OwlCarousel from '~/components/features/owl-carousel';
import { mainSlider9 } from '~/utils/data';

// React 19 compatible wrapper for Magnifier
const MagnifierWrapper = React.memo(({ imageSrc, imageAlt, largeImageSrc, ...props }) => {
    const [MagnifierComponent, setMagnifierComponent] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
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

function GalleryExtended ( props ) {
    const { product } = props;

    if ( !product ) {
        return <div></div>
    }

    return (
        <div className="product-lg position-relative">
            {
                product.new ?
                    <span className="product-label label-new">New</span>
                    : ""
            }

            {
                product.sale_price ?
                    <span className="product-label label-sale">Sale</span>
                    : ""
            }

            {
                product.top ?
                    <span className="product-label label-top">Top</span>
                    : ""
            }

            {
                product.stock == 0 ?
                    <span className="product-label label-out">Out of Stock</span>
                    : ""
            }
            <OwlCarousel adClass="product-gallery-carousel owl-full owl-nav-dark cols-1 cols-md-2 cols-lg-3" options={ mainSlider9 }>
                { product.pictures.map( ( item, index ) =>
                    <MagnifierWrapper
                        imageSrc={ process.env.NEXT_PUBLIC_ASSET_URI + item.url }
                        imageAlt="product"
                        largeImageSrc={ process.env.NEXT_PUBLIC_ASSET_URI + item.url }
                        dragToMove={ false }
                        mouseActivation="hover"
                        cursorStyleActive="crosshair"
                        className="product-gallery-image"
                        style={ { paddingTop: `${product.pictures[ 0 ].height / product.pictures[ 0 ].width * 100}%` } }
                        key={ "gallery-" + index }
                    />
                ) }
            </OwlCarousel>
        </div>
    )
}

export default React.memo( GalleryExtended );
