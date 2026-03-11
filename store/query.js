

import { createSlice } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { apirequest } from '~/utils/api';

// API Call Function
async function fetchCategoriesApi({ page, size }) {
    try {
        const response = await apirequest('GET', `/user/category-list?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
    }
}

// Redux Slice
const querySlice = createSlice({
    name: 'query',
    initialState: {
        type: '',
        category: '',
        totalItems: 0,
        totalPages: 0,
        currentPage: 0,
        search: '',
        sortBy: '',
        categories: { data: [] },
        loading: false,
        error: null,
    },
    reducers: {
        setQuery(state, action) {
            return { ...state, ...action.payload };
        },
        fetchCategoriesRequest(state) {
            state.loading = true;
            state.error = null;
        },
        fetchCategoriesSuccess(state, action) {
            state.loading = false;
            state.categories = {
                ...state.categories,
                data: [...(state.categories.data || []), ...action.payload.data],
                totalItems: action.payload.totalItems,
                totalPages: action.payload.totalPages,
                currentPage: action.payload.currentPage,
            };
        },
        fetchCategoriesFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    setQuery,
    fetchCategoriesRequest,
    fetchCategoriesSuccess,
    fetchCategoriesFailure,
} = querySlice.actions;

export default querySlice.reducer;

// Saga
function* fetchCategoriesSaga(action) {
    try {
        const categories = yield call(fetchCategoriesApi, action.payload);
        yield put(fetchCategoriesSuccess(categories));
    } catch (error) {
        yield put(fetchCategoriesFailure(error.message));
    }
}

export function* querySaga() {
    yield takeLatest(fetchCategoriesRequest.type, fetchCategoriesSaga);
}
