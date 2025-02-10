import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperProvider, Button, Card, Title, useTheme  } from 'react-native-paper';

export default function App() {
    const router = useRouter();
    const { colors } = useTheme();
    return (
        
        <View style={styles.container}>
        

            <Button
                mode="contained"
                icon="login"
                style={[styles.button, { backgroundColor: colors.secondary }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./user/logIn')}
                >
                Iniciar sesión
            </Button>
            <Button
                mode="contained"
                icon="map"
                style={[styles.button, { backgroundColor: colors.secondary }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./mapScreen')}
                >
                Ver mapa
            </Button>

            <Button
                mode="contained"
                icon="volume-high"
                style={[styles.button, { backgroundColor: colors.secondary }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./mapScreen')}
                >
                Configuración de sonido
            </Button>

            {/* Botón grande para información */}
            <Button
                mode="contained"
                icon="information"
                style={[styles.button, { backgroundColor: colors.secondary }]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={() => router.push('./mapScreen')}
                >
                Configuración de navegación
            </Button>
        </View>
    );
    //     <PaperProvider>
    //         <View style={styles.container}>
    //             <Button title="Iniciar sesión" onPress={()=> router.push('./user/logIn')}/>
    //             <Button title="Ver mapa" onPress={() => router.push('./mapScreen')} />
    //             <Button title="Configurar sonidos" onPress={()=> router.push('./soundSettings')}/>
    //             <Button title="Configurar navegación" onPress={()=> router.push('./navSettings')}/>
    //             <Button title="About Us" onPress={()=> router.push('./aboutUs')}/>

    //         </View>
    //     </PaperProvider>
        
    // )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    card: {
      marginBottom: 30,
      elevation: 4,
      borderRadius: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#333',
    },
    button: {
      marginVertical: 10,
      borderRadius: 10,
      elevation: 3,
      paddingVertical: 15,
    },
    buttonContent: {
      height: 80, // Altura del botón
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
    },
  });