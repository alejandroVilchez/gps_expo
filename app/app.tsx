import { View, StyleSheet, Alert, Text, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperProvider, Button, Card, Title  } from 'react-native-paper';
import {AuthContext} from '../contexts/AuthContext';
import { TrackingContext } from '../contexts/TrackingContext';

import React, {useContext, useState, useEffect} from 'react';
import useSensors from './sensors';

export default function App() {

  const router = useRouter();
  const { user } = useContext(AuthContext);
  // Estado para determinar si el tracking está activo
  // const [trackingActive, setTrackingActive] = useState(false);
  // const [trackingTimeLeft, setTrackingTimeLeft] = useState(0); // Tiempo restante en segundos
  //const { trackingActive, trackingTimeLeft, setTrackingActive, setTrackingTimeLeft } = useContext(TrackingContext);
  const { startTracking, resetTracking, trackingActive, trackingTimeLeft } = useContext(TrackingContext);


  const [switchUserMode, setSwitchUserMode] = useState(false);

  const { roll, pitch, yaw, calibrateNorth  } = useSensors();


  const toggleSwitchUserMode = () => setSwitchUserMode(!switchUserMode);
  
  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (trackingActive && trackingTimeLeft > 0) {
  //     timer = setInterval(() => {
  //       setTrackingTimeLeft((prev) => {
  //         if (prev <= 1) {
  //           clearInterval(timer);
  //           setTrackingActive(false);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  //   }
  //   return () => clearInterval(timer);
  // }, [trackingActive, trackingTimeLeft]);

  // const startTracking = () => {
  //   setTrackingActive(true);
  //   setTrackingTimeLeft(3600); // 1 hora en segundos
  // };
  // const resetTracking = () => {
  //   setTrackingActive(false);
  //   setTrackingTimeLeft(0);
  // };
  
  
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
          <Text style={styles.title}>Bienvenido a Solo Sailing! </Text>
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
                onPress={!trackingActive? startTracking : resetTracking}
                // onPress={startTracking}
                //disabled={trackingActive}
                style={[styles.button, { backgroundColor:trackingActive?"green": "grey" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                >
                {trackingActive ? `Tracking Activo ` : "Iniciar Tracking"}
            </Button>
                       
            <Button
                mode="contained"
                icon="map"
                // style={[styles.button, { backgroundColor: "#007AFF" }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                style={[styles.button, { backgroundColor: trackingActive ? "#007AFF" : "grey" }]}
                onPress={() => trackingActive ? router.push('./mapScreen') : Alert.alert("Debes iniciar el tracking")}
                // disabled={!trackingActive}                
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
            {trackingActive && (

            
            <View style={styles.infoContainer}>
              {/* <Button mode="contained" onPress={calibrateNorth} style={{backgroundColor: "#007AFF"}}>Calibrar Norte</Button> */}
              <Text style={styles.infoText}>Tiempo restante de tracking: {Math.floor(trackingTimeLeft / 60)}:{trackingTimeLeft % 60}</Text>
              <Text style={styles.infoText}>Inclinación actual: {roll.toFixed(1)}°</Text>
              <Text style={styles.infoText}>Orientación actual: {yaw?.toFixed(1)}º</Text>

            </View>
            )}
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