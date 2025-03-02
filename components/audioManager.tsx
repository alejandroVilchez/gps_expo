// audioManager.ts
import { Audio } from 'expo-av';

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
}

export const audioManager = new AudioManager();
