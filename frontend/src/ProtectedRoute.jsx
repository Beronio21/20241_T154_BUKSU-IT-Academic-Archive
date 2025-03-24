import { Navigate } from 'react-router-dom';
import { useSession, useUser } from '@supabase/auth-helpers-react';

const ProtectedRoute = ({ element: Element, allowedRole }) => {
  const session = useSession();
  const user = useUser();

  if (!session || !user) {
    return <Navigate to="/" replace />;
  }

  // Assuming user metadata contains the role
  const userRole = user?.user_metadata?.role;

  if (userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return Element;
};

export default ProtectedRoute;
