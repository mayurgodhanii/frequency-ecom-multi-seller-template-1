import React, { useRef, useEffect, useState, useCallback } from 'react';

function OwlCarousel(props) {
    const { adClass, options, events, isTheme = true } = props;
    const carouselRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const owlInstanceRef = useRef(null);
    const isInitializingRef = useRef(false);
    const isMountedRef = useRef(true);

    const defaultOptions = {
        items: 1,
        loop: false,
        margin: 0,
        responsiveClass: "true",
        nav: true,
        navText: ['<i class="icon-angle-left">', '<i class="icon-angle-right">'],
        dots: true,
        smartSpeed: 400,
        autoplay: false,
        responsive: {
            320: {
                nav: false
            },
            375: {
                nav: false
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        // Load OwlCarousel CSS and JS if not already loaded
        const loadOwlCarousel = () => {
            if (!isMountedRef.current) return;
            
            // Check if OwlCarousel CSS is already loaded
            if (!document.querySelector('link[href*="owl.carousel"]')) {
                const owlCSS = document.createElement('link');
                owlCSS.rel = 'stylesheet';
                owlCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css';
                document.head.appendChild(owlCSS);

                const owlThemeCSS = document.createElement('link');
                owlThemeCSS.rel = 'stylesheet';
                owlThemeCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css';
                document.head.appendChild(owlThemeCSS);
            }

            // Check if OwlCarousel JS is already loaded
            if (typeof window !== 'undefined' && window.jQuery && !window.jQuery.fn.owlCarousel) {
                const owlScript = document.createElement('script');
                owlScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js';
                owlScript.onload = () => {
                    if (isMountedRef.current) {
                        setIsReady(true);
                    }
                };
                owlScript.onerror = () => {
                    console.warn('Failed to load OwlCarousel');
                    if (isMountedRef.current) {
                        setIsReady(true); // Still set ready to render content
                    }
                };
                document.head.appendChild(owlScript);
            } else if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.owlCarousel) {
                setIsReady(true);
            } else {
                // jQuery not ready yet, try again
                setTimeout(loadOwlCarousel, 100);
            }
        };

        loadOwlCarousel();
    }, []);

    const destroyCarousel = useCallback(() => {
        if (!isMountedRef.current) return;
        
        if (owlInstanceRef.current && typeof window !== 'undefined' && window.jQuery) {
            try {
                const $carousel = owlInstanceRef.current;
                
                // Unbind all events first
                $carousel.off('.owl.carousel');
                
                // Destroy the carousel
                $carousel.trigger('destroy.owl.carousel');
                
                // Clean up classes
                $carousel.removeClass('owl-loaded owl-drag owl-grab');
                
                // Remove owl-generated elements more safely
                $carousel.find('.owl-stage-outer, .owl-nav, .owl-dots').remove();
                
                // Reset the instance
                owlInstanceRef.current = null;
            } catch (error) {
                console.warn('OwlCarousel destroy warning:', error);
                owlInstanceRef.current = null;
            }
        }
    }, []);

    const initCarousel = useCallback(() => {
        if (!isMountedRef.current || isInitializingRef.current || !carouselRef.current) return;
        
        if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.owlCarousel) {
            const $ = window.jQuery;
            const $carousel = $(carouselRef.current);
            
            try {
                isInitializingRef.current = true;
                
                // Destroy existing instance
                destroyCarousel();
                
                // Wait a bit for DOM to settle
                setTimeout(() => {
                    if (!isMountedRef.current || !carouselRef.current) {
                        isInitializingRef.current = false;
                        return;
                    }
                    
                    try {
                        const settings = Object.assign({}, defaultOptions, options);
                        
                        // Initialize new carousel
                        $carousel.owlCarousel(settings);
                        owlInstanceRef.current = $carousel;
                        
                        // Bind events
                        if (events) {
                            Object.keys(events).forEach(eventName => {
                                $carousel.on(eventName + '.owl.carousel', events[eventName]);
                            });
                        }
                    } catch (error) {
                        console.warn('OwlCarousel initialization failed:', error);
                    } finally {
                        isInitializingRef.current = false;
                    }
                }, 50);
            } catch (error) {
                console.warn('OwlCarousel initialization failed:', error);
                isInitializingRef.current = false;
            }
        }
    }, [options, events, destroyCarousel]);

    useEffect(() => {
        if (!isReady || !carouselRef.current) return;

        // Delay initialization to let React finish its work
        const timer = setTimeout(initCarousel, 200);

        // Cleanup function
        return () => {
            clearTimeout(timer);
            if (isMountedRef.current) {
                destroyCarousel();
            }
        };
    }, [isReady, initCarousel, destroyCarousel]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            destroyCarousel();
        };
    }, [destroyCarousel]);

    useEffect(() => {
        if (props.onChangeRef && carouselRef.current) {
            props.onChangeRef(carouselRef);
        }
    }, [props.onChangeRef]);

    if (!props.children || (Array.isArray(props.children) && props.children.length === 0)) {
        return null;
    }

    return (
        <div 
            ref={carouselRef}
            className={`owl-carousel ${isTheme ? 'owl-theme' : ''} ${adClass || ''}`}
            suppressHydrationWarning={true}
        >
            {props.children}
        </div>
    );
}

export default React.memo(OwlCarousel);