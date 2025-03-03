// audioManager.ts
import { Audio } from 'expo-av';
import { SOUNDS } from './soundConfig'

type SoundConfig = {
  volume: number;
  minDelay: number;
  maxDelay: number;
};

const SOUND_CONFIG: { [key: string]: { source: any; config: SoundConfig } } = {
  boat: {
    source: { uri: 'https://software-mansion-labs.github.io/react-native-audio-api/audio/sounds/C4.mp3' },
    config: { volume: 1.0, minDelay: 500, maxDelay: 2000 },
  },
  buoy: {
    source: { uri: 'https://software-mansion-labs.github.io/react-native-audio-api/audio/sounds/Ds4.mp3' },
    config: { volume: 1.0, minDelay: 500, maxDelay: 2000 },
  },
};

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private loopTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private beachHourSounds: Map<number, Audio.Sound> = new Map();
  private distanceSounds: Map<number, Audio.Sound> = new Map();

  private northHourSounds: Map<number, Audio.Sound> = new Map();

  // Flag para evitar solapamiento de señales
  private isBeachSignalPlaying: boolean = false;
  private isNorthSignalPlaying: boolean = false;

  // Convertimos a arrow function para mantener el contexto de 'this'
  loadAllSounds = async () => {
    try {
      for (const [key, { source, config }] of Object.entries(SOUND_CONFIG)) {
        await this.loadSound(key, source, config.volume);
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  };

  loadSound = async (key: string, source: any, volume: number) => {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume,
      });
      this.sounds.set(key, sound);
    } catch (error) {
      console.error(`Error loading sound ${key}:`, error);
    }
  };

  scheduleObstacleAlert = async (type: 'boat' | 'buoy', distance: number) => {
    const sound = this.sounds.get(type);
    if (!sound) {
      console.warn(`Sound for ${type} not loaded`);
      return;
    }
    // Calculamos el delay en función de la distancia
    const maxDistance = 100;
    const { minDelay, maxDelay } = SOUND_CONFIG[type].config;
    const clampedDistance = Math.min(distance, maxDistance);
    const delay = minDelay + (maxDelay - minDelay) * (clampedDistance / maxDistance);

    const minVolume = 0.2;
    const volume = minVolume + (1 - clampedDistance / maxDistance) * (1 - minVolume);


    try {
      await sound.setVolumeAsync(volume);
    } catch (error) {
      console.error(`Error setting volume for ${type}:`, error);
    }


    try {
      await sound.replayAsync();
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
    }
    const existingTimeout = this.loopTimeouts.get(type);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    const timeoutId = setTimeout(() => {
      this.scheduleObstacleAlert(type, distance);
    }, delay);
    this.loopTimeouts.set(type, timeoutId);
  };

  stopObstacleAlert = async (type: string) => {
    const sound = this.sounds.get(type);
    if (sound) {
      try {
        await sound.stopAsync();
      } catch (error) {
        console.error(`Error stopping sound ${type}:`, error);
      }
    }
    const timeout = this.loopTimeouts.get(type);
    if (timeout) {
      clearTimeout(timeout);
      this.loopTimeouts.delete(type);
    }
  };

  unloadAll = async () => {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
    this.loopTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.loopTimeouts.clear();
  };



  loadBeachSounds = async () => {
    // Cargar sonidos de beachHours (horas 1 a 12)
    for (let i = 1; i <= 12; i++) {
      const key = `hour_${i}` as keyof typeof SOUNDS.beachHours;
      try {
        const { sound } = await Audio.Sound.createAsync(SOUNDS.beachHours[key]);
        this.beachHourSounds.set(i, sound);
      } catch (error) {
        console.error(`Error loading beach hour sound ${i}:`, error);
      }
    }
    // Cargar sonidos de distancias (5, 10, 25, 50, 100, 150, 200)
    const distanceKeys = [5, 10, 25, 50, 100, 150, 200];
    for (const d of distanceKeys) {
      const key = `distance_${d}` as keyof typeof SOUNDS.distances;
      try {
        const { sound } = await Audio.Sound.createAsync(SOUNDS.distances[key]);
        this.distanceSounds.set(d, sound);
      } catch (error) {
        console.error(`Error loading distance sound ${d}:`, error);
      }
    }
  };

  loadNorthSounds = async () => {
    for (let i = 1; i <= 12; i++) {
      const key = `hour_${i}` as keyof typeof SOUNDS.northHours;
      try {
        const { sound } = await Audio.Sound.createAsync(SOUNDS.northHours[key]);
        this.northHourSounds.set(i, sound);
      } catch (error) {
        console.error(`Error loading north hour sound ${i}:`, error);
      }
    }
  };

  // Función auxiliar para calcular el bearing entre dos puntos
  calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;
    const lat_1 = toRad(lat1);
    const lat_2 = toRad(lat2);
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(lat_2);
    const x = Math.cos(lat_1) * Math.sin(lat_2) - Math.sin(lat_1) * Math.cos(lat_2) * Math.cos(dLon);
    const angle = Math.atan2(y, x);
    return (toDeg(angle) + 360) % 360;
  }

  // Función auxiliar para calcular la distancia (fórmula de Haversine)
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Reproduce la indicación auditiva para "vuelta a playa".
   * Calcula el reloj (1-12) según el ángulo relativo entre la dirección al marcador de playa y el heading del barco,
   * y determina la pista de distancia adecuada según la separación.
   * Se reproducen secuencialmente: primero la pista de orientación y, tras un breve retraso, la pista de distancia.
   */
  scheduleBeachSignal = async (
    beachMarker: { latitude: number; longitude: number },
    boatLocation: { latitude: number; longitude: number },
    boatHeading: number
  ) => {
    // Calcular el bearing (dirección absoluta) desde el barco hacia la playa
    if(this.isBeachSignalPlaying) return;
    this.isBeachSignalPlaying = true;
    const bearing = this.calculateBearing(
      boatLocation.latitude,
      boatLocation.longitude,
      beachMarker.latitude,
      beachMarker.longitude
    );
    // Calcular el ángulo relativo (diferencia entre el bearing y el heading del barco)
    const relativeAngle = (bearing - boatHeading + 360) % 360;
    // Convertir a "hora": se divide 360° en 12 sectores de 30° cada uno.
    // Usamos un offset de 15° para centrar cada sector.
    let clockHour = Math.floor((relativeAngle + 15) / 30) % 12;
    if (clockHour === 0) clockHour = 12;

    // Calcular la distancia en metros
    const distance = this.getDistance(
      boatLocation.latitude,
      boatLocation.longitude,
      beachMarker.latitude,
      beachMarker.longitude
    );

    // Seleccionar la pista de distancia según umbrales (puedes ajustar estos valores)
    let distanceKey: number;
    if (distance < 7.5) distanceKey = 5;
    else if (distance < 17.5) distanceKey = 10;
    else if (distance < 37.5) distanceKey = 25;
    else if (distance < 75) distanceKey = 50;
    else if (distance < 125) distanceKey = 100;
    else if (distance < 175) distanceKey = 150;
    else distanceKey = 200;

    // Reproducir la pista de orientación (beach hour)
    const hourSound = this.beachHourSounds.get(clockHour);
    if (hourSound) {
      try {
        await hourSound.replayAsync();
      } catch (error) {
        console.error(`Error playing beach hour sound ${clockHour}:`, error);
      }
    }

    // Tras un retraso (por ejemplo, 1 segundo) reproducir la pista de distancia
    setTimeout(async () => {
      const distSound = this.distanceSounds.get(distanceKey);
      if (distSound) {
        try {
          await distSound.replayAsync();
        } catch (error) {
          console.error(`Error playing distance sound ${distanceKey}:`, error);
        }
      }
      setTimeout(() => {
        this.isBeachSignalPlaying = false;
      }, 5000);
    }, 2000);
  };

  scheduleNorthSignal = async (
    boatLocation: { latitude: number; longitude: number },
    boatHeading: number
  ) => {
    if (this.isNorthSignalPlaying) return;
    this.isNorthSignalPlaying = true;

    // Para dirección norte, la referencia es 0°
    // Calculamos el ángulo relativo entre el heading del barco y el norte:
    const relativeAngle = (0 - boatHeading + 360) % 360;
    let clockHour = Math.floor((relativeAngle + 15) / 30) % 12;
    if (clockHour === 0) clockHour = 12;

    // Reproducir la pista de orientación (north hour)
    const northSound = this.northHourSounds.get(clockHour);
    if (northSound) {
      try {
        await northSound.replayAsync();
      } catch (error) {
        console.error(`Error playing north hour sound ${clockHour}:`, error);
      }
    }
    setTimeout(() => {
      this.isNorthSignalPlaying = false;
    }, 5000);
  };
}


export const audioManager = new AudioManager();
