import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Dialog, Portal, RadioButton } from "react-native-paper";
import useSensors from './sensors'; 
import { audioManager } from '../components/audioManager';
import { calculateClockOrientation, calculateBearing, mapClockOrientation } from '../utils/orientationUtils';



const OBSTACLE_TYPES = {
  boat: { label: "Otra embarcación", color: "blue" },
  buoy: { label: "Boya", color: "purple" },
  beach: { label: "Playa (punto de partida)", color: "green" },
};

// configuración de proximidad
const OBSTACLE_CONFIG = {
  maxDistance: 100,
  minVolume: 0.3,
  maxVolume: 1.0,
  minDelay: 300,
  maxDelay: 2500
};

const BEACH_CONFIG = {
  updateInterval: 6000,
  maxAudioDistance: 500
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const [heading, setHeading] = useState<number | null>(null);
  //const sensors = useSensors();
  const { roll } = useSensors();
  
  const [markers, setMarkers] = useState<{ latitude: number; longitude: number; id: number, type: keyof typeof OBSTACLE_TYPES }[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof OBSTACLE_TYPES>("boat");
  const [newMarker, setNewMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  


  // cargar sonidos
  useEffect(() => {
    audioManager.loadAllSounds();

    return () => {
      audioManager.unloadAll();
    }
  }, []);


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
  const saveMarkers = async (newMarkers: typeof markers) => {
    try {
      await AsyncStorage.setItem('markers', JSON.stringify(newMarkers));
    } catch (error) {
      console.error('Error al guardar los marcadores:', error);
    }
  };

  // Obtener ubicación y orientación (heading) del usuario
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

      let lastOrientation = 12;

      let headingSubscription = await Location.watchHeadingAsync((data) => {
        if(data.trueHeading){
          const newOrientation = calculateClockOrientation(data.trueHeading);
          const mappedOrientation = mapClockOrientation(newOrientation);
          setHeading(data.trueHeading);
          if (mappedOrientation !== lastOrientation) {
            audioManager.playSound(`hour_${mappedOrientation}`, { volume: 0.6, delay: 0 });
          }
          lastOrientation = mappedOrientation;
        }
      });

      return () => headingSubscription.remove(); // Limpiar suscripción
    })();
  }, []);

  //Intreactuar con los marcadores
  const openDialog = (coordinate: { latitude: number; longitude: number }) => {
    setNewMarker(coordinate);
    setDialogVisible(true);
  };

  const saveMarker = () => {
    if (newMarker) {
      const newMarkers = [
        ...markers,
        { latitude: newMarker.latitude, longitude: newMarker.longitude, id: Date.now(), type: selectedType },
      ];
      setMarkers(newMarkers);
      saveMarkers(newMarkers);
      setNewMarker(null);
      setDialogVisible(false);
    }
  };
  const handleMarkerPress = (id: number) => {
    if (selectedMarker === id) {
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
    } else {
      setSelectedMarker(id);
    }

  };
 
  
  // Reproducir sonido de alerta

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
    markers: { latitude: number; longitude: number; id: number; type: keyof typeof OBSTACLE_TYPES }[]
) => {
    markers.forEach(async marker => {
      if (marker.type === 'beach') return;

      const distance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude
      );
      
      const maxDistance = 100;
      const soundType = marker.type === 'buoy' ? 'buoy' : 'boat';
      if (distance < maxDistance) {
        console.log(`Distancia al marcador ${marker.id}: ${distance} metros. Reproduciendo sonido.`);
        const volume = 1 - (distance / maxDistance);
        const delay = Math.max(300, 2500 * (distance / maxDistance));

        // Calcular dirección relativa
        const bearing = calculateBearing(
          userLocation.latitude,
          userLocation.longitude,
          marker.latitude,
          marker.longitude
        );

        await audioManager.playDirectionalSound(soundType, {
          volume,
          delay,
          isLooping: true,
          bearing, // Dirección del sonido
          userHeading: heading || 0, // Dirección del usuario
        });
      } else {
        await audioManager.stopSound(soundType);
      }
    });
  };
  
  // Vuelta a la playa
  useEffect(() => {
    const playBeachFeedback = async (clock: number, distance: number) => {
      // Reproducir número de hora
      await audioManager.playSound(`hour_${clock}`, { volume: 0.8, delay: 0 });
      
      // Reproducir distancia en intervalos de 50m
      if (distance < 35) {
        if (distance > 15){
          await audioManager.playSound('distance_25', { volume: 0.7, delay: 1000 });
        }else if (distance < 15 && distance > 7){
          await audioManager.playSound('distance_10', { volume: 0.7, delay: 1000 });
        }else if (distance < 7 && distance > 0){
          await audioManager.playSound('distance_5', { volume: 0.7, delay: 1000 });
        }
      }
      else if(distance>= 35){
        const distanceRounded = Math.round(distance / 50) * 50;
        if (distanceRounded > 0) {
          await audioManager.playSound(`distance_${distanceRounded}`, {
            volume: 0.7,
            delay: 1000
          });
        }
      }
    };
  
    const updateBeachFeedback = async () => {
      const beach = markers.find(m => m.type === 'beach');
      if (beach && location && heading !== null) {
        const distance = getDistance(
          location.coords.latitude,
          location.coords.longitude,
          beach.latitude,
          beach.longitude
        );
        
        const bearing = calculateBearing(
          location.coords.latitude,
          location.coords.longitude,
          beach.latitude,
          beach.longitude
        );
        
        const relativeBearing = (bearing - heading + 360) % 360;
        const clock = calculateClockOrientation(relativeBearing);
        await playBeachFeedback(clock, distance);
      }
    };
  
    const interval = setInterval(updateBeachFeedback, 6000);
    return () => clearInterval(interval);
  }, [markers, location, heading]);


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

  
  useEffect(() => {
    return () => {
      audioManager.stopAll();
    };
  }, []);

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} initialRegion={region} onPress={(e) => openDialog(e.nativeEvent.coordinate)}>
          {location && (
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              title="Tu ubicación"
              description={`Dirección: ${heading ? heading.toFixed(1) + '°' : 'N/A'}`}
              //description={`Dirección: ${sensors.orientation.yaw.toFixed(1)}°`}
              anchor={{ x: 0.5, y: 0.5 }}
              rotation={heading || 0}
              //rotation={sensors.orientation.yaw || 0}
              icon={require('../assets/images/directionIcon.png')}
            />

          )}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={OBSTACLE_TYPES[marker.type].label}
              description={`Lat: ${marker.latitude.toFixed(5)}, Lon: ${marker.longitude.toFixed(5)}`}
              pinColor={OBSTACLE_TYPES[marker.type].color}
              onPress={() => handleMarkerPress(marker.id)}
            />
          ))}
        </MapView>
      )}

      {/* Diálogo para seleccionar el tipo de obstáculo */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Seleccionar tipo de obstáculo</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedType(value as keyof typeof OBSTACLE_TYPES)}
              value={selectedType}
            >
              {Object.entries(OBSTACLE_TYPES).map(([key, { label }]) => (
                <RadioButton.Item key={key} label={label} value={key} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={saveMarker}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Inclinación actual: {roll.toFixed(1)}°</Text>
        <Text style={styles.infoText}>Orientación actual: {heading?.toFixed(1)}º</Text>
        <Text style={styles.infoText}>Dirección playa en horas: {} </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: { fontSize: 16, color: '#000' },
});
