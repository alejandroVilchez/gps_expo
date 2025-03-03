import { Text, View } from "react-native";
import App from "./app";
import { TrackingProvider } from "../contexts/TrackingContext";


export default function Index() {
  return (
    
    <View style={{ flex: 1 }}>
      <App />
    </View>
  );
}
