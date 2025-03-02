import { View, StyleSheet, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperProvider, Button, Card, Title  } from 'react-native-paper';
import {AuthContext} from '../contexts/AuthContext';
import React, {useContext, useState} from 'react';
import useSensors from './sensors';

export default function App() {

  const router = useRouter();
  const { user } = useContext(AuthContext);
  // Estado para determinar si el tracking está activo
  const [trackingActive, setTrackingActive] = useState(false);
  const [switchUserMode, setSwitchUserMode] = useState(false);

  const { roll, pitch, yaw, calibrateNorth  } = useSensors();


  const toggleSwitchUserMode = () => setSwitchUserMode(!switchUserMode);
  const toggleTracking = () => {
    if (!trackingActive) {
      startTracking();
    } else {
      stopTracking();
    }
    setTrackingActive(!trackingActive);
  };
  
  const startTracking = () => {
    console.log("Tracking iniciado");
  };
  
  const stopTracking = () => {
    console.log("Tracking detenido");
  };
  
  // Función para manejar el acceso a funcionalidades restringidas
  const handleRestrictedAccess = (ruta: string) => {
    Alert.alert(
      "Acceso restringido",
      "Debes tener una cuenta para acceder a esta funcionalidad",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Iniciar sesión",
          onPress: () => router.push('./user/logIn'),
        },
      ]
    );
  };
  


  if (!user || !switchUserMode) {
    return (
      <View style={styles.container}>
          <Text style={styles.title}>Bienvenido a la App</Text>
          <View style={styles.switchContainer}>
              <Button mode="contained" onPress={toggleSwitchUserMode} style={{backgroundColor: "#007AFF"}}>Cambiar menú ( ͡° ͜ʖ ͡°)</Button>
          </View>
          <Button
            mode="contained"
            icon="login"
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => router.push('./user/logIn')}
            >
            Iniciar sesión
          </Button>
          <Button
            mode="contained"
            icon="map"
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={() => router.push('./regattaSimulation')}
            >
            Comenzar simulación
          </Button>

            <Button
                mode="contained"
                icon="volume-high"
                style={[styles.button, { backgroundColor: "#007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => handleRestrictedAccess('settings/soundSettings')}
                >
                Configuración de sonido
            </Button>

            {/* Botón grande para información */}
            <Button
                mode="contained"
                icon="cog"
                style={[styles.button, { backgroundColor: "#007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => handleRestrictedAccess('settings/soundSettings')}
                >
                Configuración de navegación
            </Button>
        </View>
      );
  } 
  else {
    return (
        
        <View style={styles.container}>
            <Text style={styles.title}>Inicio</Text>
            <View style={styles.switchContainer}>
              <Button mode="contained" onPress={toggleSwitchUserMode} style={{backgroundColor: "#007AFF"}}>Cambiar menú ( ͡° ͜ʖ ͡°)</Button>
            </View>
            
            <Button
                mode="contained"
                onPress={toggleTracking}
                style={[styles.button, { backgroundColor: "#007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                >
                {trackingActive ? "Detener Tracking" : "Iniciar Tracking"}
            </Button>
            <Button
                mode="contained"
                icon="map"
                style={[styles.button, { backgroundColor: "#007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./mapScreen')}
                >
                Ver mapa
            </Button>

            <Button
                mode="contained"
                icon="volume-high"
                style={[styles.button, { backgroundColor: "#007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./settings/soundSettings')}
                >
                Configuración de sonido
            </Button>

            {/* Botón grande para información */}
            <Button
                mode="contained"
                icon="cog"
                style={[styles.button, { backgroundColor: "##007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./settings/navSettings')}
                >
                Configuración de navegación
            </Button>
            <View style={styles.infoContainer}>
              <Button mode="contained" onPress={calibrateNorth} style={{backgroundColor: "#007AFF"}}>Calibrar Norte</Button>
              <Text style={styles.infoText}>Inclinación actual: {roll.toFixed(1)}°</Text>
              <Text style={styles.infoText}>Orientación actual: {yaw?.toFixed(1)}º</Text>

            </View>
        </View>
        
    );
   }
  
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    card: {
      marginBottom: 30,
      elevation: 4,
      borderRadius: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#333',
    },
    button: {
      marginVertical: 10,
      borderRadius: 10,
      elevation: 3,
      paddingVertical: 15,
    },
    buttonContent: {
      height: 80, // Altura del botón
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
    },
    switchContainer:{
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 10,
      borderRadius: 8,
    },
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