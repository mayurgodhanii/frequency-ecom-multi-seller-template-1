import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createWrapper } from 'next-redux-wrapper';
import createSagaMiddleware from 'redux-saga';
import { persistStore } from 'redux-persist';

import rootSaga from './root-saga'; 

import cartReducer from './cart';
import wishlistReducer from './wishlist';
import compareReducer from './compare';
import demoReducer from './demo';
import authReducer from './authReducer';
import queryReducer from './query';

const rootReducers = combineReducers({
    cartlist: cartReducer,
    wishlist: wishlistReducer,
    comparelist: compareReducer,
    demo: demoReducer,
    auth: authReducer,
    query: queryReducer,
});

const sagaMiddleware = createSagaMiddleware();

export const makeStore = (context) => {
    const store = createStore(rootReducers, applyMiddleware(sagaMiddleware));
    store.sagaTask = sagaMiddleware.run(rootSaga);
    store.__persistor = persistStore(store); 
    return store;
};

export const wrapper = createWrapper(makeStore, { debug: true });
