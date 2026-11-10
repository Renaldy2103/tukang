import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Layers, Wind, Droplets, Zap, Hammer } from 'lucide-react-native';
import { WorkerCategory } from '../types/worker';
import { COLORS } from '../constants/theme';

export type CategoryOption = 'Semua' | WorkerCategory;

export const CATEGORIES: CategoryOption[] = ['Semua', 'AC', 'Ledeng', 'Listrik', 'Bangunan'];

interface CategoryFilterProps {
  selectedCategory: CategoryOption;
  onSelectCategory: (category: CategoryOption) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getCategoryIcon = (category: CategoryOption, isSelected: boolean) => {
    const color = isSelected ? '#FFFFFF' : COLORS.textSecondary;
    const size = 15;

    switch (category) {
      case 'Semua':
        return <Layers size={size} color={color} strokeWidth={2} />;
      case 'AC':
        return <Wind size={size} color={color} strokeWidth={2} />;
      case 'Ledeng':
        return <Droplets size={size} color={color} strokeWidth={2} />;
      case 'Listrik':
        return <Zap size={size} color={color} strokeWidth={2} />;
      case 'Bangunan':
        return <Hammer size={size} color={color} strokeWidth={2} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>KATEGORI TUKANG</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isSelected ? styles.chipActive : styles.chipInactive]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.iconWrapper}>{getCategoryIcon(cat, isSelected)}</View>
              <Text style={[styles.chipText, isSelected ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 38,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  iconWrapper: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: COLORS.textPrimary,
  },
});
