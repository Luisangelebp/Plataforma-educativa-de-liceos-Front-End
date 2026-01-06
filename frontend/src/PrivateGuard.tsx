import { Navigate, Outlet, Route } from "react-router-dom";

export const PrivateGuard = ({ RouteRol }: { RouteRol: string }) => {
    const token = localStorage.getItem('accessToken');
    const rol = localStorage.getItem('rol');
    const user = localStorage.getItem('user');

    if (!token && !user && (rol !== RouteRol)) {
        console.log('No autorizado. Redirigiendo al inicio de sesión.');
        return <Navigate to="/" replace />;
    } else {
        return <Outlet />;
    }
}