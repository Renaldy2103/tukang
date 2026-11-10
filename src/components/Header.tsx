import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Settings, User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { UserProfile } from '../context/AuthContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenAuth, user }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>TukangSekitar</Text>
          <View style={styles.dotIndicator} />
        </View>
        <Text style={styles.subtitle}>Cari tukang terdekat dalam hitungan detik</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, user ? styles.userButtonActive : styles.userButtonLogin]}
          onPress={onOpenAuth}
          activeOpacity={0.7}
          accessibilityLabel={user ? `Akun: ${user.name}` : 'Masuk atau Daftar Akun'}
          accessibilityRole="button"
        >
          {user ? (
            <Text style={styles.userInitials}>{getInitials(user.name)}</Text>
          ) : (
            <View style={styles.loginPill}>
              <User size={14} color={COLORS.primary} strokeWidth={2.2} />
              <Text style={styles.loginText}>Masuk</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
          accessibilityLabel="Pengaturan dan Info Aplikasi"
          accessibilityRole="button"
        >
          <Settings size={18} color={COLORS.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  userButtonActive: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    backgroundColor: COLORS.primarySoft,
    borderColor: '#D2ECE3',
  },
  userButtonLogin: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.primarySoft,
    borderColor: '#D2ECE3',
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
