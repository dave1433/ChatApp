import { useEffect, useState } from "react";
import { loginRequest } from "../../utils/api/authApi";

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (savedToken) setToken(savedToken);
        if (savedRole) setRole(savedRole);
    }, []);

    async function login(username: string, password: string) {
        const data = await loginRequest(username, password);

        setToken(data.token);
        setRole(data.role);

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
    }

    function logout() {
        setToken(null);
        setRole(null);

        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }

    return { token, role, login, logout };
}
