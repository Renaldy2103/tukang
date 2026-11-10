import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SearchX, SlidersHorizontal, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface EmptyStateProps {
  radiusKm: number;
  category: string;
  onExpandRadius: () => void;
  onResetCategory: () => void;
  onRefresh: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  radiusKm,
  category,
  onExpandRadius,
  onResetCategory,
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <SearchX size={32} color={COLORS.primary} strokeWidth={1.8} />
      </View>

      <Text style={styles.title}>Tidak Ada Tukang Ditemukan</Text>
      <Text style={styles.description}>
        Belum ada mitra tukang{' '}
        {category !== 'Semua' ? `kategori ${category} ` : ''}dalam radius {radiusKm} km dari lokasi Anda.
      </Text>

      <View style={styles.actionGroup}>
        {radiusKm < 20 && (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={onExpandRadius}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionText}>
              Perbesar Radius ({Math.min(radiusKm + 5, 20)} km)
            </Text>
          </TouchableOpacity>
        )}

        {category !== 'Semua' && (
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={onResetCategory}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryActionText}>Lihat Semua Kategori</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.textAction} onPress={onRefresh} activeOpacity={0.7}>
          <RefreshCw size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.textActionText}>Cek Ulang Lokasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  actionGroup: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 40,
    width: '100%',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 38,
    width: '100%',
  },
  secondaryActionText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  textActionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
