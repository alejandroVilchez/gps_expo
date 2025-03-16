import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button } from 'react-native-paper';
// Importa el JSON con la simulación de la regata.
// Asegúrate de que el archivo regatta1.json se encuentre en el mismo directorio o ajusta la ruta.
import regattaData from '../assets/regatta/regatta1.json';
import {audioManager} from '../components/audioManager';



interface Buoy {
  id: string;
  name: string;
  lat: number;
  lng: number;
}
interface Position{
  a: number;
  n: number;
  s: number;
  c: number;
}

interface RegattaData {
  buoys: Buoy[];
  positions: { [key: string]:Position[] };
  startTmst: number;
  endTmst: number;
}


// Extraemos las boyas y la ruta de posiciones del barco.
const regattaDataTyped: RegattaData = regattaData as RegattaData;
const buoys = regattaDataTyped.buoys;
const positions = regattaDataTyped.positions['360'];

export default function RegattaSimulation() {
  
    const [northSignalActive, setNorthSignalActive] = useState(false);
  
    const toggleNorthSignal = () => {
      setNorthSignalActive(!northSignalActive);
    }
  
    useEffect(() => {
      audioManager.loadAllSounds();
    }, []);
   
    useEffect(() => {
      audioManager.loadNorthSounds();
    }
    , []);
    
  
  // Estado para el índice actual de la posición y la posición del barco.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({
    latitude: positions[0].a,
    longitude: positions[0].n,
  });

  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);


  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < positions.length) {
          setCurrentPosition({ latitude: positions[nextIndex].a, longitude: positions[nextIndex].n });
          return nextIndex;
        } else {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return prevIndex;
        }
      });
    }, 1000);
  };

  const goBack = () => {
    setCurrentIndex(prev => {
      const newIndex = Math.max(prev - 100, 0);
      setCurrentPosition({ latitude: positions[newIndex].a, longitude: positions[newIndex].n });
      return newIndex;
    });
  };

  const skipAhead = () => {
    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 100, positions.length - 1);
      setCurrentPosition({ latitude: positions[newIndex].a, longitude: positions[newIndex].n });
      return newIndex;
    });
  };

  const stopSimulation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
      }
  };

  const resetSimulation = () => {
    stopSimulation();
    setCurrentIndex(0);
    setCurrentPosition({ latitude: positions[0].a, longitude: positions[0].n });
  };


  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // en metros
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  useEffect(() => {
    if (currentPosition) {
      // Usamos la posición actual y el heading simulado de la posición actual
      const simulatedHeading = positions[currentIndex].c; // heading del barco
      // Determinar la boya más cercana
      let closestBuoy: Buoy | any = null;
      let minDist = Infinity;
      regattaDataTyped.buoys.forEach(buoy => {
        const d = getDistance(currentPosition.latitude, currentPosition.longitude, buoy.lat, buoy.lng);
        if (d < minDist) {
          minDist = d;
          closestBuoy = buoy;
        }
      });

      const OBSTACLE_THRESHOLD = 100; // 

      if (closestBuoy && minDist < OBSTACLE_THRESHOLD) {
        
        // if (closestBuoy.name === '1') {
        //   // Llamamos a scheduleBeachSignal
        //   audioManager.scheduleBeachSignal(
        //     { latitude: closestBuoy.lat, longitude: closestBuoy.lng },
        //     currentPosition,
        //     simulatedHeading
        //   );
        // } else {
          // Para otras boyas, usamos la señal de obstáculo (tipo 'buoy')
          audioManager.scheduleObstacleAlert('buoy', minDist);
        // }
      } else {
        // No hay boya en cercanía: detener señal obstáculo
        audioManager.stopObstacleAlert('buoy');
      }

      // También, podemos disparar la señal norte si el heading difiere significativamente del norte (0°)
      const NORTH_THRESHOLD = 10; // si el heading difiere en más de 10°
      if (northSignalActive && Math.abs(simulatedHeading) > NORTH_THRESHOLD) {
        audioManager.scheduleNorthSignal(currentPosition, simulatedHeading);
      }
      
    }
  }, [currentPosition, currentIndex]);
  


  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Marcador de la embarcación */}
        <Marker
          coordinate={currentPosition}
          title="Embarcación"
          description={`Velocidad: ${positions[currentIndex].s} m/s, Curso: ${positions[currentIndex].c}°`}
          rotation={positions[currentIndex].c}
          icon={require('../assets/images/directionIcon.png')}
        />
        {/* Marcadores para las boyas */}
        {regattaDataTyped.buoys.map(buoy => (
          <Marker
            key={buoy.id}
            coordinate={{ latitude: buoy.lat, longitude: buoy.lng }}
            title={`Boya ${buoy.name}`}
            pinColor="purple"
          />
        ))}
      </MapView>
      {/* Controles para la simulación */}
      <View style={[styles.buttonContainer]}>
        <View style={{ flexDirection: 'row', gap: 1, alignContent: 'center', justifyContent: 'center' }}>
          <Button mode="contained" icon="play" onPress={startSimulation} style={styles.button} children={undefined}/>
          <Button mode="contained" icon="skip-backward" onPress={goBack} style={styles.button} children={undefined}>
          </Button>
          <Button mode="contained" icon="pause" onPress={stopSimulation} style={styles.button} children={undefined}>
          </Button>
          <Button mode="contained" icon="skip-forward" onPress={skipAhead} style={styles.button} children={undefined}>
          </Button>
          <Button mode="contained" icon="restart" onPress={resetSimulation} style={styles.button} children={undefined}>
          </Button>
        </View>
        
        <Text style={[styles.infoText,{alignSelf: "center"}]}>Orientación actual: {positions[currentIndex].c?.toFixed(1)}º</Text>
      </View>
      <View style={styles.switchContainer}>
        <Button mode="contained" onPress={toggleNorthSignal} style={{backgroundColor: "#007AFF"}}>Señal Norte</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 8,
    gap: 5,
  },
  infoText: { fontSize: 16, color: '#000' },
  button: {
    marginHorizontal: 0,
    backgroundColor: '#007AFF',
  },
  switchContainer:{
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
});