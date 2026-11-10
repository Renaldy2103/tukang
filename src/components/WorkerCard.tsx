import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MessageCircle, Star, MapPin } from 'lucide-react-native';
import { Worker } from '../types/worker';
import { COLORS } from '../constants/theme';

interface WorkerCardProps {
  worker: Worker;
  onContactWhatsApp: (worker: Worker) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onContactWhatsApp }) => {
  // Ambil inisial nama untuk avatar elegan
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        {/* Avatar Inisial */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(worker.name)}</Text>
        </View>

        {/* Info Tukang */}
        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {worker.name}
          </Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{worker.category}</Text>
          </View>
        </View>

        {/* Rating & Jarak */}
        <View style={styles.metricsCol}>
          <View style={styles.metricItem}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingValue}>{worker.rating.toFixed(1)}</Text>
          </View>

          <View style={styles.metricItem}>
            <MapPin size={13} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.distanceValue}>
              {worker.distance_km !== undefined ? `${worker.distance_km.toFixed(1)} km` : '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* WhatsApp Button */}
      <TouchableOpacity
        style={styles.waButton}
        onPress={() => onContactWhatsApp(worker)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Hubungi ${worker.name} via WhatsApp`}
      >
        <MessageCircle size={18} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 8 }} />
        <Text style={styles.waButtonText}>Hubungi via WhatsApp</Text>
      </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1.5,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#D2ECE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricsCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  distanceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  waButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 10,
    height: 42,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  waButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
