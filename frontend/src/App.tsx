import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ManagerLayout } from './layouts/ManagerLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { MallMap } from './pages/MallMap';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OAuth2RedirectHandler } from './pages/OAuth2RedirectHandler';
import { Dashboard } from './pages/manager/Dashboard';
import { Booths } from './pages/manager/Booths';
import { Requests } from './pages/manager/Requests';
import { Contracts } from './pages/manager/Contracts';
import { Payments } from './pages/manager/Payments';
import { Users } from './pages/manager/Users';
import { UserDashboard } from './pages/UserDashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { SystemConfig } from './pages/manager/SystemConfig';
import { AuditLogs } from './pages/manager/AuditLogs';

import { Profile } from './pages/Profile';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public/Customer Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/mall-map" element={<MallMap />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes for All Authenticated Users using MainLayout */}
            <Route element={<ProtectedRoute roles={[]} />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>
          </Route>

          {/* Manager/Admin Routes — bảo vệ bằng ProtectedRoute */}
          <Route element={<ProtectedRoute roles={['MANAGER', 'SYSTEM_ADMIN']} />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="booths" element={<Booths />} />
              <Route path="requests" element={<Requests />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="payments" element={<Payments />} />

              {/* Chỉ System Admin mới thấy trang Users, Configs và AuditLogs */}
              <Route element={<ProtectedRoute roles={['SYSTEM_ADMIN']} />}>
                <Route path="users" element={<Users />} />
                <Route path="configs" element={<SystemConfig />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
