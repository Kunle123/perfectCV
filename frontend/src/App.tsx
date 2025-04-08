import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import theme from './theme';
import { authService } from './services/auth';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobDescriptionUpload from './pages/JobDescriptionUpload';
import OptimizationResult from './pages/OptimizationResult';
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

interface AppProps {
  initialAuthState?: boolean;
  skipAuthCheck?: boolean;
}

const PrivateRoute = ({ children, isAuthenticated }: PrivateRouteProps) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = ({ initialAuthState = false, skipAuthCheck = false }: AppProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (skipAuthCheck) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [skipAuthCheck]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: { email: string; password: string; full_name: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
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
