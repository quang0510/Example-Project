import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  /** Các role được phép truy cập. Nếu không truyền thì chỉ cần đăng nhập. */
  roles?: string[];
}

/**
 * Route Guard: kiểm tra đăng nhập và quyền truy cập.
 * - Chưa đăng nhập → redirect về /login
 * - Đã đăng nhập nhưng không đủ quyền → redirect về /
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Chờ AuthContext khởi tạo xong từ localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (roles && roles.length > 0) {
    const hasRole = roles.some(
      (role) => user.role === role || user.role === `ROLE_${role}`
    );
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
