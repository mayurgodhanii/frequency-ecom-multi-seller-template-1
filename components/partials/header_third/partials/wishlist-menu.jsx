import React from 'react';
import { connect } from 'react-redux';

import ALink from '~/components/features/alink';

function WishlistMenu ( props ) {
    const { wishlist } = props;

    return (
         <div className="header-three">
        <div className="wishlist">
            <ALink href="/shop/wishlist" title="Wishlist" >
                <i className="icon-heart-o"></i>
                <span className="wishlist-count">{ wishlist.length }</span>
            </ALink>
        </div>
        </div>
    );
}

function mapStateToProps ( state ) {
    return {
        wishlist: state.wishlist.data
    }
}

export default connect( mapStateToProps, {} )( WishlistMenu );
