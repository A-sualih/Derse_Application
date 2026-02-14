import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface CategoryCardProps {
    category: Category;
    onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const TEXT_COLOR = '#FFFFFF';
    const SECONDARY_TEXT_COLOR = '#bbf7d0'; // Light green text for secondary
    const ACCENT_COLOR = '#4ade80'; // Bright green

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    borderColor: 'rgba(74, 222, 128, 0.2)', // Subtle green border
                    shadowColor: '#000'
                }
            ]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            {/* Premium Black-Green Gradient Background */}
            <LinearGradient
                colors={['#020617', '#14532d', '#020617']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative Pattern / Shine */}
            <LinearGradient
                colors={['transparent', 'rgba(74, 222, 128, 0.05)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { transform: [{ skewX: '-20deg' }] }]}
            />

            {/* Decorative Background Elements */}
            <View style={styles.decorativeContainer} pointerEvents="none">
                <Text style={[styles.arabicText]}>
                    إرشاد
                </Text>
                <Ionicons
                    name="book"
                    size={120}
                    color={ACCENT_COLOR}
                    style={styles.watermarkIcon}
                />
            </View>

            <View style={[styles.contentContainer]}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Ionicons name="book" size={28} color={ACCENT_COLOR} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.title, { color: TEXT_COLOR }]}>{category.title}</Text>
                    {category.description && (
                        <Text style={[styles.description, { color: SECONDARY_TEXT_COLOR }]} numberOfLines={1}>
                            {category.description}
                        </Text>
                    )}
                    <View style={styles.badge}>
                        <Text style={[styles.fileCount, { color: ACCENT_COLOR }]}>
                            {category.files.length} {category.files.length === 1 ? 'Lesson' : 'Lessons'}
                        </Text>
                    </View>
                </View>
                <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color={SECONDARY_TEXT_COLOR} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        overflow: 'hidden',
        minHeight: 120,
    },
    decorativeContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    arabicText: {
        position: 'absolute',
        top: -10,
        right: 20,
        fontSize: 100,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
        fontWeight: 'bold',
        opacity: 0.03, // Subtle
        color: '#fff',
        transform: [{ rotate: '5deg' }],
    },
    watermarkIcon: {
        position: 'absolute',
        right: -30,
        bottom: -30,
        opacity: 0.05,
        transform: [{ rotate: '-15deg' }],
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        zIndex: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: 'rgba(74, 222, 128, 0.1)', // Green tint
    },
    fileCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
