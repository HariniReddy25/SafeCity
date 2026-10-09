package com.safecity.util;

public class HaversineDistanceUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates the surface distance in kilometers between two GPS coordinates
     * using the Haversine formula. Returns null safely if any coordinate is null.
     */
    public static Double calculateDistanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }

        // Validate coordinate bounds
        if (lat1 < -90.0 || lat1 > 90.0 || lon1 < -180.0 || lon1 > 180.0 ||
            lat2 < -90.0 || lat2 > 90.0 || lon2 < -180.0 || lon2 > 180.0) {
            return null;
        }

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(radLat1) * Math.cos(radLat2) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distance = EARTH_RADIUS_KM * c;
        // Round to 1 decimal place
        return Math.round(distance * 10.0) / 10.0;
    }
}
