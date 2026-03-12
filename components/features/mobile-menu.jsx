import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import SlideToggle from 'react-slide-toggle';

import ALink from '~/components/features/alink';

function MobileMenu() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        router.events.on('routeChangeComplete', hideMobileMenu);
    }, [])

    function hideMobileMenu() {
        document.querySelector('body').classList.remove('mmenu-active');
    }


    return (
       
        <div className="mobile-menu-container">
            <div className="mobile-menu-wrapper">
                {/* <span className="mobile-menu-close" onClick={hideMobileMenu}><i className="icon-close"></i></span>

                <form action="#" method="get" onSubmit={onSubmitSearchForm} className="mobile-search">
                    <label htmlFor="mobile-search" className="sr-only">Search</label>
                    <input type="text" className="form-control" value={searchTerm} onChange={onSearchChange} name="mobile-search" id="mobile-search" placeholder="Search product ..." required />
                    <button className="btn btn-primary" type="submit"><i className="icon-search"></i></button>
                </form> */}


            <span className="mobile-menu-close" onClick={hideMobileMenu}><i className="icon-close"></i></span>


                <nav className="mobile-nav">
                    <ul className="mobile-menu">
                        <SlideToggle collapsed={true}>
                            {({ onToggle, setCollapsibleElement, toggleState }) => (
                                <li className={toggleState.toLowerCase() == 'expanded' ? 'open' : ''}>
                                    <ALink href="/">
                                        Home
                                        <span className="mmenu-btn" onClick={(e) => { onToggle(e); e.preventDefault() }}></span>
                                    </ALink>
                                </li>
                            )}
                        </SlideToggle>
                        <SlideToggle collapsed={true}>
                            {({ onToggle, setCollapsibleElement, toggleState }) => (
                                <li className={toggleState.toLowerCase() == 'expanded' ? 'open' : ''}>
                                    <ALink href="/shop/sidebar/list">
                                        Shop
                                        <span className="mmenu-btn" onClick={(e) => { onToggle(e); e.preventDefault() }}></span>
                                    </ALink>


                                </li>
                            )}
                        </SlideToggle>

                        <SlideToggle collapsed={true}>
                            {({ onToggle, setCollapsibleElement, toggleState }) => (
                                <li className={toggleState.toLowerCase() == 'expanded' ? 'open' : ''}>
                                    <ALink href="#">
                                        Pages
                                        <span className="mmenu-btn" onClick={(e) => { onToggle(e); e.preventDefault() }}></span>
                                    </ALink>
                                    <ul ref={setCollapsibleElement}>
                                        <SlideToggle collapsed={true}>
                                            {({ onToggle, setCollapsibleElement, toggleState }) => (
                                                <li className={toggleState.toLowerCase() == 'expanded' ? 'open' : ''}>
                                                    <ALink href="/about" className="sf-with-ul">About <span className="mmenu-btn" onClick={(e) => { onToggle(e); e.preventDefault() }}></span></ALink>


                                                </li>

                                            )}
                                        </SlideToggle>
                                        <SlideToggle collapsed={true}>
                                            {({ onToggle, setCollapsibleElement, toggleState }) => (
                                                <li className={toggleState.toLowerCase() == 'expanded' ? 'open' : ''}>
                                                    <ALink href="/contact" className="sf-with-ul">Contact <span className="mmenu-btn" onClick={(e) => { onToggle(e); e.preventDefault() }}></span></ALink>


                                                </li>
                                            )}
                                        </SlideToggle>

                                    </ul>
                                </li>
                            )}
                        </SlideToggle>


                    </ul>
                </nav>

                <div className="social-icons">
                    <ALink href="#" className="social-icon" title="Facebook"><i className="icon-facebook-f"></i></ALink>
                    <ALink href="#" className="social-icon" title="Twitter"><i className="icon-twitter"></i></ALink>
                    <ALink href="#" className="social-icon" title="Instagram"><i className="icon-instagram"></i></ALink>
                    <ALink href="#" className="social-icon" title="Youtube"><i className="icon-youtube"></i></ALink>
                </div>
            </div>
        </div>
        
    )
}

export default React.memo(MobileMenu);
