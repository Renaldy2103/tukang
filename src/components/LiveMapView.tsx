import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Navigation, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react-native';
import { Worker } from '../types/worker';
import { COLORS } from '../constants/theme';

interface LiveMapViewProps {
  userLocation: { latitude: number; longitude: number } | null;
  radiusKm: number;
  workers: Worker[];
  onContactWhatsApp: (worker: Worker) => void;
  onRefreshGps?: () => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  userLocation,
  radiusKm,
  workers,
  onContactWhatsApp,
  onRefreshGps,
}) => {
  const webViewRef = useRef<any>(null);

  const lat = userLocation?.latitude ?? -6.2088;
  const lng = userLocation?.longitude ?? 106.8456;

  // Bangun script HTML Leaflet dengan OpenStreetMap tiles (100% gratis & tanpa API key)
  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: #F7F8FA; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* User pulse marker */
    .user-marker {
      position: relative;
      width: 22px;
      height: 22px;
    }
    .user-marker-inner {
      width: 16px;
      height: 16px;
      background: #167A65;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: absolute;
      top: 3px;
      left: 3px;
    }
    .user-marker-pulse {
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(22, 122, 101, 0.35);
      animation: pulse 1.8s infinite ease-out;
    }
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* Worker marker */
    .worker-pin {
      background: #FFFFFF;
      border: 2px solid #167A65;
      border-radius: 18px;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.18);
      font-size: 11px;
      font-weight: 700;
      color: #202A33;
      white-space: nowrap;
      cursor: pointer;
    }
    .worker-pin-badge {
      background: #E8F4EF;
      color: #167A65;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 10px;
    }

    /* Custom Leaflet Popup */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      padding: 6px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      border: 1px solid #E5EAF0;
    }
    .leaflet-popup-content {
      margin: 8px 10px;
      line-height: 1.4;
    }
    .popup-title {
      font-size: 14px;
      font-weight: 700;
      color: #202A33;
      margin-bottom: 2px;
    }
    .popup-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #75818D;
      margin-bottom: 8px;
    }
    .popup-badge {
      background: #E8F4EF;
      color: #167A65;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .popup-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #25D366;
      color: #FFFFFF;
      text-decoration: none;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const userLat = ${lat};
    const userLng = ${lng};
    const radiusMeters = ${radiusKm * 1000};
    const workersData = ${JSON.stringify(workers)};

    // Inisialisasi Map
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([userLat, userLng], 14);

    // Tile Layer OpenStreetMap Gratis
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Lingkaran Radius Pencarian
    const radiusCircle = L.circle([userLat, userLng], {
      color: '#167A65',
      fillColor: '#167A65',
      fillOpacity: 0.1,
      weight: 1.5,
      radius: radiusMeters,
    }).addTo(map);

    // Marker Lokasi Pengguna
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div class="user-marker-pulse"></div><div class="user-marker-inner"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Lokasi Anda</b><br><small>Pusat radius pencarian</small>');

    // Marker Mitra Tukang
    workersData.forEach((w) => {
      const dist = w.distance_km !== undefined ? w.distance_km.toFixed(1) + ' km' : '';
      const pinHtml = '<div class="worker-pin"><span>' + w.name + '</span><span class="worker-pin-badge">' + w.category + '</span></div>';
      
      const workerIcon = L.divIcon({
        className: 'custom-pin',
        html: pinHtml,
        iconSize: [120, 28],
        iconAnchor: [60, 14],
      });

      const popupHtml = 
        '<div class="popup-title">' + w.name + '</div>' +
        '<div class="popup-meta">' +
          '<span class="popup-badge">' + w.category + '</span>' +
          '<span>⭐ ' + w.rating.toFixed(1) + '</span>' +
          '<span>📍 ' + dist + '</span>' +
        '</div>' +
        '<button class="popup-btn" onclick="contactWorker(\\'' + w.id + '\\')">' +
          '💬 Hubungi WhatsApp' +
        '</button>';

      L.marker([w.latitude, w.longitude], { icon: workerIcon })
        .addTo(map)
        .bindPopup(popupHtml);
    });

    // Auto fit bounds jika ada data tukang
    if (workersData.length > 0) {
      const group = new L.featureGroup([
        radiusCircle,
        ...workersData.map(w => L.marker([w.latitude, w.longitude]))
      ]);
      map.fitBounds(group.getBounds().pad(0.12));
    }

    // Komunikasi kembali ke React Native
    function contactWorker(id) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'contact_wa', workerId: id }));
      }
    }

    // Fungsi kontrol dari tombol luar
    window.recenterMap = function() {
      map.setView([userLat, userLng], 14);
    };
    window.zoomInMap = function() {
      map.zoomIn();
    };
    window.zoomOutMap = function() {
      map.zoomOut();
    };
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'contact_wa') {
        const found = workers.find((w) => w.id === data.workerId);
        if (found) {
          onContactWhatsApp(found);
        }
      }
    } catch (e) {
      console.warn('Map message error:', e);
    }
  };

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript('window.recenterMap && window.recenterMap(); true;');
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript('window.zoomInMap && window.zoomInMap(); true;');
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript('window.zoomOutMap && window.zoomOutMap(); true;');
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webView}
        onMessage={handleMessage}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat peta OpenStreetMap...</Text>
          </View>
        )}
      />

      {/* Floating Map Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleRecenter}
          activeOpacity={0.7}
          accessibilityLabel="Pusatkan peta ke lokasi Anda"
        >
          <Navigation size={18} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.zoomGroup}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={handleZoomIn}
            activeOpacity={0.7}
            accessibilityLabel="Perbesar peta"
          >
            <ZoomIn size={17} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={handleZoomOut}
            activeOpacity={0.7}
            accessibilityLabel="Perkecil peta"
          >
            <ZoomOut size={17} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {onRefreshGps && (
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={onRefreshGps}
            activeOpacity={0.7}
            accessibilityLabel="Perbarui sinyal GPS"
          >
            <RefreshCw size={17} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Badge Legenda Atas */}
      <View style={styles.legendBadge}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>
          {workers.length} tukang dalam radius {radiusKm} km (OpenStreetMap)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 380,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  floatingControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 8,
    alignItems: 'center',
  },
  controlBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  zoomGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 38,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  legendBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
