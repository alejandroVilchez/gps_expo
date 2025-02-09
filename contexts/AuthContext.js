import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Crear contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  //const API_URL = "http://192.168.1.135:3000/api";
  const API_URL = "http://20.199.85.103:3000/api";
  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser({ token });
      }
    };
    loadUser();
  }, []);

 
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      console.log("Respuesta de login:", response.data);
      const token = response.data.token;
      await AsyncStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ token });
    } catch (error) {
      console.error("Error en login:", error.response || error.message);
      throw error.response?.data?.message || "Error al iniciar sesión";
    }
  };
  

  // Función para registrar usuario
  const register = async (username, email, password) => {
    try {
      await axios.post(`${API_URL}/register`, { username, email, password });
    } catch (error) {
      throw error.response?.data?.message || "Error al registrarse";
    }
  };

  // Cerrar sesión
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
