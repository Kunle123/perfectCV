import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import theme from './theme';
import { getCurrentUser } from './services/auth';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobDescriptionUpload from './pages/JobDescriptionUpload';
import OptimizationResult from './pages/OptimizationResult';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import NotFound from './pages/NotFound';
import ResumeBuilder from './pages/ResumeBuilder';
import JobParser from './pages/JobParser';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import Loading from './components/Loading';

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const PrivateRoute = ({ children, isAuthenticated }: PrivateRouteProps) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  // Set isAuthenticated to true for demo
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // TODO: Implement actual login logic
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = () => {
    setIsLoading(true);
    // TODO: Implement actual registration logic
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} isLoading={isLoading} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Register onRegister={handleRegister} isLoading={isLoading} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/resume-builder"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <ResumeBuilder />
              </PrivateRoute>
            }
          />
          <Route
            path="/job-parser"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <JobParser />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/resume-upload"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <ResumeUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/job-description-upload"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <JobDescriptionUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/optimization-result"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <OptimizationResult />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
