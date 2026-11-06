
import { createContext, useContext, useState } from "react";
import API from "../services/Api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    const saveSession = (data) => {
        const authToken = data.token;

        if (!authToken) {
            throw new Error("Authentication token was not returned");
        }

        const authUser = data.user || null;

        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));

        setToken(authToken);
        setUser(authUser);
    };

    const signup = async (formData) => {
        const response = await API.post("/auth/signup", formData);
        saveSession(response.data);
        return response.data;
    };

    const login = async (formData) => {
        const response = await API.post("/auth/login", formData);
        saveSession(response.data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: Boolean(token),
                signup,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
