import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './app/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { OrdersListPage } from './features/orders/pages/OrdersListPage';
import { OrderDetailPage } from './features/orders/pages/OrderDetailPage';
import { EventOrdersListPage } from './features/eventOrders/pages/EventOrdersListPage';
import { EventOrderDetailPage } from './features/eventOrders/pages/EventOrderDetailPage';
import { CatalogListPage } from './features/catalog/pages/CatalogListPage';
import { ProductFormPage } from './features/catalog/pages/ProductFormPage';
import { EventsListPage } from './features/events/pages/EventsListPage';
import { EventFormPage } from './features/events/pages/EventFormPage';
import { NewsListPage } from './features/news/pages/NewsListPage';
import { NewsFormPage } from './features/news/pages/NewsFormPage';
import { WineStoresListPage } from './features/wineStores/pages/WineStoresListPage';
import { WineStoreFormPage } from './features/wineStores/pages/WineStoreFormPage';
import { WineStoreStockPage } from './features/wineStores/pages/WineStoreStockPage';
import { CitiesListPage } from './features/cities/pages/CitiesListPage';
import { CustomersListPage } from './features/customers/pages/CustomersListPage';
import { CustomerDetailPage } from './features/customers/pages/CustomerDetailPage';

function CatchAllRedirect() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return <Navigate to={status === 'authenticated' ? '/' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />

        <Route path="/event-orders" element={<EventOrdersListPage />} />
        <Route path="/event-orders/:id" element={<EventOrderDetailPage />} />

        <Route path="/catalog" element={<CatalogListPage />} />
        <Route path="/catalog/new" element={<ProductFormPage />} />
        <Route path="/catalog/:id" element={<ProductFormPage />} />

        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/new" element={<EventFormPage />} />
        <Route path="/events/:id" element={<EventFormPage />} />

        <Route path="/news" element={<NewsListPage />} />
        <Route path="/news/new" element={<NewsFormPage />} />
        <Route path="/news/:id" element={<NewsFormPage />} />

        <Route path="/wine-stores" element={<WineStoresListPage />} />
        <Route path="/wine-stores/new" element={<WineStoreFormPage />} />
        <Route path="/wine-stores/:id" element={<WineStoreFormPage />} />
        <Route path="/wine-stores/:id/stock" element={<WineStoreStockPage />} />

        <Route path="/cities" element={<CitiesListPage />} />

        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
      </Route>

      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
