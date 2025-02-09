import { View, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function App() {
    const router = useRouter();

    return (
        <PaperProvider>
            <View style={styles.container}>
                <Button title="Ver Mapa" onPress={() => router.push('./mapScreen')} />
                <Button title="Ver Sensores" onPress={() => router.push('./sensors')} />
                <Button title="About Us" onPress={()=> router.push('./aboutUs')}/>
                <Button title="Iniciar Sesión" onPress={()=> router.push('./user/logIn')}/>
            </View>
        </PaperProvider>
        
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10
    },
  });
  