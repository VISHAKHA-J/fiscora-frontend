import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Accounts from './pages/Accounts.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Categories from './pages/Categories.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/accounts" replace />} />
    </Routes>
  );
}