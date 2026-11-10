import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { MapPin, RefreshCw, Navigation, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export type GpsStatus = 'locating' | 'locked' | 'default' | 'error';
export type LocationSource = 'gps' | 'default';

interface LocationBannerProps {
  location: { latitude: number; longitude: number } | null;
  address: string | null;
  gpsStatus: GpsStatus;
  locationSource: LocationSource;
  onRefresh: () => void;
  refreshing: boolean;
  errorMessage: string | null;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  location,
  address,
  gpsStatus,
  locationSource,
  onRefresh,
  refreshing,
  errorMessage,
}) => {
  const isRealGps = locationSource === 'gps' && gpsStatus === 'locked';

  const renderStatusBadge = () => {
    switch (gpsStatus) {
      case 'locating':
        return (
          <View style={[styles.badge, styles.badgeLocating]}>
            <ActivityIndicator size={11} color="#0284C7" style={{ marginRight: 5 }} />
            <Text style={[styles.badgeText, { color: '#0284C7' }]}>Mencari GPS...</Text>
          </View>
        );
      case 'locked':
        return (
          <View style={[styles.badge, styles.badgeLocked]}>
            <CheckCircle2 size={12} color={COLORS.primary} strokeWidth={2.5} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: COLORS.primary }]}>GPS Akurat</Text>
          </View>
        );
      case 'default':
        return (
          <View style={[styles.badge, styles.badgeDefault]}>
            <AlertTriangle size={12} color="#D97706" strokeWidth={2.2} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: '#D97706' }]}>Lokasi Default</Text>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.badge, styles.badgeError]}>
            <AlertCircle size={12} color={COLORS.error} strokeWidth={2.2} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: COLORS.error }]}>GPS Gagal</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.statusCol}>
          <Text style={styles.sectionLabel}>LOKASI PENGGUNA</Text>
          {renderStatusBadge()}
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
          accessibilityLabel="Segarkan lokasi GPS"
          accessibilityRole="button"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <RefreshCw size={13} color={COLORS.primary} strokeWidth={2.2} />
              <Text style={styles.refreshText}>Refresh GPS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.detailRow}>
        <View style={[styles.iconBox, isRealGps ? styles.iconBoxGps : styles.iconBoxDefault]}>
          <MapPin size={18} color={isRealGps ? COLORS.primary : '#D97706'} strokeWidth={2} />
        </View>

        <View style={styles.addressWrapper}>
          <Text style={styles.addressTitle} numberOfLines={1}>
            {address || (location ? 'Koordinat Terpantau' : 'Mencari lokasi...')}
          </Text>
          <Text style={styles.coordsText}>
            {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Menunggu sinyal GPS'}
          </Text>
          {!isRealGps && location && (
            <Text style={styles.sourceNote}>
              *Bukan GPS aktual. Menggunakan koordinat pusat Jakarta.
            </Text>
          )}
        </View>
      </View>

      {errorMessage && (
        <View style={styles.errorBox}>
          <AlertCircle size={13} color={COLORS.error} style={{ marginRight: 6, marginTop: 1 }} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLocating: {
    backgroundColor: '#F0F9FF',
  },
  badgeLocked: {
    backgroundColor: COLORS.primarySoft,
  },
  badgeDefault: {
    backgroundColor: '#FEF3C7',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#D2ECE3',
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconBoxGps: {
    backgroundColor: COLORS.primarySoft,
  },
  iconBoxDefault: {
    backgroundColor: '#FEF3C7',
  },
  addressWrapper: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coordsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  sourceNote: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 3,
    fontStyle: 'italic',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.error,
    lineHeight: 15,
  },
});
