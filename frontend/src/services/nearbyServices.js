/**
 * Calculate Haversine straight-line distance in kilometers between two GPS coordinates.
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance in kilometers or meters into human-readable string.
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return '';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

/**
 * Map Overpass amenity tag to standard Service Type
 */
const getServiceTypeFromAmenity = (amenityTag) => {
  switch (amenityTag) {
    case 'hospital':
    case 'clinic':
      return { type: 'HOSPITAL', label: 'Hospital', icon: '🏥' };
    case 'police':
      return { type: 'POLICE', label: 'Police Station', icon: '👮' };
    case 'fire_station':
      return { type: 'FIRE_STATION', label: 'Fire Station', icon: '🚒' };
    default:
      return { type: 'OTHER', label: 'Emergency Service', icon: '🚨' };
  }
};

/**
 * Fetch real nearby emergency services from OpenStreetMap Overpass API within 5km radius.
 */
export const fetchNearbyEmergencyServices = async (lat, lng, radiusMeters = 5000) => {
  if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
    throw new Error('Valid latitude and longitude are required to find nearby emergency services.');
  }

  const numLat = Number(lat);
  const numLng = Number(lng);

  // Overpass QL query for Hospitals, Police Stations, and Fire Stations
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radiusMeters},${numLat},${numLng});
      way["amenity"="hospital"](around:${radiusMeters},${numLat},${numLng});
      node["amenity"="police"](around:${radiusMeters},${numLat},${numLng});
      way["amenity"="police"](around:${radiusMeters},${numLat},${numLng});
      node["amenity"="fire_station"](around:${radiusMeters},${numLat},${numLng});
      way["amenity"="fire_station"](around:${radiusMeters},${numLat},${numLng});
    );
    out center body;
  `;

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const response = await fetch(overpassUrl);
  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.statusText}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  const services = elements.map((elem) => {
    const sLat = elem.lat ?? elem.center?.lat;
    const sLng = elem.lon ?? elem.center?.lon;
    const tags = elem.tags || {};

    const typeInfo = getServiceTypeFromAmenity(tags.amenity);
    const distanceKm = calculateHaversineDistance(numLat, numLng, sLat, sLng);

    // Build street address from tags if present
    let addressParts = [];
    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    const fullAddress = addressParts.length > 0 ? addressParts.join(' ') : tags['addr:full'] || 'Address unavailable';

    const defaultName =
      tags.name ||
      tags['name:en'] ||
      `${typeInfo.label} near ${fullAddress !== 'Address unavailable' ? fullAddress : 'your location'}`;

    return {
      id: `service-${elem.type}-${elem.id}`,
      name: defaultName,
      type: typeInfo.type,
      typeLabel: typeInfo.label,
      iconSymbol: typeInfo.icon,
      lat: Number(sLat),
      lng: Number(sLng),
      address: fullAddress,
      distanceKm: distanceKm,
      distanceFormatted: formatDistance(distanceKm),
      phone: tags.phone || tags['contact:phone'] || tags.telephone || null,
      openingHours: tags.opening_hours || (tags.amenity === 'police' || tags.amenity === 'fire_station' || tags.amenity === 'hospital' ? '24/7 Emergency Service' : null),
    };
  });

  // Filter out elements with invalid coordinates and sort by distance nearest first
  return services
    .filter((s) => !isNaN(s.lat) && !isNaN(s.lng) && s.lat >= -90 && s.lat <= 90 && s.lng >= -180 && s.lng <= 180)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};
