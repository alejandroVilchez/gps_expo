import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const WEBSOCKET_URL = "wss://backend-production-f962.up.railway.app/gps/regattas";


export default function GPSReceiver() {

    const [gpsData, setGpsData] = useState({ latitude: 0, longitude: 0 });

    useEffect(() => {
        const ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
            console.log("Conectado al servidor WebSocket");
        };

        ws.onmessage = (event) => {
            console.log("Mensaje recibido sin procesar:", event.data);
            if (typeof event.data !== "string") {
                console.warn("Mensaje no es un string, ignorando...");
                return;
            }
            try {
                const data = JSON.parse(event.data);
                console.log("Datos GPS recibidos:", data);
                const latitude = Number(data.savedData.latitude);
                const longitude = Number(data.savedData.longitude);
                setGpsData({latitude, longitude});
            } catch (error) {
                console.error("Error al procesar los datos recibidos:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        ws.onclose = () => {
            console.log("Conexión cerrada con el servidor");
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Datos GPS Recibidos:</Text>
        <Text>Latitud: {gpsData.latitude}</Text>
        <Text>Longitud: {gpsData.longitude}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
