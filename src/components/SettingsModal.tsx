import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { X, ShieldCheck, Database, Navigation, User, LogOut } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { UserProfile } from '../context/AuthContext';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
  isRealGps: boolean;
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  isSupabaseConnected,
  isRealGps,
  user,
  onSignOut,
  onOpenAuth,
}) => {
  const handleLogoutConfirm = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          onSignOut();
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header Modal */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Pengaturan & Akun</Text>
                  <Text style={styles.subtitle}>TukangSekitar v1.0.0</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Tutup pengaturan"
                >
                  <X size={18} color={COLORS.textPrimary} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* Akun Pengguna Section */}
              <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <User size={20} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user ? user.name : 'Tamu (Belum Masuk)'}</Text>
                  <Text style={styles.userEmail}>
                    {user ? user.email : 'Masuk untuk sinkronisasi riwayat'}
                  </Text>
                </View>
                {user ? (
                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogoutConfirm}
                    activeOpacity={0.7}
                    accessibilityLabel="Keluar akun"
                  >
                    <LogOut size={16} color={COLORS.error} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.loginModalBtn}
                    onPress={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginModalBtnText}>Masuk</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Layanan */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>STATUS SISTEM</Text>

                <View style={styles.statusRow}>
                  <View style={styles.statusIconBox}>
                    <Database size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.statusTextCol}>
                    <Text style={styles.statusName}>Database Layanan</Text>
                    <Text style={styles.statusDetail}>
                      {isSupabaseConnected
                        ? 'Supabase Cloud aktif & terhubung'
                        : 'Offline Mode (katalog fallback lokal)'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: isSupabaseConnected ? COLORS.success : '#D97706' },
                    ]}
                  />
                </View>

                <View style={styles.statusRow}>
                  <View style={styles.statusIconBox}>
                    <Navigation size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.statusTextCol}>
                    <Text style={styles.statusName}>Sensor GPS</Text>
                    <Text style={styles.statusDetail}>
                      {isRealGps
                        ? 'Presisi GPS perangkat aktif'
                        : 'Koordinat default (Jakarta) aktif'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: isRealGps ? COLORS.success : '#D97706' },
                    ]}
                  />
                </View>
              </View>

              {/* Jaminan Privasi */}
              <View style={styles.privacyCard}>
                <ShieldCheck size={20} color={COLORS.primary} style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.privacyTitle}>Privasi & Transparansi</Text>
                  <Text style={styles.privacyText}>
                    Peta interaktif menggunakan OpenStreetMap (Open Source & Gratis). Koordinat GPS Anda hanya digunakan untuk kalkulasi radius lokal dan kontak WhatsApp langsung.
                  </Text>
                </View>
              </View>

              {/* Tombol Tutup */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  loginModalBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loginModalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTextCol: {
    flex: 1,
  },
  statusName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D2ECE3',
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    lineHeight: 16,
    opacity: 0.9,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
