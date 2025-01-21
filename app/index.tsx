import { Text, View } from "react-native";
import App from "./app";
import Sound from "./sound"

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <App />
      {/* <Sound /> */}
    </View>
  );
}
