import React from 'react';
import { connect } from 'react-redux';

import ALink from '~/components/features/alink';

function WishlistMenu ( props ) {
    const { wishlist  } = props;

    return (
        <div className="header-second">
        <ALink href="/shop/wishlist" title="Wishlist" className="wishlist-link">
            <i className="icon-heart-o"></i>
            <span className="wishlist-count">{ wishlist.length }</span>
            <span className="wishlist-txt">My Wishlist</span>
        </ALink>
        </div>
    );
}

function mapStateToProps ( state ) {
    return {
        wishlist: state.wishlist.data
    }
}

export default connect( mapStateToProps, {} )( WishlistMenu );
