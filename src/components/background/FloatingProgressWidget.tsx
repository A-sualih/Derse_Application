import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    withSpring, 
    withRepeat, 
    withSequence, 
    withTiming,
    useSharedValue
} from 'react-native-reanimated';
import { useBackgroundTasks } from '../../context/BackgroundTaskContext';

export const FloatingProgressWidget: React.FC<{ onPress: () => void }> = ({ onPress }) => {
    const { tasks } = useBackgroundTasks();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    
    const activeTasks = useMemo(() => tasks.filter(t => t.status === 'running'), [tasks]);
    const overallProgress = useMemo(() => {
        if (activeTasks.length === 0) return 0;
        return activeTasks.reduce((acc, t) => acc + t.progress, 0) / activeTasks.length;
    }, [activeTasks]);

    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (activeTasks.length > 0) {
            opacity.value = withTiming(1, { duration: 500 });
            scale.value = withSpring(1);
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                true
            );
        } else {
            opacity.value = withTiming(0, { duration: 500 });
            scale.value = withSpring(0.8);
        }
    }, [activeTasks.length]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value * pulse.value }],
    }));

    if (activeTasks.length === 0) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <BlurView intensity={80} tint="dark" style={styles.blur}>
                    <LinearGradient
                        colors={['rgba(37, 99, 235, 0.2)', 'rgba(79, 70, 229, 0.2)']}
                        style={StyleSheet.absoluteFill}
                    />
                    
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="sync" size={20} color="#60A5FA" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>
                                {activeTasks.length} Task{activeTasks.length > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.percentage}>
                                {Math.round(overallProgress)}%
                            </Text>
                        </View>
                        
                        <View style={styles.progressRing}>
                            {/* Simple linear progress indicator for the widget */}
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={['#3B82F6', '#8B5CF6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressBarFill, { width: `${overallProgress}%` }]}
                                />
                            </View>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        right: 20,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        zIndex: 1000,
    },
    blur: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 140,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#E2E8F0',
        fontSize: 12,
        fontWeight: '600',
    },
    percentage: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    progressRing: {
        width: 40,
        justifyContent: 'center',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    }
});
