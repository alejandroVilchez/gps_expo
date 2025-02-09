import { Audio } from 'expo-av';
import { SOUNDS } from './soundConfig';


type SoundConfig = {
  volume: number;
  delay: number;
  isLooping?: boolean;
};

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  async loadAllSounds() {
    try {
      //  obstáculos
      for (const [key, sound] of Object.entries(SOUNDS.obstacles)) {
        await this.loadSound(key, sound);
      }
      // horas
      for (const [key, sound] of Object.entries(SOUNDS.beachHours)) {
        await this.loadSound(key, sound);
      }
      // distancias
      for (const [key, sound] of Object.entries(SOUNDS.distances)) {
        await this.loadSound(key, sound);
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async loadSound(key: string, source: any) {
    const { sound } = await Audio.Sound.createAsync(source);
    this.sounds.set(key, sound);
  }

  async playSound(key: string, config: SoundConfig) {
    const sound = this.sounds.get(key);
    if (sound) {
      await sound.setVolumeAsync(config.volume);
      await sound.setRateAsync(1.0, true);
      await sound.playAsync();
      
      if (config.isLooping && config.delay > 0) {
        this.setupLoop(key, config.delay);
      }
    }
  }

  async playDirectionalSound(key: string, config: SoundConfig & { bearing: number, userHeading: number }) {
    const { bearing, userHeading, ...soundConfig } = config;
    const pan = this.calculatePan(bearing, userHeading);
    const sound = this.sounds.get(key);
    
    if (sound) {
      await sound.setPositionAsync(pan);
      await this.playSound(key, soundConfig);
    }
  }

  private calculatePan(bearing: number, userHeading: number): number {
    const relativeAngle = (bearing - userHeading + 360) % 360;
    // Mapear ángulo de 0-360 a pan de -1 a 1
    return Math.sin(relativeAngle * Math.PI / 180);
  }

  private setupLoop(key: string, delay: number) {
    const loop = () => {
      const sound = this.sounds.get(key);
      sound?.replayAsync();
      this.timeouts.set(key, setTimeout(loop, delay));
    };
    this.timeouts.set(key, setTimeout(loop, delay));
  }

  async stopSound(key: string) {
    const sound = this.sounds.get(key);
    if (sound) {
      await sound.stopAsync();
      const timeout = this.timeouts.get(key);
      if (timeout) clearTimeout(timeout);
    }
  }

  async unloadAll() {
    await Promise.all(Array.from(this.sounds.values()).map(sound => sound.unloadAsync()));
    this.sounds.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  async stopAll() {
    await Promise.all(
      Array.from(this.sounds.values()).map(sound => sound.stopAsync())
    );
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

export const audioManager = new AudioManager();
