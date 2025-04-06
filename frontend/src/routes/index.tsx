import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Spinner } from '@chakra-ui/react';
import PrivateRoute from '../components/Auth/PrivateRoute';
import PublicRoute from '../components/Auth/PublicRoute';

// Lazy load components
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ResumeUpload = lazy(() => import('../pages/ResumeUpload'));
const ResumeOptimization = lazy(() => import('../pages/ResumeOptimization'));
const OptimizationResult = lazy(() => import('../pages/OptimizationResult'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minH="100vh"
  >
    <Spinner size="xl" />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <ResumeUpload />
            </PrivateRoute>
          }
        />
        <Route
          path="/optimize"
          element={
            <PrivateRoute>
              <ResumeOptimization />
            </PrivateRoute>
          }
        />
        <Route
          path="/optimization-result"
          element={
            <PrivateRoute>
              <OptimizationResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 