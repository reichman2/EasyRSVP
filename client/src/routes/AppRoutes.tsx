import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { JSX, useEffect } from 'react';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}

const Logout = () => {
    const { logout } = useAuth();
    useEffect(() => {
        logout();
    }, []);
    return <Navigate to="/login" />;
}


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={ <ProtectedRoute><h1>/</h1></ProtectedRoute> } />
            <Route path="/dashboard" element={ <ProtectedRoute><DashboardPage /></ProtectedRoute> } />
            <Route path="/login" element={ <LoginPage /> } />
            <Route path="/register" element={ <RegisterPage />} />
            <Route path="/logout" element={ <ProtectedRoute><Logout /></ProtectedRoute> } />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;