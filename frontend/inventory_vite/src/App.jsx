import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import theme from './styles/Theme';
import NavBar from './components/NavBar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import ProductForm from './pages/products/ProductForm';
import Orders from './pages/orders/Orders';
import OrderForm from './pages/orders/OrderForm';
import Category from './pages/category/Category';
import CategoryForm from './pages/category/CategoryForm';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected: root (/) shows Login */}
        <Route path="/" element={
          <ProtectedRoute>
            <Login />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/orders/new" element={
          <ProtectedRoute>
            <OrderForm />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id/edit" element={
          <ProtectedRoute>
            <OrderForm />
          </ProtectedRoute>
        } />

        <Route path="/category" element={
          <ProtectedRoute>
            <Category />
          </ProtectedRoute>
        } />
        <Route path="/category/new" element={
          <ProtectedRoute>
            <CategoryForm />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Footer/>
    </ThemeProvider>
  );
};

export default App;
