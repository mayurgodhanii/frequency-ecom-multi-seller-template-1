import { all } from 'redux-saga/effects';
import { cartSaga } from './cart';
import { wishlistSaga } from './wishlist';
import { compareSaga } from './compare';
import { authSaga } from './authReducer';
import { querySaga } from './query';


export default function* rootSaga() {
    yield all([
        cartSaga(),
        wishlistSaga(),
        compareSaga(),
        authSaga(),
        querySaga(), 
        ]);
}
