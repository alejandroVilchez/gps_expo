import { useState, useEffect } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { Audio } from 'expo-av';

const useSensors = () => {
  const [orientation, setOrientation] = useState({ roll: 0, pitch: 0, yaw: 0 });
  const [tiltAngle, setTiltAngle] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let subscription: { remove: any; };

    const subscribe = async () => {
      subscription = DeviceMotion.addListener(({ rotation, acceleration }) => {
        if (rotation) {
          setOrientation({
            roll: (rotation.beta * 180) / Math.PI, // Inclinación lateral
            pitch: (rotation.alpha * 180) / Math.PI, // Inclinación adelante/atrás
            yaw: (rotation.gamma * 180) / Math.PI, // Rotación en su propio eje
          });
        }

        if (acceleration) {
          const rollAngle = Math.atan2(acceleration.y, acceleration.z) * (180 / Math.PI);
          setTiltAngle(Math.abs(rollAngle));
        }
      });
    };

    subscribe();
    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const playWarningSound = async () => {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../assets/snap.mp3')
        );
        setSound(newSound);
      }
      if (sound) {
        await sound.replayAsync();
      }
    };

    if (tiltAngle > 10) {
      const frequency = Math.max(200, 2000 - tiltAngle * 100); // Más inclinado -> menor intervalo
      interval = setInterval(playWarningSound, frequency);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [tiltAngle]);

  return { orientation, tiltAngle };
};

export default useSensors;
