import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_URL } from "../config/api";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const checkAuth =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/api/auth/me`,
              {
                credentials:
                  "include",
              }
            );

          if (!response.ok) {
            setUser(null);
            return;
          }

          const data =
            await response.json();

          setUser(
            data.user || null
          );
        } catch (error) {
          console.error(
            "Authentication check failed:",
            error
          );

          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    checkAuth();
  }, []);

  const login = async (
    email,
    password,
    rememberMe = false
  ) => {
    const response =
      await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials:
            "include",

          body: JSON.stringify({
            email,
            password,
            rememberMe,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Login failed."
      );
    }

    setUser(data.user);

    return data;
  };

  const logout = async () => {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials:
            "include",
        }
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}