import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootreducer from "./rootReducer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { paymentApi } from "@/features/api/paymentApi";
import { userApi } from "@/features/api/userApi";


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
};

const persistedReducer = persistReducer(persistConfig, rootreducer);

export const appStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }).concat([
      authApi.middleware,
      courseApi.middleware,
      courseProgressApi.middleware,
      paymentApi.middleware,
      userApi.middleware

    ]),
});

export const persistor = persistStore(appStore);

// Modified initializeApp function with proper state access and error handling
const initializeApp = async () => {
  try {
    const state = appStore.getState();
    // Check if auth state exists and has isAuthenticated property
    if (state?.auth?.isAuthenticated) {
      await appStore.dispatch(authApi.endpoints.loaduser.initiate(undefined, { forceRefetch: true }));
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

initializeApp();
