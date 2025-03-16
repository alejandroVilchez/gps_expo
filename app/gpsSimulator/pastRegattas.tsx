import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const API_URL = "http://192.168.1.12:8080/regattas"; 

export default function PastRegattas() {
  interface Regatta {
    latitude: number;
    longitude: number;
    timestamp: number;
  }

  const [regattas, setRegattas] = useState<Regatta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setRegattas(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error al cargar regatas:", error));
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{
        latitude: regattas.length > 0 ? regattas[0].latitude : 0,
        longitude: regattas.length > 0 ? regattas[0].longitude : 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}>
        {regattas.map((point, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={`Tiempo: ${new Date(point.timestamp).toLocaleTimeString()}`}
          />
        ))}
        <Polyline
          coordinates={regattas.map((p) => ({
            latitude: p.latitude,
            longitude: p.longitude,
          }))}
          strokeWidth={3}
          strokeColor="blue"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
