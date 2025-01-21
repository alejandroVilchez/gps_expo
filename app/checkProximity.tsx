// import * as Location from "expo-location";
// import Sound from './sound';


// const checkProximity = async (userLocation, markers) => {
//   markers.forEach((marker) => {
//     const distance = getDistance(
//       userLocation,
//       marker.coordinate
//     ); // Función que calcula la distancia entre dos coordenadas

//     if (distance < 10) {
//       Sound();
//     }
//   });
// };

// const getDistance = (coord1, coord2) => {
//   const R = 6371e3; // Radio de la Tierra en metros
//   const lat1 = (coord1.latitude * Math.PI) / 180;
//   const lat2 = (coord2.latitude * Math.PI) / 180;
//   const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
//   const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

//   const a =
//     Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) *
//     Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// // Escucha cambios en la ubicación del usuario
// useEffect(() => {
//   let locationSubscription;
//   (async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       console.error("Permiso de ubicación denegado");
//       return;
//     }

//     locationSubscription = await Location.watchPositionAsync(
//       { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
//       (location) => checkProximity(location.coords, markers)
//     );
//   })();

//   return () => locationSubscription && locationSubscription.remove();
// }, [markers]);
