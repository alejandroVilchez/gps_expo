import { View, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Button title="Ver Mapa" onPress={() => router.push('/mapScreen')} />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'

    },
  });
  