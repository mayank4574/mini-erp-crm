import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Inventory from './pages/Inventory';
import Challans from './pages/Challans';
import ChallanForm from './pages/ChallanForm';
import AIAssistant from './pages/AIAssistant';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              
              <Route path="/products" element={<Products />} />
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
                <Route path="/inventory" element={<Inventory />} />
              </Route>
              
              <Route path="/challans" element={<Challans />} />
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/challans/new" element={<ChallanForm />} />
              </Route>
              
              <Route path="/ai-assistant" element={<AIAssistant />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
