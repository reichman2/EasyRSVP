import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { JSX, useEffect } from 'react';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import EventPage from '../pages/EventPage';


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}

const LoggedOutOnlyRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuth();
    return !token ? children : <Navigate to="/dashboard" />;
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
            <Route path="/events" element={ <ProtectedRoute><EventPage /></ProtectedRoute> } />
            <Route path="/login" element={ <LoggedOutOnlyRoute><LoginPage /></LoggedOutOnlyRoute> } />
            <Route path="/register" element={ <LoggedOutOnlyRoute><RegisterPage /></LoggedOutOnlyRoute> } />
            <Route path="/logout" element={ <ProtectedRoute><Logout /></ProtectedRoute> } />
            <Route path="*" element={<Navigate to="/" />} />

            {/* TODO -- add error pages. */}
        </Routes>
    );
};

export default AppRoutes;