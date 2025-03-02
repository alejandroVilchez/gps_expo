import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Button } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";


const Login = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const router = useRouter();


  const handleLogin = async () => {
    try {
      await login(username, password);
      router.replace("../app"); // Redirigir a la pantalla principal tras iniciar sesión
    } catch (error) {
      alert(error);
    }
  };

  return (
    <View style={styles.container}>
      <Avatar.Icon size={64} icon="lock-outline" style={styles.avatar} />
      <Text style={styles.title}>Inicie sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        keyboardType="default"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Iniciar sesión
      </Button>

      <TouchableOpacity onPress={() => router.push("./register")}>
        <Text style={styles.link}>¿No tiene una cuenta? Regístrese.</Text>
      </TouchableOpacity>
    </View>
  );  
};

 

// 🎨 Estilos para que el diseño sea más limpio
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatar: {
    backgroundColor: "#007AFF",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    marginVertical: 10,
    backgroundColor: "#007AFF",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 10,
  },
});

export default Login;
