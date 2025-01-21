import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playSound } from './sound';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [markers, setMarkers] = useState<{ latitude: number; longitude: number; id: number }[]>([]);

  // Cargar marcadores guardados al iniciar
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const storedMarkers = await AsyncStorage.getItem('markers');
        if (storedMarkers) {
          setMarkers(JSON.parse(storedMarkers));
        }
      } catch (error) {
        console.error('Error al cargar los marcadores:', error);
      }
    };

    loadMarkers();
  }, []);

  // Guardar marcadores en AsyncStorage
  const saveMarkers = async (newMarkers: { latitude: number; longitude: number; id: number }[]) => {
    try {
      await AsyncStorage.setItem('markers', JSON.stringify(newMarkers));
    } catch (error) {
      console.error('Error al guardar los marcadores:', error);
    }
  };

  // Obtener ubicación del usuario
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);

      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);


  // Agregar un marcador al tocar el mapa
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newMarkers = [...markers, { latitude, longitude, id: Date.now() }];
    setMarkers(newMarkers);
    saveMarkers(newMarkers);
  };

  // Eliminar marcador al presionar
  const handleMarkerPress = (id: number) => {
    Alert.alert(
      'Obstáculo',
      '¿Quieres eliminar este marcador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            const updatedMarkers = markers.filter((marker) => marker.id !== id);
            setMarkers(updatedMarkers);
            saveMarkers(updatedMarkers);
          },
        },
      ]
    );
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en metros
  };
  const checkProximity = (
    userLocation: { latitude: number; longitude: number; }, 
    markers: { latitude: number; longitude: number; id: number; }[]
) => {
    markers.forEach(marker => {
      const distance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude
      );
      
      if (distance < 10) {
        console.log(`Distancia al marcador ${marker.id}: ${distance} metros. Reproduciendo sonido.`);
        // Si ya hay un intervalo activo para este marcador, ajustarlo
        playSound();
     }
    });
  };
  
  useEffect(() => {
    let locationSubscription: { remove: any; };
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permiso de ubicación denegado");
        return;
      }
  
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (location) => checkProximity(location.coords, markers)
      );
    })();
  
    return () => locationSubscription && locationSubscription.remove();
  }, [markers]);

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} initialRegion={region} onPress={handleMapPress}>
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Tu ubicación"
              description="Estás aquí"
            />
          )}

          {/* Renderizar los marcadores añadidos */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title="Obstáculo"
              description={`Lat: ${marker.latitude.toFixed(5)}, Lon: ${marker.longitude.toFixed(5)}`}
              pinColor="purple"
              onPress={() => handleMarkerPress(marker.id)} // Al presionar, eliminar marcador
              
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});
