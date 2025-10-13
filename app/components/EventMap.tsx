import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/styles';

interface EventMapProps {
  location: string;
  height?: number;
}

export default function EventMap({ location, height = 200 }: EventMapProps) {
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeLocation = async () => {
      if (!location || location.trim() === '') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Request foreground location permissions for geocoding
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          // If permission denied, still try geocoding (it might work without permissions on some platforms)
          console.log('Location permission not granted, attempting geocoding anyway');
        }

        // Use Expo Location geocoding to convert location text to coordinates
        const geocodeResult = await Location.geocodeAsync(location);

        if (geocodeResult.length > 0) {
          const { latitude, longitude } = geocodeResult[0];
          setCoordinates({ latitude, longitude });
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  // Open location in external maps app
  const openInMaps = async () => {
    const url = Platform.select({
      ios: coordinates 
        ? `http://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=${encodeURIComponent(location)}`
        : `http://maps.apple.com/?q=${encodeURIComponent(location)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    });

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Error opening maps:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.loadingText}>Finding location...</Text>
      </View>
    );
  }

  // Always show a simple location card that opens in external maps
  return (
    <View style={[styles.container, { height }]}>
      <TouchableOpacity style={styles.mapContainer} onPress={openInMaps}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{location}</Text>
        <Text style={styles.mapSubtext}>Tap to open in Maps</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginVertical: SIZES.base,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.padding,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
  },
  locationIcon: {
    fontSize: 40,
    marginBottom: SIZES.base,
  },
  locationText: {
    ...FONTS.h3,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  mapSubtext: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
});
