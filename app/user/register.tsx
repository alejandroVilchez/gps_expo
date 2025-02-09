import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Button } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      await register(username, email, password);
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      router.push("./logIn");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <View style={styles.container}>
      <Avatar.Icon size={64} icon="lock-outline" style={styles.avatar} />
      <Text style={styles.title}>Registrarse</Text>

      <TextInput style={styles.input} placeholder="Nombre de usuario" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Crear cuenta
      </Button>

      <TouchableOpacity onPress={() => router.push("./logIn")}>
        <Text style={styles.link}>¿Ya tienes una cuenta? Inicia sesión.</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 10,
  },
});

export default Register;
