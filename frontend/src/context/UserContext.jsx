import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("contractiq_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setIsLoaded(true);
  }, []);

  const login = ({ username, email }) => {
    const userData = {
      username: username?.trim() || "Guest",
      email: email?.trim() || "",
      isGuest: !username?.trim() && !email?.trim(),
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem("contractiq_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("contractiq_user");
    setUser(null);
  };

  const getInitials = () => {
    if (!user || user.isGuest) return "G";
    const name = user.username || user.email || "G";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <UserContext.Provider value={{ user, login, logout, getInitials, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}