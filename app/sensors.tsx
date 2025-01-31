import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";
import { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { playSound } from "./sound";

export default function Sensors() {
    const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
    const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
    const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
    const [roll, setRoll] = useState(0);
    const lastRoll = useRef(0); // Almacena el último roll registrado
    const THRESHOLD = 10; // Umbral en grados para activar sonido
    const activationDelay = 5; // retardo de activación

    useEffect(() => {
      Accelerometer.setUpdateInterval(200); // Reducimos frecuencia de actualización
  
      const accelSub = Accelerometer.addListener((data) => {
        setAccelData(data);
        const newRoll = Math.atan2(data.y, Math.sqrt(data.x * data.x + data.z * data.z)) * (180 / Math.PI);
  
        setRoll(newRoll);
  
        // Filtro de histéresis: evita activar sonido en cada fluctuación mínima
        if (Math.abs(newRoll) > THRESHOLD && Math.abs(newRoll - lastRoll.current) > activationDelay ) {
          playSound();
          lastRoll.current = newRoll; // Actualizar último roll registrado
        }
      });
  
      return () => {
        accelSub.remove();
      };
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Acelerómetro: X {accelData.x.toFixed(2)}, Y {accelData.y.toFixed(2)}, Z {accelData.z.toFixed(2)}</Text>
        <Text>Giroscopio: X {gyroData.x.toFixed(2)}, Y {gyroData.y.toFixed(2)}, Z {gyroData.z.toFixed(2)}</Text>
        <Text>Magnetómetro: X {magData.x.toFixed(2)}, Y {magData.y.toFixed(2)}, Z {magData.z.toFixed(2)}</Text>
        <Text>Roll (Acelerómetro): {roll.toFixed(2)}°</Text>
        </View>
    );
}
