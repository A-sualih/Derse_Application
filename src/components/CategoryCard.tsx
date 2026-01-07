import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface CategoryCardProps {
    category: Category;
    onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    shadowColor: colorScheme === 'dark' ? '#000' : '#475569'
                }
            ]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.tint + '15' }]}>
                <Ionicons name="book" size={28} color={theme.tint} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.title, { color: theme.text }]}>{category.title}</Text>
                {category.description && (
                    <Text style={[styles.description, { color: theme.secondaryText }]} numberOfLines={1}>
                        {category.description}
                    </Text>
                )}
                <View style={styles.badge}>
                    <Text style={[styles.fileCount, { color: theme.tint }]}>
                        {category.files.length} {category.files.length === 1 ? 'Lesson' : 'Lessons'}
                    </Text>
                </View>
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
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
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    fileCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
