import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider, useSelector } from 'react-redux'
import { appStore, persistor } from './app/store'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from './components/ui/sonner'
import { useLoaduserQuery } from './features/api/authApi'
import Loader from './components/Loader'
import { ThemeProvider } from './extensions/ThemeProvider.jsx'  



const Custom = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const { isLoading } = useLoaduserQuery(undefined, {
    skip: !isAuthenticated || !!user,
    refetchOnMountOrArgChange: true // Only refetch when component mounts or arguments change
  });

  if (isLoading) return <Loader />;

  return <>{children}</>;
};

createRoot(document.getElementById('root')).render(
  <Provider store={appStore}>
    <PersistGate loading={<Loader />} persistor={persistor}>
      <Custom>
        <ThemeProvider>

        <App />

        </ThemeProvider>
        <Toaster />
      </Custom>
    </PersistGate>
  </Provider>
)
