import React, { useState, useEffect } from 'react';
import LightBox from 'react-image-lightbox';

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

function GalleryMasonry ( props ) {
    const { product } = props;
    const [ isOpen, setIsOpen ] = useState( false );
    const [ photoIndex, setPhotoIndex ] = useState( 0 );

    useEffect( () => {
        if ( product ) {
            setIsOpen( false );
            setPhotoIndex( 0 );
        }
    }, [ product ] )

    function moveNextPhoto () {
        setPhotoIndex( ( photoIndex + 1 ) % product.pictures.length );
    }

    function movePrevPhoto () {
        setPhotoIndex( ( photoIndex + product.pictures.length - 1 ) % product.pictures.length );
    }

    function openLightBox () {
        let index = parseInt( document.querySelector( ".product-main-image" ).getAttribute( "index" ) );

        if ( !index ) {
            index = 0;
        }
        setIsOpen( true );
        setPhotoIndex( index );
    }

    function closeLightBox () {
        setIsOpen( false );
    }

    function changeBgImage ( e, image, index ) {
        let imgs = document.querySelectorAll( '.product-main-image img' );
        for ( let i = 0; i < imgs.length; i++ ) {
            imgs[ i ].src = image;
        }

        document.querySelector( '.product-image-gallery .active' ).classList.remove( 'active' );
        document.querySelector( '.product-main-image' ).setAttribute( 'index', index );
        e.currentTarget.classList.add( 'active' );
    }

    if ( !product ) {
        return <div></div>
    }

    return (
        <>
            <div className="product-gallery product-gallery-masonry">
                <div className="row m-0">
                    <figure className="product-main-image" index="0">
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
                            !product.stock || product.stock == 0 ?
                                <span className="product-label label-out">Out of Stock</span>
                                : ""
                        }

                        <MagnifierWrapper
                            imageSrc={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ 0 ].url }
                            imageAlt="product"
                            largeImageSrc={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ 0 ].url }
                            dragToMove={ false }
                            mouseActivation="hover"
                            cursorStyleActive="crosshair"
                            className="zoom-image overflow-hidden p-relative"
                            width={ product.pictures[ 0 ].width }
                            height={ '100%' }
                            style={ { paddingTop: `${product.pictures[ 0 ].height / product.pictures[ 0 ].width * 100}%` } }
                        />

                        <button id="btn-product-gallery" className="btn-product-gallery" onClick={ openLightBox }>
                            <i className="icon-arrows"></i>
                        </button>
                    </figure>

                    <div id="product-zoom-gallery" className="product-image-gallery mr-0 ml-0">
                        <div className="row">
                            <div className="col-5 d-flex mb-1">
                                <button className="active product-masonry-item p-0 w-100" onClick={ e => changeBgImage( e, `${process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 0 ].url}`, 0 ) }>
                                    <img src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 0 ].url } alt="product back" className="w-100" />
                                </button>
                            </div>
                            {
                                product.sm_pictures.length > 1 ?
                                    <div className="col-7 d-flex mb-1">
                                        <button className="product-masonry-item p-0 w-100" onClick={ e => changeBgImage( e, `${process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 1 ].url}`, 1 ) }>
                                            <img src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 1 ].url } alt="product back" className="w-100" />
                                        </button>
                                    </div>
                                    : ""
                            }
                            {
                                product.sm_pictures.length > 2 ?
                                    <div className="col-7 d-flex mb-1">
                                        <button className="product-masonry-item p-0 w-100" onClick={ e => changeBgImage( e, `${process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 2 ].url}`, 2 ) }>
                                            <img src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 2 ].url } alt="product back" className="w-100" />
                                        </button>
                                    </div>
                                    : ""
                            }
                            {
                                product.sm_pictures.length > 3 ?
                                    <div className="col-5 d-flex mb-1">
                                        <button className="product-masonry-item p-0 w-100" onClick={ e => changeBgImage( e, `${process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 3 ].url}`, 3 ) }>
                                            <img src={ process.env.NEXT_PUBLIC_ASSET_URI + product.sm_pictures[ 3 ].url } alt="product back" className="w-100" />
                                        </button>
                                    </div>
                                    : ""
                            }
                        </div>
                    </div>
                </div>
            </div>

            {
                isOpen ?
                    <LightBox
                        mainSrc={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ photoIndex ].url }
                        nextSrc={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ ( photoIndex + 1 ) % product.pictures.length ].url }
                        prevSrc={ process.env.NEXT_PUBLIC_ASSET_URI + product.pictures[ ( photoIndex + product.pictures.length - 1 ) % product.pictures.length ].url }
                        onCloseRequest={ closeLightBox }
                        onMovePrevRequest={ moveNextPhoto }
                        onMoveNextRequest={ movePrevPhoto }
                        reactModalStyle={ {
                            overlay: {
                                zIndex: 1041
                            },
                        }
                        }
                    />
                    : ''
            }
        </>
    )
}

export default React.memo( GalleryMasonry );
