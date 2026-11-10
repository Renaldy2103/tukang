import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { List, Map } from 'lucide-react-native';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateDistanceKm } from '../lib/distance';
import { Worker } from '../types/worker';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { LocationBanner, GpsStatus, LocationSource } from '../components/LocationBanner';
import { CategoryFilter, CategoryOption } from '../components/CategoryFilter';
import { RadiusFilter } from '../components/RadiusFilter';
import { WorkerCard } from '../components/WorkerCard';
import { EmptyState } from '../components/EmptyState';
import { SettingsModal } from '../components/SettingsModal';
import { AuthModal } from '../components/AuthModal';
import { LiveMapView } from '../components/LiveMapView';

// Fallback data lokal sebelum DB Supabase di-seed
const MOCK_WORKERS: Worker[] = [
  { id: '1', name: 'Budi Santoso', category: 'AC', rating: 4.9, phone: '6281234567890', latitude: -6.200, longitude: 106.816 },
  { id: '2', name: 'Asep Saepudin', category: 'Ledeng', rating: 4.7, phone: '6281234567891', latitude: -6.210, longitude: 106.825 },
  { id: '3', name: 'Joko Widodo', category: 'Listrik', rating: 4.8, phone: '6281234567892', latitude: -6.225, longitude: 106.830 },
  { id: '4', name: 'Slamet Riyadi', category: 'Bangunan', rating: 4.6, phone: '6281234567893', latitude: -6.240, longitude: 106.850 },
  { id: '5', name: 'Dedi Kusnandar', category: 'AC', rating: 4.8, phone: '6281234567894', latitude: -6.205, longitude: 106.840 },
];

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('locating');
  const [locationSource, setLocationSource] = useState<LocationSource>('gps');
  const [locationLoading, setLocationLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>('Semua');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [authVisible, setAuthVisible] = useState<boolean>(false);

  // Reverse geocode untuk mendapatkan nama area yang ramah
  const resolveAddress = async (lat: number, lng: number) => {
    try {
      const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (places && places.length > 0) {
        const p = places[0];
        const parts = [
          p.district || p.subregion || p.street,
          p.city || p.region,
        ].filter(Boolean);
        if (parts.length > 0) {
          setAddress(parts.join(', '));
          return;
        }
      }
      setAddress('Pusat Kota');
    } catch {
      setAddress(null);
    }
  };

  // Ambil koordinat GPS perangkat dengan status transparan
  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    setGpsStatus('locating');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Izin akses GPS ditolak. Aplikasi menggunakan koordinat default (Jakarta).');
        setLocationSource('default');
        setGpsStatus('default');
        const defaultCoords = { latitude: -6.2088, longitude: 106.8456 };
        setLocation(defaultCoords);
        setAddress('Jakarta Pusat, DKI Jakarta');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(userCoords);
      setLocationSource('gps');
      setGpsStatus('locked');
      resolveAddress(userCoords.latitude, userCoords.longitude);
    } catch (err: any) {
      setLocationError('Gagal membaca sensor GPS: ' + (err.message || 'Perangkat tidak merespons'));
      setLocationSource('default');
      setGpsStatus('error');
      const defaultCoords = { latitude: -6.2088, longitude: 106.8456 };
      setLocation(defaultCoords);
      setAddress('Jakarta Pusat (Fallback)');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Query data tukang dari Supabase atau fallback mock
  const fetchWorkers = useCallback(async () => {
    if (!location) return;
    setLoadingWorkers(true);

    try {
      if (isSupabaseConfigured) {
        // Coba panggil RPC get_nearby_workers (haversine di database)
        const categoryFilter = selectedCategory === 'Semua' ? null : selectedCategory;
        const { data, error } = await supabase.rpc('get_nearby_workers', {
          user_lat: location.latitude,
          user_lng: location.longitude,
          filter_category: categoryFilter,
          radius_km: radiusKm,
        });

        if (!error && Array.isArray(data)) {
          setWorkers(data);
          setLoadingWorkers(false);
          return;
        }

        // Fallback query tabel langsung jika function RPC belum tersedia
        let query = supabase.from('workers').select('*');
        if (selectedCategory !== 'Semua') {
          query = query.eq('category', selectedCategory);
        }
        const { data: rawWorkers, error: tableError } = await query;

        if (!tableError && rawWorkers) {
          const mapped = rawWorkers
            .map((w: any) => ({
              ...w,
              distance_km: calculateDistanceKm(
                location.latitude,
                location.longitude,
                w.latitude,
                w.longitude
              ),
            }))
            .filter((w: Worker) => (w.distance_km ?? 0) <= radiusKm)
            .sort((a: Worker, b: Worker) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

          setWorkers(mapped);
          setLoadingWorkers(false);
          return;
        }
      }

      // Fallback data lokal jika Supabase belum aktif atau koneksi gagal
      const mappedMock = MOCK_WORKERS
        .filter((w) => selectedCategory === 'Semua' || w.category === selectedCategory)
        .map((w) => ({
          ...w,
          distance_km: calculateDistanceKm(
            location.latitude,
            location.longitude,
            w.latitude,
            w.longitude
          ),
        }))
        .filter((w) => (w.distance_km ?? 0) <= radiusKm)
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

      setWorkers(mappedMock);
    } catch (err: any) {
      Alert.alert('Gagal Mengambil Data', err.message);
    } finally {
      setLoadingWorkers(false);
    }
  }, [location, selectedCategory, radiusKm]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Pull to refresh handler
  const handlePullRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    await fetchWorkers();
    setRefreshing(false);
  };

  // Aksi WhatsApp langsung ke mitra
  const handleContactWhatsApp = (worker: Worker) => {
    let cleanPhone = worker.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const message = encodeURIComponent(
      `Halo ${worker.name}, saya menemukan kontak Anda di aplikasi TukangSekitar. Saya butuh jasa untuk kategori ${worker.category}. Apakah Anda sedang tersedia?`
    );
    const url = `https://wa.me/${cleanPhone}?text=${message}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Aplikasi Tidak Ditemukan', 'WhatsApp tidak terpasang di perangkat ini.');
          return;
        }
        return Linking.openURL(url);
      })
      .catch((err) => Alert.alert('Error', err.message));
  };

  const renderHeader = () => (
    <View style={styles.listHeaderWrapper}>
      <LocationBanner
        location={location}
        address={address}
        gpsStatus={gpsStatus}
        locationSource={locationSource}
        onRefresh={getCurrentLocation}
        refreshing={locationLoading}
        errorMessage={locationError}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <RadiusFilter
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        minRadius={1}
        maxRadius={20}
      />

      {/* Header Counter & Toggle Mode Tampilan (Daftar / Peta) */}
      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.resultTitle}>DAFTAR TUKANG TERDEKAT</Text>
          <Text style={styles.resultCount}>{workers.length} ditemukan</Text>
        </View>

        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Tampilan Daftar"
          >
            <List size={14} color={viewMode === 'list' ? '#FFFFFF' : COLORS.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.toggleBtnText, viewMode === 'list' && styles.toggleBtnTextActive]}>
              Daftar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Tampilan Peta Langsung"
          >
            <Map size={14} color={viewMode === 'map' ? '#FFFFFF' : COLORS.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.toggleBtnText, viewMode === 'map' && styles.toggleBtnTextActive]}>
              Peta
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Peta Interaktif Langsung (OpenStreetMap) saat mode Peta Aktif */}
      {viewMode === 'map' && (
        <LiveMapView
          userLocation={location}
          radiusKm={radiusKm}
          workers={workers}
          onContactWhatsApp={handleContactWhatsApp}
          onRefreshGps={getCurrentLocation}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header Aplikasi dengan tombol Gear & Profil / Masuk */}
      <Header
        onOpenSettings={() => setSettingsVisible(true)}
        onOpenAuth={() => setAuthVisible(true)}
        user={user}
      />

      {/* Konten Utama */}
      <View style={styles.container}>
        {loadingWorkers && workers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Mencari tukang di sekitar Anda...</Text>
          </View>
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <WorkerCard worker={item} onContactWhatsApp={handleContactWhatsApp} />
            )}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <EmptyState
                radiusKm={radiusKm}
                category={selectedCategory}
                onExpandRadius={() => setRadiusKm((prev) => Math.min(prev + 5, 20))}
                onResetCategory={() => setSelectedCategory('Semua')}
                onRefresh={getCurrentLocation}
              />
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handlePullRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal Pengaturan & Akun */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isSupabaseConnected={isSupabaseConfigured}
        isRealGps={locationSource === 'gps' && gpsStatus === 'locked'}
        user={user}
        onSignOut={signOut}
        onOpenAuth={() => setAuthVisible(true)}
      />

      {/* Modal Masuk / Daftar Akun */}
      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  listHeaderWrapper: {
    marginBottom: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  resultTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  cardSeparator: {
    height: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

