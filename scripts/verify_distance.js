function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const d = calculateDistanceKm(-6.1754, 106.8272, -6.195, 106.823);
console.log('Distance Monas -> Bundaran HI:', d, 'km');
if (d >= 2.0 && d <= 2.5) {
  console.log('Haversine verification PASSED');
  process.exit(0);
} else {
  console.error('Haversine verification FAILED');
  process.exit(1);
}
