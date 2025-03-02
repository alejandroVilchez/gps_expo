import { useState, useEffect, useRef } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { Audio } from 'expo-av';

const useSensors = () => {
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPlaying = useRef(false);
  const lastAngle = useRef(0);
  const lastPlayTime = useRef<number>(Date.now());

  const lastUpdateRef = useRef<number>(0);
  const yawAccumulated = useRef(0);
  const smoothedYaw = useRef(0);
  // Configuración
  const MIN_ANGLE = 10;
  const MAX_ANGLE = 40;
  const MIN_INTERVAL = 80;    
  const MAX_INTERVAL = 800;   
  const SMOOTHING = 0.2; 

  // Cargar sonido
  useEffect(() => {
    Audio.Sound.createAsync(require('../assets/sound/tilt/tilt.wav'))
      .then(({ sound }) => {
        soundRef.current = sound;
      })
      .catch(console.error);

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Detección de inclinación CORREGIDA (usando eje X para roll)
  useEffect(() => {
    let smoothedRoll = 0;
    let smoothedPitch = 0;
    //let smoothedYaw = 0;
    
    const sub = DeviceMotion.addListener(({ accelerationIncludingGravity, rotationRate }) => {
      if (!accelerationIncludingGravity || !rotationRate) return;
      
      const { x, y, z } = accelerationIncludingGravity;

      // Cálculo de roll usando eje X
      const rawRoll = Math.atan2(x, Math.sqrt(y*y + z*z)) * (180/Math.PI);
      smoothedRoll = smoothedRoll * (1 - SMOOTHING) + rawRoll * SMOOTHING;
      // Calculo de pitch usando eje Y
      const rawPitch = Math.atan2(y, Math.sqrt(x*x + z*z)) * (180/Math.PI);
      smoothedPitch = smoothedPitch * (1 - SMOOTHING) + rawPitch * SMOOTHING;
      
     
      setPitch(smoothedPitch);
      setRoll(Math.abs(smoothedRoll));
      lastAngle.current = Math.abs(smoothedRoll);


      if(rotationRate && typeof rotationRate.gamma === 'number'){
        const currentTime = Date.now();
        if(lastUpdateRef.current !== null){
          const dt = (currentTime - lastUpdateRef.current) /1000;
          yawAccumulated.current += -rotationRate.gamma * dt;
          yawAccumulated.current = ((yawAccumulated.current % 360) +360 ) % 360;
          smoothedYaw.current = smoothedYaw.current * (1-SMOOTHING) + yawAccumulated.current * SMOOTHING;
          setYaw(smoothedYaw.current );
        }
        lastUpdateRef.current = currentTime;

      }
    });

    return () => sub.remove();
  }, []);

  // Control de sonido
  useEffect(() => {
    const interval = setInterval(() => {
      const currentAngle = lastAngle.current;
      const currentTime = Date.now();

      if (currentAngle >= MIN_ANGLE && soundRef.current && !isPlaying.current) {
        const normalized = Math.min(
          (currentAngle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE),
          1
        );
        //const intervalDuration = MAX_INTERVAL - (MAX_INTERVAL - MIN_INTERVAL) * Math.pow(normalized, 2); // Curva cuadrática
        const intervalDuration = MAX_INTERVAL - (MAX_INTERVAL - MIN_INTERVAL) * normalized; // Lineal

        if (currentTime - lastPlayTime.current >= intervalDuration) {
          isPlaying.current = true;
          soundRef.current.replayAsync()
            .then(() => {
              lastPlayTime.current = Date.now();
              isPlaying.current = false;
            })
            .catch(() => {
              isPlaying.current = false;
            });
        }
      }
    }, 50); // Verificación cada 50ms para mayor respuesta

    return () => clearInterval(interval);
  }, []);

  return { roll, pitch, yaw };
};

export default useSensors;