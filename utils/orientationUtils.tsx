export const calculateClockOrientation = (degrees: number): number => {
    const adjusted = (degrees + 15) % 360;
    return Math.floor(adjusted / 30) || 12;
};
  
export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    //return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    let bearing = Math.atan2(y, x);
    bearing = bearing * (180 / Math.PI);
    bearing = (bearing + 360) % 360;      
  

    return bearing;
};

export const mapClockOrientation = (orientation: number): number => {
    if (orientation === 12 || orientation === 6) {
      return orientation; // Mantener 12 y 6 sin cambios
    }
    return (12 - orientation) % 12 || 12; // Invertir las demás horas
  };