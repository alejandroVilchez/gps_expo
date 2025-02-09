// import { useEffect, useState } from 'react';
// import { View, StyleSheet, Button } from 'react-native';
// import { Audio, AVPlaybackSource } from 'expo-av';

import { Audio } from 'expo-av';
let isPlaying = false; 

export const playSound = async () => {
  if (isPlaying) return; // Para evitar reproducir el sonido varias veces

  isPlaying = true;
  let sound: Audio.Sound | null = null;
  
  try {
    const { sound: loadedSound } = await Audio.Sound.createAsync(require('../assets/snap.mp3'));
    sound = loadedSound;
    await sound.playAsync();
    isPlaying = false;
  
    // Descargar el sonido después de que termine de reproducirse
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded && status.didJustFinish) {
        await sound?.unloadAsync();
        sound = null;
      }
    });
  } catch (error) {
    console.error('Error al reproducir el sonido:', error);
    // Descargar cualquier recurso si ocurre un error
    if (sound) {
      await sound.unloadAsync();
      sound = null;
      isPlaying = false;
    }
  }
};
  