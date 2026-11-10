import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { SlidersHorizontal } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface RadiusFilterProps {
  radiusKm: number;
  onRadiusChange: (value: number) => void;
  minRadius?: number;
  maxRadius?: number;
}

export const RadiusFilter: React.FC<RadiusFilterProps> = ({
  radiusKm,
  onRadiusChange,
  minRadius = 1,
  maxRadius = 20,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.labelRow}>
            <SlidersHorizontal size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionLabel}>RADIUS PENCARIAN</Text>
          </View>
          <Text style={styles.helperText}>Cakupan area tukang dari lokasi Anda</Text>
        </View>

        <View style={styles.valueBadge}>
          <Text style={styles.valueNumber}>{radiusKm}</Text>
          <Text style={styles.valueUnit}>km</Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={minRadius}
        maximumValue={maxRadius}
        step={1}
        value={radiusKm}
        onValueChange={onRadiusChange}
        minimumTrackTintColor={COLORS.primary}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={COLORS.primary}
      />

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{minRadius} km</Text>
        <Text style={styles.rangeHint}>Maksimal {maxRadius} km</Text>
        <Text style={styles.rangeText}>{maxRadius} km</Text>
      </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2ECE3',
  },
  valueNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  valueUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 2,
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  rangeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rangeHint: {
    fontSize: 10,
    color: '#A0AEC0',
  },
});
