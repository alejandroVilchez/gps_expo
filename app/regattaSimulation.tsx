import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button } from 'react-native-paper';
// Importa el JSON con la simulación de la regata.
// Asegúrate de que el archivo regatta1.json se encuentre en el mismo directorio o ajusta la ruta.
import regattaData from '../assets/regatta/regatta1.json';

interface RegattaData {
  buoys: { id: string; name: string; lat: number; lng: number }[];
  positionsJSON: { [key: string]: { a: number; n: number; s: number; c: number }[] };
}

const regattaDataTyped: RegattaData = regattaData as RegattaData;

export default function RegattaSimulation() {
  // Extraemos las boyas y la ruta de posiciones del barco.
  const { buoys, positionsJSON } = regattaDataTyped;
  // Suponemos que la clave "360" contiene la secuencia de posiciones para la embarcación.
  const positions = positionsJSON['360'];

  // Estado para el índice actual de la posición y la posición del barco.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({
    latitude: positions[0].a,
    longitude: positions[0].n,
  });

  // Intervalo que actualiza la posición del barco cada segundo (ajustable).
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < positions.length) {
          const pos = positions[nextIndex];
          setCurrentPosition({ latitude: pos.a, longitude: pos.n });
          return nextIndex;
        } else {
          clearInterval(interval);
          return prevIndex;
        }
      });
    }, 1000); // Actualización cada 1000ms (1 segundo)
    return () => clearInterval(interval);
  }, []);

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
        {/* Marcador animado para la embarcación */}
        <Marker
          coordinate={currentPosition}
          title="Embarcación"
          description={`Velocidad: ${positions[currentIndex].s} m/s, Curso: ${positions[currentIndex].c}°`}
        />

        {/* Marcadores para las boyas */}
        {buoys.map(buoy => (
          <Marker
            key={buoy.id}
            coordinate={{ latitude: buoy.lat, longitude: buoy.lng }}
            title={`Boya ${buoy.name}`}
            pinColor="purple"
          />
        ))}
      </MapView>
      {/* Botón para reiniciar la simulación, si se desea */}
      <Button
        mode="contained"
        onPress={() => {
          setCurrentIndex(0);
          setCurrentPosition({ latitude: positions[0].a, longitude: positions[0].n });
        }}
        style={styles.button}
      >
        Reiniciar Simulación
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});
