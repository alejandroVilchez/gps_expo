import { Stack } from 'expo-router';
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Inicio' }} />
          <Stack.Screen name="app" options={{ title: 'Inicio' }} />
          <Stack.Screen name="mapScreen" options={{ title: 'Mapa' }} />
          <Stack.Screen name="sensors" options={{ title: 'Sensores' }} />
          <Stack.Screen name="aboutUs" options={{ title: 'About Us'}}/>
          <Stack.Screen name="user/logIn" options={{ title: 'Log In'}}/>
          <Stack.Screen name="user/register" options={{ title: 'Sign Up'}}/>
          <Stack.Screen name="regattaSimulation" options={{ title: 'Simulación'}}/>

        </Stack>
    </PaperProvider>  
    </AuthProvider>
    
  );
}